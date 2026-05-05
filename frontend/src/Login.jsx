import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ChevronRight } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    // Thêm state để quản lý thông báo hiển thị lên màn hình
    const [status, setStatus] = useState({ type: '', msg: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Đang kết nối đến hệ thống...' });

        // Sử dụng URLSearchParams để tương thích hoàn hảo với request.getParameter() của Java Servlet
        const params = new URLSearchParams();
        params.append('username', credentials.username);
        params.append('password', credentials.password);

        try {
            // Gọi qua API Gateway (Kong) ở cổng 8000
            const response = await axios.post('http://localhost:8000/api/account/login', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.status === 200) {
                setStatus({ type: 'success', msg: 'Đăng nhập thành công! Đang chuyển hướng...' });
                
                // Lưu Token vào LocalStorage để dùng cho các request sau này
                localStorage.setItem('token', response.data.token);
                
                // Giả lập chuyển hướng sau 1.5 giây
                setTimeout(() => {
                    navigate('/dashboard'); // Chuyển sang trang quản lý sau này
                }, 1500);
            }
        } catch (error) {
            // Hiển thị lỗi từ Backend hoặc Gateway
            const errorMsg = error.response?.data?.message || 'Sai tên đăng nhập hoặc lỗi kết nối Gateway!';
            setStatus({ type: 'error', msg: errorMsg });
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Chào Mừng Trở Lại</h2>
                <p style={styles.subtitle}>Đăng nhập để quản lý bất động sản của bạn</p>

                {/* KHU VỰC HIỂN THỊ THÔNG BÁO (ALERTS) */}
                {status.msg && (
                    <div style={{
                        ...styles.alert,
                        backgroundColor: status.type === 'success' ? '#d4edda' : status.type === 'error' ? '#f8d7da' : '#e2e3e5',
                        color: status.type === 'success' ? '#155724' : status.type === 'error' ? '#721c24' : '#383d41'
                    }}>
                        {status.msg}
                    </div>
                )}
                
                <form onSubmit={handleLogin}>
                    <div style={styles.inputBox}>
                        <User size={18} color="#007bff" />
                        <input name="username" placeholder="Tên đăng nhập" onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.inputBox}>
                        <Lock size={18} color="#007bff" />
                        <input name="password" type="password" placeholder="Mật khẩu" onChange={handleChange} style={styles.input} required />
                    </div>
                    <button type="submit" style={styles.btn}>Đăng Nhập <ChevronRight size={18} /></button>
                </form>

                <div style={styles.footer}>
                    Chưa có tài khoản?{' '}
                    <Link to="/register" style={styles.link}>Đăng ký thành viên mới</Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#e9ecef', fontFamily: 'Arial' },
    card: { backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
    title: { textAlign: 'center', marginBottom: '5px', color: '#333' },
    subtitle: { textAlign: 'center', marginBottom: '30px', color: '#6c757d', fontSize: '14px' },
    inputBox: { display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '8px', padding: '10px 15px', marginBottom: '15px' },
    input: { border: 'none', background: 'none', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '15px' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
    footer: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' },
    link: { color: '#007bff', textDecoration: 'none', fontWeight: 'bold' },
    // Style cho phần thông báo
    alert: { padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }
};

export default Login;