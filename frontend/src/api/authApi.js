import axiosClient from './axiosClient';

const authApi = {
    login: (credentials) => {
        return axiosClient.post('/api/auth/login', credentials); // Endpoint qua Kong
    },
    register: (userData) => {
        return axiosClient.post('/api/auth/register', userData);
    },
    getProfile: () => {
        return axiosClient.get('/api/account/profile'); // Hàm lấy profile dựa theo Role đã làm ở BE
    },
    updateProfile: (profileData) => {
        return axiosClient.put('/api/account/profile', profileData); // Hàm cập nhật profile
    }
};

export default authApi;