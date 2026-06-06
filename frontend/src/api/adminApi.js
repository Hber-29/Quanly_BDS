// src/api/adminApi.js

const KONG_URL = 'http://localhost:8000'; 

// 🔥 CÁI PHỄU "BẪY SẬP": Tự động bọc Header và bắt lỗi Đá văng
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const headers = new Headers(options.headers || {});
    if (token) headers.append('Authorization', `Bearer ${token}`);
    if (username) headers.append('X-Username', username);

    // Trong adminApi.js
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        // XÓA SẠCH MỌI DẤU VẾT
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('roleId');
        
        alert("⚠️ TÀI KHOẢN ĐÃ BỊ KHÓA. VUI LÒNG ĐĂNG NHẬP LẠI!");
        
        // ĐÁ VĂNG VỀ TRANG LOGIN
        window.location.href = '/login'; 
        throw new Error("Force Logout");
    }

    return response;
};

export const adminApi = {
    // 1. Lấy danh sách
    getAllCustomers: async () => {
        try {
            const response = await fetchWithAuth(`${KONG_URL}/api/account/api/admin/customers`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            return []; 
        }
    },

    // 2. Cập nhật
    updateCustomer: async (formData) => {
        try {
            const response = await fetchWithAuth(`${KONG_URL}/api/account/api/admin/customers`, {
                method: 'PUT',
                body: formData 
            });
            if (!response.ok) throw new Error("Lỗi cập nhật");
            return await response.json(); 
        } catch (error) {
            return { status: "error", message: "Lỗi kết nối!" };
        }
    }, 

    // 3. Khóa / Mở
    changeStatus: async (accountId, isActive) => {
        try {
            const response = await fetchWithAuth(`${KONG_URL}/api/account/api/admin/customers?accountId=${accountId}&isActive=${isActive}`, {
                method: 'DELETE' 
            });
            if (!response.ok) throw new Error("Lỗi cập nhật trạng thái");
            return await response.json(); 
        } catch (error) {
            return { status: "error", message: "Lỗi kết nối!" };
        }
    },

    // 4. Đăng nhập
    login: async (username, password) => {
        try {
            const response = await fetch(`${KONG_URL}/api/account/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await response.json(); 
        } catch (error) {
            return { status: "error", message: "Lỗi kết nối!" };
        }
    },

    // 5. 🔥 Hàm Đăng xuất
    logout: () => {
        // Xóa sạch "két sắt" trình duyệt
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('roleId');
        
        // Đá văng về trang Login
        window.location.href = '/login';
    }
};