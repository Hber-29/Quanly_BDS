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

@WebServlet(value = "/api/property/search")
public class PropertySearchController extends HttpServlet {

    private PropertyService propertyService = new PropertyService();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 1. Cấu hình CORS để cho phép ReactJS (Front-end) gọi API mà không bị chặn
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        // 2. Tiếp nhận các tham số tìm kiếm và phân trang từ URL gửi lên
        String keyword = request.getParameter("keyword");
        String region = request.getParameter("region");
        String pageParam = request.getParameter("page");
        String limitParam = request.getParameter("limit");

        // Thiết lập giá trị phân trang mặc định an toàn
        int page = 1;
        int limit = 15; // Mặc định trang kết quả tìm kiếm sẽ hiển thị tối đa 15 bài/trang

        // 3. Kiểm tra và ép kiểu an toàn cho các tham số phân trang
        try {
            if (pageParam != null && !pageParam.trim().isEmpty()) {
                page = Integer.parseInt(pageParam);
                if (page < 1) page = 1; // Ngăn chặn phá hoại bằng số âm hoặc số 0
            }
            if (limitParam != null && !limitParam.trim().isEmpty()) {
                limit = Integer.parseInt(limitParam);
                if (limit <= 0 || limit > 50) limit = 15; // Giới hạn tối đa 50 bài để bảo vệ DB
            }
        } catch (NumberFormatException e) {
            System.out.println("⚠️ Tham số phân trang tìm kiếm không hợp lệ, hệ thống tự động dùng giá trị mặc định.");
        }

        // 4. Gọi tầng não bộ Service (Nơi đã tích hợp cả luồng kiểm tra Redis Cache và DB Replica)
        PropertyPageResponse result = propertyService.searchPropertyList(keyword, region, page, limit);

        // 5. Chuyển đổi Object kết quả thành chuỗi JSON và bắn ngược về cho Front-end
        response.getWriter().write(gson.toJson(result));
    }
}