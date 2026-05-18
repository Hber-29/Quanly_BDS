import axiosClient from './axiosClient';

const authApi = {
    // Đăng nhập: Đẩy dữ liệu dưới dạng x-www-form-urlencoded
    login: (params) => {
        return axiosClient.post('/api/account/login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    },

    // Đăng ký: Đẩy dữ liệu dưới dạng x-www-form-urlencoded
    register: (params) => {
        return axiosClient.post('/api/account/register', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    }
};

export default authApi;