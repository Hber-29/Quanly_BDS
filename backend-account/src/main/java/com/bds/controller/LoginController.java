package com.bds.controller;

import com.bds.service.LoginService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@WebServlet(name = "LoginController", value = "/login")
public class LoginController extends HttpServlet {

    // Khởi tạo trực tiếp Service, loại bỏ hoàn toàn hàm init()
    private LoginService loginService = new LoginService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String username = request.getParameter("username");
        String passwordRaw = request.getParameter("password");

        if (username == null || passwordRaw == null || username.trim().isEmpty() || passwordRaw.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"message\": \"Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!\"}");
            return;
        }

        try {
            // Gọi LoginService để xử lý
            Map<String, Object> authData = loginService.authenticate(username, passwordRaw);

            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{\"message\": \"Đăng nhập thành công\", " +
                    "\"token\": \"" + authData.get("token") + "\", " +
                    "\"accountId\": " + authData.get("accountId") + ", " +
                    "\"roleId\": " + authData.get("roleId") + "}");

        } catch (Exception e) {
            String errorMsg = e.getMessage();

            if (errorMsg != null && errorMsg.startsWith("UNAUTHORIZED:")) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print("{\"message\": \"" + errorMsg.replace("UNAUTHORIZED:", "") + "\"}");

            } else if (errorMsg != null && errorMsg.startsWith("FORBIDDEN:")) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.print("{\"message\": \"" + errorMsg.replace("FORBIDDEN:", "") + "\"}");

            } else {
                e.printStackTrace();
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\"message\": \"Lỗi hệ thống: Không thể kết nối cơ sở dữ liệu!\"}");
            }
        }
    }
}