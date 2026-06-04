package com.bds.controller;

import com.bds.dao.BookingRequestDAO;
import com.bds.kafka.BookingProducer;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;

@WebServlet("/api/booking/request")
public class BookingController extends HttpServlet {

    private BookingRequestDAO bookingDAO = new BookingRequestDAO();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        try {
            // 1. Đọc dữ liệu JSON từ React / Postman gửi lên
            BufferedReader reader = request.getReader();
            JsonObject jsonReq = gson.fromJson(reader, JsonObject.class);

            // 🌟 ĐÃ SỬA: Lấy kiểu số Nguyên (Int) thay vì String
            int propertyId = jsonReq.get("propertyId").getAsInt();

            // 🌟 ĐÃ SỬA: Lấy accountId thay vì customerId
            int accountId = jsonReq.get("accountId").getAsInt();

            // 2. Lưu vào Database với trạng thái 'PENDING_KAFKA'
            int bookingId = bookingDAO.createPendingBooking(propertyId, accountId);

            if (bookingId > 0) {
                // 3. Đóng gói cái "Phong bì" để ném vào Kafka
                JsonObject kafkaMessage = new JsonObject();
                kafkaMessage.addProperty("bookingId", bookingId);
                kafkaMessage.addProperty("propertyId", propertyId);
                kafkaMessage.addProperty("accountId", accountId);
                kafkaMessage.addProperty("timestamp", System.currentTimeMillis()); // Thời gian thực

                // 4. Giao cho Producer ném lên Kafka
                // 🌟 BÍ QUYẾT: Phải cộng thêm chuỗi rỗng ("") để biến propertyId thành String
                // vì Kafka bắt buộc KEY phân luồng phải là kiểu String
                BookingProducer.sendBookingMessage(propertyId + "", kafkaMessage.toString());

                // 5. Trả lời ngay lập tức cho React để hiển thị thông báo
                JsonObject res = new JsonObject();
                res.addProperty("status", "success");
                res.addProperty("message", "Yêu cầu đặt chỗ đã được đưa vào hàng đợi ưu tiên!");
                response.getWriter().write(res.toString());
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"status\":\"error\", \"message\":\"Lỗi ghi nhận Database\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"status\":\"error\", \"message\":\"Dữ liệu gửi lên không hợp lệ\"}");
        }
    }
}