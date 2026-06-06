// src/api/adminApi.js

// Cấu hình URL trỏ thẳng vào Kong API Gateway
const KONG_URL = 'http://localhost:8000'; 

export const adminApi = {
    // Hàm lấy danh sách khách hàng
    getAllCustomers: async () => {
        try {
            // Gọi qua Kong (Cổng 8000)
            const response = await fetch(`${KONG_URL}/api/account/api/admin/customers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // TODO: Sau này sếp bật xác thực Token trên Kong thì nhả dòng dưới ra nhé
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Lỗi mạng khi gọi API: ${response.status} - ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error("Lỗi fetch khách hàng qua Kong:", error);
            return []; // Trả về mảng rỗng nếu lỗi để giao diện không bị sập (trắng trang)
        }
    }
};