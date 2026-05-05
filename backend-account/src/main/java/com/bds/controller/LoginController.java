package com.bds.controller;

import com.bds.dao.AccountDAO;
import com.bds.model.Account;
import com.bds.util.DBContext;
import com.bds.util.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;

@WebServlet(name = "LoginController", value = "/Login") // Khớp với route trong Kong Gateway của bạn
public class LoginController extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Thiết lập header trả về JSON chuẩn
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String username = request.getParameter("username");
        String passwordRaw = request.getParameter("password");

        // 1. Validate dữ liệu đầu vào
        if (username == null || passwordRaw == null || username.trim().isEmpty() || passwordRaw.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\": \"Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!\"}");
            return;
        }

        // 2. Mở kết nối ĐỌC (Tối ưu cho kiến trúc Master-Replica qua Nginx)
        try (Connection conn = DBContext.getReadConnection()) {
            AccountDAO dao = new AccountDAO();
            Account acc = dao.getAccountByUsername(conn, username);

            // 3. Kiểm tra tài khoản có tồn tại không
            if (acc == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print("{\"message\": \"Sai tên đăng nhập hoặc mật khẩu!\"}");
                return;
            }

            // 4. Kiểm tra trạng thái kích hoạt của tài khoản
            if (!acc.isActive()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403 Forbidden
                out.print("{\"message\": \"Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt!\"}");
                return;
            }

            // 5. Kiểm tra mật khẩu (So sánh chuỗi Raw và chuỗi BCrypt Hash)
            if (BCrypt.checkpw(passwordRaw, acc.getPassword())) {

                // Cấp phát JWT Token (Sử dụng đúng hàm getAccountId() của bạn)
                String token = JwtUtil.generateToken(acc.getAccountId(), acc.getUsername(), acc.getRoleId());

                response.setStatus(HttpServletResponse.SC_OK);
                // Trả về Token và thông tin User để React lưu vào LocalStorage/Redux
                out.print("{\"message\": \"Đăng nhập thành công\", " +
                        "\"token\": \"" + token + "\", " +
                        "\"accountId\": " + acc.getAccountId() + ", " +
                        "\"roleId\": " + acc.getRoleId() + "}");
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print("{\"message\": \"Sai tên đăng nhập hoặc mật khẩu!\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"message\": \"Lỗi hệ thống: Không thể kết nối cơ sở dữ liệu!\"}");
        }
    }
}
