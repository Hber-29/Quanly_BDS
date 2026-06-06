import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// =========================================================================
// IMPORT THƯ VIỆN CSS (BOOTSTRAP & ICONS) ĐỂ HIỂN THỊ GIAO DIỆN ĐẸP
// =========================================================================
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Sếp nhớ cài thư viện này nhé

// =========================================================================
// IMPORT COMPONENTS & PAGES (CLIENT)
// =========================================================================
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HomePage from './pages/HomePage';
import PropertySalePage from './pages/PropertySalePage';
import CreateListingPage from './pages/CreateListingPage';
import ProfilePage from './pages/ProfilePage';
import PropertyDetailPage from './pages/PropertyDetailPage'; 
import CustomerList from './pages/Admin/CustomerManage/CustomerList';

// =========================================================================
// IMPORT COMPONENTS (ADMIN)
// =========================================================================
import AdminLayout from './components/Admin/AdminLayout';

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
// GUARD 3: ADMIN ROUTE (Chỉ dành cho Admin/Staff)
// =========================================================================
const AdminRoute = ({ children }) => {
  const isAuthenticated = checkAuth();
  // Tạm thời chỉ check đăng nhập. 
  // TODO: Sau này sếp lấy Role từ localStorage ra check thêm. VD: role === 'ADMIN'
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
        <Route path="/nha-dat-ban/:id" element={<PropertyDetailPage />} />

        {/* 🟠 NHÓM 2: ROUTE AUTH (Xác thực tài khoản) */}
        <Route 
          path="/login" 
          element={<PublicRoute><Login /></PublicRoute>} 
        />
        <Route 
          path="/register" 
          element={<PublicRoute><Register /></PublicRoute>} 
        />

        {/* 🔴 NHÓM 3: ROUTE BẢO MẬT (Dành cho User đã đăng nhập) */}
        <Route 
          path="/dang-tin" 
          element={<PrivateRoute><CreateListingPage /></PrivateRoute>} 
        />
        <Route 
          path="/profile" 
          element={<PrivateRoute><ProfilePage /></PrivateRoute>} 
        />

        {/* 🟣 NHÓM 4: ROUTE DÀNH RIÊNG CHO ADMIN */}
        {/* Bọc bằng AdminRoute để đảm bảo tính bảo mật */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
           {/* Các trang con của Admin (Outlet) */}
           <Route index element={<h2 className="p-4">📊 Chào mừng đến với Dashboard Quản trị</h2>} />
           <Route path="customers" element={<CustomerList />} />
           <Route path="properties" element={<h2 className="p-4">🏠 Màn hình Quản lý Bài đăng</h2>} />
           <Route path="bookings" element={<h2 className="p-4">📞 Màn hình Quản lý Tư vấn</h2>} />
        </Route>

        {/* ⚪ NHÓM 5: XỬ LÝ LỖI 404 (Trang không tồn tại) */}
        {/* Lưu ý: Route * này luôn phải để ở DƯỚI CÙNG nhé sếp! */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;