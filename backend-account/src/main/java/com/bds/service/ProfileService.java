package com.bds.service;

import com.bds.dao.CustomerInfoDAO;
import com.bds.dao.StaffInfoDAO;
import com.bds.model.CustomerInfo;
import com.bds.model.StaffInfo;
import com.bds.util.DBContext;
import java.sql.Connection;

public class ProfileService {

    private CustomerInfoDAO customerDAO = new CustomerInfoDAO();
    private StaffInfoDAO staffDAO = new StaffInfoDAO();

    /**
     * Lấy dữ liệu hồ sơ dựa theo RoleId
     */
    public Object getProfileByRole(int accountId, int roleId) throws Exception {
        try (Connection conn = DBContext.getReadConnection()) {
            if (roleId == 1 || roleId == 2) { // 1: Admin, 2: Staff
                return staffDAO.getByAccountId(conn, accountId);
            } else { // 3: Customer
                return customerDAO.getByAccountId(conn, accountId);
            }
        }
    }

    /**
     * 🔥 ĐÃ SỬA: Cập nhật hồ sơ nhận tham số là Object (Để hỗ trợ chức năng có Upload Ảnh Avatar)
     */
    public boolean updateProfileByRole(int accountId, int roleId, Object profileData) throws Exception {
        try (Connection conn = DBContext.getWriteConnection()) {
            if (roleId == 1 || roleId == 2) {
                StaffInfo staff = (StaffInfo) profileData;
                staff.setAccountId(accountId); // Đảm bảo luôn dùng ID từ Token để bảo mật
                return staffDAO.update(conn, staff);
            } else {
                CustomerInfo customer = (CustomerInfo) profileData;
                customer.setAccountId(accountId);
                return customerDAO.update(conn, customer);
            }
        }
    }
}