import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';

// 🔥 Đã dọn dẹp các icon thừa, chỉ giữ lại đúng những icon trang này đang dùng
import { Search, MapPin, Building, Heart, User, LogOut, Clock, X, ChevronRight, ChevronDown, Globe } from 'lucide-react';

import propertyApi from '../api/propertyApi';
import { formatPrice, formatArea } from '../utils/formatPrice';
import ProfileModal from '../components/Customer/ProfileModal';

const PropertySalePage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // STATE QUẢN LÝ MODAL PROFILE
    const [showProfileModal, setShowProfileModal] = useState(false);
    
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
    
    // CÁC STATE DROPDOWN BỘ LỌC
    const [selectedRegionId, setSelectedRegionId] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const [selectedAreaRange, setSelectedAreaRange] = useState('');

    const [searchHistory, setSearchHistory] = useState(() => {
        const history = localStorage.getItem('search_history');
        return history ? JSON.parse(history) : [];
    });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

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
        const isConfirm = window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống BĐS không?");
        if (isConfirm) {
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
        setTimeout(() => {
            if (keywordInput !== keywordParam) setKeywordInput(keywordParam);
            if (searchKeyword !== keywordParam) setSearchKeyword(keywordParam);
            if (currentPage !== 1) setCurrentPage(1);
        }, 0);
    }, [keywordParam]);

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

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!keywordInput.trim()) {
                setTimeout(() => setSuggestions([]), 0);
                return;
            }
            try {
                const response = await propertyApi.searchPropertiesAdvanced(keywordInput, selectedRegionId, 1, 5);
                const responseData = response.data || response;
                if (responseData && responseData.properties) {
                    setSuggestions(responseData.properties);
                }
            } catch (err) {
                console.error("Lỗi lấy gợi ý:", err);
            }
        };
        fetchSuggestions();
    }, [keywordInput, selectedRegionId]);

    useEffect(() => {
        const loadProperties = async () => {
            setLoading(true);
            try {
                const response = await propertyApi.searchPropertiesAdvanced(searchKeyword, selectedRegionId, currentPage, limit);
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
    }, [searchKeyword, selectedRegionId, currentPage, selectedPriceRange, selectedAreaRange]); 

    const displayedProperties = isVerifiedOnly 
        ? properties.filter(item => item.badge === 'XÁC THỰC') 
        : properties;

    // DỮ LIỆU SIDEBAR BỘ LỌC
    const priceFilters = [
        "Thỏa thuận", "Dưới 500 triệu", "500 - 800 triệu", "800 triệu - 1 tỷ", 
        "1 - 2 tỷ", "2 - 3 tỷ", "3 - 5 tỷ", "5 - 7 tỷ", "7 - 10 tỷ", 
        "10 - 20 tỷ", "20 - 30 tỷ", "30 - 40 tỷ", "40 - 60 tỷ", "Trên 60 tỷ"
    ];
    const areaFilters = [
        "Dưới 30 m²", "30 - 50 m²", "50 - 80 m²", "80 - 100 m²", 
        "100 - 150 m²", "150 - 200 m²", "200 - 250 m²", "250 - 300 m²", 
        "300 - 500 m²", "Trên 500 m²"
    ];

    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <style>
                {`
                /* CSS CHO BỘ LỌC SIDEBAR */
                .filter-sidebar-card { border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
                .filter-sidebar-title { font-size: 16px; font-weight: 700; color: #2C2C2C; margin-bottom: 15px; }
                .filter-item { font-size: 14px; color: #505050; padding: 8px 0; border-bottom: 1px dashed #f0f0f0; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; }
                .filter-item:last-child { border-bottom: none; }
                .filter-item::before { content: '›'; margin-right: 8px; color: transparent; font-size: 18px; transition: color 0.2s; }
                .filter-item:hover { color: #dc3545; padding-left: 5px; font-weight: 500; }
                .filter-item:hover::before { color: #dc3545; }
                
                /* LÀM MƯỢT CARD BẤT ĐỘNG SẢN */
                .property-card { transition: all 0.2s ease-in-out; border: 1px solid #e9ecef; }
                .property-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; border-color: #dee2e6; }

                /* CSS CHO FOOTER ĐỂ TRÁNH BỊ VỠ GIAO DIỆN */
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
                <div className="container-fluid px-4 py-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-5">
                        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2 text-dark">
                            <Building size={32} className="text-danger" />
                            <div className="d-flex align-items-baseline">
                                <span className="fs-4 fw-bold text-danger" style={{letterSpacing: '-0.5px'}}>Batdongsan</span>
                                <span className="fs-6 fw-bold text-dark">.com.vn</span>
                            </div>
                        </Link>
                        <nav className="d-none d-lg-flex gap-4">
                            {menus.map((item, idx) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link 
                                        key={idx} 
                                        to={item.path} 
                                        onClick={(e) => handleMenuClick(e, item)}
                                        className={`text-decoration-none fs-6 fw-semibold pb-2 pt-2 ${isActive ? 'text-danger border-bottom border-danger border-3' : 'text-dark hover-danger'}`}
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
                                <Link to="/login" className="text-dark text-decoration-none fw-semibold">Đăng nhập</Link>
                                <span className="text-muted">|</span>
                                <Link to="/register" className="text-dark text-decoration-none fw-semibold">Đăng ký</Link>
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
                                        <div 
                                            onClick={() => { setIsDropdownOpen(false); setShowProfileModal(true); }} 
                                            className="dropdown-item py-2 px-3 d-flex align-items-center text-secondary fw-semibold" 
                                            style={{cursor: 'pointer', transition: '0.2s'}}
                                        >
                                            <User size={18} className="me-3 text-dark" /> Thông tin cá nhân
                                        </div>
                                        <div className="dropdown-divider my-1"></div>
                                        <div onClick={handleLogout} className="dropdown-item py-2 px-3 d-flex align-items-center text-danger fw-semibold" style={{cursor: 'pointer', transition: '0.2s'}}>
                                            <LogOut size={18} className="me-3" /> Đăng xuất
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <Link to={isLoggedIn ? "/dang-tin" : "/login"} className="btn btn-outline-dark fw-bold ms-3 px-4 py-2 rounded-3">Đăng tin</Link>
                    </div>
                </div>
            </header>

            {/* FILTER BAR TÌM KIẾM NÂNG CAO */}
            <div className="bg-white border-bottom shadow-sm py-3 mb-4">
                <div className="container d-flex flex-wrap align-items-center gap-3">
                    
                    <div className="flex-grow-1 position-relative" style={{minWidth: '300px'}} ref={searchRef}>
                        <div className="input-group border border-secondary-subtle rounded-3 overflow-hidden">
                            <span className="input-group-text bg-white border-0"><Search size={18} className="text-muted" /></span>
                            <input 
                                type="text" 
                                className="form-control border-0 shadow-none px-2 py-2"
                                value={keywordInput} 
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Gõ tiêu đề, khu vực hoặc mã bài đăng..." 
                            />
                            {keywordInput && (
                                <span className="input-group-text bg-white border-0" style={{cursor: 'pointer'}} onClick={() => setKeywordInput('')}>
                                    <X size={18} className="text-muted" />
                                </span>
                            )}
                        </div>
                        
                        {/* Box Gợi ý */}
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
                        className="form-select w-auto shadow-none border-secondary-subtle rounded-3 py-2 text-dark fw-semibold"
                        value={selectedRegionId}
                        onChange={(e) => { setSelectedRegionId(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Khu vực (Toàn quốc)</option>
                        <option value="1">Thành phố Hà Nội</option>
                        <option value="2">Tỉnh Hà Giang</option>
                        <option value="4">Tỉnh Cao Bằng</option>
                        <option value="6">Tỉnh Bắc Kạn</option>
                        <option value="8">Tỉnh Tuyên Quang</option>
                        <option value="10">Tỉnh Lào Cai</option>
                        <option value="11">Tỉnh Điện Biên</option>
                        <option value="12">Tỉnh Lai Châu</option>
                        <option value="14">Tỉnh Sơn La</option>
                        <option value="15">Tỉnh Yên Bái</option>
                        <option value="17">Tỉnh Hoà Bình</option>
                        <option value="19">Tỉnh Thái Nguyên</option>
                        <option value="20">Tỉnh Lạng Sơn</option>
                        <option value="22">Tỉnh Quảng Ninh</option>
                        <option value="24">Tỉnh Bắc Giang</option>
                        <option value="25">Tỉnh Phú Thọ</option>
                        <option value="26">Tỉnh Vĩnh Phúc</option>
                        <option value="27">Tỉnh Bắc Ninh</option>
                        <option value="30">Tỉnh Hải Dương</option>
                        <option value="31">Thành phố Hải Phòng</option>
                        <option value="33">Tỉnh Hưng Yên</option>
                        <option value="34">Tỉnh Thái Bình</option>
                        <option value="35">Tỉnh Hà Nam</option>
                        <option value="36">Tỉnh Nam Định</option>
                        <option value="37">Tỉnh Ninh Bình</option>
                        <option value="38">Tỉnh Thanh Hóa</option>
                        <option value="40">Tỉnh Nghệ An</option>
                        <option value="42">Tỉnh Hà Tĩnh</option>
                        <option value="44">Tỉnh Quảng Bình</option>
                        <option value="45">Tỉnh Quảng Trị</option>
                        <option value="46">Tỉnh Thừa Thiên Huế</option>
                        <option value="48">Thành phố Đà Nẵng</option>
                        <option value="49">Tỉnh Quảng Nam</option>
                        <option value="51">Tỉnh Quảng Ngãi</option>
                        <option value="52">Tỉnh Bình Định</option>
                        <option value="54">Tỉnh Phú Yên</option>
                        <option value="56">Tỉnh Khánh Hòa</option>
                        <option value="58">Tỉnh Ninh Thuận</option>
                        <option value="60">Tỉnh Bình Thuận</option>
                        <option value="62">Tỉnh Kon Tum</option>
                        <option value="64">Tỉnh Gia Lai</option>
                        <option value="66">Tỉnh Đắk Lắk</option>
                        <option value="67">Tỉnh Đắk Nông</option>
                        <option value="68">Tỉnh Lâm Đồng</option>
                        <option value="70">Tỉnh Bình Phước</option>
                        <option value="72">Tỉnh Tây Ninh</option>
                        <option value="74">Tỉnh Bình Dương</option>
                        <option value="75">Tỉnh Đồng Nai</option>
                        <option value="77">Tỉnh Bà Rịa - Vũng Tàu</option>
                        <option value="79">Thành phố Hồ Chí Minh</option>
                        <option value="80">Tỉnh Long An</option>
                        <option value="82">Tỉnh Tiền Giang</option>
                        <option value="83">Tỉnh Bến Tre</option>
                        <option value="84">Tỉnh Trà Vinh</option>
                        <option value="86">Tỉnh Vĩnh Long</option>
                        <option value="87">Tỉnh Đồng Tháp</option>
                        <option value="89">Tỉnh An Giang</option>
                        <option value="91">Tỉnh Kiên Giang</option>
                        <option value="92">Thành phố Cần Thơ</option>
                        <option value="93">Tỉnh Hậu Giang</option>
                        <option value="94">Tỉnh Sóc Trăng</option>
                        <option value="95">Tỉnh Bạc Liêu</option>
                        <option value="96">Tỉnh Cà Mau</option>
                    </select>

                    <select 
                        className="form-select w-auto shadow-none border-secondary-subtle rounded-3 py-2 text-dark fw-semibold"
                        value={selectedPriceRange}
                        onChange={(e) => { setSelectedPriceRange(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Mức giá</option>
                        <option value="Thỏa thuận">Thỏa thuận</option>
                        <option value="Dưới 500 triệu">Dưới 500 triệu</option>
                        <option value="500 - 800 triệu">500 - 800 triệu</option>
                        <option value="800 triệu - 1 tỷ">800 triệu - 1 tỷ</option>
                        <option value="1 - 2 tỷ">1 - 2 tỷ</option>
                        <option value="2 - 3 tỷ">2 - 3 tỷ</option>
                        <option value="3 - 5 tỷ">3 - 5 tỷ</option>
                        <option value="5 - 7 tỷ">5 - 7 tỷ</option>
                        <option value="7 - 10 tỷ">7 - 10 tỷ</option>
                        <option value="10 - 20 tỷ">10 - 20 tỷ</option>
                        <option value="20 - 30 tỷ">20 - 30 tỷ</option>
                        <option value="Trên 30 tỷ">Trên 30 tỷ</option>
                    </select>

                    <select 
                        className="form-select w-auto shadow-none border-secondary-subtle rounded-3 py-2 text-dark fw-semibold"
                        value={selectedAreaRange}
                        onChange={(e) => { setSelectedAreaRange(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Diện tích</option>
                        <option value="Dưới 30 m²">Dưới 30 m²</option>
                        <option value="30 - 50 m²">30 - 50 m²</option>
                        <option value="50 - 80 m²">50 - 80 m²</option>
                        <option value="80 - 100 m²">80 - 100 m²</option>
                        <option value="100 - 150 m²">100 - 150 m²</option>
                        <option value="150 - 200 m²">150 - 200 m²</option>
                        <option value="200 - 250 m²">200 - 250 m²</option>
                        <option value="250 - 300 m²">250 - 300 m²</option>
                        <option value="300 - 500 m²">300 - 500 m²</option>
                        <option value="Trên 500 m²">Trên 500 m²</option>
                    </select>

                    {/* SWITCH TIN XÁC THỰC */}
                    <div 
                        className="d-flex align-items-center border rounded-3 px-3 py-2 bg-white ms-auto"
                        style={{ cursor: 'pointer', userSelect: 'none', borderColor: isVerifiedOnly ? '#28a745' : '#ddd', transition: '0.2s' }}
                        onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isVerifiedOnly ? '#28a745' : '#6c757d'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span className="fw-bold me-3 small" style={{color: isVerifiedOnly ? '#28a745' : '#495057'}}>Tin xác thực</span>
                        <div className="rounded-pill d-flex align-items-center p-1" style={{ width: '36px', height: '20px', backgroundColor: isVerifiedOnly ? '#28a745' : '#e9ecef', transition: 'all 0.3s' }}>
                            <div className="bg-white rounded-circle shadow-sm" style={{ width: '14px', height: '14px', transform: isVerifiedOnly ? 'translateX(16px)' : 'translateX(0px)', transition: 'transform 0.3s' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* PRODUCT GRID & SIDEBAR */}
            <div className="container mt-4 flex-grow-1">
                <div className="row">
                    
                    {/* CỘT TRÁI: DANH SÁCH BĐS (Chiếm 9 phần) */}
                    <div className="col-lg-9 pe-lg-4">
                        <h2 className="fw-bold mb-1 text-dark" style={{letterSpacing: '-0.5px'}}>Mua bán nhà đất trên toàn quốc</h2>
                        <p className="fw-semibold mb-4 text-secondary" style={{fontSize: '15px'}}>
                            Hiện có <strong className="text-danger">{displayedProperties.length}</strong> bất động sản phù hợp.
                        </p>

                        {loading ? (
                            <div className="text-center py-5 text-muted">
                                <div className="spinner-border text-danger mb-2" role="status"></div>
                                <div>Đang tìm kiếm bài đăng...</div>
                            </div>
                        ) : displayedProperties.length > 0 ? (
                            displayedProperties.map((item) => (
                                <Link to={`/nha-dat-ban/${item.propertyId || item.id}`} key={item.propertyId || item.id} className="text-decoration-none text-dark d-block mb-4">
                                    <div className="card flex-row property-card rounded-3 shadow-sm bg-white p-3">
                                        <img src={item.thumbnail} alt={item.title} className="rounded-3 object-fit-cover" style={{width: '260px', height: '175px'}} />
                                        <div className="card-body d-flex flex-column py-1 pe-1 ms-3">
                                            <div className="mb-2">
                                                <span className="badge fw-bold" style={{ fontSize: '11px', color: item.badge === 'XÁC THỰC' ? '#28a745' : '#e03c31', backgroundColor: item.badge === 'XÁC THỰC' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(224, 60, 49, 0.1)', padding: '5px 8px', letterSpacing: '0.5px' }}>
                                                    {item.badge === 'XÁC THỰC' ? '✓ TIN XÁC THỰC' : '★ VIP KIM CƯƠNG'}
                                                </span>
                                            </div>
                                            <h5 className="card-title fw-bold text-dark mb-2 lh-base" style={{fontSize: '17px'}}>{item.title}</h5>
                                            <div className="d-flex align-items-center gap-4 mb-2">
                                                <span className="fw-bold text-danger fs-5">{formatPrice(item.price)}</span>
                                                <span className="fw-bold text-danger fs-6">{formatArea(item.area)} m²</span>
                                            </div>
                                            <div className="small text-secondary mb-3 d-flex align-items-center gap-1">
                                                <MapPin size={14} className="text-muted"/> {item.address}
                                            </div>
                                            <p className="card-text text-muted mb-3" style={{fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{item.description}</p>
                                            <div className="mt-auto d-flex justify-content-between align-items-center border-top pt-3">
                                                <span className="text-muted fw-semibold" style={{ fontSize: '12px' }}>Mã tin: {item.propertyCode}</span>
                                                <button className="btn btn-light border rounded-circle p-2" onClick={(e) => e.preventDefault()}><Heart size={16} className="text-secondary" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="alert alert-light border border-dashed text-center py-5 text-secondary">
                                <Search size={40} className="text-muted mb-3 opacity-50" /><br/>
                                Không tìm thấy bài đăng nào khớp với điều kiện tìm kiếm của bạn.
                            </div>
                        )}

                        {/* THANH PHÂN TRANG */}
                        {!loading && totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-5 mb-5 gap-2">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                    className="btn btn-outline-secondary fw-semibold px-3 py-2"
                                    style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    &laquo; Trước
                                </button>
                                
                                {[...Array(totalPages)].map((_, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => handlePageChange(index + 1)}
                                        className={`btn fw-bold px-3 py-2 ${currentPage === index + 1 ? 'btn-danger' : 'btn-outline-secondary bg-white text-dark'}`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                    className="btn btn-outline-secondary fw-semibold px-3 py-2"
                                    style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                >
                                    Sau &raquo;
                                </button>
                            </div>
                        )}
                    </div>

                    {/* CỘT PHẢI: SIDEBAR BỘ LỌC */}
                    <div className="col-lg-3">
                        <div className="filter-sidebar-card mb-4">
                            <h6 className="filter-sidebar-title">Lọc theo khoảng giá</h6>
                            <div className="d-flex flex-column">
                                {priceFilters.map((filter, index) => (
                                    <div key={index} className="filter-item" onClick={() => { setSelectedPriceRange(filter); setCurrentPage(1); }}>{filter}</div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-sidebar-card">
                            <h6 className="filter-sidebar-title">Lọc theo diện tích</h6>
                            <div className="d-flex flex-column">
                                {areaFilters.map((filter, index) => (
                                    <div key={index} className="filter-item" onClick={() => { setSelectedAreaRange(filter); setCurrentPage(1); }}>{filter}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* SIÊU FOOTER HOÀN MỸ */}
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

                    {/* HÀNG 2: 4 CỘT MENU CHÍNH */}
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
                                <div className="bg-white p-1 rounded border shadow-sm">
                                    <i className="bi bi-qr-code" style={{fontSize: '3.5rem', lineHeight:'1'}}></i>
                                </div>
                                <div className="d-flex flex-column gap-2">
                                    <a href="#" className="app-btn"><i className="bi bi-google-play text-success fs-5"></i> Google Play</a>
                                    <a href="#" className="app-btn"><i className="bi bi-apple fs-5"></i> App Store</a>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-6">
                            <h6 className="footer-title">HƯỚNG DẪN</h6>
                            <a href="#" className="footer-link">Về chúng tôi</a>
                            <a href="#" className="footer-link">Báo giá và hỗ trợ</a>
                            <a href="#" className="footer-link">Câu hỏi thường gặp</a>
                            <a href="#" className="footer-link">Góp ý báo lỗi</a>
                            <a href="#" className="footer-link">Sitemap</a>
                        </div>

                        <div className="col-lg-2 col-md-6">
                            <h6 className="footer-title">QUY ĐỊNH</h6>
                            <a href="#" className="footer-link">Quy định đăng tin</a>
                            <a href="#" className="footer-link">Quy chế hoạt động</a>
                            <a href="#" className="footer-link">Điều khoản thỏa thuận</a>
                            <a href="#" className="footer-link">Chính sách bảo mật</a>
                            <a href="#" className="footer-link">Giải quyết khiếu nại</a>
                        </div>

                        <div className="col-lg-4 col-md-6">
                            <h6 className="footer-title">ĐĂNG KÝ NHẬN TIN</h6>
                            <div className="input-group mb-4">
                                <input type="email" className="form-control input-newsletter border-secondary-subtle" placeholder="Nhập email của bạn" />
                                <button className="btn btn-newsletter"><i className="bi bi-send-fill"></i></button>
                            </div>
                            <h6 className="footer-title mb-2">QUỐC GIA & NGÔN NGỮ</h6>
                            <div className="position-relative d-inline-block" style={{width: '200px'}}>
                                <Globe size={16} className="position-absolute top-50 translate-middle-y ms-3 text-secondary" />
                                <select className="form-select bg-white border-secondary-subtle py-2 ps-5 text-dark fw-semibold" style={{fontSize:'13px', cursor: 'pointer'}}>
                                    <option>Việt Nam</option>
                                    <option>English</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {/* HÀNG 3: CHI NHÁNH */}
                    <div className="border-top border-light-subtle pt-4 mt-4 mb-4">
                        <div className="d-flex align-items-center gap-2 mb-3 cursor-pointer" style={{color: '#2C2C2C'}}>
                            <ChevronDown size={18} /> <span className="fw-semibold" style={{fontSize: '13px'}}>Xem chi nhánh của Batdongsan.com.vn</span>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="branch-title">Chi nhánh TP. Hồ Chí Minh</div>
                                <div className="branch-text">Tầng 2, 3, Tháp B Tòa nhà Viettel, 285 Cách Mạng Tháng Tám, Phường Hòa Thạnh, Thành phố Hồ Chí Minh, Việt Nam<br/>Hotline: 1900 1881</div>
                                <div className="branch-title">Chi nhánh Đà Nẵng</div>
                                <div className="branch-text">Tầng 9 Vĩnh Trung Plaza, 255-257 Hùng Vương, Phường Thanh Khê, Thành phố Đà Nẵng, Việt Nam<br/>Hotline: 1900 1881</div>
                            </div>
                            <div className="col-md-4">
                                <div className="branch-title">Chi nhánh Hải Phòng</div>
                                <div className="branch-text">Phòng 502, tầng số 5 tòa nhà TD Business Center, Lô 20A, đường Lê Hồng Phong, Phường Gia Viên, Thành phố Hải Phòng, Việt Nam<br/>Hotline: 1900 1881</div>
                                <div className="branch-title">Chi nhánh Vũng Tàu</div>
                                <div className="branch-text">Số P.F4-01 lầu 4 tòa nhà ACB chi nhánh Vũng Tàu, số 111 Hoàng Hoa Thám, Phường Vũng Tàu, Thành phố Hồ Chí Minh, Việt Nam<br/>Hotline: 1900 1881</div>
                            </div>
                            <div className="col-md-4">
                                <div className="branch-title">Chi nhánh Bình Dương</div>
                                <div className="branch-text">Tầng 05, Tòa nhà Biconsi Tower, số 01 đường Phú Lợi, Phường Phú Lợi, Thành phố Hồ Chí Minh, Việt Nam<br/>Hotline: 1900 1881</div>
                                <div className="branch-title">Chi nhánh Nha Trang</div>
                                <div className="branch-text">11 Lý Thánh Tôn, Phường Nha Trang, Tỉnh Khánh Hòa, Việt Nam<br/>Hotline: 1900 1881</div>
                            </div>
                        </div>
                    </div>

                    {/* HÀNG 4: BẢN QUYỀN & MẠNG XÃ HỘI */}
                    <div className="border-top border-light-subtle pt-4 d-flex flex-column flex-xl-row justify-content-between align-items-start gap-4">
                        <div style={{maxWidth: '400px'}}>
                            <p className="footer-text mb-1">Copyright © 2007 - 2026 Batdongsan.com.vn</p>
                            <p className="footer-text mb-0">Giấy ĐKKD số 0104630479 do Sở KHĐT TP Hà Nội cấp lần đầu ngày 02/06/2010. Người đại diện theo pháp luật: Ông Bạch Dương</p>
                        </div>
                        <div style={{maxWidth: '400px'}}>
                            <p className="footer-text mb-0">Chịu trách nhiệm sản phẩm: Ông Bạch Dương<br/>Quy chế, quy định giao dịch có hiệu lực từ 08/08/2023<br/>Ghi rõ nguồn "Batdongsan.com.vn" khi phát hành lại thông tin từ website này.</p>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                            <span className="badge bg-danger p-2 px-3 fw-bold shadow-sm d-flex align-items-center gap-1" style={{fontSize:'12px', border: '1px solid #c92a2a'}}>
                                <i className="bi bi-check-circle-fill"></i> ĐÃ ĐĂNG KÝ<br/>BỘ CÔNG THƯƠNG
                            </span>
                            <div className="d-flex gap-2">
                                <a href="#" className="social-icon-box"><i className="bi bi-facebook fs-6"></i></a>
                                <a href="#" className="social-icon-box"><i className="bi bi-youtube fs-6"></i></a>
                                <a href="#" className="social-icon-box"><i className="bi bi-chat-dots-fill fs-6"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <ProfileModal show={showProfileModal} handleClose={() => setShowProfileModal(false)} />
        </div>
    );
};

export default PropertySalePage;