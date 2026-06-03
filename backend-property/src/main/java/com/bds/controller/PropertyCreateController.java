package com.bds.controller;

import com.bds.model.Property;
import com.bds.service.PropertyService;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/property/create")
public class PropertyCreateController extends HttpServlet {

    // Khởi tạo tầng Service (Bạn kiểm tra lại đường dẫn package nếu khác nhé)
    private PropertyService propertyService = new PropertyService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 1. Cấu hình UTF-8 (Cực kỳ quan trọng để lưu tiếng Việt không bị lỗi dấu ??)
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        try {
            // 2. Parse chuỗi JSON từ React gửi lên
            JsonObject jsonRequest = JsonParser.parseReader(request.getReader()).getAsJsonObject();

            Property property = new Property();

            // 3. Lấy accountId (ĐỂ FIX TRUYỆT ĐỂ LỖI NULL TRONG POSTGRESQL)
            if (jsonRequest.has("accountId") && !jsonRequest.get("accountId").isJsonNull()) {
                property.setAccountId(jsonRequest.get("accountId").getAsInt());
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"status\":\"error\", \"message\":\"Lỗi: Không xác định được người đăng tin (thiếu accountId).\"}");
                return;
            }

            // 4. Trích xuất object "details" (Tiêu đề, giá, diện tích...)
            if (jsonRequest.has("details") && !jsonRequest.get("details").isJsonNull()) {
                JsonObject details = jsonRequest.getAsJsonObject("details");
                if (details.has("title") && !details.get("title").isJsonNull()) {
                    property.setTitle(details.get("title").getAsString());
                }
                if (details.has("description") && !details.get("description").isJsonNull()) {
                    property.setDescription(details.get("description").getAsString());
                }
                if (details.has("price") && !details.get("price").isJsonNull()) {
                    property.setPrice(details.get("price").getAsBigDecimal());
                }
                if (details.has("area") && !details.get("area").isJsonNull()) {
                    property.setArea(details.get("area").getAsFloat());
                }
                if (details.has("categoryId") && !details.get("categoryId").isJsonNull()) {
                    property.setCategoryId(details.get("categoryId").getAsInt());
                }
            }

            // 5. Trích xuất chuỗi địa chỉ (fullAddress)
            if (jsonRequest.has("fullAddress") && !jsonRequest.get("fullAddress").isJsonNull()) {
                property.setAddress(jsonRequest.get("fullAddress").getAsString());
            }

            // Tạm thời gán RegionID = 1 (Bạn có thể bổ sung logic map theo tỉnh thành sau)
            property.setRegionId(1);

            // 6. Trích xuất mảng link ảnh từ MinIO
            List<String> imageUrls = new ArrayList<>();
            if (jsonRequest.has("images") && jsonRequest.get("images").isJsonArray()) {
                JsonArray imagesArray = jsonRequest.getAsJsonArray("images");
                for (int i = 0; i < imagesArray.size(); i++) {
                    imageUrls.add(imagesArray.get(i).getAsString());
                }
            }
            // Gán danh sách link ảnh vào Object Property
            property.setImages(imageUrls);

            // 7. Gọi tầng Service để lưu vào Database
            boolean isSuccess = propertyService.createProperty(property, imageUrls);

            // 8. Phản hồi về Frontend
            if (isSuccess) {
                response.getWriter().write("{\"status\":\"success\", \"message\":\"Tạo tin đăng bất động sản thành công!\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"status\":\"error\", \"message\":\"Lỗi hệ thống khi lưu vào Database.\"}");
            }

        } catch (Exception e) {
            e.printStackTrace(); // In lỗi ra log Tomcat để dễ debug
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"status\":\"error\", \"message\":\"Dữ liệu đầu vào không hợp lệ: " + e.getMessage() + "\"}");
        }
    }
}