package com.bds.filter; // Đổi package cho đúng nếu cần

import com.bds.util.DBContext;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

// Bố trí bảo vệ đứng ở tất cả các cổng API dành cho Admin
@WebFilter("/api/admin/*")
public class AuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // Cho phép các request OPTIONS của CORS đi qua thoải mái
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        // Lấy tên tài khoản (username) do React gửi ngầm lên trong Header
        String username = req.getHeader("X-Username");

        if (username != null && !username.isEmpty()) {
            // Kiểm tra DB xem tài khoản này còn "sống" không
            boolean isActive = checkUserActive(username);

            if (!isActive) {
                // TÀI KHOẢN ĐÃ BỊ KHÓA -> Báo lỗi 401 (Không có quyền) và CHẶN ĐỨNG
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                res.setCharacterEncoding("UTF-8");
                res.getWriter().print("{\"status\":\"error\", \"message\":\"Tài khoản của bạn đã bị vô hiệu hóa!\"}");
                return;
            }
        }

        // Trạng thái bình thường -> Cho đi tiếp vào Controller
        chain.doFilter(request, response);
    }

    // Hàm chui xuống DB kiểm tra cột is_active
    private boolean checkUserActive(String username) {
        String sql = "SELECT is_active FROM account WHERE username = ?";
        try (Connection conn = DBContext.getReadConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getBoolean("is_active");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false; // Nếu lỗi hoặc không tìm thấy coi như khóa
    }
}