package com.bds.service;

import com.bds.dao.AccountDAO;
import com.bds.dto.RegisterDTO;
import com.bds.model.Account;
import com.bds.model.CustomerInfo;
import com.bds.util.DBContext;
import org.mindrot.jbcrypt.BCrypt;
import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.Period;
import java.util.regex.Pattern;

public class AccountService {
    private AccountDAO accountDAO = new AccountDAO();

    private static final String USERNAME_PATTERN = "^[a-zA-Z0-9_]{3,50}$";
    private static final String PASSWORD_PATTERN = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";
    private static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@(.+)$";
    private static final String PHONE_PATTERN = "^[0-9]{9,11}$";

    public String registerCustomer(RegisterDTO dto) {
        // --- 1. VALIDATE DỮ LIỆU ---
        if (dto.getUsername() == null || !Pattern.matches(USERNAME_PATTERN, dto.getUsername())) {
            return "Username 3-50 ký tự, không dấu cách, không ký tự đặc biệt.";
        }
        if (dto.getPassword() == null || !Pattern.matches(PASSWORD_PATTERN, dto.getPassword())) {
            return "Password tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.";
        }
        if (dto.getFullName() == null || dto.getFullName().trim().isEmpty()) {
            return "Họ tên không được để trống.";
        }
        if (dto.getEmail() == null || !Pattern.matches(EMAIL_PATTERN, dto.getEmail())) {
            return "Email không đúng định dạng.";
        }
        if (dto.getPhone() == null || !Pattern.matches(PHONE_PATTERN, dto.getPhone())) {
            return "Số điện thoại không hợp lệ (9-11 số).";
        }

        // --- 2. XỬ LÝ NGÀY SINH & KIỂM TRA ĐỘ TUỔI ---
        Date sqlDob = null;
        try {
            if (dto.getDob() != null && !dto.getDob().isEmpty()) {
                LocalDate birthDate = LocalDate.parse(dto.getDob());
                LocalDate now = LocalDate.now();
                if (birthDate.isAfter(now)) return "Ngày sinh không hợp lệ.";
                if (Period.between(birthDate, now).getYears() < 13) return "Yêu cầu trên 13 tuổi.";
                sqlDob = Date.valueOf(birthDate);
            }
        } catch (Exception e) {
            return "Định dạng ngày sinh không hợp lệ (yyyy-mm-dd).";
        }

        Connection readConn = null;
        Connection writeConn = null;
        try {
            // --- 3. CHECK UNIQUE (Tối ưu: Chạy qua cổng ĐỌC Nginx 5433) ---
            readConn = DBContext.getReadConnection();
            if (accountDAO.isUsernameExists(readConn, dto.getUsername())) return "Tên đăng nhập đã tồn tại.";
            if (accountDAO.isEmailExists(readConn, dto.getEmail())) return "Email đã được sử dụng.";
            if (accountDAO.isPhoneExists(readConn, dto.getPhone())) return "Số điện thoại đã được sử dụng.";

            // Đóng kết nối đọc ngay sau khi check xong để giải phóng pool
            readConn.close();

            // --- 4. HASH PASSWORD ---
            String hashedPass = BCrypt.hashpw(dto.getPassword(), BCrypt.gensalt(12));

            // --- 5. OPEN TRANSACTION GHI (Bắn thẳng vào Master 5431) ---
            writeConn = DBContext.getWriteConnection();
            writeConn.setAutoCommit(false);

            // INSERT BẢNG ACCOUNT
            Account acc = new Account();
            acc.setUsername(dto.getUsername());
            acc.setPassword(hashedPass);
            acc.setRoleId(dto.getRoleId() > 0 ? dto.getRoleId() : 3);

            int accId = accountDAO.insertAccount(writeConn, acc);

            if (accId > 0) {
                // INSERT BẢNG CUSTOMER_INFO
                CustomerInfo info = new CustomerInfo();
                info.setAccountId(accId);
                info.setFullName(dto.getFullName().replaceAll("<[^>]*>", ""));
                info.setGender(dto.getGender());
                info.setDob(sqlDob);
                info.setPhone(dto.getPhone());
                info.setEmail(dto.getEmail());
                info.setAddress(dto.getAddress());
                info.setPreferences(dto.getPreferences());

                accountDAO.insertCustomerInfo(writeConn, info);

                writeConn.commit(); // Lưu vĩnh viễn vào Master DB
                return "SUCCESS";
            }
            writeConn.rollback();
        } catch (Exception e) {
            if (writeConn != null) try { writeConn.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
            e.printStackTrace();
            return "Lỗi hệ thống: " + e.getMessage();
        } finally {
            // Đảm bảo đóng toàn bộ kết nối an toàn
            try {
                if (readConn != null && !readConn.isClosed()) readConn.close();
                if (writeConn != null && !writeConn.isClosed()) writeConn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return "Đăng ký thất bại.";
    }
}