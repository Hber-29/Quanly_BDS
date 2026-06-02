package com.bds.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBContext {

    // Tài khoản mặc định đã cấu hình trong Docker
    private static final String USER = "postgres";
    private static final String PASS = "postgres";

    // URL kết nối trực tiếp đến Master (Cổng 5431) - Dùng để TẠO BÀI ĐĂNG (GHI)
    private static final String WRITE_URL = "jdbc:postgresql://localhost:5431/bds_property";

    // URL kết nối đến Nginx Load Balancer (Cổng 5433) - Dùng để XEM & TÌM KIẾM (ĐỌC)
    private static final String READ_URL = "jdbc:postgresql://localhost:5433/bds_property";

    /**
     * Kết nối dùng để GHI dữ liệu (INSERT, UPDATE, DELETE bài đăng)
     * Kết nối thẳng tới Master DB để đảm bảo dữ liệu mới nhất
     */
    public static Connection getWriteConnection() throws ClassNotFoundException, SQLException {
        Class.forName("org.postgresql.Driver");
        return DriverManager.getConnection(WRITE_URL, USER, PASS);
    }

    /**
     * Kết nối dùng để ĐỌC dữ liệu (SELECT danh sách, tìm kiếm)
     * Đi qua Nginx để phân phối tải sang các con Replica
     */
    public static Connection getReadConnection() throws ClassNotFoundException, SQLException {
        Class.forName("org.postgresql.Driver");
        return DriverManager.getConnection(READ_URL, USER, PASS);
    }
}
