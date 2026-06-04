package com.bds.controller;

import com.bds.dto.ResponseDTO.PropertyDetailDTO;
import com.bds.service.PropertyService;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/property/detail")
public class PropertyDetailController extends HttpServlet {
    private PropertyService propertyService = new PropertyService();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        try {
            String idParam = request.getParameter("id");
            if (idParam == null || idParam.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"status\":\"error\", \"message\":\"Thiếu ID bài đăng\"}");
                return;
            }

            // 🔥 Bật lại lệnh parse int
            int propertyId = Integer.parseInt(idParam);

            PropertyDetailDTO propertyDto = propertyService.getPropertyDetail(propertyId);

            if (propertyDto != null) {
                response.getWriter().write(gson.toJson(propertyDto));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"status\":\"error\", \"message\":\"Không tìm thấy bài đăng này\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"status\":\"error\", \"message\":\"Lỗi server\"}");
        }
    }
}