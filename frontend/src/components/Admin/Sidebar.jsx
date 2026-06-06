import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const Sidebar = () => {
  const location = useLocation();

  // Hàm kiểm tra: Nếu đang ở link đó thì nền Đỏ (bg-danger), chữ Trắng. Còn không thì chữ Đen.
  const isActive = (path) => location.pathname === path ? 'active bg-danger text-white' : 'text-dark';

  return (
    // Dùng bg-white, thêm viền bên phải (border-end)
    <div className="d-flex flex-column vh-100 p-3 bg-white border-end shadow-sm" style={{ width: '280px' }}>
      <Link to="/admin" className="d-flex align-items-center mb-4 text-danger text-decoration-none">
        <i className="bi bi-buildings-fill fs-3 me-2"></i>
        <span className="fs-5 fw-bold text-uppercase">BĐS Admin</span>
      </Link>
      <hr className="text-secondary mt-0" />
      
      <Nav variant="pills" className="flex-column mb-auto gap-2">
        <Nav.Item>
          <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
            <i className="bi bi-speedometer2 me-3"></i> Dashboard
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/admin/customers" className={`nav-link ${isActive('/admin/customers')}`}>
            <i className="bi bi-people-fill me-3"></i> Quản lý Khách hàng
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/admin/properties" className={`nav-link ${isActive('/admin/properties')}`}>
            <i className="bi bi-house-door-fill me-3"></i> Quản lý Bài đăng
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/admin/bookings" className={`nav-link ${isActive('/admin/bookings')}`}>
            <i className="bi bi-telephone-fill me-3"></i> Quản lý Tư vấn
          </Link>
        </Nav.Item>
      </Nav>
      
      <hr className="text-secondary" />
      <div className="small text-muted text-center">
        © 2026 BDS System
      </div>
    </div>
  );
};

export default Sidebar;