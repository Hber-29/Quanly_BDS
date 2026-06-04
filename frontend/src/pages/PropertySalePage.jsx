import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, MapPin, Building, Heart, User, LogOut, Clock, X } from 'lucide-react';
import propertyApi from '../api/propertyApi';
import { formatPrice, formatArea, formatUnitPrice } from '../utils/formatPrice';

const PropertySalePage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // PHÂN TRANG
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 15;
    
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const keywordParam = queryParams.get('keyword') || '';
    
    // STATE QUẢN LÝ BỘ LỌC TÌM KIẾM NÂNG CAO
    const [keywordInput, setKeywordInput] = useState(keywordParam);
    const [searchKeyword, setSearchKeyword] = useState(keywordParam);
    const [selectedRegion, setSelectedRegion] = useState('');

    // 🌟 KHỞI TẠO STATE & LỊCH SỬ TÌM KIẾM (Đã tối ưu tránh lỗi render)
    const [searchHistory, setSearchHistory] = useState(() => {
        const history = localStorage.getItem('search_history');
        return history ? JSON.parse(history) : [];
    });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    const rawToken = localStorage.getItem('token');
    const isLoggedIn = rawToken && rawToken !== 'null' && rawToken !== 'undefined' && rawToken.trim() !== '';

    // MENU GIỮ NGUYÊN 100%
    const menus = [
        { name: 'Nhà đất bán', path: '/nha-dat-ban', isReady: true },
        { name: 'Nhà đất cho thuê', path: '#', isReady: false },
        { name: 'Dự án', path: '#', isReady: false },
        { name: 'Tin tức', path: '#', isReady: false },
        { name: 'Phân tích đánh giá', path: '#', isReady: false },
        { name: 'Danh bạ', path: '#', isReady: false }
    ];

    // CÁC HÀM XỬ LÝ LỊCH SỬ & LOGOUT (GIỮ NGUYÊN)
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

    const handleSelectKeyword = (kw) => {
        setKeywordInput(kw);
        setSearchKeyword(kw);
        setShowSuggestions(false);
        saveToHistory(kw);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo(0, 0);
        }
    };

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

    // QUẢN LÝ SỰ KIỆN CLICK OUTSIDE
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ĐỒNG BỘ TỪ KHÓA TRANG CHỦ & TRANG BÁN
    useEffect(() => {
        setTimeout(() => {
            if (keywordInput !== keywordParam) setKeywordInput(keywordParam);
            if (searchKeyword !== keywordParam) setSearchKeyword(keywordParam);
            if (currentPage !== 1) setCurrentPage(1);
        }, 0);
    }, [keywordParam]);

    // 🌟 DEBOUNCE TÌM KIẾM 350MS
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchKeyword(keywordInput);
            setCurrentPage(1); 
            if (keywordInput.trim() && keywordInput !== keywordParam) {
                saveToHistory(keywordInput.trim());
            }
        }, 350); 
        return () => clearTimeout(delayDebounceFn);
    }, [keywordInput, keywordParam]);

    // 🌟 LẤY SUGGESTION TỪ REDIS
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!keywordInput.trim()) {
                setTimeout(() => setSuggestions([]), 0);
                return;
            }
            try {
                const response = await propertyApi.searchPropertiesAdvanced(keywordInput, selectedRegion, 1, 5);
                const responseData = response.data || response;
                if (responseData && responseData.properties) {
                    setSuggestions(responseData.properties);
                }
            } catch (err) {
                console.error("Lỗi lấy gợi ý:", err);
            }
        };
        fetchSuggestions();
    }, [keywordInput, selectedRegion]);

    // 🌟 LẤY DANH SÁCH BÀI ĐĂNG CHÍNH
    useEffect(() => {
        const loadProperties = async () => {
            setLoading(true);
            try {
                const response = await propertyApi.searchPropertiesAdvanced(searchKeyword, selectedRegion, currentPage, limit);
                const responseData = response.data || response;
                
                if (responseData && responseData.properties) {
                    setProperties(responseData.properties);
                    setTotalPages(responseData.totalPages);
                } else {
                    setProperties([]);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("⚠️ Lỗi gọi dữ liệu tìm kiếm nâng cao:", error);
                setProperties([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };
        loadProperties();
    }, [searchKeyword, selectedRegion, currentPage]);

    const displayedProperties = isVerifiedOnly 
        ? properties.filter(item => item.badge === 'XÁC THỰC') 
        : properties;

    return (
        <div className="bg-light min-vh-100 pb-5">
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

            {/* FILTER BAR TÌM KIẾM NÂNG CAO - GIỮ NGUYÊN 100% CÁC TRƯỜNG CỦA BẠN */}
            <div className="bg-white border-bottom shadow-sm py-3 mb-4">
                <div className="container d-flex flex-wrap align-items-center gap-3">
                    
                    {/* KHỐI Ô NHẬP TÌM KIẾM CÓ CHỨA DROPDOWN GỢI Ý & LỊCH SỬ */}
                    <div className="flex-grow-1 position-relative" style={{minWidth: '300px'}} ref={searchRef}>
                        <div className="input-group border rounded">
                            <span className="input-group-text bg-white border-0"><Search size={16} className="text-muted" /></span>
                            <input 
                                type="text" 
                                className="form-control border-0 shadow-none px-2 py-2"
                                value={keywordInput} 
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Gõ tiêu đề hoặc mã bài đăng..." 
                            />
                            {keywordInput && (
                                <span className="input-group-text bg-white border-0" style={{cursor: 'pointer'}} onClick={() => setKeywordInput('')}>
                                    <X size={16} className="text-muted" />
                                </span>
                            )}
                        </div>
                        
                        {/* 🌟 GIAO DIỆN DROPDOWN THÔNG MINH 🌟 */}
                        {showSuggestions && (
                            <div className="position-absolute start-0 w-100 bg-white border rounded shadow mt-1" style={{zIndex: 999, maxHeight: '280px', overflowY: 'auto'}}>
                                {!keywordInput.trim() ? (
                                    <>
                                        <div className="d-flex justify-content-between px-3 py-2 bg-light border-bottom text-muted small fw-bold">
                                            <span>Lịch sử tìm kiếm gần đây</span>
                                            {searchHistory.length > 0 && (
                                                <button onClick={clearHistory} className="btn btn-link btn-sm p-0 text-danger text-decoration-none fw-bold">Xóa tất cả</button>
                                            )}
                                        </div>
                                        {searchHistory.length > 0 ? (
                                            <div className="list-group list-group-flush">
                                                {searchHistory.map((item, idx) => (
                                                    <div key={idx} onClick={() => handleSelectKeyword(item)} className="list-group-item list-group-item-action d-flex align-items-center border-0 py-2" style={{cursor: 'pointer'}}>
                                                        <Clock size={14} className="text-muted me-2" />
                                                        <span className="small text-dark">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 text-center text-muted small">Bạn chưa tìm kiếm từ khóa nào gần đây.</div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="px-3 py-2 bg-light border-bottom text-muted small fw-bold">Gợi ý bài đăng phù hợp</div>
                                        {suggestions.length > 0 ? (
                                            <div className="list-group list-group-flush">
                                                {suggestions.map((item) => (
                                                    <div key={item.propertyId} onClick={() => handleSelectKeyword(item.title)} className="list-group-item list-group-item-action d-flex align-items-center border-0 py-2" style={{cursor: 'pointer'}}>
                                                        <Search size={14} className="text-danger me-2 flex-shrink-0" />
                                                        <span className="small text-dark text-truncate flex-grow-1">{item.title}</span>
                                                        <span className="badge bg-secondary ms-2 p-1" style={{fontSize: '11px'}}>{item.propertyCode}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 text-center text-muted small">Không tìm thấy gợi ý nào trùng khớp.</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* BỘ LỌC VÙNG MIỀN */}
                    <select 
                        className="form-select w-auto shadow-none"
                        value={selectedRegion}
                        onChange={(e) => { setSelectedRegion(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Khu vực (Toàn quốc)</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Hồ Chí Minh">TP.Hồ Chí Minh</option>
                        <option value="Thủ Đức">Thủ Đức</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Bình Dương">Bình Dương</option>
                    </select>

                    {/* GIỮ LẠI NGUYÊN VẸN 2 Ô CHỌN NÀY CỦA BẠN */}
                    <select className="form-select w-auto shadow-none"><option>Khoảng giá</option></select>
                    <select className="form-select w-auto shadow-none"><option>Diện tích</option></select>

                    {/* GIỮ NGUYÊN NÚT TOGGLE SWITCH CUSTOM CỦA BẠN */}
                    <div 
                        className="d-flex align-items-center border rounded px-3 py-2 bg-white"
                        style={{ cursor: 'pointer', userSelect: 'none', borderColor: isVerifiedOnly ? '#28a745' : '#ddd' }}
                        onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isVerifiedOnly ? '#28a745' : '#666'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span className="fw-semibold me-2 small" style={{color: isVerifiedOnly ? '#28a745' : '#555'}}>Tin xác thực</span>
                        <div className="rounded-pill d-flex align-items-center p-1" style={{ width: '30px', height: '16px', backgroundColor: isVerifiedOnly ? '#28a745' : '#ccc', transition: 'all 0.3s' }}>
                            <div className="bg-white rounded-circle shadow-sm" style={{ width: '12px', height: '12px', transform: isVerifiedOnly ? 'translateX(14px)' : 'translateX(0px)', transition: 'transform 0.3s' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="container">
                <div className="row">
                    {/* KHỐI TRÁI: DANH SÁCH BÀI ĐĂNG */}
                    <div className="col-lg-9">
                        <h2 className="fw-bold mb-2">Mua bán nhà đất trên toàn quốc</h2>
                        <p className="small fw-semibold mb-4 text-dark">
                            Tìm thấy <strong className="text-danger">{displayedProperties.length}</strong> bất động sản phù hợp.
                        </p>

                        {loading ? (
                            <div className="text-center py-5 text-muted">Đang tìm kiếm bài đăng...</div>
                        ) : displayedProperties.length > 0 ? (
                            displayedProperties.map((item) => (
                                /* 🔥 BƯỚC 2: Bọc Link thay cho thẻ div bọc ngoài cùng */
                                <Link to={`/nha-dat-ban/${item.propertyId || item.id}`} key={item.propertyId || item.id} className="text-decoration-none text-dark d-block mb-4">
                                    <div className="card flex-row border border-light-subtle rounded shadow-sm bg-white p-3" style={{ transition: 'box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.classList.add('shadow')} onMouseOut={(e) => e.currentTarget.classList.remove('shadow')}>
                                        <img src={item.thumbnail} alt={item.title} className="rounded object-fit-cover" style={{width: '240px', height: '160px'}} />
                                        <div className="card-body d-flex flex-column py-0 pe-0">
                                            <div className="mb-2">
                                                <span className="badge fw-bold" style={{ fontSize: '11px', color: item.badge === 'XÁC THỰC' ? '#28a745' : '#e03c31', backgroundColor: 'transparent', padding: 0 }}>
                                                    {item.badge === 'XÁC THỰC' ? 'TIN ĐÃ XÁC THỰC' : 'VIP KIM CƯƠNG'}
                                                </span>
                                            </div>
                                            <h5 className="card-title fw-bold text-dark fs-6 mb-3 lh-base">{item.title}</h5>
                                            <div className="d-flex align-items-center gap-3 mb-2">
                                                <span className="fw-bold text-danger">{formatPrice(item.price)}</span>
                                                <span className="fw-bold text-danger">{formatArea(item.area)} m²</span>
                                                <span className="small text-muted d-flex align-items-center gap-1"><MapPin size={12} /> {item.address}</span>
                                            </div>
                                            <p className="card-text small text-secondary mb-3" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{item.description}</p>
                                            <div className="mt-auto d-flex justify-content-between align-items-center">
                                                <span className="small text-muted" style={{ fontSize: '12px' }}>Mã: {item.propertyCode}</span>
                                                {/* Ngăn chặn sự kiện click lan ra thẻ Link khi bấm trái tim */}
                                                <button className="btn btn-light border p-1" onClick={(e) => e.preventDefault()}><Heart size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="alert alert-light border border-dashed text-center py-5 text-secondary small">Không tìm thấy bài đăng nào khớp với điều kiện tìm kiếm của bạn.</div>
                        )}

                        {/* THANH PHÂN TRANG */}
                        {!loading && totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4 mb-5 gap-2">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                    className="btn btn-outline-secondary fw-semibold small px-3 py-2"
                                    style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    &laquo; Trước
                                </button>
                                
                                {[...Array(totalPages)].map((_, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => handlePageChange(index + 1)}
                                        className={`btn fw-semibold small px-3 py-2 ${currentPage === index + 1 ? 'btn-danger' : 'btn-outline-secondary bg-white text-dark'}`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                    className="btn btn-outline-secondary fw-semibold small px-3 py-2"
                                    style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                >
                                    Sau &raquo;
                                </button>
                            </div>
                        )}
                    </div>

                    {/* KHỐI PHẢI: SIDEBAR */}
                    <div className="col-lg-3">
                        <div className="card border border-light-subtle rounded shadow-sm bg-white p-3 mb-4">
                            <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '14px' }}>Lọc theo khoảng giá</h6>
                            <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small text-secondary" style={{ cursor: 'pointer' }}>
                                <li>Thỏa thuận</li>
                                <li>Dưới 500 triệu</li>
                                <li>500 - 800 triệu</li>
                                <li>1 - 2 tỷ</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertySalePage;