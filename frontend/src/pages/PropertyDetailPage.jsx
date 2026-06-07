import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// 🔥 IMPORT ĐẦY ĐỦ ICON (Bao gồm mũi tên Slider và icon Footer)
import { MapPin, Clock, AlertTriangle, CheckCircle, ShieldCheck, Building, User, LogOut, X, ChevronLeft, ChevronRight, ChevronDown, Globe, Share2, MonitorPlay, Camera } from 'lucide-react';
import { formatPrice, formatArea, formatUnitPrice } from '../utils/formatPrice';

// 🔥 IMPORT PROFILE MODAL
import ProfileModal from '../components/Customer/ProfileModal';

const PropertyDetailPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(''); 
    
    // 🌟 STATE QUẢN LÝ MODAL PROFILE (Bổ sung để không bị lỗi)
    const [showProfileModal, setShowProfileModal] = useState(false);

    // 🌟 SỬ DỤNG bookingStatus ĐỂ QUẢN LÝ GIAO DIỆN NÚT BẤM
    const [bookingStatus, setBookingStatus] = useState('IDLE'); // IDLE, POLLING, SUCCESS, FAILED
    
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
                // 1. Lấy thông tin nhà từ Property Service
                const res = await axiosClient.get(`/api/property/detail?id=${id}`);
                
                if (res && typeof res === 'object' && res.propertyId) {
                    setProperty(res);
                    if (res.images && res.images.length > 0) {
                        const validImages = res.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
                        if (validImages.length > 0) setActiveImage(validImages[0]);
                    }
                } else {
                    setProperty(null);
                }

                // 2. HỎI THĂM TRẠNG THÁI BOOKING
                try {
                    const checkRes = await axiosClient.get(`/api/booking/check?propertyId=${id}`);
                    const checkData = checkRes.data || checkRes;

                    if (checkData.isBooked) {
                        const storedAccountId = localStorage.getItem('accountId');
                        const myAccountId = storedAccountId ? parseInt(storedAccountId, 10) : 1; 

                        if (checkData.bookedByAccountId === myAccountId) {
                            setBookingStatus('SUCCESS'); 
                        } else {
                            setBookingStatus('FAILED');  
                        }
                    }
                } catch (bookingErr) {
                    console.error("Lỗi khi kiểm tra trạng thái Booking:", bookingErr);
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

    // 🌟 HÀM XỬ LÝ ĐẶT CHỖ VÀ CHỜ KẾT QUẢ KAFKA
    const handleBooking = async () => {
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để thực hiện chức năng đặt chỗ!");
            navigate('/login');
            return;
        }

        setBookingStatus('POLLING'); 

        try {
            const propertyIdInt = parseInt(id, 10);
            const storedAccountId = localStorage.getItem('accountId');
            const accountIdInt = storedAccountId ? parseInt(storedAccountId, 10) : 1; 

            const requestBody = { propertyId: propertyIdInt, accountId: accountIdInt };
            const data = await axiosClient.post('/api/booking/request', requestBody);

            if (data && (data.status === 'pending' || data.status === 'success')) {
                const bookingId = data.bookingId;
                if (!bookingId) {
                    alert("Lỗi: Server không trả về Mã đặt chỗ (bookingId)!");
                    setBookingStatus('IDLE');
                    return;
                }

                const pollInterval = setInterval(async () => {
                    try {
                        const statusRes = await axiosClient.get(`/api/booking/request?bookingId=${bookingId}`);
                        const currentStatus = statusRes.status || statusRes.data?.status;

                        if (currentStatus === 'SUCCESS') {
                            clearInterval(pollInterval);
                            setBookingStatus('SUCCESS'); 
                            alert("🎉 ĐẶT CHỖ THÀNH CÔNG!\n\nBạn là người nhanh tay nhất chốt được căn nhà này!");
                        } 
                        else if (currentStatus === 'FAILED') {
                            clearInterval(pollInterval);
                            setBookingStatus('FAILED'); 
                            alert("❌ RẤT TIẾC!\n\nCăn nhà này đã có người đặt cọc trước bạn 1 bước!");
                        }
                    } catch (e) {
                        console.error("Lỗi khi hỏi thăm server:", e);
                    }
                }, 1500);

            } else {
                setBookingStatus('IDLE');
                alert(`❌ LỖI: ${data.message || 'Lỗi không xác định'}`);
            }

        } catch (error) {
            setBookingStatus('IDLE');
            console.error("Lỗi khi gọi API Booking:", error);
            alert("❌ Không thể kết nối tới máy chủ Đặt chỗ. Vui lòng kiểm tra lại mạng!");
        }
    };

    // 🔥 LOGIC CHUYỂN ẢNH (SLIDER)
    const handlePrevImage = () => {
        if (!property?.images?.length) return;
        const currentIndex = property.images.indexOf(activeImage);
        const prevIndex = currentIndex === 0 ? property.images.length - 1 : currentIndex - 1;
        setActiveImage(property.images[prevIndex]);
    };

    const handleNextImage = () => {
        if (!property?.images?.length) return;
        const currentIndex = property.images.indexOf(activeImage);
        const nextIndex = currentIndex === property.images.length - 1 ? 0 : currentIndex + 1;
        setActiveImage(property.images[nextIndex]);
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
        <div className="bg-light min-vh-100 d-flex flex-column">
            <style>
                {`
                /* CSS CHO TRANG CHI TIẾT VÀ FOOTER */
                .smooth-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-opacity-100 { opacity: 0.5; transition: opacity 0.3s; }
                .hover-opacity-100:hover { opacity: 1 !important; }
                
                .footer-bg { background-color: #f9f9f9; border-top: 1px solid #e0e0e0; color: #2C2C2C; }
                .footer-text { font-size: 13px; color: #505050; margin-bottom: 8px; line-height: 1.5; }
                .footer-title { font-size: 14px; font-weight: 700; color: #2C2C2C; margin-bottom: 15px; text-transform: uppercase; }
                .footer-link { color: #505050; text-decoration: none; display: block; margin-bottom: 12px; font-size: 13px; transition: color 0.2s;}
                .footer-link:hover { color: #dc3545; }
                .contact-top-title { font-size: 12px; color: #999; margin-bottom: 2px;}
                .contact-top-item { font-size: 14px; color: #2C2C2C; font-weight: 600;}
                .app-btn { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 6px 12px; font-size: 13px; font-weight: 600; color: #2C2C2C; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: 0.2s;}
                .app-btn:hover { background: #f0f0f0; }
                .branch-title { font-weight: 600; color: #2C2C2C; font-size: 13px; margin-bottom: 4px; }
                .branch-text { font-size: 12px; color: #777; line-height: 1.4; margin-bottom: 15px; }
                .social-icon-box { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background-color: #505050; color: #fff; border-radius: 4px; text-decoration: none; transition: 0.2s;}
                .social-icon-box:hover { background-color: #dc3545; color: #fff; }
                .input-newsletter { font-size: 13px; padding: 10px 15px; border-right: none; }
                .btn-newsletter { background-color: #dc3545; color: white; border: 1px solid #dc3545; padding: 0 15px; }
                `}
            </style>

            {/* HEADER */}
            <header className="bg-white border-bottom sticky-top shadow-sm z-3">
                <div className="container-fluid px-4 py-2 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-5">
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
                                        {/* 🔥 ĐÃ ĐỒNG BỘ: Mở ProfileModal khi click */}
                                        <div 
                                            onClick={() => { setIsDropdownOpen(false); setShowProfileModal(true); }} 
                                            className="dropdown-item py-2 px-3 d-flex align-items-center text-secondary fw-semibold" 
                                            style={{cursor: 'pointer', transition: '0.2s'}}
                                        >
                                            <User size={18} className="me-3 text-dark" /> Thông tin cá nhân
                                        </div>
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
            <div className="container mt-4 flex-grow-1">
                <div className="row g-4">
                    <div className="col-lg-8">
                        {/* BỘ SƯU TẬP ẢNH (ĐÃ CÓ MŨI TÊN CHUYỂN ẢNH) */}
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                            <div className="bg-dark position-relative" style={{ height: '450px' }}>
                                <img src={activeImage} alt="Property" className="w-100 h-100 object-fit-contain smooth-transition" />
                                
                                {/* 🔥 2 Nút Mũi Tên Chuyển Ảnh */}
                                {property.images && property.images.length > 1 && (
                                    <>
                                        <button 
                                            onClick={handlePrevImage} 
                                            className="position-absolute top-50 start-0 translate-middle-y btn btn-dark rounded-circle ms-3 hover-opacity-100 p-2 border-0 shadow"
                                        >
                                            <ChevronLeft size={28} />
                                        </button>
                                        <button 
                                            onClick={handleNextImage} 
                                            className="position-absolute top-50 end-0 translate-middle-y btn btn-dark rounded-circle me-3 hover-opacity-100 p-2 border-0 shadow"
                                        >
                                            <ChevronRight size={28} />
                                        </button>
                                    </>
                                )}
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

                                {bookingStatus === 'SUCCESS' ? (
                                    <button disabled className="btn btn-success w-100 py-3 rounded-3 fw-bold fs-5 shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3">
                                        <CheckCircle size={22}/> Đã đặt chỗ thành công
                                    </button>
                                ) : bookingStatus === 'FAILED' ? (
                                    <button disabled className="btn btn-secondary w-100 py-3 rounded-3 fw-bold fs-5 shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3">
                                        <X size={22}/> Nhà đã được đặt
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleBooking}
                                        disabled={bookingStatus === 'POLLING'}
                                        className="btn btn-danger w-100 py-3 rounded-3 fw-bold fs-5 shadow-sm d-flex justify-content-center align-items-center gap-2 mb-3 smooth-transition"
                                    >
                                        {bookingStatus === 'POLLING' ? (
                                            <><span className="spinner-border spinner-border-sm"></span> Đang chờ kết quả...</>
                                        ) : (
                                            <><CheckCircle size={22}/> Yêu cầu tư vấn & Đặt giữ chỗ</>
                                        )}
                                    </button>
                                )}

                                <p className="text-center text-muted small mb-0" style={{ fontSize: '12px' }}>
                                    <Clock size={14} className="me-1 d-inline mb-1" />
                                    Yêu cầu của bạn sẽ được xử lý theo nguyên tắc ai đặt trước được ưu tiên trước.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* SIÊU FOOTER HOÀN MỸ (CLONE TỪ HOMEPAGE) */}
            {/* ======================================================== */}
            <footer className="footer-bg pt-5 mt-5">
                <div className="container pb-4">
                    {/* HÀNG 1: THÔNG TIN LIÊN HỆ NHANH */}
                    <div className="row pb-4 border-bottom border-light-subtle mb-4 align-items-center">
                        <div className="col-lg-3 col-md-12 mb-4 mb-lg-0">
                            <div className="d-flex align-items-center gap-2">
                                <Building size={40} className="text-dark" />
                                <div>
                                    <span className="fs-3 fw-bold text-dark d-block" style={{letterSpacing: '-0.5px', lineHeight: '1'}}>Batdongsan</span>
                                    <span className="small fw-semibold text-muted">by PropertyGuru</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4 mb-3 mb-md-0 d-flex gap-3 align-items-center">
                            <i className="bi bi-telephone text-secondary" style={{fontSize: '32px'}}></i>
                            <div>
                                <div className="contact-top-title">Hotline</div>
                                <div className="contact-top-item">1900 1881</div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4 mb-3 mb-md-0 d-flex gap-3 align-items-center">
                            <i className="bi bi-person-badge text-secondary" style={{fontSize: '32px'}}></i>
                            <div>
                                <div className="contact-top-title">Hỗ trợ khách hàng</div>
                                <div className="contact-top-item">trogiup.batdongsan.com.vn</div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4 d-flex gap-3 align-items-center">
                            <i className="bi bi-headset text-secondary" style={{fontSize: '32px'}}></i>
                            <div>
                                <div className="contact-top-title">Chăm sóc khách hàng</div>
                                <div className="contact-top-item">hotro@batdongsan.com.vn</div>
                            </div>
                        </div>
                    </div>

                    {/* HÀNG 2: MENU CHÍNH */}
                    <div className="row g-4 pb-2">
                        <div className="col-lg-4 col-md-6 pe-lg-4">
                            <h6 className="footer-title">CÔNG TY CỔ PHẦN PROPERTYGURU VIỆT NAM</h6>
                            <div className="footer-text d-flex align-items-start mt-3">
                                <i className="bi bi-geo-alt me-2 mt-1 fs-5 text-secondary"></i>
                                <span>Tầng 31, Keangnam Hanoi Landmark Tower, Phường Yên Hòa, Quận Cầu Giấy, TP. Hà Nội</span>
                            </div>
                            <div className="footer-text d-flex align-items-center mt-2 mb-4">
                                <i className="bi bi-telephone me-2 fs-5 text-secondary"></i>
                                <span>(024) 3562 5939 - (024) 3562 5940</span>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white p-1 rounded border shadow-sm"><i className="bi bi-qr-code" style={{fontSize: '3.5rem', lineHeight:'1'}}></i></div>
                                <div className="d-flex flex-column gap-2">
                                    <a href="#" className="app-btn"><i className="bi bi-google-play text-success fs-5"></i> Google Play</a>
                                    <a href="#" className="app-btn"><i className="bi bi-apple fs-5"></i> App Store</a>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-6"><h6 className="footer-title">HƯỚNG DẪN</h6><a href="#" className="footer-link">Về chúng tôi</a><a href="#" className="footer-link">Báo giá và hỗ trợ</a><a href="#" className="footer-link">Câu hỏi thường gặp</a><a href="#" className="footer-link">Góp ý báo lỗi</a><a href="#" className="footer-link">Sitemap</a></div>
                        <div className="col-lg-2 col-md-6"><h6 className="footer-title">QUY ĐỊNH</h6><a href="#" className="footer-link">Quy định đăng tin</a><a href="#" className="footer-link">Quy chế hoạt động</a><a href="#" className="footer-link">Điều khoản thỏa thuận</a><a href="#" className="footer-link">Chính sách bảo mật</a><a href="#" className="footer-link">Giải quyết khiếu nại</a></div>
                        <div className="col-lg-4 col-md-6"><h6 className="footer-title">ĐĂNG KÝ NHẬN TIN</h6><div className="input-group mb-4"><input type="email" className="form-control input-newsletter border-secondary-subtle" placeholder="Nhập email của bạn" /><button className="btn btn-newsletter"><i className="bi bi-send-fill"></i></button></div><h6 className="footer-title mb-2">QUỐC GIA & NGÔN NGỮ</h6><div className="position-relative d-inline-block" style={{width: '200px'}}><Globe size={16} className="position-absolute top-50 translate-middle-y ms-3 text-secondary" /><select className="form-select bg-white border-secondary-subtle py-2 ps-5 text-dark fw-semibold" style={{fontSize:'13px', cursor: 'pointer'}}><option>Việt Nam</option><option>English</option></select></div></div>
                    </div>
                    
                    {/* HÀNG 3: CHI NHÁNH */}
                    <div className="border-top border-light-subtle pt-4 mt-4 mb-4">
                        <div className="d-flex align-items-center gap-2 mb-3 cursor-pointer" style={{color: '#2C2C2C'}}><ChevronDown size={18} /> <span className="fw-semibold" style={{fontSize: '13px'}}>Xem chi nhánh của Batdongsan.com.vn</span></div>
                        <div className="row">
                            <div className="col-md-4"><div className="branch-title">Chi nhánh TP. Hồ Chí Minh</div><div className="branch-text">285 Cách Mạng Tháng Tám, P. Hòa Thạnh, Q.3, TP.HCM</div><div className="branch-title">Chi nhánh Đà Nẵng</div><div className="branch-text">255-257 Hùng Vương, Q. Thanh Khê, Đà Nẵng</div></div>
                            <div className="col-md-4"><div className="branch-title">Chi nhánh Hải Phòng</div><div className="branch-text">Lô 20A, đường Lê Hồng Phong, Q. Ngô Quyền, Hải Phòng</div><div className="branch-title">Chi nhánh Vũng Tàu</div><div className="branch-text">111 Hoàng Hoa Thám, P. Thắng Tam, Vũng Tàu</div></div>
                            <div className="col-md-4"><div className="branch-title">Chi nhánh Bình Dương</div><div className="branch-text">01 đường Phú Lợi, P. Phú Lợi, TP. Thủ Dầu Một</div><div className="branch-title">Chi nhánh Nha Trang</div><div className="branch-text">11 Lý Thánh Tôn, P. Vạn Thạnh, Nha Trang</div></div>
                        </div>
                    </div>

                    {/* HÀNG 4: COPYRIGHT */}
                    <div className="border-top border-light-subtle pt-4 d-flex flex-column flex-xl-row justify-content-between align-items-start gap-4">
                        <div style={{maxWidth: '400px'}}><p className="footer-text mb-1">Copyright © 2007 - 2026 Batdongsan.com.vn</p><p className="footer-text mb-0">Giấy ĐKKD số 0104630479 do Sở KHĐT TP Hà Nội cấp.</p></div>
                        <div className="d-flex align-items-center gap-4">
                            <span className="badge bg-danger p-2 px-3 fw-bold shadow-sm d-flex align-items-center gap-1" style={{fontSize:'12px'}}><i className="bi bi-check-circle-fill"></i> ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG</span>
                            <div className="d-flex gap-2"><a href="#" className="social-icon-box"><i className="bi bi-facebook fs-6"></i></a><a href="#" className="social-icon-box"><i className="bi bi-youtube fs-6"></i></a><a href="#" className="social-icon-box"><i className="bi bi-chat-dots-fill fs-6"></i></a></div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* 🔥 PROFILE MODAL ĐÃ ĐƯỢC NHÚNG VÀO ĐÂY */}
            <ProfileModal show={showProfileModal} handleClose={() => setShowProfileModal(false)} />
        </div>
    );
};

export default PropertyDetailPage;