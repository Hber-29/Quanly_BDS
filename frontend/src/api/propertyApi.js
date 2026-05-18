import axiosClient from './axiosClient';

const propertyApi = {
    // 1. Lấy danh sách bất động sản mới nhất cho Trang chủ
    getHomepageList: () => {
        // Gọi qua Kong API Gateway (cổng 8000) vào endpoint của Property Service
        return axiosClient.get('/api/property/list');
    },

    // 2. Tìm kiếm bất động sản theo mã Code hoặc từ khóa
    searchByPropertyCode: (code) => {
        return axiosClient.get(`/api/property/search-code?code=${code}`);
    },

    // 3. (Dự trù) Lấy chi tiết 1 bài đăng khi người dùng click vào xem
    getPropertyDetail: (id) => {
        return axiosClient.get(`/api/property/detail/${id}`);
    }
};

export default propertyApi;