package com.bds.controller;

import com.bds.service.AdminCustomerService;
import com.bds.dto.CustomerDTO;
import com.google.gson.Gson;

// 🔥 ĐÃ SỬA: Chuyển toàn bộ javax thành jakarta
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
import java.nio.file.Paths;
import java.util.List;

@WebServlet("/api/admin/customers")
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024 * 2,  // 2MB
        maxFileSize = 1024 * 1024 * 10,       // Tối đa 10MB cho 1 file
        maxRequestSize = 1024 * 1024 * 50     // Tối đa 50MB cho cả request
)
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

    // Thêm hàm doPut để xử lý request Cập nhật (Method PUT)
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // 1. Đọc các trường text gửi lên từ FormData
            int accountId = Integer.parseInt(request.getParameter("accountId"));
            String fullName = request.getParameter("fullName");
            String phone = request.getParameter("phone");
            String gender = request.getParameter("gender");
            String dob = request.getParameter("dob");
            String address = request.getParameter("address");

            // 2. XỬ LÝ LƯU FILE ẢNH (Nếu có)
            Part filePart = request.getPart("avatar"); // Tên "avatar" phải khớp với tên lúc append ở React
            String avatarUrl = null;

            if (filePart != null && filePart.getSize() > 0) {
                // Tạo thư mục "uploads" bên trong thư mục chạy của Tomcat để chứa ảnh
                String uploadPath = getServletContext().getRealPath("") + File.separator + "uploads";
                File uploadDir = new File(uploadPath);
                if (!uploadDir.exists()) uploadDir.mkdir();

                // Lấy tên file gốc và làm cho nó duy nhất (tránh trùng tên)
                String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
                String uniqueFileName = System.currentTimeMillis() + "_" + fileName;

                // Lưu file vào ổ cứng máy chủ
                filePart.write(uploadPath + File.separator + uniqueFileName);

                // Tạo đường dẫn URL để lưu xuống Database (Ví dụ: /uploads/16234234_avatar.jpg)
                avatarUrl = request.getContextPath() + "/uploads/" + uniqueFileName;
            }

            // 3. Đóng gói vào Object
            CustomerDTO customer = new CustomerDTO();
            customer.setAccountId(accountId);
            customer.setFullName(fullName);
            customer.setPhone(phone);
            customer.setGender(gender);
            customer.setDob(dob);
            customer.setAddress(address);
            if (avatarUrl != null) {
                customer.setAvatar(avatarUrl); // Nếu có chọn ảnh thì mới set để lưu
            }

            // 4. Gọi Service
            boolean isSuccess = customerService.updateCustomer(customer);

            if (isSuccess) {
                out.print("{\"status\":\"success\", \"message\":\"Cập nhật thông tin thành công!\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"status\":\"error\", \"message\":\"Cập nhật thất bại!\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"status\":\"error\", \"message\":\"Lỗi hệ thống khi xử lý dữ liệu!\"}");
        } finally {
            out.flush();
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // Lấy ID và trạng thái (true/false) truyền từ React xuống
            String accountIdStr = request.getParameter("accountId");
            String isActiveStr = request.getParameter("isActive");

            if (accountIdStr == null || isActiveStr == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"status\":\"error\", \"message\":\"Thiếu tham số!\"}");
                return;
            }

            int accountId = Integer.parseInt(accountIdStr);
            boolean isActive = Boolean.parseBoolean(isActiveStr);

            // Gọi Service để cập nhật trạng thái
            boolean isSuccess = customerService.updateAccountStatus(accountId, isActive);

            if (isSuccess) {
                String msg = isActive ? "Đã MỞ KHÓA tài khoản!" : "Đã KHÓA tài khoản thành công!";
                out.print("{\"status\":\"success\", \"message\":\"" + msg + "\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"status\":\"error\", \"message\":\"Thao tác thất bại!\"}");
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