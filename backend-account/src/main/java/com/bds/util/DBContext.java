package com.bds.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBContext {

    // Tài khoản mặc định đã cấu hình trong Docker
    private static final String USER = "postgres";
    private static final String PASS = "postgres";

    // ĐÃ SỬA: Thay real_estate thành bds_account (Cổng 5431 - Master)
    private static final String WRITE_URL = "jdbc:postgresql://localhost:5431/bds_account";

    // ĐÃ SỬA: Thay real_estate thành bds_account (Cổng 5433 - Nginx LB)
    private static final String READ_URL = "jdbc:postgresql://localhost:5433/bds_account";

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