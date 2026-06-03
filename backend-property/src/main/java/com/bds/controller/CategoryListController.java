package com.bds.controller;

import com.bds.dao.CategoryDAO;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(value = "/api/categories")
public class CategoryListController extends HttpServlet {
    private CategoryDAO categoryDAO = new CategoryDAO();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // 1. ÉP BUỘC CẤP QUYỀN CORS TRỰC TIẾP TẠI ĐÂY
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Xử lý request OPTIONS (Dò đường của trình duyệt)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // 2. Lấy dữ liệu từ Database và trả về JSON cho React
        try {
            response.getWriter().write(gson.toJson(categoryDAO.getAllCategories()));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Lỗi khi lấy danh mục\"}");
        }
    }
}