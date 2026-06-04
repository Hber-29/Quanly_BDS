import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// =========================================================================
// IMPORT THƯ VIỆN CSS (BOOTSTRAP) ĐỂ HIỂN THỊ GIAO DIỆN ĐẸP
// =========================================================================
import 'bootstrap/dist/css/bootstrap.min.css';

// =========================================================================
// IMPORT COMPONENTS & PAGES
// =========================================================================
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HomePage from './pages/HomePage';
import PropertySalePage from './pages/PropertySalePage';
import CreateListingPage from './pages/CreateListingPage';
import ProfilePage from './pages/ProfilePage';
// 🔥 BƯỚC 1: BẮT BUỘC PHẢI IMPORT TRANG CHI TIẾT VÀO ĐÂY
import PropertyDetailPage from './pages/PropertyDetailPage'; 

// =========================================================================
// HÀM KIỂM TRA TOKEN AN TOÀN TUYỆT ĐỐI
// =========================================================================
const checkAuth = () => {
  const token = localStorage.getItem('token');
  return token && token !== 'null' && token !== 'undefined' && token.trim() !== '';
};

// =========================================================================
// GUARD 1: PUBLIC ROUTE (Chỉ dành cho Khách chưa đăng nhập)
// =========================================================================
const PublicRoute = ({ children }) => {
  const isAuthenticated = checkAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// =========================================================================
// GUARD 2: PRIVATE ROUTE (Bắt buộc phải đăng nhập)
// =========================================================================
const PrivateRoute = ({ children }) => {
  const isAuthenticated = checkAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// =========================================================================
// MAIN APP COMPONENT
// =========================================================================
const App = () => {
  return (
    <Router>
      <Routes>
        {/* 🟢 NHÓM 1: ROUTE CÔNG KHAI (Ai vào xem cũng được) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/nha-dat-ban" element={<PropertySalePage />} />
        
        {/* 🔥 BƯỚC 2: THÊM ĐƯỜNG DẪN CHO TRANG CHI TIẾT BÀI ĐĂNG */}
        {/* Dấu :id là tham số động, đại diện cho mã bất động sản (VD: CH-123) */}
        <Route path="/nha-dat-ban/:id" element={<PropertyDetailPage />} />

        {/* 🟠 NHÓM 2: ROUTE AUTH (Xác thực tài khoản) */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* 🔴 NHÓM 3: ROUTE BẢO MẬT (Dành cho User đã đăng nhập) */}
        <Route 
          path="/dang-tin" 
          element={
            <PrivateRoute>
              <CreateListingPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } 
        />

        {/* ⚪ NHÓM 4: XỬ LÝ LỖI 404 (Trang không tồn tại) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;