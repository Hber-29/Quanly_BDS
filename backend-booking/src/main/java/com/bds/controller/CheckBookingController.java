package com.bds.controller;

import com.bds.dao.BookingRequestDAO;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/booking/check")
public class CheckBookingController extends HttpServlet {

    private BookingRequestDAO bookingDAO = new BookingRequestDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json; charset=UTF-8");

        try {
            int propertyId = Integer.parseInt(request.getParameter("propertyId"));
            int bookedAccountId = bookingDAO.getSuccessfulBookingAccountId(propertyId);

            JsonObject res = new JsonObject();
            if (bookedAccountId != -1) {
                res.addProperty("isBooked", true);
                res.addProperty("bookedByAccountId", bookedAccountId);
            } else {
                res.addProperty("isBooked", false);
            }

            response.getWriter().write(res.toString());
        } catch (Exception e) {
            response.setStatus(400);
            response.getWriter().write("{\"error\":\"Dữ liệu không hợp lệ\"}");
        }
    }
}
