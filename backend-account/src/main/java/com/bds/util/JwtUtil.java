package com.bds.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;

public class JwtUtil {
    private static final String SECRET_STRING = "DayLaMotKhoaBiMatCucKyDaiVaAnToanChoDuAnBDS2026!";
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());
    private static final long EXPIRATION_TIME = 86400000;

    // 1. Hàm tạo Token (Giữ nguyên của bạn)
    public static String generateToken(int accountId, String username, int roleId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("accountId", accountId)
                .claim("roleId", roleId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Hàm GIẢI MÃ (Bổ sung để sửa lỗi Controller)
    private static Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public static int getAccountIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("accountId", Integer.class);
    }

    public static int getRoleIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("roleId", Integer.class);
    }
}