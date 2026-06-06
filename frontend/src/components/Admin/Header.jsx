import React from 'react';
import { Dropdown } from 'react-bootstrap';

const Header = () => {
  return (
    // Dùng bg-danger (Đỏ Bootstrap) và text-white
    <header className="p-3 bg-danger shadow-sm d-flex justify-content-between align-items-center">
      <div className="fs-5 fw-semibold text-white">
        Hệ thống Quản trị Trung tâm
      </div>
      
      <div className="d-flex align-items-center gap-3">
        {/* Nút thông báo - Đổi viền trắng cho hợp nền đỏ */}
        <button className="btn btn-outline-light position-relative rounded-circle p-2 border-0">
          <i className="bi bi-bell-fill"></i>
          {/* Chấm đỏ thông báo đổi sang màu vàng (warning) cho nổi */}
          <span className="position-absolute top-25 start-75 translate-middle p-1 bg-warning border border-light rounded-circle">
            <span className="visually-hidden">Thông báo mới</span>
          </span>
        </button>

        {/* Dropdown User */}
        <Dropdown align="end">
          <Dropdown.Toggle variant="danger" id="dropdown-user" className="d-flex align-items-center border-0 shadow-none text-white">
            <img 
              // Đổi màu Avatar: Nền trắng, chữ đỏ
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
            <Dropdown.Item className="text-danger" href="#/logout">
              <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;