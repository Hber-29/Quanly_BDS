import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building, Heart, User, LogOut } from 'lucide-react';
import propertyApi from '../api/propertyApi';

const PropertySalePage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown state
    
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token'); // Check đăng nhập
    
    const queryParams = new URLSearchParams(location.search);
    const keywordParam = queryParams.get('keyword') || '';

    const menus = [
        { name: 'Nhà đất bán', path: '/nha-dat-ban', isReady: true },
        { name: 'Nhà đất cho thuê', path: '#', isReady: false },
        { name: 'Dự án', path: '#', isReady: false },
        { name: 'Tin tức', path: '#', isReady: false },
        { name: 'Phân tích đánh giá', path: '#', isReady: false },
        { name: 'Danh bạ', path: '#', isReady: false }
    ];

    useEffect(() => {
        const loadProperties = async () => {
            setLoading(true);
            try {
                let data = [];
                if (keywordParam) {
                    data = await propertyApi.searchByPropertyCode(keywordParam);
                } else {
                    data = await propertyApi.getHomepageList();
                }
                if (data && data.length > 0) {
                    setProperties(data);
                } else {
                    throw new Error();
                }
            } catch {
                const mockSaleData = [
                    { id: 1, propertyCode: 'OCP-3161', title: 'DEAL TỐT - TỰ LẬP ÁNH DƯƠNG 120M TẠI VINHOME OCEAN PARK 3 GIÁ TỐT NHẤT THỊ TRƯỜNG CHỈ 16,1 TY', priceDisplay: '16,1 tỷ', area: '120', address: 'Hưng Yên', thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=60', description: 'Giá tốt hiếm có - Tự lập Ánh Dương AD12-XX Vin Ocean Park 3...', badge: 'VIP' },
                    { id: 2, propertyCode: 'DN-0512', title: 'XÁC THỰC Gấp bán căn góc 3 phòng ngủ - 97,5 m2 thông thuỷ Sunshine City vị trí đắc địa', priceDisplay: '9,3 tỷ', area: '97.5', address: 'Bắc Từ Liêm, Hà Nội', thumbnail: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=60', description: 'Gia đình cần tiền bán gấp căn góc view siêu thoáng...', badge: 'XÁC THỰC' }
                ];
                setProperties(mockSaleData);
            } finally {
                setLoading(false);
            }
        };
        loadProperties();
    }, [keywordParam]);

    const displayedProperties = isVerifiedOnly 
        ? properties.filter(item => item.badge === 'XÁC THỰC') 
        : properties;

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
            navigate('/login');
        }
    };

    return (
        <div style={styles.page}>
            {/* HEADER ĐỒNG BỘ TRANG HOME */}
            <header style={styles.header}>
                <div style={styles.headerFlexContainer}>
                    <div style={styles.leftNavGroup}>
                        <Link to="/" style={styles.logo}>
                            <Building size={32} color="#e03c31" />
                            <div style={styles.logoTextWrapper}>
                                <span style={styles.logoMain}>Batdongsan</span>
                                <span style={styles.logoSub}>.com.vn</span>
                            </div>
                        </Link>
                        <nav style={styles.navMenu}>
                            {menus.map((item, idx) => (
                                <Link 
                                    key={idx} 
                                    to={item.path} 
                                    onClick={(e) => handleMenuClick(e, item)}
                                    style={item.isReady ? styles.navLinkActive : styles.navLink}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    
                    <div style={styles.rightActionGroup}>
                        {!token ? (
                            <>
                                <Link to="/login" style={styles.authLink}>Đăng nhập</Link>
                                <span style={{ color: '#ccc' }}>|</span>
                                <Link to="/register" style={styles.authLink}>Đăng ký</Link>
                            </>
                        ) : (
                            <div 
                                style={styles.profileWrapper}
                                onMouseEnter={() => setIsDropdownOpen(true)}
                                onMouseLeave={() => setIsDropdownOpen(false)}
                            >
                                <div style={styles.profileTrigger}>
                                    <div style={styles.avatarCircle}>
                                        <User size={16} color="#fff" />
                                    </div>
                                    <span style={styles.profileText}>Tài khoản</span>
                                </div>
                                {isDropdownOpen && (
                                    <div style={styles.dropdownMenu}>
                                        <Link to="/profile" style={styles.dropdownItem}>
                                            <User size={16} style={{ marginRight: '8px' }} />
                                            Thông tin cá nhân
                                        </Link>
                                        <div style={styles.dropdownDivider} />
                                        <div onClick={handleLogout} style={{ ...styles.dropdownItem, color: '#e03c31' }}>
                                            <LogOut size={16} style={{ marginRight: '8px' }} />
                                            Đăng xuất
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* FILTER BAR */}
            <div style={styles.filterBarWrapper}>
                <div style={styles.filterBar}>
                    <div style={styles.searchContainer}>
                        <Search size={16} color="#666" />
                        <input type="text" defaultValue={keywordParam} placeholder="Nhà riêng Thủ Đức..." style={styles.filterInput} />
                    </div>
                    <select style={styles.select}><option>Loại nhà đất</option></select>
                    <select style={styles.select}><option>Khoảng giá</option></select>
                    <select style={styles.select}><option>Diện tích</option></select>

                    <div 
                        style={{ ...styles.verifiedToggleContainer, borderColor: isVerifiedOnly ? '#28a745' : '#ddd' }}
                        onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isVerifiedOnly ? '#28a745' : '#666'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span style={{...styles.toggleText, color: isVerifiedOnly ? '#28a745' : '#555'}}>Tin xác thực</span>
                        <div style={{ ...styles.switchTrack, backgroundColor: isVerifiedOnly ? '#28a745' : '#ccc' }}>
                            <div style={{ ...styles.switchCircle, transform: isVerifiedOnly ? 'translateX(14px)' : 'translateX(0px)' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* PRODUCT GRID */}
            <div style={styles.mainContainer}>
                <div style={styles.leftColumn}>
                    <h1 style={styles.mainTitle}>Mua bán nhà đất trên toàn quốc</h1>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '20px' }}>
                        Hiện có <strong style={{color: '#e03c31'}}>{displayedProperties.length}</strong> bất động sản phù hợp.
                    </p>

                    {loading ? (
                        <div>Đang tải danh sách bài đăng...</div>
                    ) : displayedProperties.length > 0 ? (
                        displayedProperties.map((item) => (
                            <div key={item.id} style={styles.listCard}>
                                <img src={item.thumbnail} alt={item.title} style={styles.listCardImg} />
                                <div style={styles.listCardBody}>
                                    <span style={{ ...styles.vipBadge, color: item.badge === 'XÁC THỰC' ? '#28a745' : '#e03c31' }}>{item.badge === 'XÁC THỰC' ? 'TIN ĐÃ XÁC THỰC' : 'VIP KIM CƯƠNG'}</span>
                                    <h3 style={styles.listCardTitle}>{item.title}</h3>
                                    <div style={styles.listCardMeta}>
                                        <span style={styles.cardPrice}>{item.priceDisplay}</span>
                                        <span style={styles.cardArea}>{item.area} m²</span>
                                        <span style={styles.locationText}><MapPin size={12} /> {item.address}</span>
                                    </div>
                                    <p style={styles.listCardDesc}>{item.description}</p>
                                    <div style={styles.listCardFooter}>
                                        <span style={{ fontSize: '12px', color: '#777' }}>Mã: {item.propertyCode}</span>
                                        <button style={styles.favBtn}><Heart size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={styles.noDataBox}>Không tìm thấy bài đăng nào có nhãn Xác Thực!</div>
                    )}
                </div>

                <div style={styles.rightColumn}>
                    <div style={styles.sidebarBox}>
                        <h4 style={styles.sidebarTitle}>Lọc theo khoảng giá</h4>
                        <ul style={styles.sidebarList}>
                            <li>Thỏa thuận</li><li>Dưới 500 triệu</li><li>500 - 800 triệu</li><li>1 - 2 tỷ</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    page: { fontFamily: 'Arial, sans-serif', backgroundColor: '#fff', minHeight: '100vh' },
    header: { backgroundColor: '#ffffff', borderBottom: '1px solid #f2f2f2', width: '100%' },
    headerFlexContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '75px', padding: '0 30px', width: '100%' },
    leftNavGroup: { display: 'flex', alignItems: 'center', gap: '40px' },
    logo: { display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' },
    logoTextWrapper: { display: 'flex', alignItems: 'baseline' },
    logoMain: { fontSize: '26px', fontWeight: '800', color: '#e03c31', letterSpacing: '-0.5px' },
    logoSub: { fontSize: '14px', color: '#2c2c2c', fontWeight: 'bold' },
    navMenu: { display: 'flex', gap: '24px', alignItems: 'center' },
    navLink: { textDecoration: 'none', color: '#2c2c2c', fontWeight: '600', fontSize: '15px', padding: '10px 0' },
    navLinkActive: { textDecoration: 'none', color: '#2c2c2c', fontWeight: '600', fontSize: '15px', padding: '10px 0', borderBottom: '2px solid #e03c31' },
    rightActionGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
    authLink: { textDecoration: 'none', color: '#2c2c2c', fontSize: '15px', fontWeight: '600' },
    
    // Dropdown styles đồng bộ
    profileWrapper: { position: 'relative', padding: '10px 0', cursor: 'pointer' },
    profileTrigger: { display: 'flex', alignItems: 'center', gap: '8px' },
    avatarCircle: { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    profileText: { fontSize: '15px', fontWeight: '600', color: '#2c2c2c' },
    dropdownMenu: { position: 'absolute', top: '45px', right: 0, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', width: '180px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden', zIndex: 110, display: 'flex', flexDirection: 'column', padding: '6px 0' },
    dropdownItem: { display: 'flex', alignItems: 'center', padding: '10px 16px', fontSize: '14px', color: '#334155', textDecoration: 'none', cursor: 'pointer' },
    dropdownDivider: { height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' },

    filterBarWrapper: { borderBottom: '1px solid #eee', backgroundColor: '#fcfcfc', padding: '12px 0' },
    filterBar: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '12px', alignItems: 'center' },
    searchContainer: { display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '0 10px', backgroundColor: '#fff', flex: 1 },
    filterInput: { border: 'none', outline: 'none', padding: '8px', width: '100%', fontSize: '14px' },
    select: { border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px', fontSize: '14px', backgroundColor: '#fff', width: '150px', outline: 'none' },
    verifiedToggleContainer: { display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '7px 12px', backgroundColor: '#fff', cursor: 'pointer', userSelect: 'none' },
    toggleText: { fontSize: '14px', fontWeight: '600', marginRight: '10px' },
    switchTrack: { width: '30px', height: '16px', borderRadius: '10px', padding: '2px', display: 'flex', alignItems: 'center' },
    switchCircle: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff' },
    mainContainer: { maxWidth: '1200px', margin: '20px auto 0', padding: '0 20px', display: 'flex', gap: '30px' },
    leftColumn: { flex: 1 },
    mainTitle: { fontSize: '22px', color: '#2c2c2c', margin: '10px 0', fontWeight: 'bold' },
    listCard: { border: '1px solid #eee', borderRadius: '4px', display: 'flex', gap: '20px', padding: '15px', marginBottom: '20px', backgroundColor: '#fff' },
    listCardImg: { width: '240px', height: '160px', objectFit: 'cover', borderRadius: '2px' },
    listCardBody: { flex: 1, display: 'flex', flexDirection: 'column' },
    vipBadge: { fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' },
    listCardTitle: { fontSize: '15px', color: '#2c2c2c', fontWeight: 'bold', margin: '0 0 10px 0', lineHeight: '1.4' },
    listCardMeta: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' },
    cardPrice: { fontSize: '16px', fontWeight: 'bold', color: '#e03c31' },
    cardArea: { fontSize: '16px', fontWeight: 'bold', color: '#e03c31' },
    locationText: { fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '2px' },
    listCardDesc: { fontSize: '13px', color: '#555', lineHeight: '1.5', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    listCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
    favBtn: { background: 'none', border: '1px solid #eee', borderRadius: '4px', padding: '4px', cursor: 'pointer' },
    rightColumn: { width: '280px' },
    sidebarBox: { border: '1px solid #eee', borderRadius: '4px', padding: '15px', marginBottom: '20px', backgroundColor: '#fff' },
    sidebarTitle: { fontSize: '14px', color: '#2c2c2c', margin: '0 0 12px 0', fontWeight: 'bold' },
    sidebarList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#555', cursor: 'pointer' },
    noDataBox: { padding: '40px', border: '1px dashed #ccc', borderRadius: '4px', textAlign: 'center', color: '#777', backgroundColor: '#fafafa', fontSize: '14px' }
};

export default PropertySalePage;