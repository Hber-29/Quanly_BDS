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
}
