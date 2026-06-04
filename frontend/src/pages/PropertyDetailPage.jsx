import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { MapPin, Clock, AlertTriangle, CheckCircle, ShieldCheck, Building, User, LogOut, X } from 'lucide-react';
import { formatPrice, formatArea, formatUnitPrice } from '../utils/formatPrice';

const PropertyDetailPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(''); 
    const [isBooking, setIsBooking] = useState(false);
    
    // 🔴 STATE & LOGIC PHỤC VỤ CHO MENU HEADER ĐỒNG BỘ
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const rawToken = localStorage.getItem('token');
    const isLoggedIn = rawToken && rawToken !== 'null' && rawToken !== 'undefined' && rawToken.trim() !== '';

    const menus = [
        { name: 'Nhà đất bán', path: '/nha-dat-ban', isReady: true },
        { name: 'Nhà đất cho thuê', path: '#', isReady: false },
        { name: 'Dự án', path: '#', isReady: false },
        { name: 'Tin tức', path: '#', isReady: false },
        { name: 'Phân tích đánh giá', path: '#', isReady: false },
        { name: 'Danh bạ', path: '#', isReady: false }
    ];

    const handleMenuClick = (e, item) => {
        if (!item.isReady) {
            e.preventDefault();
            alert('Tính năng đang được phát triển, vui lòng quay lại sau!');
        }
    };

    const handleLogout = () => {
        const isConfirm = window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống BĐS 2026 không?");
        if (isConfirm) {
            localStorage.clear();
            window.location.reload();
        }
    };



    useEffect(() => {
        const fetchPropertyDetail = async () => {
            try {
                const res = await axiosClient.get(`/api/property/detail?id=${id}`);
                
                if (res && typeof res === 'object' && res.propertyId) {
                    setProperty(res);
                    if (res.images && res.images.length > 0) {
                        const validImages = res.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
                        if (validImages.length > 0) {
                            setActiveImage(validImages[0]);
                        }
                    }
                } else {
                    console.warn("⚠️ Response từ backend không hợp lệ:", res);
                    setProperty(null);
                }
            } catch (err) {
                console.error("Lỗi lấy dữ liệu chi tiết bài đăng:", err);
                setProperty(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetail();
    }, [id]);

    const handleBooking = async () => {
        // 1. CHẶN NẾU CHƯA ĐĂNG NHẬP
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để thực hiện chức năng đặt chỗ!");
            navigate('/login');
            return;
        }

        setIsBooking(true);

        try {
            // 2. CHUẨN BỊ DỮ LIỆU ĐÚNG KIỂU SỐ (INT)
            const propertyIdInt = parseInt(id, 10);
            
            // Lấy accountId từ LocalStorage (Giả sử khi Login bạn có lưu biến này)
            // Nếu chưa làm phần Login lưu accountId, tạm để số 1 để test luồng Kafka
            const storedAccountId = localStorage.getItem('accountId');
            const accountIdInt = storedAccountId ? parseInt(storedAccountId, 10) : 1; 

            const requestBody = {
                propertyId: propertyIdInt,
                accountId: accountIdInt
            };

            const data = await axiosClient.post('/api/booking/request', requestBody);

            // 4. XỬ LÝ KẾT QUẢ HIỂN THỊ CHO NGƯỜI DÙNG
            if (data && data.status === 'success') {
                alert(`🎉 ĐẶT CHỖ THÀNH CÔNG!\n\n${data.message}`);
                // Có thể navigate người dùng sang trang "Lịch sử đặt chỗ" ở đây
            } else {
                alert(`❌ LỖI ĐẶT CHỖ: ${data.message || 'Hệ thống đang bận, vui lòng thử lại'}`);
            }

        } catch (error) {
            console.error("Lỗi khi gọi API Booking:", error);
            alert("❌ Không thể kết nối tới máy chủ Đặt chỗ. Vui lòng kiểm tra lại mạng!");
        } finally {
            setIsBooking(false);
        }
    };

    if (loading) return <div className="text-center py-5 mt-5"><div className="spinner-border text-danger"></div></div>;
    
    if (!property) return (
        <div className="container py-5 text-center mt-5">
            <AlertTriangle size={64} className="text-warning mb-3" />
            <h3>Không tìm thấy bất động sản</h3>
            <p className="text-muted">Tin đăng này có thể đã bị xóa hoặc bạn nhập sai đường dẫn.</p>
            <button onClick={() => navigate('/nha-dat-ban')} className="btn btn-outline-dark mt-3">Quay lại danh sách</button>
        </div>
    );

    return (
        <div className="bg-light min-vh-100 pb-5">
            
            {/* 🌟 ĐỒNG BỘ NGUYÊN VẸN HEADER TỪ TRANG PROPERTY-SALE-PAGE CỦA BẠN 🌟 */}
            <header className="bg-white border-bottom sticky-top shadow-sm z-3">
                <div className="container-fluid px-4 py-2 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-5">
                        {/* Bấm vào Logo quay về trang chủ */}
                        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 text-dark">
                            <Building size={32} className="text-danger" />
                            <div className="d-flex align-items-baseline">
                                <span className="fs-4 fw-bold text-danger" style={{letterSpacing: '-0.5px'}}>Batdongsan</span>
                                <span className="fs-6 fw-bold text-dark">.com.vn</span>
                            </div>
                        </Link>
                        <nav className="d-none d-lg-flex gap-4">
                            {menus.map((item, idx) => (
                                <Link 
                                    key={idx} 
                                    to={item.path} 
                                    onClick={(e) => handleMenuClick(e, item)}
                                    className={`text-decoration-none fw-semibold pb-2 pt-2 ${item.isReady ? 'text-danger border-bottom border-danger border-2' : 'text-dark'}`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    
                    <div className="d-flex align-items-center gap-3">
                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" className="text-dark text-decoration-none fw-semibold">Đăng nhập</Link>
                                <span className="text-muted">|</span>
                                <Link to="/register" className="text-dark text-decoration-none fw-semibold">Đăng ký</Link>
                            </>
                        ) : (
                            <div className="position-relative" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                                <div className="d-flex align-items-center gap-2" style={{cursor: 'pointer'}}>
                                    <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center text-white" style={{width: '28px', height: '28px'}}>
                                        <User size={16} />
                                    </div>
                                    <span className="fw-semibold text-dark">Tài khoản</span>
                                </div>
                                {isDropdownOpen && (
                                    <div className="position-absolute end-0 bg-white border rounded shadow mt-2 py-2" style={{width: '180px', zIndex: 110}}>
                                        <Link to="/profile" className="dropdown-item py-2 d-flex align-items-center text-secondary">
                                            <User size={16} className="me-2" /> Thông tin cá nhân
                                        </Link>
                                        <div className="dropdown-divider my-1"></div>
                                        <div onClick={handleLogout} className="dropdown-item py-2 d-flex align-items-center text-danger" style={{cursor: 'pointer'}}>
                                            <LogOut size={16} className="me-2" /> Đăng xuất
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <Link to={isLoggedIn ? "/dang-tin" : "/login"} className="btn btn-outline-dark fw-bold ms-2 px-3 py-2 rounded">Đăng tin</Link>
                    </div>
                </div>
            </header>

            {/* THÂN TRANG CHI TIẾT */}
            <div className="container mt-4">
                

                <div className="row g-4">
                    <div className="col-lg-8">
                        {/* BỘ SƯU TẬP ẢNH */}
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                            <div className="bg-dark position-relative" style={{ height: '450px' }}>
                                <img src={activeImage} alt="Property" className="w-100 h-100 object-fit-contain" />
                            </div>
                            
                            {property.images && property.images.length > 0 && (
                                <div className="p-3 bg-white border-top d-flex gap-2 overflow-auto custom-scrollbar" style={{ whiteSpace: 'nowrap' }}>
                                    {property.images.map((img, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => setActiveImage(img)}
                                            className={`rounded overflow-hidden cursor-pointer ${activeImage === img ? 'border border-danger border-2' : 'opacity-75'}`}
                                            style={{ width: '80px', height: '60px', flexShrink: 0, cursor: 'pointer', transition: '0.2s' }}
                                        >
                                            <img src={img} alt={`Thumbnail ${index}`} className="w-100 h-100 object-fit-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* KHỐI THÔNG TIN CHÍNH */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4 p-md-5">
                                <h3 className="fw-bold text-dark mb-3 lh-base">{property.title}</h3>
                                <p className="text-muted d-flex align-items-start gap-2 mb-4">
                                    <MapPin size={20} className="text-danger flex-shrink-0 mt-1" />
                                    <span className="fs-6">{property.address}</span>
                                </p>
                                <hr className="text-secondary opacity-25 mb-4" />
                                
                                <div className="row g-4 mb-5 text-center text-md-start">
                                    <div className="col-6 col-md-4 border-end">
                                        <div className="text-muted small mb-1">Mức giá</div>
                                        <div className="fw-bold text-danger fs-4">
                                            {formatPrice(property.price)}
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-4 border-end">
                                        <div className="text-muted small mb-1">Diện tích</div>
                                        <div className="fw-bold text-dark fs-4">
                                            {formatArea(property.area)} m²
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="text-muted small mb-1">Đơn giá</div>
                                        <div className="fw-bold text-dark fs-5">
                                            {formatUnitPrice(property.price, property.area)}
                                        </div>
                                    </div>
                                </div>
                                
                                <h5 className="fw-bold mb-3">Thông tin mô tả</h5>
                                <div className="text-secondary lh-lg" style={{ whiteSpace: 'pre-line', fontSize: '15px' }}>
                                    {property.description || "Đang cập nhật mô tả..."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOX ĐẶT CHỖ BÊN PHẢI (STICKY) */}
                    <div className="col-lg-4">
                        <div className="position-sticky" style={{ top: '90px' }}>
                            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 border-top border-danger border-4">
                                <div className="d-flex align-items-center gap-2 mb-3 text-success fw-bold">
                                    <ShieldCheck size={20} /> Bất động sản đã được kiểm duyệt
                                </div>
                                <h3 className="fw-bold text-danger mb-1">
                                    {formatPrice(property.price)}
                                </h3>
                                <p className="text-muted mb-4">
                                    {formatArea(property.area)} m² • Giao dịch an toàn
                                </p>

                                <button 
                                    onClick={handleBooking}
                                    disabled={isBooking}
                                    className="btn btn-danger w-100 py-3 rounded-3 fw-bold fs-5 shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3 transition"
                                >
                                    {isBooking ? (
                                        <><span className="spinner-border spinner-border-sm"></span> Đang đẩy vào hàng đợi...</>
                                    ) : (
                                        <><CheckCircle size={22}/> Yêu cầu tư vấn & Đặt giữ chỗ</>
                                    )}
                                </button>

                                <p className="text-center text-muted small mb-0" style={{ fontSize: '12px' }}>
                                    <Clock size={14} className="me-1 d-inline mb-1" />
                                    Yêu cầu của bạn sẽ được xử lý theo nguyên tắc ai đặt trước được ưu tiên trước.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};
export default PropertyDetailPage;