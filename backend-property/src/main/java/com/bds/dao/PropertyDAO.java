package com.bds.dao;

import com.bds.model.Property;
import com.bds.util.DBContext;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PropertyDAO {

    // Lấy danh sách bài đăng (20 bài mỗi trang), truyền vào Connection ĐỌC
    // Đã bỏ tham số Connection, thêm tham số pageSize, và tự động gọi DBContext
    public List<Property> getPropertiesByPage(int page, int pageSize) {
        List<Property> list = new ArrayList<>();

        // LIMIT số lượng bài lấy, OFFSET vị trí bắt đầu lấy
        String sql = "SELECT * FROM property ORDER BY created_at DESC LIMIT ? OFFSET ?";

        // Tự động mở kết nối ReadConnection tại đây
        try (Connection conn = DBContext.getReadConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, pageSize);
            ps.setInt(2, (page - 1) * pageSize);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Property p = new Property();
                    p.setPropertyId(rs.getString("property_id"));
                    p.setPropertyCode(rs.getString("property_code"));
                    p.setAccountId(rs.getInt("account_id"));
                    p.setTitle(rs.getString("title"));
                    p.setPrice(rs.getBigDecimal("price"));
                    p.setPropertyUuid(rs.getString("property_uuid"));
                    if(p.getPrice() != null) {
                        p.setPriceDisplay(p.getPrice().toString() + " tỷ");
                    }

                    p.setArea(rs.getFloat("area"));
                    p.setAddress(rs.getString("address"));
                    p.setThumbnail(rs.getString("thumbnail"));
//                    p.setBadge(rs.getString("badge"));
                    p.setCreatedAt(rs.getTimestamp("created_at"));

                    list.add(p);
                }
            }
        } catch (Exception e) {
            System.out.println("Lỗi lấy danh sách bài đăng: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }


    public int getTotalPropertiesCount() {
        int count = 0;
        String sql = "SELECT COUNT(*) FROM property";

        try (Connection conn = DBContext.getReadConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) {
                count = rs.getInt(1); // Lấy kết quả của hàm COUNT(*)
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return count;
    }

    // 1. Hàm tìm kiếm bài đăng nâng cao có phân trang (Phục vụ cả tìm theo chữ và mã)
    public List<Property> searchProperties(String keyword, String region, int page, int pageSize) {
        List<Property> list = new ArrayList<>();

        // Chuẩn hóa dữ liệu tìm kiếm để đưa vào câu lệnh ILIKE (%từ_khóa%)
        String searchKeyword = (keyword != null) ? "%" + keyword.trim() + "%" : "%%";
        String searchRegion = (region != null && !region.equals("Loại nhà đất") && !region.trim().isEmpty())
                ? "%" + region.trim() + "%" : "%%";

        // Câu lệnh SQL động: Tìm theo tiêu đề HOẶC mã bài đăng, và phải nằm trong khu vực/vùng được chọn
        String sql = "SELECT * FROM property " +
                "WHERE (title ILIKE ? OR property_code ILIKE ?) " +
                "AND (address ILIKE ?) " +
                "ORDER BY created_at DESC LIMIT ? OFFSET ?";

        try (Connection conn = DBContext.getReadConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, searchKeyword); // Khớp với title
            ps.setString(2, searchKeyword); // Khớp với property_code
            ps.setString(3, searchRegion);  // Khớp với vùng (quét trong cột address)
            ps.setInt(4, pageSize);         // LIMIT số lượng bài (ví dụ: 15)
            ps.setInt(5, (page - 1) * pageSize); // OFFSET vị trí bắt đầu lấy

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Property p = new Property();
                    p.setPropertyId(rs.getString("property_id"));
                    p.setPropertyCode(rs.getString("property_code"));
                    p.setAccountId(rs.getInt("account_id"));
                    p.setTitle(rs.getString("title"));
                    p.setPrice(rs.getBigDecimal("price"));

                    if (p.getPrice() != null) {
                        p.setPriceDisplay(p.getPrice().toString() + " tỷ");
                    }

                    p.setArea(rs.getFloat("area"));
                    p.setAddress(rs.getString("address"));
                    p.setThumbnail(rs.getString("thumbnail"));
//                    p.setBadge(rs.getString("badge"));
                    p.setCreatedAt(rs.getTimestamp("created_at"));

                    list.add(p);
                }
            }
        } catch (Exception e) {
            System.out.println("Lỗi khi thực thi tìm kiếm bài đăng: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    // 2. Hàm đếm tổng số lượng bài đăng khớp với điều kiện tìm kiếm (Để tính tổng số trang)
    public int getTotalSearchCount(String keyword, String region) {
        int count = 0;

        String searchKeyword = (keyword != null) ? "%" + keyword.trim() + "%" : "%%";
        String searchRegion = (region != null && !region.equals("Loại nhà đất") && !region.trim().isEmpty())
                ? "%" + region.trim() + "%" : "%%";

        String sql = "SELECT COUNT(*) FROM property " +
                "WHERE (title ILIKE ? OR property_code ILIKE ?) " +
                "AND (address ILIKE ?)";

        try (Connection conn = DBContext.getReadConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, searchKeyword);
            ps.setString(2, searchKeyword);
            ps.setString(3, searchRegion);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    count = rs.getInt(1);
                }
            }
        } catch (Exception e) {
            System.out.println("Lỗi khi đếm tổng số bài tìm kiếm: " + e.getMessage());
            e.printStackTrace();
        }
        return count;
    }

    /**
     * Hàm lấy region_id dựa vào tên Tỉnh/Thành phố
     */
    public int getRegionIdByName(String provinceName) {
        String sql = "SELECT region_id FROM region WHERE ? ILIKE '%' || region_name || '%' LIMIT 1";
        try (Connection conn = DBContext.getReadConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, provinceName);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("region_id");
            }
        } catch (Exception e) {
            System.out.println("⚠️ Lỗi dò region_id: " + e.getMessage());
        }
        return 1; // Trả về 1 (Hà Nội) nếu lỗi để tránh crash
    }

    public boolean insertPropertyWithImages(Property p, List<String> imageUrls) {
        // 🔥 SỬA LỖI SQL: Thêm account_id vào danh sách cột và thêm một dấu ? vào VALUES
        String insertPropertySql = "INSERT INTO property (property_uuid, property_code, title, description, price, area, address, thumbnail, category_id, region_id, account_id, created_at) " +
                "VALUES (?::uuid, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) RETURNING property_id";

        String insertImageSql = "INSERT INTO property_image (property_id, image_url) VALUES (?, ?)";

        String newUuid = java.util.UUID.randomUUID().toString();
        String newCode = "CH-" + (int)(Math.random() * 9000 + 1000);
        p.setPropertyUuid(newUuid);
        p.setPropertyCode(newCode);

        // Lấy ảnh đầu tiên làm thumbnail (nếu có)
        String thumbnail = (imageUrls != null && !imageUrls.isEmpty()) ? imageUrls.get(0) : null;

        Connection conn = null;
        try {
            conn = DBContext.getWriteConnection();
            // Bắt đầu Transaction (Khái niệm cốt lõi trong hệ thống phân tán)
            conn.setAutoCommit(false);

            try (PreparedStatement psProp = conn.prepareStatement(insertPropertySql, Statement.RETURN_GENERATED_KEYS)) {
                psProp.setString(1, p.getPropertyUuid());
                psProp.setString(2, p.getPropertyCode());
                psProp.setString(3, p.getTitle());
                psProp.setString(4, p.getDescription());
                psProp.setBigDecimal(5, p.getPrice());
                psProp.setFloat(6, p.getArea());
                psProp.setString(7, p.getAddress());
                psProp.setString(8, thumbnail);
                psProp.setInt(9, p.getCategoryId());
                psProp.setInt(10, p.getRegionId());
                psProp.setInt(11, p.getAccountId()); // 🔥 SỬA LỖI PARSE: Gán giá trị account_id vào dấu ? thứ 11

                psProp.executeUpdate();

                // Lấy ID của property vừa tạo để lưu vào bảng property_image
                int generatedPropertyId = 0;
                try (ResultSet rsKeys = psProp.getGeneratedKeys()) {
                    if (rsKeys.next()) generatedPropertyId = rsKeys.getInt(1);
                }

                // Lưu các ảnh còn lại vào bảng property_image bằng kỹ thuật Batch Insert
                if (imageUrls != null && imageUrls.size() > 1) {
                    try (PreparedStatement psImg = conn.prepareStatement(insertImageSql)) {
                        for (int i = 1; i < imageUrls.size(); i++) {
                            psImg.setInt(1, generatedPropertyId);
                            psImg.setString(2, imageUrls.get(i));
                            psImg.addBatch(); // Gom lệnh để tối ưu hiệu suất network
                        }
                        psImg.executeBatch(); // Thực thi một lần
                    }
                }
            }

            // Hoàn tất Transaction
            conn.commit();
            return true;

        } catch (Exception e) {
            if (conn != null) {
                try {
                    conn.rollback(); // Nếu có lỗi (dù ở bảng property hay property_image), hủy bỏ toàn bộ
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            e.printStackTrace();
            return false;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close(); // Trả connection về Pool
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // 🔥 Đã đổi tham số thành int
    public Property getPropertyDetailById(int propertyId) {
        Property property = null;
        List<String> images = new ArrayList<>();

        String sqlProperty = "SELECT property_id, title, description, price, area, address, thumbnail, category_id, region_id, account_id FROM property WHERE property_id = ?";
        String sqlImages = "SELECT image_url FROM property_image WHERE property_id = ?";

        try (Connection conn = DBContext.getWriteConnection()) {

            try (PreparedStatement psProp = conn.prepareStatement(sqlProperty)) {
                // 🔥 Đã đổi thành setInt
                psProp.setInt(1, propertyId);
                try (ResultSet rs = psProp.executeQuery()) {
                    if (rs.next()) {
                        property = new Property();
                        // 🔥 Đã đổi thành getInt
                        property.setPropertyId(String.valueOf(rs.getInt("property_id")));
                        property.setTitle(rs.getString("title"));
                        property.setDescription(rs.getString("description"));
                        property.setPrice(rs.getBigDecimal("price"));
                        property.setArea(rs.getFloat("area"));
                        property.setAddress(rs.getString("address"));
                        property.setThumbnail(rs.getString("thumbnail"));
                        property.setCategoryId(rs.getInt("category_id"));
                        property.setRegionId(rs.getInt("region_id"));
                        property.setAccountId(rs.getInt("account_id"));

                        if (property.getThumbnail() != null && !property.getThumbnail().isEmpty()) {
                            images.add(property.getThumbnail());
                        }
                    }
                }
            }

            if (property != null) {
                try (PreparedStatement psImg = conn.prepareStatement(sqlImages)) {
                    // 🔥 Đã đổi thành setInt
                    psImg.setInt(1, propertyId);
                    try (ResultSet rsImg = psImg.executeQuery()) {
                        while (rsImg.next()) {
                            images.add(rsImg.getString("image_url"));
                        }
                    }
                }
                property.setImages(images);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return property;
    }

    // Hàm cập nhật trạng thái nhà (Ví dụ: Chuyển từ AVAILABLE sang SOLD)
    public void updatePropertyStatus(int propertyId, String newStatus) {
        String sql = "UPDATE property SET status = ? WHERE property_id = ?";

        // 🌟 ĐÃ SỬA: Dùng getWriteConnection() vì đây là thao tác Cập nhật (Ghi)
        try (Connection conn = DBContext.getWriteConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, newStatus);
            ps.setInt(2, propertyId);

            int rowsAffected = ps.executeUpdate();
            if (rowsAffected > 0) {
                System.out.println("   💾 [DATABASE] Đã cập nhật căn nhà " + propertyId + " thành " + newStatus);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


}
