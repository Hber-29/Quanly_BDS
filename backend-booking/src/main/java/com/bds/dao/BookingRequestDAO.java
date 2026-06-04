package com.bds.dao;

import com.bds.util.DBContext;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class BookingRequestDAO {

    // 1. Lưu yêu cầu vào DB với trạng thái PENDING_KAFKA, trả về ID vừa tạo
    public int createPendingBooking(int propertyId, int accountId) {
        // 🌟 ĐÃ SỬA: customer_id -> account_id
        String sql = "INSERT INTO booking_request (property_id, account_id, status, notes) VALUES (?, ?, 'PENDING_KAFKA', 'Đang xếp hàng chờ xử lý...')";
        int generatedId = -1;

        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            // 🌟 ĐÃ SỬA: Dùng setInt thay vì setString
            ps.setInt(1, propertyId);
            ps.setInt(2, accountId);
            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    generatedId = rs.getInt(1);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return generatedId;
    }

    // 2. Kiểm tra xem căn nhà này đã bị ai đặt thành công chưa? (Dùng cho Kafka Consumer)
    public boolean isPropertyAlreadyBooked(int propertyId) {
        String sql = "SELECT COUNT(*) FROM booking_request WHERE property_id = ? AND status = 'SUCCESS'";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            // 🌟 ĐÃ SỬA: Dùng setInt thay vì setString
            ps.setInt(1, propertyId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0; // Trả về true nếu count > 0 (đã có người cọc)
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // 3. Cập nhật lại trạng thái sau khi Kafka xử lý xong
    public void updateBookingStatus(int bookingId, String status, String notes) {
        String sql = "UPDATE booking_request SET status = ?, notes = ? WHERE booking_id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, status);
            ps.setString(2, notes);
            ps.setInt(3, bookingId);
            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Lấy trạng thái hiện tại của một đơn đặt chỗ
    public String getBookingStatus(int bookingId) {
        String sql = "SELECT status FROM booking_request WHERE booking_id = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("status");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "UNKNOWN";
    }

    // 🌟 Kiểm tra xem nhà này đã có ai đặt thành công chưa, trả về accountId của người chiến thắng
    public int getSuccessfulBookingAccountId(int propertyId) {
        String sql = "SELECT account_id FROM booking_request WHERE property_id = ? AND status = 'SUCCESS'";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, propertyId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("account_id"); // Trả về ID của người đã mua được
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return -1; // Trả về -1 nếu chưa có ai mua
    }
}