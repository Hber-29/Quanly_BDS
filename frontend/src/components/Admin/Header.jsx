import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { adminApi } from '../../api/adminApi'; // Đảm bảo đường dẫn này đúng với project của sếp

const Header = () => {
  
  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Sếp có chắc chắn muốn đăng xuất hệ thống?")) {
      adminApi.logout();
    }
  };

  return (
    <header className="p-3 bg-danger shadow-sm d-flex justify-content-between align-items-center">
      <div className="fs-5 fw-semibold text-white">
        Hệ thống Quản trị Trung tâm
      </div>
      
      <div className="d-flex align-items-center gap-3">
        {/* Nút thông báo */}
        <button className="btn btn-outline-light position-relative rounded-circle p-2 border-0">
          <i className="bi bi-bell-fill"></i>
          <span className="position-absolute top-25 start-75 translate-middle p-1 bg-warning border border-light rounded-circle">
            <span className="visually-hidden">Thông báo mới</span>
          </span>
        </button>

        {/* Dropdown User */}
        <Dropdown align="end">
          <Dropdown.Toggle variant="danger" id="dropdown-user" className="d-flex align-items-center border-0 shadow-none text-white">
            <img 
              src="https://ui-avatars.com/api/?name=Admin&background=ffffff&color=dc3545" 
              alt="Avatar" 
              width="35" 
              height="35" 
              className="rounded-circle me-2 shadow-sm" 
            />
            <strong>Super Admin</strong>
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow border-0 mt-2">
            <Dropdown.Item href="#/profile"><i className="bi bi-person me-2"></i> Hồ sơ cá nhân</Dropdown.Item>
            <Dropdown.Item href="#/settings"><i className="bi bi-gear me-2"></i> Cài đặt</Dropdown.Item>
            <Dropdown.Divider />
            
            {/* 🔥 NÚT ĐĂNG XUẤT ĐÃ ĐƯỢC KẾT NỐI VỚI HÀM LOGOUT */}
            <Dropdown.Item className="text-danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;