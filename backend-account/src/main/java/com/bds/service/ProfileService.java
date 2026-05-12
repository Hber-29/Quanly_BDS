package com.bds.service;

import com.bds.dao.CustomerInfoDAO;
import com.bds.dao.StaffInfoDAO;
import com.bds.model.CustomerInfo;
import com.bds.model.StaffInfo;
import com.bds.util.DBContext;
import com.google.gson.Gson;
import java.sql.Connection;

public class ProfileService {
    // Khởi tạo trực tiếp tại mục khai báo biến theo yêu cầu của bạn
    private CustomerInfoDAO customerDAO = new CustomerInfoDAO();
    private StaffInfoDAO staffDAO = new StaffInfoDAO();
    private Gson gson = new Gson();

    /**
     * Lấy dữ liệu hồ sơ dựa theo RoleId trích xuất từ Token
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
     * Cập nhật hồ sơ dựa theo RoleId
     */
    public boolean updateProfileByRole(int accountId, int roleId, String jsonBody) throws Exception {
        try (Connection conn = DBContext.getWriteConnection()) {
            if (roleId == 1 || roleId == 2) {
                StaffInfo staff = gson.fromJson(jsonBody, StaffInfo.class);
                staff.setAccountId(accountId); // Đảm bảo luôn dùng ID từ Token để bảo mật
                return staffDAO.update(conn, staff);
            } else {
                CustomerInfo customer = gson.fromJson(jsonBody, CustomerInfo.class);
                customer.setAccountId(accountId);
                return customerDAO.update(conn, customer);
            }
        }
    }
}