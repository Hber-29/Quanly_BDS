package com.bds.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;

public class JwtUtil {
    // KHÓA BÍ MẬT (Secret Key): Phải giữ kín, dùng để ký Token.
    // Trong thực tế, chuỗi này nên để ở biến môi trường (Environment Variable)
    private static final String SECRET_STRING = "DayLaMotKhoaBiMatCucKyDaiVaAnToanChoDuAnBDS2026!";
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    // Thời gian sống của Token: 24 giờ (tính bằng milliseconds)
    private static final long EXPIRATION_TIME = 86400000;

    // Hàm tạo Token
    public static String generateToken(int accountId, String username, int roleId) {
        return Jwts.builder()
                .setSubject(username) // Ai là chủ thẻ?
                .claim("accountId", accountId) // Thêm dữ liệu tùy chỉnh (Payload)
                .claim("roleId", roleId)
                .setIssuedAt(new Date()) // Thời gian phát hành
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Thời gian hết hạn
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256) // Ký bằng thuật toán HS256
                .compact();
    }
}
