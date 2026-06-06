import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ChevronRight } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const navigate = useNavigate();
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    // 🔥 XÓA TOKEN CŨ NHƯNG GIỮ LẠI DỮ LIỆU KHÁC
    useEffect(() => {
        // Chỉ xóa token và role, không xóa tất cả
        localStorage.removeItem('token');
        localStorage.removeItem('roleId');
        
    }, []);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    // Đồng bộ state khi có autofill xảy ra
    const handleInputBlur = () => {
        if (usernameRef.current && passwordRef.current) {
            setCredentials({
                username: usernameRef.current.value || '',
                password: passwordRef.current.value || ''
            });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Đang kết nối đến hệ thống...' });

        try {
            // 🔥 FORCE-SYNC: Lấy giá trị từ input DOM thay vì dùng state (tránh autofill cũ)
            const username = usernameRef.current?.value || '';
            const password = passwordRef.current?.value || '';

            if (!username || !password) {
                setStatus({ type: 'error', msg: '❌ Vui lòng nhập tên đăng nhập và mật khẩu!' });
                return;
            }

            // Gọi API bằng định dạng JSON truyền xuống Backend Java
            const response = await fetch('http://localhost:8000/api/account/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            // Nếu Backend trả về thành công (200 OK)
            if (response.ok && data.status === 'success') {
                setStatus({ type: 'success', msg: 'Đăng nhập thành công! Đang chuyển hướng...' });
                
                // Cất "Chìa khóa" mới vào két sắt
                localStorage.setItem('token', data.token);
                localStorage.setItem('roleId', data.role); 
                localStorage.setItem('username', username);
                localStorage.setItem('accountId', data.accountId || data.id);
                
                setTimeout(() => {
                    const role = parseInt(data.role);
                    
                    // 🔥 PHÂN LUỒNG QUYỀN CHUẨN XÁC
                    if (role === 1 || role === 2) {
                        // Chỉ cho Role 1 (Admin) và Role 2 (Staff) vào trang quản trị
                        navigate('/admin/customers'); 
                    } else {
                        // Role 3 (Customer) hoặc các role khác thì đẩy ra trang chủ
                        navigate('/'); 
                    }
                }, 1500);

            } else {
                // Backend trả về lỗi (Ví dụ: 403 Tài khoản bị khóa, 401 Sai pass)
                setStatus({ type: 'error', msg: `❌ ${data.message}` });
            }

        } catch (error) {
            setStatus({ type: 'error', msg: '❌ Lỗi kết nối đến máy chủ!' });
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Chào Mừng Trở Lại</h2>
                <p style={styles.subtitle}>Đăng nhập để quản lý hệ thống</p>

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
                        <input 
                            ref={usernameRef}
                            name="username" 
                            placeholder="Tên đăng nhập" 
                            value={credentials.username}
                            onChange={handleChange}
                            onBlur={handleInputBlur}
                            style={styles.input} 
                            required 
                            autoComplete="new-username"
                        />
                    </div>
                    <div style={styles.inputBox}>
                        <Lock size={18} color="#007bff" />
                        <input 
                            ref={passwordRef}
                            name="password" 
                            type="password" 
                            placeholder="Mật khẩu" 
                            value={credentials.password}
                            onChange={handleChange}
                            onBlur={handleInputBlur}
                            style={styles.input} 
                            required 
                            autoComplete="new-password"
                        />
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
    alert: { padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }
};

export default Login;