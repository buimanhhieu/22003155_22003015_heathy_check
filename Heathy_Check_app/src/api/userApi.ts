// src/api/userApi.ts

import { apiClient, API_BASE_URL } from './config';
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfo } from '../types';
import { clearAllStorage } from '../utils/storageUtils';
import { authEvents, AUTH_EVENTS } from '../utils/authEvents';

// Create user API instance with token interceptor
// Use separate instance to avoid affecting other APIs
const userApi: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Copy interceptors from apiClient
// Request interceptor: Add token to headers
userApi.interceptors.request.use(
  async (config) => {
    try {
      const userInfoString = await AsyncStorage.getItem('userInfo');
      if (userInfoString) {
        const userInfo: UserInfo = JSON.parse(userInfoString);
        const token = userInfo.token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('[UserApi] Error attaching token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally (same as apiClient)
userApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as any & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await clearAllStorage();
        console.warn('[UserApi] Token expired, cleared storage');
        authEvents.emit(AUTH_EVENTS.TOKEN_EXPIRED);
      } catch (clearError) {
        console.error('[UserApi] Error clearing storage:', clearError);
      }
    }

    return Promise.reject(error);
  }
);

// Note: Response interceptor đã được xử lý trong config.ts
// Không cần thêm interceptor ở đây nữa

// Meal Log API functions
export interface MealLogRequest {
  mealName?: string;
  mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  totalCalories: number;
  fatGrams?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  loggedAt?: string;
}

export interface MealLogResponse {
  id: number;
  mealName?: string;
  mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  totalCalories: number;
  fatGrams: number;
  proteinGrams: number;
  carbsGrams: number;
  loggedAt: string;
}

export interface UserGoal {
  dailyStepsGoal: number;
  dailyCaloriesGoal: number;
  bedtime: string | null; // Format: "HH:mm:ss"
  wakeup: string | null; // Format: "HH:mm:ss"
  activityLevel: string;
}

export const mealLogApi = {
  getMealLogs: async (userId: number, date?: string): Promise<MealLogResponse[]> => {
    const params: any = {};
    if (date) {
      params.date = date;
    }
    const response = await userApi.get(`/${userId}/meal-logs`, { params });
    return response.data;
  },

  createMealLog: async (userId: number, mealLog: MealLogRequest): Promise<MealLogResponse> => {
    const response = await userApi.post(`/${userId}/meal-logs`, mealLog);
    return response.data;
  },

  updateMealLog: async (userId: number, mealLogId: number, mealLog: MealLogRequest): Promise<MealLogResponse> => {
    const response = await userApi.put(`/${userId}/meal-logs/${mealLogId}`, mealLog);
    return response.data;
  },

  deleteMealLog: async (userId: number, mealLogId: number): Promise<void> => {
    await userApi.delete(`/${userId}/meal-logs/${mealLogId}`);
  },
};

export const userGoalApi = {
  // Lấy user goal từ dashboard API (vì backend không có GET endpoint riêng)
  getUserGoal: async (userId: number, token: string): Promise<UserGoal | null> => {
    try {
      // Thử lấy từ dashboard API
      const { dashboardApi } = await import('./dashboardApi');
      const dashboardData = await dashboardApi.getDashboard(userId, token);

      // Lấy goal từ sleep data trong dashboard
      const sleepGoal = dashboardData?.highlights?.sleep?.goal || 8.0;

      // Parse bedtime và wakeup từ goal (giả sử goal là số giờ)
      // Nếu có thông tin từ user goal, sẽ cần endpoint riêng
      // Tạm thời trả về null và sẽ lấy từ dashboard sleep data
      return null;
    } catch (error) {
      console.error('Error getting user goal:', error);
      return null;
    }
  },
};

export default userApi;