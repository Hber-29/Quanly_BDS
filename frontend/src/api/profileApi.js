// src/api/profileApi.js

const KONG_URL = 'http://localhost:8000'; 

const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const headers = new Headers(options.headers || {});
    if (token) headers.append('Authorization', `Bearer ${token}`);
    if (username) headers.append('X-Username', username);

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
        localStorage.clear(); 
        alert("⚠️ TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA HOẶC HẾT HẠN!");
        window.location.href = '/login'; 
        throw new Error("Force Logout");
    }

    return response;
};

// 🔥 CHÚ Ý CHỮ "export const profileApi" Ở ĐÂY SẾP NHÉ
export const profileApi = {
    getProfile: async (accountId, roleId) => {
        try {
            const response = await fetchWithAuth(`${KONG_URL}/api/account/api/profile?accountId=${accountId}&roleId=${roleId}`, {
                method: 'GET'
            });
            return await response.json();
        } catch (error) {
            console.error("Lỗi lấy profile:", error);
            return null;
        }
    },

    updateProfile: async (accountId, roleId, formData) => {
        try {
            const response = await fetchWithAuth(`${KONG_URL}/api/account/api/profile?accountId=${accountId}&roleId=${roleId}`, {
                method: 'POST',
                body: formData 
            });
            return await response.json();
        } catch (error) {
            console.error("Lỗi cập nhật profile:", error);
            return { status: "error", message: "Lỗi kết nối!" };
        }
    }
};