package com.bds.dao;

import com.bds.model.StaffInfo;
import java.sql.*;

public class StaffInfoDAO {
    public StaffInfo getByAccountId(Connection conn, int accountId) throws SQLException {
        String sql = "SELECT * FROM staff_info WHERE account_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, accountId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    StaffInfo s = new StaffInfo();
                    s.setAccountId(accountId);
                    s.setFullName(rs.getString("full_name"));
                    s.setGender(rs.getInt("gender"));
                    s.setDob(rs.getDate("dob"));
                    s.setPhone(rs.getString("phone"));
                    s.setEmail(rs.getString("email"));
                    s.setAddress(rs.getString("address"));
                    return s;
                }
            }
        }
        return null;
    }

    public boolean update(Connection conn, StaffInfo s) throws SQLException {
        String sql = "UPDATE staff_info SET full_name = ?, phone = ?, address = ? WHERE account_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, s.getFullName());
            ps.setString(2, s.getPhone());
            ps.setString(3, s.getAddress());
            ps.setInt(4, s.getAccountId());
            return ps.executeUpdate() > 0;
        }
    }
}
