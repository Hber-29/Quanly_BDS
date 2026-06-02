package com.bds.controller;

import com.bds.service.MinioService;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import java.io.IOException;
import java.io.InputStream;

@WebServlet(value = "/api/upload/image")
// @MultipartConfig cực kỳ quan trọng để Servlet hiểu request này chứa File
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024 * 2,  // 2MB
        maxFileSize = 1024 * 1024 * 10,       // Tối đa 10MB mỗi file
        maxRequestSize = 1024 * 1024 * 50     // Tối đa 50MB tổng request
)
public class UploadImageController extends HttpServlet {

    private MinioService minioService = new MinioService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 1. Cấu hình CORS để Frontend (React) bắn file qua không bị chặn
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");

        JsonObject jsonResponse = new JsonObject();

        try {
            // 2. Trích xuất phần dữ liệu File từ Request (Frontend sẽ gửi file với name="file")
            Part filePart = request.getPart("file");
            if (filePart == null || filePart.getSize() == 0) {
                response.setStatus(400);
                jsonResponse.addProperty("error", "File ảnh không tồn tại hoặc bị rỗng.");
                response.getWriter().write(jsonResponse.toString());
                return;
            }

            // 3. Lấy thông tin cơ bản của file
            String originalFileName = filePart.getSubmittedFileName();
            String contentType = filePart.getContentType();
            InputStream fileContent = filePart.getInputStream();

            // 4. Bắn stream ảnh sang MinIO Service xử lý
            System.out.println("🚀 Đang truyền tải ảnh lên MinIO Object Storage...");
            String imageUrl = minioService.uploadImage(fileContent, originalFileName, contentType);

            // 5. Trả về Link URL công khai cho Frontend
            jsonResponse.addProperty("message", "Upload thành công!");
            jsonResponse.addProperty("imageUrl", imageUrl);
            response.setStatus(200);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
            jsonResponse.addProperty("error", "Lỗi Server khi upload ảnh: " + e.getMessage());
        }

        // Bắn JSON kết quả về lại cho ReactJS
        response.getWriter().write(jsonResponse.toString());
    }

    // Xử lý pre-flight request của CORS (bắt buộc khi Upload file khác port)
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }
}