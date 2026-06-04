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
            BufferedReader reader = request.getReader();
            JsonObject jsonReq = gson.fromJson(reader, JsonObject.class);

            int propertyId = jsonReq.get("propertyId").getAsInt();
            int accountId = jsonReq.get("accountId").getAsInt();

            int bookingId = bookingDAO.createPendingBooking(propertyId, accountId);

            if (bookingId > 0) {
                JsonObject kafkaMessage = new JsonObject();
                kafkaMessage.addProperty("bookingId", bookingId);
                kafkaMessage.addProperty("propertyId", propertyId);
                kafkaMessage.addProperty("accountId", accountId);
                kafkaMessage.addProperty("timestamp", System.currentTimeMillis());

                BookingProducer.sendBookingMessage(propertyId + "", kafkaMessage.toString());

                // 🌟 QUAN TRỌNG: Phải trả về "pending" và có bookingId
                JsonObject res = new JsonObject();
                res.addProperty("status", "pending");
                res.addProperty("bookingId", bookingId);
                res.addProperty("message", "Đang xử lý...");
                response.getWriter().write(res.toString());
            } else {
                response.setStatus(500);
                response.getWriter().write("{\"status\":\"error\", \"message\":\"Lỗi DB\"}");
            }
        } catch (Exception e) {
            response.setStatus(400);
            response.getWriter().write("{\"status\":\"error\", \"message\":\"Dữ liệu sai\"}");
        }
    }

    // 🌟 HÀM MỚI ĐỂ REACT GỌI HỎI THĂM TRẠNG THÁI
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json; charset=UTF-8");
        try {
            int bookingId = Integer.parseInt(request.getParameter("bookingId"));
            String status = bookingDAO.getBookingStatus(bookingId);

            JsonObject res = new JsonObject();
            res.addProperty("status", status); // Trả về PENDING_KAFKA, SUCCESS hoặc FAILED
            response.getWriter().write(res.toString());
        } catch (Exception e) {
            response.setStatus(400);
        }
    }
}