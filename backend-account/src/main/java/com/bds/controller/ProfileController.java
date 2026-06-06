package com.bds.controller;

import com.bds.model.CustomerInfo;
import com.bds.service.ProfileService;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.UUID;

@WebServlet("/api/profile")

@MultipartConfig(fileSizeThreshold = 1024 * 1024 * 2, maxFileSize = 1024 * 1024 * 10, maxRequestSize = 1024 * 1024 * 50)
public class ProfileController extends HttpServlet {

    private ProfileService profileService = new ProfileService();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            int accountId = Integer.parseInt(request.getParameter("accountId"));
            int roleId = Integer.parseInt(request.getParameter("roleId"));

            Object profile = profileService.getProfileByRole(accountId, roleId);
            out.print(gson.toJson(profile));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"status\":\"error\", \"message\":\"Lỗi lấy thông tin!\"}");
        } finally {
            out.flush();
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        System.out.println("DEBUG: Content-Type: " + request.getContentType());
        try {
            Part filePart = request.getPart("avatar");
            System.out.println("DEBUG: File part có null không? " + (filePart == null ? "NULL" : "CÓ DỮ LIỆU"));
            if(filePart != null) System.out.println("DEBUG: Size: " + filePart.getSize());
        } catch(Exception e) { System.out.println("DEBUG: Lỗi khi lấy file part"); }
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            int accountId = Integer.parseInt(request.getParameter("accountId"));
            int roleId = Integer.parseInt(request.getParameter("roleId"));

            // NẾU LÀ CUSTOMER (role_id = 3)
            // NẾU LÀ CUSTOMER (role_id = 3)
            if (roleId == 3) {
                com.bds.model.CustomerInfo customer = new com.bds.model.CustomerInfo();

                // 1. Lấy thông tin cơ bản
                customer.setFullName(request.getParameter("fullName"));
                customer.setPhone(request.getParameter("phone"));
                customer.setEmail(request.getParameter("email"));
                customer.setAddress(request.getParameter("address"));

                // 🔥 THÊM DÒNG NÀY ĐỂ BẮT DỮ LIỆU SỞ THÍCH (PREFERENCES)
                customer.setPreferences(request.getParameter("preferences"));

                String genderStr = request.getParameter("gender");
                if(genderStr != null && !genderStr.isEmpty()) {
                    customer.setGender(Integer.parseInt(genderStr));
                }

                // XỬ LÝ NGÀY SINH
                String dobStr = request.getParameter("dob");
                if(dobStr != null && !dobStr.trim().isEmpty() && !dobStr.equals("null")) {
                    customer.setDob(java.sql.Date.valueOf(dobStr));
                }

                // 🔥 XỬ LÝ LƯU ẢNH (Bảo vệ ảnh cũ không bị ghi đè thành NULL)
                Part filePart = null;
                try {
                    filePart = request.getPart("avatar");
                } catch (Exception e) { /* Bỏ qua nếu không gửi Multipart avatar */ }

                if (filePart != null && filePart.getSize() > 0) {
                    // Nếu user CÓ CHỌN ẢNH MỚI
                    String uploadDir = getServletContext().getRealPath("") + File.separator + "uploads";
                    File dir = new File(uploadDir);
                    if (!dir.exists()) dir.mkdirs();

                    String fileName = UUID.randomUUID().toString() + "_" + filePart.getSubmittedFileName();
                    filePart.write(uploadDir + File.separator + fileName);
                    customer.setAvatar("/api/account/uploads/" + fileName);
                } else {
                    // Nếu user KHÔNG CHỌN ẢNH MỚI -> Bắt buộc dùng lại đường dẫn ảnh cũ
                    String oldAvatar = request.getParameter("oldAvatar");
                    if(oldAvatar != null && !oldAvatar.trim().isEmpty() && !oldAvatar.equals("null")) {
                        customer.setAvatar(oldAvatar);
                    }
                }

                boolean success = profileService.updateProfileByRole(accountId, roleId, customer);
                if (success) {
                    out.print("{\"status\":\"success\", \"message\":\"Cập nhật thành công!\"}");
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print("{\"status\":\"error\", \"message\":\"Cập nhật thất bại!\"}");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"status\":\"error\", \"message\":\"Lỗi hệ thống!\"}");
        } finally {
            out.flush();
        }
    }
}