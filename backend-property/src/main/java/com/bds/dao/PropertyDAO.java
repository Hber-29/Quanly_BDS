package com.bds.dao;

import com.bds.model.Property;
import com.bds.util.DBContext;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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
}
