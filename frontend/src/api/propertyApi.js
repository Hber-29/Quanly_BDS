import axiosClient from './axiosClient';

const propertyApi = {
    // 1. Lấy danh sách bất động sản mới nhất cho Trang chủ (Mặc định 8 bài)
    getHomepageList: () => {
        return axiosClient.get('/api/property/list?page=1&limit=8');
    },

    // 2. Lấy danh sách bài đăng mặc định cho trang Nhà đất bán (15 bài)
    getListSale: (page = 1, limit = 15) => {
        return axiosClient.get(`/api/property/list?page=${page}&limit=${limit}`);
    },

    // 🌟 3. HÀM ĐÃ ĐƯỢC SỬA LỖI: Đổi chữ "region" thành "regionId"
    searchPropertiesAdvanced: (keyword = '', regionId = '', page = 1, limit = 15) => {
        // CHÚ Ý: Đường link đã được đổi thành &regionId=
        return axiosClient.get(`/api/property/search?keyword=${encodeURIComponent(keyword)}&regionId=${encodeURIComponent(regionId)}&page=${page}&limit=${limit}`);
    },

    // 4. Tìm kiếm cũ (giữ nguyên dự phòng)
    searchByPropertyCode: (code) => {
        return axiosClient.get(`/api/property/search-code?code=${code}`);
    },

    // 5. Lấy chi tiết 1 bài đăng khi người dùng click vào xem
    getPropertyDetail: (id) => {
        return axiosClient.get(`/api/property/detail/${id}`);
    }
};

export default propertyApi;