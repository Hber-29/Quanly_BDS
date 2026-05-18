import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone, MapPin, Calendar, UserCheck, ChevronRight, Heart } from 'lucide-react';
import authApi from '../../api/authApi'; // Import tầng API mới

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        roleId: '3', // Mặc định là 3 (CUSTOMER)
        fullName: '',
        gender: '1',
        dob: '',
        phone: '',
        email: '',
        address: '',
        preferences: ''
    });

    const [status, setStatus] = useState({ type: '', msg: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Đang kết nối hệ thống phân tán...' });

        const params = new URLSearchParams();
        Object.keys(formData).forEach(key => params.append(key, formData[key]));

        try {
            // Chuyển sang gọi hàm của authApi trung tâm
            await authApi.register(params);
            
            setStatus({ type: 'success', msg: 'Chúc mừng! Đăng ký thành công. Đang chuyển về trang đăng nhập...' });
            
            // Đăng ký xong tự động đá sang màn hình Login sau 2 giây
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            const errorServer = error.response?.data?.message || 'Lỗi hệ thống hoặc trùng tên đăng nhập!';
            setStatus({ type: 'error', msg: errorServer });
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Đăng Ký Thành Viên</h2>
                <p style={styles.subtitle}>Hệ thống Microservices Quản lý Bất động sản</p>

                {status.msg && (
                    <div style={{ 
                        ...styles.alert, 
                        backgroundColor: status.type === 'success' ? '#d4edda' : status.type === 'error' ? '#f8d7da' : '#e2e3e5',
                        color: status.type === 'success' ? '#155724' : status.type === 'error' ? '#721c24' : '#383d41'
                    }}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.grid}>
                        {/* Cột 1: Tài khoản */}
                        <div>
                            <h4 style={styles.sectionTitle}>Thông tin tài khoản</h4>
                            <div style={styles.inputBox}><User size={18} color="#007bff" /><input name="username" placeholder="Tên đăng nhập" onChange={handleChange} required style={styles.input} /></div>
                            <div style={styles.inputBox}><Lock size={18} color="#007bff" /><input name="password" type="password" placeholder="Mật khẩu" onChange={handleChange} required style={styles.input} /></div>
                            <div style={styles.inputBox}><Mail size={18} color="#007bff" /><input name="email" type="email" placeholder="Email liên hệ" onChange={handleChange} required style={styles.input} /></div>
                            <div style={styles.inputBox}><Phone size={18} color="#007bff" /><input name="phone" placeholder="Số điện thoại" onChange={handleChange} required style={styles.input} /></div>
                        </div>
                        {/* Cột 2: Cá nhân */}
                        <div>
                            <h4 style={styles.sectionTitle}>Thông tin cá nhân</h4>
                            <div style={styles.inputBox}><UserCheck size={18} color="#28a745" /><input name="fullName" placeholder="Họ và tên" onChange={handleChange} required style={styles.input} /></div>
                            <div style={styles.inputBox}><Calendar size={18} color="#28a745" /><input name="dob" type="date" onChange={handleChange} required style={styles.input} /></div>
                            <div style={styles.inputBox}><Heart size={18} color="#28a745" /><input name="preferences" placeholder="Sở thích (Căn hộ, Đất nền...)" onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.inputBox}><MapPin size={18} color="#28a745" /><input name="address" placeholder="Địa chỉ thường trú" onChange={handleChange} style={styles.input} /></div>
                            <div style={styles.inputBox}>
                                <select name="gender" onChange={handleChange} style={styles.input}>
                                    <option value="1">Nam</option>
                                    <option value="0">Nữ</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <button type="submit" style={styles.btn}>Xác nhận đăng ký <ChevronRight size={18} /></button>
                </form>
                <div style={styles.footer}>
                    Bạn đã có tài khoản?{' '}
                    <Link to="/login" style={styles.link}>Đăng nhập ngay</Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#e9ecef', padding: '20px', fontFamily: 'Arial' },
    card: { backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '800px' },
    title: { textAlign: 'center', marginBottom: '5px', color: '#333' },
    subtitle: { textAlign: 'center', marginBottom: '30px', color: '#6c757d', fontSize: '14px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    sectionTitle: { borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px', fontSize: '16px', color: '#444' },
    inputBox: { display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '8px', padding: '10px 15px', marginBottom: '15px' },
    input: { border: 'none', background: 'none', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '15px' },
    btn: { width: '100%', padding: '15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' },
    alert: { padding: '15px', borderRadius: '8px', marginBottom: '25px', textAlign: 'center', fontSize: '14px', fontWeight: '500' },
    footer: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' },
    link: { color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }
};

export default Register;