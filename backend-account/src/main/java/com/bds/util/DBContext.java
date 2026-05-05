package com.bds.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBContext {

    // Tài khoản mặc định đã cấu hình trong Docker
    private static final String USER = "postgres";
    private static final String PASS = "postgres";

    // URL kết nối trực tiếp đến Master (Cổng 5431) để GHI dữ liệu (Đăng ký)
    private static final String WRITE_URL = "jdbc:postgresql://localhost:5431/real_estate";

    // URL kết nối đến Nginx Load Balancer (Cổng 5433) để ĐỌC dữ liệu (Kiểm tra trùng lặp)
    private static final String READ_URL = "jdbc:postgresql://localhost:5433/real_estate";

    /**
     * Kết nối dùng để GHI dữ liệu (INSERT, UPDATE, DELETE)
     * Kết nối thẳng tới Master DB
     */
    public static Connection getWriteConnection() throws ClassNotFoundException, SQLException {
        Class.forName("org.postgresql.Driver");
        return DriverManager.getConnection(WRITE_URL, USER, PASS);
    }

    /**
     * Kết nối dùng để ĐỌC dữ liệu (SELECT)
     * Đi qua Nginx để tối ưu tải
     */
    public static Connection getReadConnection() throws ClassNotFoundException, SQLException {
        Class.forName("org.postgresql.Driver");
        return DriverManager.getConnection(READ_URL, USER, PASS);
    }
}
