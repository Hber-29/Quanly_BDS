package com.bds.controller;

import com.bds.service.AdminCustomerService;
import com.bds.dto.CustomerDTO;
import com.google.gson.Gson;

// 🔥 ĐÃ SỬA: Chuyển toàn bộ javax thành jakarta
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/admin/customers")
public class AdminCustomerController extends HttpServlet {

    // Gọi qua tầng Service thay vì DAO
    private AdminCustomerService customerService = new AdminCustomerService();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Lấy data từ Service
        List<CustomerDTO> customers = customerService.getAllCustomers();

        // Trả về JSON
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(customers));
        out.flush();
    }
}