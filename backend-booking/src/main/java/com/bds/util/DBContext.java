package com.bds.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBContext {

    // Khớp với cấu hình db-master trong docker-compose.yml của bạn
    private static final String URL = "jdbc:postgresql://localhost:5431/bds_booking";
    private static final String USER = "postgres";
    private static final String PASSWORD = "postgres";

    public static Connection getConnection() {
        Connection conn = null;
        try {
            // Load driver của PostgreSQL
            Class.forName("org.postgresql.Driver");
            conn = DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (ClassNotFoundException e) {
            System.err.println("❌ Không tìm thấy Driver PostgreSQL! Hãy kiểm tra lại thư viện pom.xml");
            e.printStackTrace();
        } catch (SQLException e) {
            System.err.println("❌ Lỗi kết nối Database!");
            e.printStackTrace();
        }
        return conn;
    }
}