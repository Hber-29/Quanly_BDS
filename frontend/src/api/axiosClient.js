import axios from 'axios';

// Khởi tạo một thực thể Axios dùng chung
const axiosClient = axios.create({
    baseURL: 'http://localhost:8000', // ĐÚNG CHUẨN: Cổng của Kong API Gateway
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Ngắt kết nối nếu Server không phản hồi sau 10 giây
});

// Bộ chặn Request (Request Interceptor): Tự động cấu hình trước khi gửi đi
axiosClient.interceptors.request.use(
    (config) => {
        // Lấy token được lưu từ localStorage (khi đăng nhập thành công)
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
        // Nếu thành công, chỉ trả về phần dữ liệu (data) để FE dùng cho gọn
        return response.data;
    },
    (error) => {
        // Bắt lỗi tập trung (Ví dụ: Token hết hạn -> sút người dùng về trang login)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('roleId');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;