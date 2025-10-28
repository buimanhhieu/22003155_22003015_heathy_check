// src/api/userApi.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfo } from '../types'; // Đảm bảo UserInfo trong types.ts có trường 'token'
import { clearAllStorage } from '../utils/storageUtils';

// const API_BASE_URL = 'http://192.168.39.112:8080/api/users';
// const API_BASE_URL = 'http://192.168.39.112:8080/api/users';
const API_BASE_URL = 'http://172.20.10.9:8080/api/users';
// const API_BASE_URL = 'http://172.20.10.8:8080/api/users';
// const API_BASE_URL = 'http://192.168.178.194:8080/api/users';
// const API_BASE_URL = 'http://192.168.1.192:8080/api/users';
const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token vào header
userApi.interceptors.request.use(
  async (config) => {
    try {
      // Lấy chuỗi JSON từ AsyncStorage
      const userInfoString = await AsyncStorage.getItem('userInfo');

      if (userInfoString) {
        // Parse chuỗi thành đối tượng UserInfo
        const userInfo: UserInfo = JSON.parse(userInfoString);

        // ✅ Lấy token từ đối tượng userInfo
        const token = userInfo.token;

        if (token) {
          // Gắn token vào header Authorization
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[DEBUG] Token attached to header.'); // Thêm log để kiểm tra
        }
      }
    } catch (e) {
      console.error('Error attaching token:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response lỗi
userApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('[DEBUG] 401 Unauthorized - clearing storage and redirecting to login');
      // Xóa storage khi token không hợp lệ
      try {
        await clearAllStorage();
        console.log('Storage cleared due to 401 error');
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }
    }
    return Promise.reject(error);
  }
);

export default userApi;