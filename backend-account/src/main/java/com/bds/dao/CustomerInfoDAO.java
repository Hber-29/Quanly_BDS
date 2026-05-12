package com.bds.dao;

import com.bds.model.CustomerInfo;
import java.sql.*;

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
}
