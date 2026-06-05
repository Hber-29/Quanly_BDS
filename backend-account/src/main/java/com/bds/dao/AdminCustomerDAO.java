package com.bds.dao;

import com.bds.dto.CustomerDTO;
import com.bds.util.DBContext;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class AdminCustomerDAO {

    public List<CustomerDTO> getAllCustomers() {
        List<CustomerDTO> list = new ArrayList<>();

        // ĐÃ SỬA LẠI SQL: Lấy c.email thay vì a.email, lấy a.is_active thay vì a.status
        String sql = "SELECT a.account_id, a.is_active, " +
                "c.email, c.full_name, c.phone, c.gender, c.dob, c.address, c.avatar " +
                "FROM account a " +
                "JOIN role r ON a.role_id = r.role_id " +
                "LEFT JOIN customer_info c ON a.account_id = c.account_id " +
                "WHERE r.role_name = 'CUSTOMER'";

        try (Connection conn = DBContext.getReadConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                CustomerDTO customer = new CustomerDTO();
                customer.setAccountId(rs.getInt("account_id"));

                // Lấy email từ bảng c (customer_info)
                customer.setEmail(rs.getString("email"));

                // ĐÃ SỬA: Chuyển đổi boolean is_active thành chuỗi ACTIVE/BANNED cho Frontend dễ đọc
                boolean isActive = rs.getBoolean("is_active");
                customer.setStatus(isActive ? "ACTIVE" : "BANNED");

                customer.setFullName(rs.getString("full_name"));
                customer.setPhone(rs.getString("phone"));
                customer.setGender(rs.getString("gender"));
                customer.setDob(rs.getString("dob"));
                customer.setAddress(rs.getString("address"));
                customer.setAvatar(rs.getString("avatar"));

                list.add(customer);
            }
        } catch (Exception e) {
            e.printStackTrace(); // Lần trước nó nhảy vào đây nên sếp thấy []
        }
        return list;
    }
}