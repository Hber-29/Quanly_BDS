import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building, Heart, User, LogOut } from 'lucide-react';
import propertyApi from '../api/propertyApi';

const HomePage = () => {
    const [latestProperties, setLatestProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    
    
    // SỬA LOGIC TẠI ĐÂY: Kiểm tra chặt chẽ, tránh nuốt phải chuỗi rỗng hoặc null/undefined
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

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const response = await propertyApi.getHomepageList();
                if (response && response.length > 0) {
                    setLatestProperties(response);
                } else {
                    throw new Error();
                }
            } catch {
                const mockData = [
                    { id: 1, propertyCode: 'CH-8392', title: 'QUỸ CĂN SUNSHINE CITY ĐẦY ĐỦ DIỆN TÍCH 02PN, 03PN...', priceDisplay: '9,6 tỷ', area: '98', address: 'Bắc Từ Liêm, Hà Nội', thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=500&q=60', isVip: true, badge: 'VIP' },
                    { id: 2, propertyCode: 'DN-2041', title: 'Chính chủ bán căn 116m2 tòa S3 Sunshine City, giá 11,8 tỷ', priceDisplay: '11,8 tỷ', area: '116', address: 'Bắc Từ Liêm, Hà Nội', thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=60', isVip: true, badge: 'VIP' },
                    { id: 3, propertyCode: 'BT-9921', title: 'Bán căn hộ 104m2 3PN tại chung cư Sunshine City, giá 10,3 tỷ...', priceDisplay: '10,3 tỷ', area: '103', address: 'Bắc Từ Liêm, Hà Nội', thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=60', isVip: false, badge: 'VIP' },
                    { id: 4, propertyCode: 'CH-1029', title: 'Bán căn hộ 3PN 98m2 tại Sunshine City; giá 9,3 tỷ (sẵn sổ...', priceDisplay: '9,3 tỷ', area: '98', address: 'Bắc Từ Liêm, Hà Nội', thumbnail: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=500&q=60', isVip: false, badge: 'VIP' }
                ];
                setLatestProperties(mockData);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const handleMenuClick = (e, item) => {
        if (!item.isReady) {
            e.preventDefault();
            alert('Tính năng đang được phát triển, vui lòng quay lại sau!');
        }
    };

    const handleLogout = () => {
        const isConfirm = window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống BĐS 2026 không?");
        if (isConfirm) {
            localStorage.clear(); // Xóa sạch dữ liệu trong kho lưu trữ
            window.location.reload(); // Refresh lại trang để cập nhật ngay lập tức giao diện sang trạng thái Guest
        }
    };

    return (
        <div style={styles.page}>
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
                                    style={styles.navLink}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div style={styles.rightActionGroup}>
                        <span style={styles.utilityText} onClick={() => alert('Tính năng đang được phát triển!')}>Yêu thích</span>
                        <span style={styles.divider}>|</span>

                        {/* KIỂM TRA TRẠNG THÁI ĐÃ LOGIN HAY CHƯA ĐỂ ĐỔI GIAO DIỆN HEADER */}
                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" style={styles.authLink}>Đăng nhập</Link>
                                <span style={styles.divider}>/</span>
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
                        <Link to={isLoggedIn ? "/dashboard" : "/login"} style={styles.postButton}>Đăng tin</Link>
                    </div>
                </div>
            </header>

            {/* HERO BANNER */}
            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <div style={styles.tabContainer}>
                        <span style={styles.activeTab}>Mua bán</span>
                    </div>
                    <div style={styles.searchBox}>
                        <div style={styles.inputWrapper}>
                            <Search size={18} color="#666" style={{ marginLeft: '15px' }} />
                            <input 
                                type="text" 
                                placeholder="Nhập địa điểm, khu vực hoặc mã bài đăng tìm nhanh..." 
                                style={styles.searchInput}
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>
                        <Link to={searchKeyword.trim() ? `/nha-dat-ban?keyword=${searchKeyword}` : '/nha-dat-ban'} style={styles.searchButton}>
                            Tìm kiếm
                        </Link>
                    </div>
                </div>
            </section>

            {/* LISTING */}
            <section style={styles.listSection}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Bất động sản dành cho bạn</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Link to="/nha-dat-ban" style={styles.subLinkActive}>Tin nhà đất bán mới nhất</Link>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải danh sách bài đăng...</div>
                ) : (
                    <div style={styles.grid}>
                        {latestProperties.map((item) => (
                            <div key={item.id} style={styles.card}>
                                <div style={styles.imageContainer}>
                                    <img src={item.thumbnail} alt={item.title} style={styles.cardImg} />
                                    <span style={{ ...styles.badge, backgroundColor: '#e03c31' }}>{item.badge || 'VIP'}</span>
                                </div>
                                <div style={styles.cardBody}>
                                    <h3 style={styles.cardTitle}>{item.title}</h3>
                                    <div style={styles.cardMeta}>
                                        <span style={styles.cardPrice}>{item.priceDisplay}</span>
                                        <span style={styles.cardArea}>{item.area} m²</span>
                                    </div>
                                    <div style={styles.cardLocation}>
                                        <MapPin size={14} color="#666" />
                                        <span style={styles.locationText}>{item.address}</span>
                                    </div>
                                    <div style={styles.cardFooter}>
                                        <span style={{ fontSize: '12px', color: '#999' }}>Mã: {item.propertyCode}</span>
                                        <button style={styles.favBtn}><Heart size={16} color="#666" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

const styles = {
    page: { fontFamily: 'Arial, sans-serif', backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '80px' },
    header: { backgroundColor: '#ffffff', borderBottom: '1px solid #f2f2f2', position: 'sticky', top: 0, zIndex: 100, width: '100%' },
    headerFlexContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '75px', padding: '0 30px', width: '100%' },
    leftNavGroup: { display: 'flex', alignItems: 'center', gap: '40px' },
    logo: { display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' },
    logoTextWrapper: { display: 'flex', alignItems: 'baseline' },
    logoMain: { fontSize: '26px', fontWeight: '800', color: '#e03c31', letterSpacing: '-0.5px' },
    logoSub: { fontSize: '14px', color: '#2c2c2c', fontWeight: 'bold' },
    navMenu: { display: 'flex', gap: '24px', alignItems: 'center' },
    navLink: { textDecoration: 'none', color: '#2c2c2c', fontWeight: '600', fontSize: '15px', padding: '10px 0' },
    rightActionGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
    utilityText: { fontSize: '15px', fontWeight: '600', color: '#2c2c2c', cursor: 'pointer' },
    authLink: { textDecoration: 'none', color: '#2c2c2c', fontSize: '15px', fontWeight: '600' },
    divider: { color: '#e2e8f0', fontWeight: 'bold', fontSize: '14px' },
    postButton: { textDecoration: 'none', border: '2px solid #2c2c2c', color: '#2c2c2c', padding: '8px 18px', borderRadius: '6px', fontSize: '15px', fontWeight: '700', marginLeft: '12px', backgroundColor: '#fff' },
    profileWrapper: { position: 'relative', padding: '10px 0', cursor: 'pointer' },
    profileTrigger: { display: 'flex', alignItems: 'center', gap: '8px' },
    avatarCircle: { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e03c31', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    profileText: { fontSize: '15px', fontWeight: '600', color: '#2c2c2c' },
    dropdownMenu: { position: 'absolute', top: '45px', right: 0, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', width: '180px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden', zIndex: 110, display: 'flex', flexDirection: 'column', padding: '6px 0' },
    dropdownItem: { display: 'flex', alignItems: 'center', padding: '10px 16px', fontSize: '14px', color: '#334155', textDecoration: 'none', cursor: 'pointer', transition: 'background-color 0.15s' },
    dropdownDivider: { height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' },
    hero: { height: '380px', backgroundImage: 'url(https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    heroContent: { width: '100%', maxWidth: '720px', padding: '0 20px' },
    tabContainer: { display: 'flex', marginBottom: '0px' },
    activeTab: { backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px 20px', borderRadius: '4px 4px 0 0', fontSize: '14px', fontWeight: 'bold' },
    searchBox: { display: 'flex', backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '0 4px 4px 4px' },
    inputWrapper: { display: 'flex', alignItems: 'center', flex: 1, backgroundColor: '#ffffff', borderRadius: '4px' },
    searchInput: { width: '100%', border: 'none', backgroundColor: 'transparent', padding: '12px 10px', fontSize: '14px', outline: 'none' },
    searchButton: { backgroundColor: '#e03c31', color: '#fff', border: 'none', padding: '0 25px', fontSize: '14px', fontWeight: 'bold', borderRadius: '4px', marginLeft: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' },
    listSection: { maxWidth: '1200px', margin: '40px auto 0', padding: '0 20px' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' },
    sectionTitle: { fontSize: '20px', color: '#2c2c2c', margin: 0, fontWeight: 'bold' },
    subLinkActive: { textDecoration: 'none', color: '#2c2c2c', fontSize: '14px', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
    card: { backgroundColor: '#ffffff', borderRadius: '4px', overflow: 'hidden', border: '1px solid #f2f2f2', display: 'flex', flexDirection: 'column', position: 'relative' },
    imageContainer: { position: 'relative', height: '160px' },
    cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
    badge: { position: 'absolute', top: '10px', left: '10px', color: '#fff', padding: '2px 6px', borderRadius: '2px', fontSize: '10px', fontWeight: 'bold' },
    cardBody: { padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
    cardTitle: { fontSize: '14px', color: '#2c2c2c', margin: '0 0 8px 0', fontWeight: '500', lineHeight: '1.4', height: '38px', overflow: 'hidden' },
    cardMeta: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '8px' },
    cardPrice: { fontSize: '15px', fontWeight: 'bold', color: '#e03c31' },
    cardArea: { fontSize: '13px', fontWeight: 'bold', color: '#e03c31' },
    cardLocation: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' },
    locationText: { fontSize: '12px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f2f2f2', paddingTop: '8px', marginTop: 'auto' },
    favBtn: { background: 'none', border: '1px solid #eee', borderRadius: '5px', padding: '4px', cursor: 'pointer' }
};

export default HomePage;