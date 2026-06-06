package com.bds.controller;

import com.bds.dao.AuthDAO;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.UUID;

@WebServlet("/api/auth/login")
public class AuthController extends HttpServlet {

    private AuthDAO authDAO = new AuthDAO();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            BufferedReader reader = request.getReader();
            JsonObject jsonObject = gson.fromJson(reader, JsonObject.class);

            String username = jsonObject.get("username").getAsString();
            String password = jsonObject.get("password").getAsString();

            String loginResult = authDAO.checkLogin(username, password);

            if ("LOCKED".equals(loginResult)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.print("{\"status\":\"error\", \"message\":\"Tài khoản của bạn đã bị khóa!\"}");

            } else if ("FAIL".equals(loginResult)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print("{\"status\":\"error\", \"message\":\"Sai email hoặc mật khẩu!\"}");

            } else {
                // ĐĂNG NHẬP THÀNH CÔNG 🎉
                String token = UUID.randomUUID().toString();
                String role = loginResult;

                // 🔥 1. GỌI HÀM LẤY ID SẾP VỪA TẠO BÊN DAO
                int accountId = authDAO.getAccountIdByUsername(username);

                // 🔥 2. NHÉT accountId VÀO CHUỖI JSON TRẢ VỀ CHO REACT
                out.print("{\"status\":\"success\", \"message\":\"Đăng nhập thành công!\", \"token\":\"" + token + "\", \"role\":\"" + role + "\", \"accountId\":\"" + accountId + "\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"status\":\"error\", \"message\":\"Lỗi hệ thống!\"}");
        } finally {
            out.flush();
        }
    }
}