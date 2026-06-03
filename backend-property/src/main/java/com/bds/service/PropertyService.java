package com.bds.service;

import com.bds.dao.PropertyDAO;
import com.bds.model.Property;
import com.bds.dto.ResponseDTO.PropertyPageResponse;
import com.bds.util.DBContext;
import com.google.gson.Gson;
import redis.clients.jedis.Jedis;

import java.sql.Connection;
import java.util.List;

public class PropertyService {
    private PropertyDAO propertyDAO = new PropertyDAO();
    private Gson gson = new Gson(); // Dùng chung 1 đối tượng Gson cho tiết kiệm bộ nhớ

    public PropertyPageResponse getPropertyList(int page, int pageSize) {

        // 🌟 SỬA QUAN TRỌNG: Kẹp thêm pageSize vào tên key để tách biệt Cache của Trang chủ (8 bài) và Trang bán (15 bài)
        String cacheKey = "properties_page_" + page + "_limit_" + pageSize;

        // 1. Kiểm tra trong Redis trước
        try (Jedis jedis = new Jedis("localhost", 6379)) { // Sửa lại port Redis nếu bạn dùng port khác
            String cachedData = jedis.get(cacheKey);
            if (cachedData != null) {
                System.out.println("⚡ Lấy dữ liệu siêu tốc từ Redis Cache (Key: " + cacheKey + ")!");
                // Trả về thẳng object phân trang
                return gson.fromJson(cachedData, PropertyPageResponse.class);
            }
        } catch (Exception e) {
            System.out.println("Lỗi kết nối Redis: " + e.getMessage());
        }

        // 2. Nếu Redis trống -> Chọc xuống Database Replica
        System.out.println("🐢 Cache trống, đang lấy dữ liệu từ Database Replica (Key: " + cacheKey + ")...");

        // Gọi hàm DAO, truyền vào trang hiện tại và số lượng bài cần lấy
        List<Property> list = propertyDAO.getPropertiesByPage(page, pageSize);
        int totalItems = propertyDAO.getTotalPropertiesCount();

        // Tính toán tổng số trang (Ví dụ: 10 bài / pageSize 8 = 2 trang)
        int totalPages = (int) Math.ceil((double) totalItems / pageSize);

        // Đóng gói dữ liệu vào hộp PropertyPageResponse
        PropertyPageResponse responseObj = new PropertyPageResponse();
        responseObj.setTotalItems(totalItems);
        responseObj.setTotalPages(totalPages);
        responseObj.setCurrentPage(page);
        responseObj.setProperties(list);

        // 3. Lưu vào Redis để lần sau tải nhanh hơn (Lưu 5 phút = 300s)
        try (Jedis jedis = new Jedis("localhost", 6379)) {
            jedis.setex(cacheKey, 300, gson.toJson(responseObj));
        } catch (Exception e) {
            System.out.println("Lỗi lưu Redis: " + e.getMessage());
        }

        return responseObj;
    }

