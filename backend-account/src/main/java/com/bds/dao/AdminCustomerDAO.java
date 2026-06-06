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

    public boolean updateCustomer(CustomerDTO customer) {
        // Viết câu SQL cơ bản
        StringBuilder sql = new StringBuilder("UPDATE customer_info SET full_name = ?, phone = ?, gender = ?, dob = ?, address = ?");

        // Nếu có ảnh gửi lên thì mới Update cột avatar
        if (customer.getAvatar() != null) {
            sql.append(", avatar = ?");
        }
        sql.append(" WHERE account_id = ?"); // Chốt đuôi câu SQL

        try (Connection conn = DBContext.getWriteConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            ps.setString(1, customer.getFullName());
            ps.setString(2, customer.getPhone());
            ps.setString(3, customer.getGender());

            // Xử lý Ngày sinh (Ép kiểu)
            if (customer.getDob() != null && !customer.getDob().trim().isEmpty()) {
                ps.setDate(4, java.sql.Date.valueOf(customer.getDob()));
            } else {
                ps.setNull(4, java.sql.Types.DATE);
            }

            ps.setString(5, customer.getAddress());

            int paramIndex = 6;
            // Nếu có avatar thì gán giá trị vào dấu ? tiếp theo
            if (customer.getAvatar() != null) {
                ps.setString(paramIndex++, customer.getAvatar());
            }

            // Tham số cuối cùng luôn là accountId
            ps.setInt(paramIndex, customer.getAccountId());

            int rowAffected = ps.executeUpdate();
            return rowAffected > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
    // Hàm Cập nhật trạng thái tài khoản (Khóa / Mở khóa)
    public boolean updateAccountStatus(int accountId, boolean isActive) {
        String sql = "UPDATE account SET is_active = ? WHERE account_id = ?";
        try (Connection conn = DBContext.getWriteConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setBoolean(1, isActive);
            ps.setInt(2, accountId);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}