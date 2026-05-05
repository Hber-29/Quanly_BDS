package com.bds.controller;

import com.bds.dto.RegisterDTO;
import com.bds.service.AccountService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "RegisterController", value = "/register")
public class RegisterController extends HttpServlet {
    private AccountService accountService = new AccountService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Thiết lập header hỗ trợ JSON và xử lý tiếng Việt
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            RegisterDTO dto = new RegisterDTO();

            // 1. Nhận thông tin Account
            dto.setUsername(request.getParameter("username"));
            dto.setPassword(request.getParameter("password"));

            // Ép kiểu roleId an toàn, mặc định là 3 (CUSTOMER)
            String roleIdStr = request.getParameter("roleId");
            dto.setRoleId(roleIdStr != null ? Integer.parseInt(roleIdStr) : 3);

            // 2. Nhận thông tin Customer Info
            dto.setFullName(request.getParameter("fullName"));

            // Ép kiểu gender an toàn
            String genderStr = request.getParameter("gender");
            dto.setGender(genderStr != null ? Integer.parseInt(genderStr) : 1);

            // dob gửi từ FE là chuỗi "yyyy-MM-dd", truyền thẳng vào DTO để Service xử lý
            dto.setDob(request.getParameter("dob"));

            dto.setPhone(request.getParameter("phone"));
            dto.setEmail(request.getParameter("email"));
            dto.setAddress(request.getParameter("address"));

            // Nhận thêm trường preferences (sở thích)
            dto.setPreferences(request.getParameter("preferences"));

            // 3. Gọi Service xử lý nghiệp vụ
            String result = accountService.registerCustomer(dto);

            if ("SUCCESS".equals(result)) {
                response.setStatus(HttpServletResponse.SC_CREATED);
                response.getWriter().write("{\"status\": \"success\", \"message\": \"Đăng ký thành công!\"}");
            } else {
                // Trả về lỗi nghiệp vụ (ví dụ: Trùng username, password yếu...)
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"status\": \"fail\", \"message\": \"" + result + "\"}");
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"status\": \"error\", \"message\": \"Lỗi định dạng số (gender hoặc roleId).\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"status\": \"error\", \"message\": \"Lỗi hệ thống không xác định.\"}");
        }
    }
}
