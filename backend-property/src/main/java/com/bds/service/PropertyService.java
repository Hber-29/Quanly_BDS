package com.bds.service;

import com.bds.dao.PropertyDAO;
import com.bds.dto.ResponseDTO.PropertyDetailDTO;
import com.bds.model.Property;
import com.bds.dto.ResponseDTO.PropertyPageResponse;
import com.bds.util.DBContext;
import com.google.gson.Gson;
import redis.clients.jedis.Jedis;

import java.sql.Connection;
import java.util.List;

public class PropertyService {
    private PropertyDAO propertyDAO = new PropertyDAO();
    private Gson gson = new Gson();


    public PropertyPageResponse getPropertyList(int page, int pageSize) {
        String cacheKey = "properties_page_" + page + "_limit_" + pageSize;
        try (Jedis jedis = new Jedis("localhost", 6379)) {
            String cachedData = jedis.get(cacheKey);
            if (cachedData != null) {
                System.out.println(" Lấy dữ liệu siêu tốc từ Redis Cache (Key: " + cacheKey + ")!");
                return gson.fromJson(cachedData, PropertyPageResponse.class);
            }
        } catch (Exception e) {
            System.out.println("Lỗi kết nối Redis: " + e.getMessage());
        }

        System.out.println(" Cache trống, đang lấy dữ liệu từ Database Replica (Key: " + cacheKey + ")...");
        List<Property> list = propertyDAO.getPropertiesByPage(page, pageSize);
        int totalItems = propertyDAO.getTotalPropertiesCount();
        int totalPages = (int) Math.ceil((double) totalItems / pageSize);

        PropertyPageResponse responseObj = new PropertyPageResponse();
        responseObj.setTotalItems(totalItems);
        responseObj.setTotalPages(totalPages);
        responseObj.setCurrentPage(page);
        responseObj.setProperties(list);

        try (Jedis jedis = new Jedis("localhost", 6379)) {
            jedis.setex(cacheKey, 300, gson.toJson(responseObj));
        } catch (Exception e) {
            System.out.println("Lỗi lưu Redis: " + e.getMessage());
        }
        return responseObj;
    }

    //  Chuyển đổi tham số vùng miền sang định dạng Số nguyên để map chuẩn với DAO
    public PropertyPageResponse searchPropertyList(String keyword, int regionId, int page, int pageSize) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim().replaceAll("\\s+", "_") : "all";

        // 1. Tạo chìa khóa Cache phân mảnh duy nhất bằng ID vùng thay vì chữ tiếng Việt
        String cacheKey = "search_kw_" + cleanKeyword + "_regId_" + regionId + "_page_" + page + "_limit_" + pageSize;

        // 2. TẦNG 1: Kiểm tra trong Redis Cache
        try (Jedis jedis = new Jedis("localhost", 6379)) {
            String cachedData = jedis.get(cacheKey);
            if (cachedData != null) {
                System.out.println("⚡ [Redis Cache Hit] Trả về kết quả tìm kiếm siêu tốc: " + cacheKey);
                return gson.fromJson(cachedData, PropertyPageResponse.class);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Lỗi kết nối Redis khi tìm kiếm: " + e.getMessage());
        }

        // 3. TẦNG 2: Cache trống -> Chọc xuống Database Replica thông qua DAO mới
        System.out.println("🐢 [Cache Miss] Đang quét Database Replica cho từ khóa: [" + keyword + "] - Mã vùng ID: [" + regionId + "]");
        List<Property> list = propertyDAO.searchProperties(keyword, regionId, page, pageSize);
        int totalItems = propertyDAO.getTotalSearchCount(keyword, regionId);
        int totalPages = (int) Math.ceil((double) totalItems / pageSize);

        PropertyPageResponse responseObj = new PropertyPageResponse();
        responseObj.setTotalItems(totalItems);
        responseObj.setTotalPages(totalPages);
        responseObj.setCurrentPage(page);
        responseObj.setProperties(list);

        // 4. TẦNG 3: Đồng bộ ngược lại dữ liệu sạch vào mạng lưới Redis Cache
        try (Jedis jedis = new Jedis("localhost", 6379)) {
            int ttl = 180;
            if (keyword != null && keyword.trim().matches("^[A-Za-z]{2,5}-\\d+$")) {
                ttl = 1800;
                System.out.println("📌 Phát hiện tìm kiếm theo MÃ BĐS, tăng thời gian Cache lên 30 phút.");
            }
            jedis.setex(cacheKey, ttl, gson.toJson(responseObj));
            System.out.println("💾 Đã lưu kết quả tìm kiếm vào Redis thành công (TTL: " + ttl + "s).");
        } catch (Exception e) {
            System.out.println("⚠️ Lỗi lưu Redis khi tìm kiếm: " + e.getMessage());
        }

        return responseObj;
    }


    public boolean createProperty(Property newProperty, List<String> images) {
        if (newProperty.getTitle() == null || newProperty.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề không được để trống");
        }
        if (newProperty.getPrice().doubleValue() <= 0 || newProperty.getArea() <= 0) {
            throw new IllegalArgumentException("Giá và Diện tích phải lớn hơn 0");
        }

        boolean isSuccess = propertyDAO.insertPropertyWithImages(newProperty, images);

        // 3. XÓA CACHE REDIS (Bước Cực Kỳ Quan Trọng)
        if (isSuccess) {
            try (Jedis jedis = new Jedis("localhost", 6379)) {
                // 🌟 NÂNG CẤP: Lấy TẤT CẢ các key bắt đầu bằng properties_ VÀ search_
                java.util.Set<String> keysToDelete = new java.util.HashSet<>();
                keysToDelete.addAll(jedis.keys("properties_*"));
                keysToDelete.addAll(jedis.keys("search_*")); // Thêm dòng này để xóa sạch cache tìm kiếm

                if (!keysToDelete.isEmpty()) {
                    jedis.del(keysToDelete.toArray(new String[0]));
                    System.out.println("🧹 Đã xóa " + keysToDelete.size() + " cache Redis (bao gồm cả lịch sử tìm kiếm) để cập nhật dữ liệu mới!");
                }
            } catch (Exception e) {
                System.out.println("⚠️ Lỗi khi xóa Redis Cache: " + e.getMessage());
            }
        }
        return isSuccess;
    }


    public PropertyDetailDTO getPropertyDetail(int propertyId) {
        Property p = propertyDAO.getPropertyDetailById(propertyId);
        if (p == null) return null;

        PropertyDetailDTO dto = new PropertyDetailDTO();
        dto.setPropertyId(Integer.parseInt(p.getPropertyId()));
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setArea(p.getArea());
        dto.setAddress(p.getAddress());
        dto.setImages(p.getImages());
        return dto;
    }
}