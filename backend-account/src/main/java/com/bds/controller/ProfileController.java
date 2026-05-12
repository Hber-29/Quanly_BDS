package com.bds.controller;

import com.bds.service.ProfileService;
import com.bds.util.JwtUtil;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet(name = "ProfileController", value = "/api/account/profile")
public class ProfileController extends HttpServlet {

    // Khởi tạo trực tiếp Service chuyên biệt
    private ProfileService profileService = new ProfileService();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        setupResponse(response);
        PrintWriter out = response.getWriter();
        try {
            // Lấy Token từ Header Authorization
            String authHeader = request.getHeader("Authorization");
            String token = authHeader.replace("Bearer ", "");

            int accountId = JwtUtil.getAccountIdFromToken(token);
            int roleId = JwtUtil.getRoleIdFromToken(token);

            // Gọi Service chuyên phụ trách Profile
            Object data = profileService.getProfileByRole(accountId, roleId);
            out.print(gson.toJson(data));

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{\"message\": \"Phiên đăng nhập hết hạn hoặc không hợp lệ!\"}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        setupResponse(response);
        PrintWriter out = response.getWriter();
        try {
            String authHeader = request.getHeader("Authorization");
            String token = authHeader.replace("Bearer ", "");

            int accountId = JwtUtil.getAccountIdFromToken(token);
            int roleId = JwtUtil.getRoleIdFromToken(token);

            // Đọc dữ liệu JSON từ body
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }

            boolean success = profileService.updateProfileByRole(accountId, roleId, sb.toString());

            if (success) {
                out.print("{\"message\": \"Cập nhật hồ sơ thành công!\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"message\": \"Cập nhật thất bại, vui lòng kiểm tra lại dữ liệu!\"}");
            }

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"message\": \"Lỗi hệ thống khi cập nhật hồ sơ!\"}");
        }
    }

    private void setupResponse(HttpServletResponse response) {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
    }
}
