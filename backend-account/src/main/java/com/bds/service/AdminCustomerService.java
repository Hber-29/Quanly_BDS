package com.bds.service;

import com.bds.dao.AdminCustomerDAO;
import com.bds.dto.CustomerDTO;
import java.util.List;

public class AdminCustomerService {
    private AdminCustomerDAO customerDAO = new AdminCustomerDAO();

    public List<CustomerDTO> getAllCustomers() {
        // Sau này sếp có thể thêm logic kiểm tra, filter dữ liệu ở đây trước khi trả về
        return customerDAO.getAllCustomers();
    }
    // Thêm hàm này vào dưới hàm getAllCustomers
    public boolean updateCustomer(CustomerDTO customer) {
        // Sau này nếu sếp muốn validate dữ liệu (VD: Số ĐT phải đủ 10 số) thì viết ở đây
        return customerDAO.updateCustomer(customer);
    }

    public boolean updateAccountStatus(int accountId, boolean isActive) {
        return customerDAO.updateAccountStatus(accountId, isActive);
    }
}
