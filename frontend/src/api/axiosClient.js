import axios from 'axios';

// Khởi tạo một thực thể Axios dùng chung
const axiosClient = axios.create({
    baseURL: 'http://localhost:8000', // Cổng của Kong API Gateway
    headers: {
        'Content-Type': 'application/json',
    },
    // 🔥 TĂNG TIMEOUT LÊN 30 GIÂY: Để đảm bảo việc upload các bức ảnh nặng không bị time-out
    timeout: 30000, 
});

// Bộ chặn Request (Request Interceptor): Tự động cấu hình trước khi gửi đi
axiosClient.interceptors.request.use(
    (config) => {
        // Lấy token được lưu từ localStorage
        const token = localStorage.getItem('token');
        if (token) {
            // Tự động đính kèm chuỗi "Bearer <token>" vào Header Authorization
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Bộ chặn Response (Response Interceptor): Xử lý kết quả trả về từ Gateway
axiosClient.interceptors.response.use(
    (response) => {
        // 🔥 QUAN TRỌNG: Tự động "bóc vỏ" response, chỉ trả về cục data bên trong
        // Giúp các file Component gọn gàng hơn, không cần phải gọi res.data nữa
        return response.data;
    },
    (error) => {
        // Xử lý lỗi chung toàn hệ thống
        if (error.response) {
            // 401 Unauthorized: Token hết hạn hoặc không hợp lệ -> Sút về trang đăng nhập
            if (error.response.status === 401) {
                console.warn("Phiên đăng nhập hết hạn. Đang chuyển hướng...");
                localStorage.removeItem('token');
                localStorage.removeItem('roleId');
                
                // Tránh reload vòng lặp nếu đang ở sẵn trang login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            
            // Có thể bổ sung thêm bắt lỗi 403 (Cấm truy cập), 500 (Lỗi server) tại đây sau này
        }
        return Promise.reject(error);
    }
);

export default axiosClient;