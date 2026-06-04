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
        // 1. Cấu hình định dạng tiếng Việt đầu ra cho JSON
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // 2. Tiếp nhận các tham số tìm kiếm và phân trang từ URL gửi lên
        String keyword = request.getParameter("keyword");
        String regionIdParam = request.getParameter("regionId"); // Đón nhận ID khu vực kiểu số nguyên
        String pageParam = request.getParameter("page");
        String limitParam = request.getParameter("limit");

        // Thiết lập giá trị phân trang mặc định an toàn
        int page = 1;
        int limit = 15;
        int regionId = 0; // Giá trị mặc định bằng 0 nghĩa là Tìm kiếm trên Toàn quốc

        // 3. Kiểm tra và ép kiểu dữ liệu an toàn cho các tham số đầu vào
        try {
            if (regionIdParam != null && !regionIdParam.trim().isEmpty()) {
                regionId = Integer.parseInt(regionIdParam);
            }
            if (pageParam != null && !pageParam.trim().isEmpty()) {
                page = Integer.parseInt(pageParam);
                if (page < 1) page = 1;
            }
            if (limitParam != null && !limitParam.trim().isEmpty()) {
                limit = Integer.parseInt(limitParam);
                if (limit <= 0 || limit > 50) limit = 15;
            }
        } catch (NumberFormatException e) {
            System.out.println("⚠️ Tham số phân trang tìm kiếm không hợp lệ, hệ thống tự động dùng giá trị mặc định.");
        }

        // 4. Chọc xuống tầng não bộ Service để xử lý tìm kiếm và điều phối luồng dữ liệu
        PropertyPageResponse result = propertyService.searchPropertyList(keyword, regionId, page, limit);

        // 5. Chuyển đổi Object kết quả thành chuỗi JSON và bắn ngược về cho Front-end
        response.getWriter().write(gson.toJson(result));
    }
}