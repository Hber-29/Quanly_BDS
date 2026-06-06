package com.bds.dao;

import com.bds.util.DBContext;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
// Sếp nhớ đảm bảo đã có thư viện BCrypt trong project nhé (thường là jbcrypt)
import org.mindrot.jbcrypt.BCrypt;

public class AuthDAO {

    // Hàm checkLogin trả về String (LOCKED, FAIL, hoặc role_id dạng chuỗi VD: "3")
    public String checkLogin(String username, String plainPassword) {

        // CHỈ TÌM THEO USERNAME
        String sql = "SELECT role_id, is_active, password FROM account WHERE username = ?";

        try (Connection conn = DBContext.getReadConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {
                // Nếu tìm thấy username này trong DB
                if (rs.next()) {
                    String hashedDbPassword = rs.getString("password");
                    boolean isActive = rs.getBoolean("is_active");
                    int roleId = rs.getInt("role_id");

                    // 1. KIỂM TRA MẬT KHẨU BẰNG BCRYPT
                    // So sánh mật khẩu gốc React gửi lên với chuỗi băm trong DB
                    if (BCrypt.checkpw(plainPassword, hashedDbPassword)) {

                        // 2. NẾU ĐÚNG PASS -> KIỂM TRA KHÓA
                        if (!isActive) {
                            return "LOCKED";
                        }

                        // 3. NẾU NGON LÀNH -> TRẢ VỀ ROLE_ID (ép sang chuỗi)
                        return String.valueOf(roleId);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "FAIL";
    }

    // 🔥 Hàm mới thêm: Dùng để bốc accountId ra bằng username
    public int getAccountIdByUsername(String username) {
        String sql = "SELECT account_id FROM account WHERE username = ?";
        try (java.sql.Connection conn = com.bds.util.DBContext.getReadConnection();
             java.sql.PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            try (java.sql.ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("account_id");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return -1;
    }
}