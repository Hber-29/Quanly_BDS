import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// 🔥 ĐÃ FIX: Thêm 'ChevronDown' vào cuối danh sách import này để không bị lỗi trắng trang
import { Search, MapPin, Building, Heart, User, LogOut, Clock, X, Phone, Mail, Globe, Share2, MonitorPlay, Camera, ChevronRight, ChevronDown } from 'lucide-react';

import propertyApi from '../api/propertyApi';
import { formatPrice, formatArea } from '../utils/formatPrice';
import ProfileModal from '../components/Customer/ProfileModal';

const HomePage = () => {
    // ==========================================
    // KHU VỰC LOGIC (GIỮ NGUYÊN 100% CỦA SẾP)
    // ==========================================
    const [latestProperties, setLatestProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    const [searchHistory, setSearchHistory] = useState(() => {
        const history = localStorage.getItem('search_history');
        return history ? JSON.parse(history) : [];
    });
    
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    
    const location = useLocation();

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

    const saveToHistory = (kw) => {
        let history = JSON.parse(localStorage.getItem('search_history')) || [];
        history = history.filter(item => item.toLowerCase() !== kw.toLowerCase());
        history.unshift(kw);
        if (history.length > 5) history.pop();
        localStorage.setItem('search_history', JSON.stringify(history));
        setSearchHistory(history);
    };

    const clearHistory = (e) => {
        e.stopPropagation();
        localStorage.removeItem('search_history');
        setSearchHistory([]);
    };

    const handleSearchSubmit = () => {
        if (searchKeyword.trim()) {
            saveToHistory(searchKeyword.trim());
            navigate(`/nha-dat-ban?keyword=${encodeURIComponent(searchKeyword.trim())}`);
        } else {
            navigate('/nha-dat-ban');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearchSubmit();
    };

    const handleSelectKeyword = (kw) => {
        setSearchKeyword(kw);
        saveToHistory(kw);
        setShowSuggestions(false);
        navigate(`/nha-dat-ban?keyword=${encodeURIComponent(kw)}`);
    };

    const handleMenuClick = (e, item) => {
        if (!item.isReady) {
            e.preventDefault();
            alert('Tính năng đang được phát triển, vui lòng quay lại sau!');
        }
    };

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            localStorage.clear(); 
            window.location.reload(); 
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!searchKeyword.trim()) {
            setTimeout(() => setSuggestions([]), 0);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await propertyApi.searchPropertiesAdvanced(searchKeyword, '', 1, 5);
                const responseData = response.data || response;
                if (responseData && responseData.properties) {
                    setSuggestions(responseData.properties);
                }
            } catch (err) {
                console.error("Lỗi lấy gợi ý tại trang chủ:", err);
            }
        }, 350);
        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword]);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const response = await propertyApi.getHomepageList();
                if (response && Array.isArray(response.properties)) {
                    setLatestProperties(response.properties);
                } else {
                    throw new Error("Sai cấu trúc JSON"); 
                }
            } catch (err) {
                console.error("Lỗi lấy bài đăng trang chủ", err);
                setLatestProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    // ==========================================
    // LOGIC ĐIỀU KHIỂN BANNER SLIDER CHẠY TỰ ĐỘNG
    // ==========================================
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80'
    ];

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); 
        return () => clearInterval(slideInterval);
    }, [slides.length]);

    // ==========================================
    // KHU VỰC GIAO DIỆN HIỂN THỊ
    // ==========================================
    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <style>
                {`
                /* CSS Nâng cấp Giao diện Mượt mà */
                .smooth-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-float:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
                
                @keyframes shimmerText {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .shimmer-btn-text {
                    background: linear-gradient(90deg, #dc3545 20%, #ff8c85 50%, #dc3545 80%);
                    background-size: 200% auto;
                    color: transparent;
                    -webkit-background-clip: text;
                    background-clip: text;
                    animation: shimmerText 3s linear infinite;
                }
                
                /* CSS Banner Slider Trượt Ngang Nguyên Bản */
                .hero-section {
                    height: 550px; 
                    position: relative;
                    width: 100%;
                }
                .slider-container-main {
                    display: flex;
                    width: 300%; 
                    height: 100%;
                    transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
                }
                .slide-img-item {
                    width: 33.33333%; 
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                }
                .hero-overlay {
                    background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 100%);
                    pointer-events: none;
                }
                
                /* Search Box Glassmorphism */
                .search-glass { 
                    background-color: rgba(0,0,0,0.65); 
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .search-tab {
                    background-color: rgba(0,0,0,0.65);
                    backdrop-filter: blur(8px);
                    transition: all 0.2s;
                }
                .search-tab:hover { background-color: rgba(220,53,69,0.95); cursor: pointer; }

                /* CSS Chuyên Nghiệp Cho Footer Mới */
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

            {/* 1. HEADER / MENU */}
            <header className="bg-white border-bottom sticky-top shadow-sm z-3">
                <div className="container-fluid px-4 py-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-5">
                        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 text-dark">
                            <Building size={38} className="text-danger smooth-transition" />
                            <div className="d-flex align-items-baseline">
                                <span className="fs-3 fw-bold text-danger" style={{letterSpacing: '-0.5px'}}>Batdongsan</span>
                                <span className="fs-5 fw-bold text-dark">.com.vn</span>
                            </div>
                        </Link>
                        
                        <nav className="d-none d-xl-flex gap-4">
                            {menus.map((item, idx) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link 
                                        key={idx} 
                                        to={item.path} 
                                        onClick={(e) => handleMenuClick(e, item)}
                                        className={`text-decoration-none fs-6 fw-bold pb-2 pt-2 smooth-transition ${isActive ? 'text-danger border-bottom border-danger border-3' : 'text-dark hover-danger'}`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" className="text-dark text-decoration-none fw-semibold smooth-transition hover-danger">Đăng nhập</Link>
                                <span className="text-muted">|</span>
                                <Link to="/register" className="text-dark text-decoration-none fw-semibold smooth-transition hover-danger">Đăng ký</Link>
                            </>
                        ) : (
                            <div className="position-relative" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                                <div className="d-flex align-items-center gap-2" style={{cursor: 'pointer'}}>
                                    <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" style={{width: '32px', height: '32px'}}>
                                        <User size={18} />
                                    </div>
                                    <span className="fw-semibold text-dark">Tài khoản</span>
                                </div>
                                {isDropdownOpen && (
                                    <div className="position-absolute end-0 bg-white border rounded-3 shadow-lg mt-2 py-2" style={{width: '200px', zIndex: 110}}>
                                        <div onClick={() => { setIsDropdownOpen(false); setShowProfileModal(true); }} className="dropdown-item py-2 px-3 d-flex align-items-center text-secondary fw-semibold smooth-transition" style={{cursor: 'pointer'}}>
                                            <User size={18} className="me-3 text-dark" /> Thông tin cá nhân
                                        </div>
                                        <div className="dropdown-divider my-1"></div>
                                        <div onClick={handleLogout} className="dropdown-item py-2 px-3 d-flex align-items-center text-danger fw-semibold smooth-transition" style={{cursor: 'pointer'}}>
                                            <LogOut size={18} className="me-3" /> Đăng xuất
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <Link to={isLoggedIn ? "/dang-tin" : "/login"} className="btn btn-outline-dark fw-bold ms-3 px-4 py-2 rounded-3 smooth-transition">Đăng tin</Link>
                    </div>
                </div>
            </header>

            {/* 2. BANNER CAO 550PX & SLIDER */}
            <section className="hero-section overflow-hidden d-flex align-items-center justify-content-center">
                <div className="slider-container-main position-absolute top-0 start-0 h-100" style={{ transform: `translateX(-${(currentSlide * 100) / slides.length}%)` }}>
                    {slides.map((url, index) => (
                        <div key={index} className="slide-img-item" style={{ backgroundImage: `url('${url}')` }}></div>
                    ))}
                </div>
                <div className="position-absolute top-0 start-0 w-100 h-100 hero-overlay"></div>

                <div className="container position-relative" style={{maxWidth: '850px', zIndex: 10, transform: 'translateY(-10px)'}}>
                    <div className="d-inline-block search-tab text-white px-4 py-2 rounded-top fw-bold fs-6 shadow-sm">Mua bán</div>
                    <div className="search-glass p-4 rounded-bottom rounded-end position-relative shadow-lg" ref={searchRef}>
                        <div className="input-group input-group-lg shadow-sm overflow-hidden rounded-3">
                            <span className="input-group-text bg-white border-0"><Search size={22} className="text-danger"/></span>
                            <input 
                                type="text" 
                                className="form-control border-0 shadow-none fs-6 py-3" 
                                placeholder="Nhập địa điểm, khu vực hoặc mã bài đăng tìm nhanh..." 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={handleKeyDown}
                            />
                            {searchKeyword && (
                                <span className="input-group-text bg-white border-0" style={{cursor: 'pointer'}} onClick={() => setSearchKeyword('')}>
                                    <X size={20} className="text-muted" />
                                </span>
                            )}
                            <button className="btn btn-danger px-5 fw-bold fs-6 smooth-transition" onClick={handleSearchSubmit}>Tìm kiếm</button>
                        </div>

                        {showSuggestions && (
                            <div className="position-absolute start-0 w-100 bg-white rounded-3 shadow-lg mt-3" style={{top: '100%', zIndex: 1050, maxHeight: '350px', overflowY: 'auto'}}>
                                {!searchKeyword.trim() ? (
                                    <>
                                        <div className="d-flex justify-content-between px-4 py-3 bg-light border-bottom text-muted small fw-bold">
                                            <span>Lịch sử tìm kiếm gần đây</span>
                                            {searchHistory.length > 0 && <button onClick={clearHistory} className="btn btn-link btn-sm p-0 text-danger text-decoration-none">Xóa tất cả</button>}
                                        </div>
                                        {searchHistory.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {searchHistory.map((item, idx) => (
                                                    <li key={idx} className="list-group-item list-group-item-action cursor-pointer border-0 py-3 px-4 smooth-transition" onClick={() => handleSelectKeyword(item)}>
                                                        <Clock size={16} className="text-muted me-3" /> <span className="fw-semibold">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="p-4 text-center text-muted small">Bạn chưa tìm kiếm từ khóa nào gần đây.</div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="px-4 py-3 bg-light border-bottom text-muted small fw-bold">Gợi ý bài đăng phù hợp</div>
                                        {suggestions.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {suggestions.map((item) => (
                                                    <li key={item.propertyId} className="list-group-item list-group-item-action cursor-pointer border-0 d-flex align-items-center py-3 px-4 smooth-transition" onClick={() => handleSelectKeyword(item.title)}>
                                                        <Search size={16} className="text-danger me-3" />
                                                        <span className="text-truncate flex-grow-1 fw-semibold">{item.title}</span>
                                                        <span className="badge bg-danger ms-3 px-2 py-1 rounded-pill">{item.propertyCode}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="p-4 text-center text-muted small">Không tìm thấy gợi ý nào trùng khớp.</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 3. DANH SÁCH BẤT ĐỘNG SẢN */}
            <section className="container mt-5 pt-3 flex-grow-1">
                <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
                    <h2 className="fw-bold mb-0 text-dark" style={{letterSpacing: '-0.5px'}}>Bất động sản dành cho bạn</h2>
                    <Link to="/nha-dat-ban" className="text-danger fw-bold text-decoration-none smooth-transition d-flex align-items-center gap-1">Tin nhà đất bán mới nhất <ChevronRight size={18}/></Link>
                </div>

                {loading ? (
                    <div className="text-center py-5 text-muted">
                        <div className="spinner-border text-danger" role="status"></div>
                        <p className="mt-3 fw-semibold">Đang tải danh sách bài đăng...</p>
                    </div>
                ) : (
                    <>
                        <div className="row g-4">
                            {latestProperties.map((item) => (
                                <div key={item.propertyId || item.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <Link to={`/nha-dat-ban/${item.propertyId || item.id}`} className="text-decoration-none text-dark">
                                        <div className="card h-100 border-0 rounded-3 overflow-hidden shadow-sm hover-float smooth-transition">
                                            <div className="position-relative" style={{height: '200px'}}>
                                                <img src={item.thumbnail} alt={item.title} className="card-img-top w-100 h-100" style={{objectFit: 'cover'}} />
                                                <span className="badge bg-danger position-absolute top-0 start-0 m-3 px-2 py-1 shadow-sm">{item.badge || 'VIP'}</span>
                                            </div>
                                            <div className="card-body d-flex flex-column p-3">
                                                <h6 className="card-title fw-bold text-dark mb-2 text-truncate-2" style={{height: '42px', lineHeight: '1.4', overflow: 'hidden'}}>{item.title}</h6>
                                                <div className="d-flex gap-3 mb-3 align-items-center">
                                                    <span className="text-danger fw-bold fs-5">{formatPrice(item.price)}</span>
                                                    <span className="text-danger fw-bold small bg-danger bg-opacity-10 px-2 py-1 rounded">{formatArea(item.area)} m²</span>
                                                </div>
                                                <div className="text-muted small mb-3 text-truncate d-flex align-items-center">
                                                    <MapPin size={16} className="me-2 text-secondary" />{item.address}
                                                </div>
                                                <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                                                    <span className="text-muted small fw-semibold">Mã: {item.propertyCode}</span>
                                                    <button className="btn btn-light btn-sm border rounded-circle p-2 smooth-transition" onClick={(e) => e.preventDefault()}>
                                                        <Heart size={16} className="text-danger" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {latestProperties.length > 0 && (
                            <div className="text-center mt-5 mb-5">
                                <Link to="/nha-dat-ban" className="btn btn-outline-danger px-5 py-3 rounded-pill shadow-sm smooth-transition">
                                    <span className="fw-bold fs-6 shimmer-btn-text">Xem thêm bất động sản mới <ChevronRight size={20}/></span>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* 4. FOOTER ĐẦY ĐỦ CHI TIẾT (CLONE TỪ ẢNH MẪU) */}
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

            <ProfileModal show={showProfileModal} handleClose={() => setShowProfileModal(false)} />
        </div>
    );
};

export default HomePage;