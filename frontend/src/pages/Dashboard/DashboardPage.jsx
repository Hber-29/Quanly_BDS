const DashboardPage = () => {
    const roleId = localStorage.getItem('roleId');

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial' }}>
            <h1 style={{ color: '#28a745' }}>Bảng Điều Khiển Quản Trị (Dashboard)</h1>
            <p>Chúc mừng bạn đã đăng nhập thành công với Quyền (RoleId): <strong>{roleId}</strong></p>
            <button 
                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold' }}
            >
                Đăng xuất
            </button>
        </div>
    );
};
export default DashboardPage;