package com.bds.dao;

import com.bds.model.Account;
import com.bds.model.CustomerInfo;
import java.sql.*;

public class AccountDAO {

    // Kiểm tra username đã tồn tại chưa (Dùng cho Validate)
    public boolean isUsernameExists(Connection conn, String username) throws SQLException {
        String sql = "SELECT 1 FROM account WHERE username = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) { return rs.next(); }
        }
    }

    // Kiểm tra email đã tồn tại chưa
    public boolean isEmailExists(Connection conn, String email) throws SQLException {
        String sql = "SELECT 1 FROM customer_info WHERE email = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) { return rs.next(); }
        }
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    public boolean isPhoneExists(Connection conn, String phone) throws SQLException {
        String sql = "SELECT 1 FROM customer_info WHERE phone = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, phone);
            try (ResultSet rs = ps.executeQuery()) { return rs.next(); }
        }
    }

    // 1. Chèn dữ liệu vào bảng account (Master Node)
    // Cập nhật: role (String) -> role_id (int) theo chuẩn RBAC
    public int insertAccount(Connection conn, Account acc) throws SQLException {
        String sql = "INSERT INTO account (username, password, role_id, is_active, created_at) VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP)";
        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, acc.getUsername());
            ps.setString(2, acc.getPassword()); // Mật khẩu đã được hash ở Service
            ps.setInt(3, acc.getRoleId());      // Sử dụng role_id mới
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }

    // 2. Chèn dữ liệu vào bảng customer_info
    // Cập nhật: Thêm trường preferences
    public void insertCustomerInfo(Connection conn, CustomerInfo info) throws SQLException {
        String sql = "INSERT INTO customer_info (account_id, full_name, gender, dob, phone, email, address, preferences) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, info.getAccountId());
            ps.setString(2, info.getFullName());
            ps.setInt(3, info.getGender());
            ps.setDate(4, info.getDob());
            ps.setString(5, info.getPhone());
            ps.setString(6, info.getEmail());
            ps.setString(7, info.getAddress());
            ps.setString(8, info.getPreferences()); // Lưu sở thích khách hàng
            ps.executeUpdate();
        }
    }

    public Account getAccountByUsername(Connection conn, String username) throws SQLException {
        String sql = "SELECT * FROM account WHERE username = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Account acc = new Account();
                    // Lưu ý: Tên cột trong getString/getInt phải khớp chính xác với DB PostgreSQL của bạn
                    acc.setAccountId(rs.getInt("account_id"));
                    acc.setUsername(rs.getString("username"));
                    acc.setPassword(rs.getString("password"));
                    acc.setRoleId(rs.getInt("role_id"));
                    acc.setActive(rs.getBoolean("is_active"));
                    acc.setCreatedAt(rs.getTimestamp("created_at"));
                    return acc;
                }
            }
        }
        return null; // Trả về null nếu không tìm thấy tài khoản
    }
}