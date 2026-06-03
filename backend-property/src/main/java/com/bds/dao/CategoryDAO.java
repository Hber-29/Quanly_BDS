package com.bds.dao;

import com.bds.model.Category;
import com.bds.util.DBContext;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class CategoryDAO {

    /**
     * Hàm lấy toàn bộ danh sách danh mục từ Database
     * @return List<Category>
     */
    public List<Category> getAllCategories() {
        List<Category> list = new ArrayList<>();
        // Câu lệnh SQL lấy tất cả dữ liệu từ bảng category
        String sql = "SELECT * FROM category ORDER BY category_id ASC";

        // Sử dụng getReadConnection() (Cổng 5432 - Replica) vì đây chỉ là thao tác Đọc dữ liệu
        try (Connection conn = DBContext.getReadConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Category c = new Category();
                // Bốc tách dữ liệu từ ResultSet ép vào Object Category
                c.setCategoryId(rs.getInt("category_id"));
                c.setCategoryName(rs.getString("category_name"));

                // Thêm vào danh sách
                list.add(c);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Lỗi khi lấy danh sách Category: " + e.getMessage());
            e.printStackTrace();
        }

        return list;
    }
}