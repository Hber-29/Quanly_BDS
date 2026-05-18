import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Lượt xem công khai cho khách vãng lai */}
        <Route path="/" element={<HomePage />} />
        
        {/* Phân hệ Xác thực */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Phân hệ Người dùng đã đăng nhập (Hồ sơ cá nhân) */}
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Tự động chuyển hướng nếu gõ sai đường dẫn */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;