package com.bds.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebFilter("/*")
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // 1. Lấy tự động nguồn gốc (Origin) của trình duyệt gửi tới
        String origin = request.getHeader("Origin");

        // 2. Cấp quyền ĐỘNG: Ai gọi tới thì cấp quyền cho đúng người đó
        if (origin != null && !origin.isEmpty()) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            response.setHeader("Access-Control-Allow-Origin", "*");
        }

        // 3. Cấp quyền cho các phương thức và Header
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");

        // 4. Cho phép gửi kèm token/cookie bảo mật
        response.setHeader("Access-Control-Allow-Credentials", "true");

        // 5. Nếu là request "dò đường" (OPTIONS), trả lời luôn là OK để nó qua
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // 6. Cho phép đi tiếp vào Controller
        chain.doFilter(req, res);
    }
}