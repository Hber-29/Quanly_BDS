package com.bds.controller;

import com.bds.dto.ResponseDTO.PropertyPageResponse;
import com.bds.service.PropertyService;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(value = "/api/property/list")
public class PropertyListController extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 1. Thiết lập CORS và tiếng Việt cho JSON
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
//        response.setHeader("Access-Control-Allow-Origin", "*");
//        response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
//        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        // 2. Định nghĩa số trang mặc định nếu client không truyền lên
        int page = 1;
        int limit = 8; // Đặt mặc định là 8 để trang chủ (nếu quên truyền tham số) vẫn sống sót

        // 3. Đọc tham số từ Frontend gửi lên
        String pageParam = request.getParameter("page");
        String limitParam = request.getParameter("limit");

        try {
            if (pageParam != null && !pageParam.trim().isEmpty()) {
                page = Integer.parseInt(pageParam);
                if (page < 1) page = 1; // Chống user truyền số âm
            }
            if (limitParam != null && !limitParam.trim().isEmpty()) {
                limit = Integer.parseInt(limitParam);
                if (limit <= 0 || limit > 50) limit = 8; // Chống spam request bắt DB kéo quá nhiều dữ liệu
            }
        } catch (NumberFormatException e) {
            // Nếu Frontend truyền bậy bạ (chữ cái), giữ nguyên mặc định 1 và 8
            System.out.println("Tham số phân trang không hợp lệ, dùng giá trị mặc định.");
        }

        // 4. Gọi Service
        PropertyService service = new PropertyService();
        PropertyPageResponse result = service.getPropertyList(page, limit);

        // 5. Trả về JSON
        Gson gson = new Gson();
        response.getWriter().write(gson.toJson(result));
    }
}