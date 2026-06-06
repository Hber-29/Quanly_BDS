import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building, Heart, User, LogOut, Clock, X } from 'lucide-react';

// 🔥 Đã sửa thành ../ (Lùi 1 cấp vì HomePage nằm ở src/pages)
import propertyApi from '../api/propertyApi';
import { formatPrice, formatArea, formatUnitPrice } from '../utils/formatPrice';
import ProfileModal from '../components/Customer/ProfileModal';

const HomePage = () => {
    const [latestProperties, setLatestProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Cờ hiệu quản lý bật/tắt Popup Hồ sơ
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    const [searchHistory, setSearchHistory] = useState(() => {
        const history = localStorage.getItem('search_history');
        return history ? JSON.parse(history) : [];
    });
    
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

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

    return (
        <div className="bg-light min-vh-100 pb-5">
            <style>
                {`
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
                .hero-bg {
                    background-image: url(https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80);
                    background-size: cover;
                    background-position: center;
                    height: 420px;
                }
                .search-glass { background-color: rgba(0,0,0,0.6); }
                `}
            </style>

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
                                        <div 
                                            onClick={() => { setIsDropdownOpen(false); setShowProfileModal(true); }} 
                                            className="dropdown-item py-2 d-flex align-items-center text-secondary" 
                                            style={{cursor: 'pointer'}}
                                        >
                                            <User size={16} className="me-2" /> Thông tin cá nhân
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

            <section className="hero-bg d-flex align-items-center justify-content-center">
                <div className="container" style={{maxWidth: '800px'}}>
                    <div className="d-inline-block search-glass text-white px-4 py-2 rounded-top fw-bold">Mua bán</div>
                    <div className="search-glass p-2 rounded-bottom rounded-end position-relative" ref={searchRef}>
                        <div className="input-group input-group-lg">
                            <span className="input-group-text bg-white border-0"><Search size={20} className="text-muted"/></span>
                            <input 
                                type="text" 
                                className="form-control border-0 shadow-none" 
                                placeholder="Nhập địa điểm, khu vực hoặc mã bài đăng tìm nhanh..." 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={handleKeyDown}
                            />
                            {searchKeyword && (
                                <span className="input-group-text bg-white border-0" style={{cursor: 'pointer'}} onClick={() => setSearchKeyword('')}>
                                    <X size={18} className="text-muted" />
                                </span>
                            )}
                            <button className="btn btn-danger px-4 fw-bold" onClick={handleSearchSubmit}>Tìm kiếm</button>
                        </div>

                        {showSuggestions && (
                            <div className="position-absolute start-0 w-100 bg-white rounded shadow mt-2" style={{top: '100%', zIndex: 1050, maxHeight: '300px', overflowY: 'auto'}}>
                                {!searchKeyword.trim() ? (
                                    <>
                                        <div className="d-flex justify-content-between px-3 py-2 bg-light border-bottom text-muted small fw-bold">
                                            <span>Lịch sử tìm kiếm gần đây</span>
                                            {searchHistory.length > 0 && <button onClick={clearHistory} className="btn btn-link btn-sm p-0 text-danger text-decoration-none">Xóa tất cả</button>}
                                        </div>
                                        {searchHistory.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {searchHistory.map((item, idx) => (
                                                    <li key={idx} className="list-group-item list-group-item-action cursor-pointer border-0" onClick={() => handleSelectKeyword(item)}>
                                                        <Clock size={14} className="text-muted me-2" /> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="p-3 text-center text-muted small">Bạn chưa tìm kiếm từ khóa nào gần đây.</div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="px-3 py-2 bg-light border-bottom text-muted small fw-bold">Gợi ý bài đăng phù hợp</div>
                                        {suggestions.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {suggestions.map((item) => (
                                                    <li key={item.propertyId} className="list-group-item list-group-item-action cursor-pointer border-0 d-flex align-items-center" onClick={() => handleSelectKeyword(item.title)}>
                                                        <Search size={14} className="text-danger me-3" />
                                                        <span className="text-truncate flex-grow-1">{item.title}</span>
                                                        <span className="badge bg-secondary ms-2">{item.propertyCode}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="p-3 text-center text-muted small">Không tìm thấy gợi ý nào trùng khớp.</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="container mt-5">
                <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2">
                    <h3 className="fw-bold mb-0">Bất động sản dành cho bạn</h3>
                    <Link to="/nha-dat-ban" className="text-dark fw-bold text-decoration-none">Tin nhà đất bán mới nhất &raquo;</Link>
                </div>

                {loading ? (
                    <div className="text-center py-5 text-muted">
                        <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div>
                        <p className="mt-2">Đang tải danh sách bài đăng...</p>
                    </div>
                ) : (
                    <>
                        <div className="row g-4">
                            {latestProperties.map((item) => (
                                <div key={item.propertyId || item.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <Link to={`/nha-dat-ban/${item.propertyId || item.id}`} className="text-decoration-none text-dark">
                                        <div className="card h-100 shadow-sm border-0 position-relative" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                            <div className="position-relative" style={{height: '180px'}}>
                                                <img src={item.thumbnail} alt={item.title} className="card-img-top w-100 h-100" style={{objectFit: 'cover'}} />
                                                <span className="badge bg-danger position-absolute top-0 start-0 m-2">{item.badge || 'VIP'}</span>
                                            </div>
                                            <div className="card-body d-flex flex-column">
                                                <h6 className="card-title text-truncate-2" style={{height: '40px', overflow: 'hidden'}}>{item.title}</h6>
                                                <div className="d-flex gap-3 mb-2 align-items-center">
                                                    <span className="text-danger fw-bold fs-6">{formatPrice(item.price)}</span>
                                                    <span className="text-danger fw-bold small">{formatArea(item.area)} m²</span>
                                                </div>
                                                <div className="text-muted small mb-3 text-truncate">
                                                    <MapPin size={14} className="me-1" />{item.address}
                                                </div>
                                                <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                                                    <span className="text-muted small">Mã: {item.propertyCode}</span>
                                                    <button className="btn btn-light btn-sm border" onClick={(e) => e.preventDefault()}><Heart size={16} className="text-muted" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {latestProperties.length > 0 && (
                            <div className="text-center mt-5">
                                <Link to="/nha-dat-ban" className="btn btn-outline-danger px-4 py-2 rounded">
                                    <span className="fw-bold shimmer-btn-text">Xem thêm bất động sản mới &raquo;</span>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Gọi Component Popup */}
            <ProfileModal show={showProfileModal} handleClose={() => setShowProfileModal(false)} />
            
        </div>
    );
};

export default HomePage;