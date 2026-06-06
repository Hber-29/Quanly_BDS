import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  return (
    // Dùng vh-100 để chiều cao luôn bằng 100% màn hình, overflow-hidden để không cuộn toàn trang
    <div className="d-flex vh-100 overflow-hidden bg-light">
      
      {/* Gọi Sidebar vào đây */}
      <Sidebar />

      {/* Cột bên phải */}
      <div className="d-flex flex-column flex-grow-1 w-100">
        
        {/* Gọi Header vào đây */}
        <Header />

        {/* Khu vực thay đổi nội dung (Main Content) */}
        <main className="flex-grow-1 p-4 overflow-auto">
          {/* Component Outlet này sẽ tự động bị thay thế bằng trang Khách hàng / Bài đăng... dựa trên URL */}
          <Outlet /> 
        </main>
        
      </div>
    </div>
  );
};

export default AdminLayout;