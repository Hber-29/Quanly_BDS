import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone, MapPin, Calendar, ChevronRight, Building, X } from 'lucide-react';
import authApi from '../../api/authApi'; 

const Register = () => {
    // ==========================================
    // 1. LOGIC FORM ĐĂNG KÝ (GIỮ NGUYÊN 100%)
    // ==========================================
    const [formData, setFormData] = useState({
        username: '', password: '', roleId: '3', fullName: '', gender: '1', dob: '', phone: '', email: '', address: '', preferences: ''
    });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', msg: 'Đang kết nối hệ thống...' });

        const params = new URLSearchParams();
        Object.keys(formData).forEach(key => params.append(key, formData[key]));

        try {
            await authApi.register(params);
            setStatus({ type: 'success', msg: 'Đăng ký thành công! Đang chuyển trang...' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setStatus({ type: 'error', msg: '❌ Lỗi kết nối đến máy chủ!' });
        }
    };

    // ==========================================
    // 2. LOGIC POPUP CHỌN ĐỊA CHỈ (OPEN API VN)
    // ==========================================
    const [showAddrModal, setShowAddrModal] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    
    const [tempAddr, setTempAddr] = useState({
        provCode: '', provName: '', distCode: '', distName: '', wardCode: '', wardName: '', specific: ''
    });

    useEffect(() => {
        if (showAddrModal && provinces.length === 0) {
            fetch('https://provinces.open-api.vn/api/p/')
                .then(res => res.json())
                .then(data => setProvinces(data));
        }
    }, [showAddrModal]);

    const handleProvChange = (e) => {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setTempAddr({ ...tempAddr, provCode: code, provName: name, distCode: '', distName: '', wardCode: '', wardName: '' });
        setDistricts([]); setWards([]);
        
        if(code) {
            fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
                .then(res => res.json())
                .then(data => setDistricts(data.districts));
        }
    };

    const handleDistChange = (e) => {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setTempAddr({ ...tempAddr, distCode: code, distName: name, wardCode: '', wardName: '' });
        setWards([]);

        if(code) {
            fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
                .then(res => res.json())
                .then(data => setWards(data.wards));
        }
    };

    const handleWardChange = (e) => {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex].text;
        setTempAddr({ ...tempAddr, wardCode: code, wardName: name });
    };

    const confirmAddress = () => {
        if (!tempAddr.provName || !tempAddr.distName || !tempAddr.wardName || !tempAddr.specific) {
            alert("Vui lòng điền đầy đủ 4 cấp địa chỉ!"); return;
        }
        const fullAddress = `${tempAddr.specific}, ${tempAddr.wardName}, ${tempAddr.distName}, ${tempAddr.provName}`;
        setFormData({ ...formData, address: fullAddress });
        setShowAddrModal(false);
    };

    // ==========================================
    // 3. GIAO DIỆN HIỂN THỊ (ĐÃ FIX TO 80% & CĂN GIỮA)
    // ==========================================
    return (
        <div className="container-fluid vh-100 p-0 d-flex overflow-hidden bg-white position-relative">
            <style>
                {`
                .smooth-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .input-glass { background: #f8f9fa; border: 1px solid #e9ecef; }
                .input-glass:focus-within { background: #fff; border-color: #dc3545; box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.15); }
                .btn-hover-float:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(220, 53, 69, 0.3); }
                
                .slider-wrapper { display: flex; width: 400%; height: 100%; animation: slideHorizontal 20s cubic-bezier(0.77, 0, 0.175, 1) infinite; }
                .slide-item { flex: 1; height: 100%; background-size: cover; background-position: center; background-color: #2c3e50; }
                @keyframes slideHorizontal {
                    0%, 20%   { transform: translateX(0%); }      
                    25%, 45%  { transform: translateX(-25%); }    
                    50%, 70%  { transform: translateX(-50%); }    
                    75%, 95%  { transform: translateX(-75%); }    
                    100%      { transform: translateX(0%); }      
                }
                .slider-overlay { background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%); pointer-events: none; }

                /* CSS cho Popup Địa Chỉ */
                .modal-overlay { position: fixed; top:0; left:0; width:100vw; height:100vh; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 1050; display:flex; align-items:center; justify-content:center; opacity: 0; animation: fadeIn 0.3s forwards; }
                .modal-content-glass { background: #fff; border-radius: 20px; width: 90%; max-width: 500px; padding: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); transform: translateY(20px); animation: slideUp 0.3s forwards; }
                @keyframes fadeIn { to { opacity: 1; } }
                @keyframes slideUp { to { transform: translateY(0); } }
                
                /* Tùy chỉnh thanh cuộn mượt */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #dee2e6; border-radius: 10px; }
                `}
            </style>

            {/* 70% CỘT TRÁI: SLIDER ẢNH (ĐỒNG BỘ 100% VỚI LOGIN) */}
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
                    <h1 className="fw-bold display-5 mb-3">Gia nhập cộng đồng của chúng tôi</h1>
                    <p className="fs-5 opacity-75 w-75">Tạo tài khoản ngay hôm nay để không bỏ lỡ những cơ hội đầu tư bất động sản tốt nhất.</p>
                </div>
            </div>

            {/* 30% CỘT PHẢI: FORM ĐĂNG KÝ (ĐÃ NỚI RỘNG 85% VÀ GIỮA KHUNG) */}
            <div className="col-12 col-lg-4 bg-white h-100 shadow-lg custom-scrollbar" style={{ zIndex: 20, overflowY: 'auto' }}>
                {/* Lớp bọc d-flex flex-column justify-content-center min-vh-100 đảm bảo căn giữa dọc hoàn hảo */}
                <div className="d-flex flex-column justify-content-center min-vh-100 py-5">
                    {/* 🔥 ĐỒNG BỘ ĐỘ RỘNG FORM: width: '85%' và maxWidth: '500px' */}
                    <div className="mx-auto smooth-transition w-100 px-4" style={{ width: '85%', maxWidth: '500px' }}>
                        
                        <div className="text-start mb-4">
                            <h2 className="fw-bold text-dark mb-2">Tạo Tài Khoản</h2>
                            <p className="text-muted">Điền thông tin để tham gia hệ thống</p>
                        </div>

                        {status.msg && (
                            <div className={`alert border-0 shadow-sm py-2 px-3 small fw-semibold text-start rounded-3 ${status.type === 'success' ? 'alert-success text-success' : status.type === 'error' ? 'alert-danger text-danger' : 'alert-secondary'}`}>
                                {status.msg}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            {/* 1. Tài khoản & Mật khẩu */}
                            <div className="row g-3 mb-3">
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-dark mb-1">Tên đăng nhập *</label>
                                    <div className="input-group input-glass rounded-3 overflow-hidden p-1">
                                        <span className="input-group-text bg-transparent border-0 text-danger"><User size={18} /></span>
                                        <input name="username" placeholder="Nhập username" value={formData.username} onChange={handleChange} className="form-control border-0 bg-transparent shadow-none" required />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-dark mb-1">Mật khẩu *</label>
                                    <div className="input-group input-glass rounded-3 overflow-hidden p-1">
                                        <span className="input-group-text bg-transparent border-0 text-danger"><Lock size={18} /></span>
                                        <input type="password" name="password" placeholder="Nhập mật khẩu" value={formData.password} onChange={handleChange} className="form-control border-0 bg-transparent shadow-none" required />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Cột đôi: Họ tên & Số điện thoại */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-7">
                                    <label className="form-label small fw-bold text-dark mb-1">Họ và Tên *</label>
                                    <input name="fullName" placeholder="VD: Nguyễn Văn A" value={formData.fullName} onChange={handleChange} className="form-control input-glass rounded-3 p-2 shadow-none" required />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label small fw-bold text-dark mb-1">Số điện thoại *</label>
                                    <input type="tel" name="phone" placeholder="VD: 0987..." value={formData.phone} onChange={handleChange} className="form-control input-glass rounded-3 p-2 shadow-none" required />
                                </div>
                            </div>

                            {/* 3. Cột đôi: Email & Ngày sinh */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-7">
                                    <label className="form-label small fw-bold text-dark mb-1">Email *</label>
                                    <input type="email" name="email" placeholder="email@gmail.com" value={formData.email} onChange={handleChange} className="form-control input-glass rounded-3 p-2 shadow-none" required />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label small fw-bold text-dark mb-1">Ngày sinh</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-control input-glass rounded-3 p-2 shadow-none text-muted" />
                                </div>
                            </div>

                            {/* 4. Cột đôi: Giới tính & Sở thích */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-dark mb-1">Giới tính</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="form-select input-glass rounded-3 p-2 shadow-none text-muted">
                                        <option value="1">Nam</option>
                                        <option value="0">Nữ</option>
                                    </select>
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold text-dark mb-1">Loại BĐS quan tâm</label>
                                    <select name="preferences" value={formData.preferences} onChange={handleChange} className="form-select input-glass rounded-3 p-2 shadow-none text-muted">
                                        <option value="">-- Bỏ qua --</option>
                                        <option value="Căn Hộ">Căn Hộ Chung Cư</option>
                                        <option value="Nhà Phố">Nhà Phố Mặt Đất</option>
                                        <option value="Đất Nền">Đất Nền</option>
                                    </select>
                                </div>
                            </div>

                            {/* 5. Địa chỉ hiện tại (Mở Popup 4 cấp) */}
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-dark mb-1">Địa chỉ hiện tại *</label>
                                <div className="input-group input-glass rounded-3 overflow-hidden p-1 bg-white cursor-pointer" onClick={() => setShowAddrModal(true)} style={{cursor: 'pointer'}}>
                                    <span className="input-group-text bg-transparent border-0 text-danger"><MapPin size={18} /></span>
                                    <input 
                                        readOnly 
                                        placeholder="Nhấn vào đây để chọn địa chỉ..." 
                                        value={formData.address}
                                        className="form-control border-0 bg-transparent shadow-none cursor-pointer text-truncate bg-white"
                                        style={{cursor: 'pointer'}}
                                        required 
                                    />
                                    <button type="button" className="btn btn-danger rounded-3 fw-bold small py-1 px-3">Chọn</button>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-danger w-100 py-3 mt-2 rounded-3 fw-bold btn-hover-float smooth-transition d-flex align-items-center justify-content-center gap-2">
                                ĐĂNG KÝ TÀI KHOẢN <ChevronRight size={20} />
                            </button>
                        </form>

                        <div className="text-center mt-4 pt-3 border-top pb-2">
                            <span className="text-muted small">Đã có tài khoản? </span>
                            <Link to="/login" className="text-danger fw-bold text-decoration-none smooth-transition hover-danger">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* POPUP CHỌN ĐỊA CHỈ 4 CẤP OVERLAY */}
            {/* ========================================== */}
            {showAddrModal && (
                <div className="modal-overlay">
                    <div className="modal-content-glass">
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                            <h5 className="fw-bold text-danger mb-0">Cập Nhật Địa Chỉ</h5>
                            <button className="btn btn-light rounded-circle p-1" onClick={() => setShowAddrModal(false)}><X size={20} /></button>
                        </div>
                        
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="small fw-bold text-muted mb-1">1. Tỉnh / Thành phố</label>
                                <select className="form-select input-glass p-2 rounded-3" value={tempAddr.provCode} onChange={handleProvChange}>
                                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                </select>
                            </div>
                            
                            <div className="col-12">
                                <label className="small fw-bold text-muted mb-1">2. Quận / Huyện</label>
                                <select className="form-select input-glass p-2 rounded-3" value={tempAddr.distCode} onChange={handleDistChange} disabled={!tempAddr.provCode}>
                                    <option value="">-- Chọn Quận/Huyện --</option>
                                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                </select>
                            </div>

                            <div className="col-12">
                                <label className="small fw-bold text-muted mb-1">3. Phường / Xã</label>
                                <select className="form-select input-glass p-2 rounded-3" value={tempAddr.wardCode} onChange={handleWardChange} disabled={!tempAddr.distCode}>
                                    <option value="">-- Chọn Phường/Xã --</option>
                                    {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                </select>
                            </div>

                            <div className="col-12 mb-2">
                                <label className="small fw-bold text-muted mb-1">4. Số nhà, Tên đường</label>
                                <input 
                                    className="form-control input-glass p-2 rounded-3" 
                                    placeholder="VD: Số 10, Ngõ 20, Đường Lê Lợi" 
                                    value={tempAddr.specific} 
                                    onChange={(e) => setTempAddr({...tempAddr, specific: e.target.value})}
                                    disabled={!tempAddr.wardCode}
                                />
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                            <button className="btn btn-light fw-bold px-4 rounded-3" onClick={() => setShowAddrModal(false)}>Hủy</button>
                            <button className="btn btn-danger fw-bold px-4 rounded-3" onClick={confirmAddress}>Xác Nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;