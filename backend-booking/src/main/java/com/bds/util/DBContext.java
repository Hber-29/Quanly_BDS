package com.bds.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBContext {

    // KẾT NỐI CHÍNH CỦA BOOKING
    private static final String URL = "jdbc:postgresql://localhost:5431/bds_booking";

    // 🌟 ĐÃ SỬA: CHỈ ĐÚNG VÀO DATABASE TÀI KHOẢN (bds_account)
    private static final String ACCOUNT_DB_URL = "jdbc:postgresql://localhost:5431/bds_account";

    private static final String USER = "postgres";
    private static final String PASSWORD = "postgres";

    public static Connection getConnection() {
        Connection conn = null;
        try {
            Class.forName("org.postgresql.Driver");
            conn = DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return conn;
    }

    // 🌟 ĐÃ SỬA TÊN HÀM CHO CHUẨN
    public static Connection getAccountDBConnection() {
        Connection conn = null;
        try {
            Class.forName("org.postgresql.Driver");
            conn = DriverManager.getConnection(ACCOUNT_DB_URL, USER, PASSWORD);
        } catch (Exception e) {
            System.err.println("❌ Lỗi kết nối sang DB Account!");
            e.printStackTrace();
        }
        return conn;
    }
}