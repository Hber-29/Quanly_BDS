package com.bds.service;

import com.bds.dao.AccountDAO;
import com.bds.model.Account;
import com.bds.util.DBContext;
import com.bds.util.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

public class LoginService {

    // Khởi tạo trực tiếp đối tượng DAO ngay tại đây
    private AccountDAO accountDAO = new AccountDAO();

    /**
     * Hàm xử lý nghiệp vụ xác thực người dùng
     * Trả về một Map chứa Token và thông tin User nếu thành công.
     */
    public Map<String, Object> authenticate(String username, String passwordRaw) throws Exception {

        // Mở kết nối ĐỌC (Tối ưu cho kiến trúc phân tán qua Nginx/Kong)
        try (Connection conn = DBContext.getReadConnection()) {

            Account acc = accountDAO.getAccountByUsername(conn, username);

            if (acc == null) {
                throw new Exception("UNAUTHORIZED:Sai tên đăng nhập hoặc mật khẩu!");
            }

            if (!acc.isActive()) {
                throw new Exception("FORBIDDEN:Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt!");
            }

            if (!BCrypt.checkpw(passwordRaw, acc.getPassword())) {
                throw new Exception("UNAUTHORIZED:Sai tên đăng nhập hoặc mật khẩu!");
            }

            String token = JwtUtil.generateToken(acc.getAccountId(), acc.getUsername(), acc.getRoleId());

            Map<String, Object> authData = new HashMap<>();
            authData.put("token", token);
            authData.put("accountId", acc.getAccountId());
            authData.put("roleId", acc.getRoleId());

            return authData;
        }
    }
}
