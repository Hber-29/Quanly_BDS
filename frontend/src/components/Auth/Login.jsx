import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ChevronRight, Building } from 'lucide-react';

const Login = () => {
    // ==========================================
    // KHU VỰC LOGIC (GIỮ NGUYÊN 100%)
    // ==========================================
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const navigate = useNavigate();
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('roleId');
    }, []);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

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
            const username = usernameRef.current?.value || '';
            const password = passwordRef.current?.value || '';

            if (!username || !password) {
                setStatus({ type: 'error', msg: '❌ Vui lòng nhập tên đăng nhập và mật khẩu!' });
                return;
            }

            const response = await fetch('http://localhost:8000/api/account/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password: password })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setStatus({ type: 'success', msg: 'Đăng nhập thành công! Đang chuyển hướng...' });
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('roleId', data.role); 
                localStorage.setItem('username', username);
                localStorage.setItem('accountId', data.accountId || data.id);
                
                setTimeout(() => {
                    const role = parseInt(data.role);
                    if (role === 1 || role === 2) {
                        navigate('/admin/customers'); 
                    } else {
                        navigate('/'); 
                    }
                }, 1500);
            } else {
                setStatus({ type: 'error', msg: `❌ ${data.message}` });
            }
        } catch (error) {
            setStatus({ type: 'error', msg: '❌ Lỗi kết nối đến máy chủ!' });
        }
    };

    // ==========================================
    // KHU VỰC GIAO DIỆN (ĐÃ NỚI RỘNG FORM)
    // ==========================================
    return (
        <div className="container-fluid vh-100 p-0 d-flex overflow-hidden bg-white">
            <style>
                {`
                /* Hiệu ứng mượt mà */
                .smooth-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .input-glass { background: #f8f9fa; border: 1px solid #e9ecef; }
                .input-glass:focus-within { background: #fff; border-color: #dc3545; box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.15); }
                .btn-hover-float:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(220, 53, 69, 0.3); }
                
                /* Slider Trượt Ngang */
                .slider-wrapper {
                    display: flex;
                    width: 400%; /* 4 ảnh */
                    height: 100%;
                    animation: slideHorizontal 20s cubic-bezier(0.77, 0, 0.175, 1) infinite;
                }
                
                .slide-item {
                    flex: 1; 
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-color: #2c3e50; 
                }

                @keyframes slideHorizontal {
                    0%, 20%   { transform: translateX(0%); }      
                    25%, 45%  { transform: translateX(-25%); }    
                    50%, 70%  { transform: translateX(-50%); }    
                    75%, 95%  { transform: translateX(-75%); }    
                    100%      { transform: translateX(0%); }      
                }
                
                .slider-overlay { background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%); pointer-events: none; }
                `}
            </style>

            {/* 70% CỘT TRÁI: SLIDER ẢNH */}
            <div className="d-none d-lg-block col-lg-8 position-relative h-100 p-0 overflow-hidden">
                <div className="slider-wrapper">
                    <div className="slide-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}></div>
                    <div className="slide-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}></div>
                    <div className="slide-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}></div>
                    <div className="slide-item" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}></div>
                </div>
                
                <div className="position-absolute top-0 start-0 w-100 h-100 slider-overlay"></div>
                <div className="position-absolute bottom-0 start-0 p-5 text-white w-100" style={{ zIndex: 10 }}>
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <Building size={40} className="text-danger" />
                        <h2 className="fw-bold mb-0" style={{ letterSpacing: '-1px' }}>Batdongsan<span className="text-danger">.com.vn</span></h2>
                    </div>
                    <h1 className="fw-bold display-5 mb-3">Tìm kiếm ngôi nhà mơ ước của bạn</h1>
                    <p className="fs-5 opacity-75 w-75">Hệ thống quản lý và giao dịch bất động sản hàng đầu. Uy tín, nhanh chóng và bảo mật tuyệt đối.</p>
                </div>
            </div>

            {/* 🔥 30% CỘT PHẢI: FORM ĐĂNG NHẬP (NỚI RỘNG LÊN 80-85% CỦA KHUNG) */}
            <div className="col-12 col-lg-4 d-flex flex-column justify-content-center bg-white h-100 shadow-lg" style={{ zIndex: 20 }}>
                {/* 🔥 SỬA Ở ĐÂY: Đặt width: 85% và tăng maxWidth lên 500px */}
                <div className="mx-auto smooth-transition" style={{ width: '85%', maxWidth: '500px' }}>
                    
                    <div className="text-start mb-5">
                        <h2 className="fw-bold text-dark mb-2">Chào Mừng Trở Lại!</h2>
                        <p className="text-muted">Đăng nhập để trải nghiệm hệ thống</p>
                    </div>

                    {status.msg && (
                        <div className={`alert border-0 shadow-sm py-2 px-3 small fw-semibold text-start rounded-3 ${status.type === 'success' ? 'alert-success text-success' : status.type === 'error' ? 'alert-danger text-danger' : 'alert-secondary'}`}>
                            {status.msg}
                        </div>
                    )}
                    
                    <form onSubmit={handleLogin}>
                        {/* Chọn Vai Trò */}
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-dark mb-2">Vai trò của bạn</label>
                            <select className="form-select input-glass p-3 rounded-3 smooth-transition shadow-none fw-semibold text-secondary">
                                <option value="customer">Tôi là Khách hàng / Nhà đầu tư</option>
                                <option value="admin">Tôi là Nhân viên / Quản trị viên</option>
                            </select>
                        </div>

                        {/* Tên đăng nhập */}
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-dark mb-2">Tên đăng nhập</label>
                            <div className="input-group input-glass rounded-3 overflow-hidden smooth-transition p-1">
                                <span className="input-group-text bg-transparent border-0 text-danger"><User size={20} /></span>
                                <input 
                                    ref={usernameRef}
                                    name="username" 
                                    placeholder="Nhập tên đăng nhập..." 
                                    value={credentials.username}
                                    onChange={handleChange}
                                    onBlur={handleInputBlur}
                                    className="form-control border-0 bg-transparent shadow-none"
                                    required 
                                    autoComplete="new-username"
                                />
                            </div>
                        </div>

                        {/* Mật khẩu */}
                        <div className="mb-5">
                            <label className="form-label small fw-bold text-dark mb-2">Mật khẩu</label>
                            <div className="input-group input-glass rounded-3 overflow-hidden smooth-transition p-1">
                                <span className="input-group-text bg-transparent border-0 text-danger"><Lock size={20} /></span>
                                <input 
                                    ref={passwordRef}
                                    name="password" 
                                    type="password" 
                                    placeholder="Nhập mật khẩu..." 
                                    value={credentials.password}
                                    onChange={handleChange}
                                    onBlur={handleInputBlur}
                                    className="form-control border-0 bg-transparent shadow-none"
                                    required 
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="text-end mt-2">
                                <a href="#" className="text-danger small text-decoration-none fw-semibold smooth-transition hover-danger">Quên mật khẩu?</a>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-danger w-100 py-3 rounded-3 fw-bold btn-hover-float smooth-transition d-flex align-items-center justify-content-center gap-2">
                            ĐĂNG NHẬP <ChevronRight size={20} />
                        </button>
                    </form>

                    <div className="text-center mt-5 pt-4 border-top">
                        <span className="text-muted">Chưa có tài khoản? </span>
                        <Link to="/register" className="text-danger fw-bold text-decoration-none smooth-transition hover-danger">
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;