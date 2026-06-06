package com.bds.dao;

import com.bds.model.CustomerInfo;
import com.bds.util.DBContext;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public class CustomerInfoDAO {
    public CustomerInfo getByAccountId(Connection conn, int accountId) throws SQLException {
        String sql = "SELECT * FROM customer_info WHERE account_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, accountId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    CustomerInfo c = new CustomerInfo();
                    c.setAccountId(accountId);
                    c.setFullName(rs.getString("full_name"));
                    c.setGender(rs.getInt("gender")); // Thêm trường này
                    c.setDob(rs.getDate("dob"));       // Thêm trường này
                    c.setPhone(rs.getString("phone"));
                    c.setEmail(rs.getString("email")); // Nên lấy cả email để hiển thị (read-only)
                    c.setAddress(rs.getString("address"));
                    c.setPreferences(rs.getString("preferences"));
                    return c;
                }
            }
        }
        return null;
    }

    public boolean update(Connection conn, CustomerInfo c) throws SQLException {

        String sql = "UPDATE customer_info SET full_name = ?, gender = ?, dob = ?, phone = ?, address = ?, preferences = ? WHERE account_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, c.getFullName());
            ps.setInt(2, c.getGender());
            ps.setDate(3, c.getDob());
            ps.setString(4, c.getPhone());
            ps.setString(5, c.getAddress());
            ps.setString(6, c.getPreferences());
            ps.setInt(7, c.getAccountId());
            return ps.executeUpdate() > 0;
        }
    }

    // 1. Hàm lấy thông tin chi tiết Customer bằng username
    public Map<String, Object> getCustomerProfile(String username) {
        Map<String, Object> profile = new HashMap<>();
        String sql = "SELECT c.full_name, c.gender, c.dob, c.phone, c.email, c.address, c.preferences, c.avatar " +
                "FROM customer_info c " +
                "JOIN account a ON c.account_id = a.account_id " +
                "WHERE a.username = ?";

        try (Connection conn = DBContext.getReadConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    profile.put("fullName", rs.getString("full_name"));
                    profile.put("gender", rs.getString("gender"));
                    profile.put("dob", rs.getString("dob"));
                    profile.put("phone", rs.getString("phone"));
                    profile.put("email", rs.getString("email"));
                    profile.put("address", rs.getString("address"));
                    profile.put("preferences", rs.getString("preferences"));
                    profile.put("avatar", rs.getString("avatar"));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return profile;
    }

    // 2. Hàm cập nhật thông tin Customer
    public boolean updateCustomerProfile(String username, String fullName, String gender, String dob, String phone, String email, String address, String preferences, String avatarPath) {
        // 🔥 Đã thêm preferences vào SQL
        // 🔥 Dùng CASE WHEN để nếu avatarPath là rỗng hoặc null thì giữ ảnh cũ
        String sql = "UPDATE customer_info SET " +
                "full_name = ?, " +
                "gender = ?, " +
                "dob = ?, " +
                "phone = ?, " +
                "email = ?, " +
                "address = ?, " +
                "preferences = ?, " +
                "avatar = CASE WHEN ? IS NULL OR ? = '' THEN avatar ELSE ? END " +
                "WHERE account_id = (SELECT account_id FROM account WHERE username = ? LIMIT 1)";

        try (Connection conn = DBContext.getWriteConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, fullName);
            ps.setInt(2, gender != null && !gender.isEmpty() ? Integer.parseInt(gender) : 1);
            ps.setDate(3, (dob != null && !dob.isEmpty()) ? java.sql.Date.valueOf(dob) : null);
            ps.setString(4, phone);
            ps.setString(5, email);
            ps.setString(6, address);
            ps.setString(7, preferences); // 🔥 Set giá trị sở thích

            // Xử lý logic avatar cho 3 dấu chấm hỏi của CASE WHEN
            ps.setString(8, avatarPath);
            ps.setString(9, avatarPath);
            ps.setString(10, avatarPath);

            ps.setString(11, username);

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}