    // 🌟 HÀM MỚI CHUYÊN TRỊ TÌM KIẾM ĐA TẦNG (TITLE, MÃ, VÙNG) KẾT HỢP REDIS
    public PropertyPageResponse searchPropertyList(String keyword, String region, int page, int pageSize) {
        // Chuẩn hóa tham số để đặt tên Key sạch sẽ
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim().replaceAll("\\s+", "_") : "all";
        String cleanRegion = (region != null && !region.equals("Loại nhà đất") && !region.trim().isEmpty()) ? region.trim().replaceAll("\\s+", "_") : "all";

        // 1. Tạo chìa khóa Cache phân mảnh duy nhất
        String cacheKey = "search_kw_" + cleanKeyword + "_reg_" + cleanRegion + "_page_" + page + "_limit_" + pageSize;

        // 2. TẦNG 1: Kiểm tra trong Redis trước để tối ưu RAM siêu tốc
        try (Jedis jedis = new Jedis("localhost", 6379)) {
            String cachedData = jedis.get(cacheKey);
            if (cachedData != null) {
                System.out.println("⚡ [Redis Cache Hit] Trả về kết quả tìm kiếm siêu tốc: " + cacheKey);
                return gson.fromJson(cachedData, PropertyPageResponse.class);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Lỗi kết nối Redis khi tìm kiếm: " + e.getMessage());
        }

        // 3. TẦNG 2: Cache trống (Cache Miss) -> Chọc xuống Database Replica gánh tải
        System.out.println("🐢 [Cache Miss] Đang quét Database Replica cho từ khóa: [" + keyword + "] - Vùng: [" + region + "]");

        // Gọi 2 hàm tối ưu dưới DAO mà chúng ta vừa viết ở Bước 1
        List<Property> list = propertyDAO.searchProperties(keyword, region, page, pageSize);
        int totalItems = propertyDAO.getTotalSearchCount(keyword, region);

        // Tính toán tổng số trang dựa trên kết quả tìm kiếm thực tế
        int totalPages = (int) Math.ceil((double) totalItems / pageSize);

        // Đóng gói dữ liệu vào hộp ResponseDTO
        PropertyPageResponse responseObj = new PropertyPageResponse();
        responseObj.setTotalItems(totalItems);
        responseObj.setTotalPages(totalPages);
        responseObj.setCurrentPage(page);
        responseObj.setProperties(list);

        // 4. TẦNG 3: Lưu kết quả vào Redis và cấu hình thời gian sống thông minh (TTL)
        try (Jedis jedis = new Jedis("localhost", 6379)) {
            int ttl = 180; // Mặc định lưu kết quả tìm kiếm chữ tự do trong 3 phút (180 giây) để tránh rác RAM

            // Kỹ thuật Regex: Nếu keyword có định dạng giống Mã bài đăng (VD: OCP-3161 hoặc BDS-2026)
            // Nhận diện: Có ký tự chữ, có dấu gạch ngang, có ký tự số
            if (keyword != null && keyword.trim().matches("^[A-Za-z]{2,5}-\\d+$")) {
                ttl = 1800; // Lưu cache Mã bài đăng trong 30 phút (1800 giây) vì mã là duy nhất và ít biến động
                System.out.println("📌 Phát hiện tìm kiếm theo MÃ BĐS, tăng thời gian Cache lên 30 phút.");
            }

            // Ghi hộp dữ liệu JSON vào Redis kèm thời gian tự hủy TTL
            jedis.setex(cacheKey, ttl, gson.toJson(responseObj));
            System.out.println("💾 Đã lưu kết quả tìm kiếm vào Redis thành công (TTL: " + ttl + "s).");
        } catch (Exception e) {
            System.out.println("⚠️ Lỗi lưu Redis khi tìm kiếm: " + e.getMessage());
        }

        return responseObj;
    }

    /**
     * Hàm xử lý nghiệp vụ Tạo bài đăng mới (Phiên bản lưu 2 bảng + Xóa Cache)
     */
    public boolean createProperty(Property newProperty, List<String> images) {
        // 1. Validate dữ liệu cơ bản
        if (newProperty.getTitle() == null || newProperty.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề không được để trống");
        }
        if (newProperty.getPrice().doubleValue() <= 0 || newProperty.getArea() <= 0) {
            throw new IllegalArgumentException("Giá và Diện tích phải lớn hơn 0");
        }

        // 2. Gọi DAO để Insert xuống Database Master (Lưu cả bài đăng & ảnh)
        boolean isSuccess = propertyDAO.insertPropertyWithImages(newProperty, images);

        // 3. XÓA CACHE REDIS (Bước Cực Kỳ Quan Trọng)
        if (isSuccess) {
            try (Jedis jedis = new Jedis("localhost", 6379)) {
                // Tìm tất cả các key lưu trữ danh sách và tìm kiếm
                java.util.Set<String> keysToDelete = jedis.keys("properties_*");

                if (keysToDelete != null && !keysToDelete.isEmpty()) {
                    // Xóa hàng loạt cache cũ
                    jedis.del(keysToDelete.toArray(new String[0]));
                    System.out.println("🧹 Đã xóa " + keysToDelete.size() + " cache Redis để cập nhật dữ liệu mới!");
                }
            } catch (Exception e) {
                System.out.println("⚠️ Lỗi khi xóa Redis Cache: " + e.getMessage());
            }
        }

        return isSuccess;
    }
}