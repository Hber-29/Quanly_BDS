package com.bds.filter; // Sửa lại tên package cho khớp với cấu trúc thư mục của bạn

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

// @WebFilter("/*") có nghĩa là bộ lọc này sẽ áp dụng cho MỌI đường dẫn API trong server này
@WebFilter("/*")
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // 🌟 CẤP GIẤY PHÉP CHO REACTJS (CỔNG 5173)
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        // Cho phép gửi kèm thông tin xác thực (token/cookie) nếu có
        response.setHeader("Access-Control-Allow-Credentials", "true");

        // Trình duyệt luôn gửi 1 request "OPTIONS" trước để dò đường.
        // Nếu thấy method là OPTIONS, ta báo SC_OK (200) để nó tự tin gửi file ảnh thực sự theo sau.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Cho phép request đi tiếp vào Servlet (UploadImageController)
        chain.doFilter(req, res);
    }
}