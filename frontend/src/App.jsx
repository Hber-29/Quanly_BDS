import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PropertySalePage from './pages/PropertySalePage';

// Component Bảo vệ: Nếu đã đăng nhập (có token), cấm vào Login/Register
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/" replace />; // Đá về trang chủ công khai
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Các tuyến đường công khai công cộng */}
        <Route path="/" element={<HomePage />} />
        <Route path="/nha-dat-ban" element={<PropertySalePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Áp dụng PublicRoute bảo vệ cho Login và Register */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;