import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login.jsx'
import Register from './Register.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 1. Vào trang web mặc định sẽ nhảy sang Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* 2. Route dành cho Đăng nhập */}
        <Route path="/login" element={<Login />} />
        
        {/* 3. Route dành cho Đăng ký */}
        <Route path="/register" element={<Register />} />

        {/* 4. Sau này bạn sẽ thêm các Route bảo mật như /dashboard tại đây */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)