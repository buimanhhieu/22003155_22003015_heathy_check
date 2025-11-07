// Base API configuration
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfo } from '../types';
import { clearAllStorage } from '../utils/storageUtils';
import { API_BASE_URL } from '../config/api';
import { authEvents, AUTH_EVENTS } from '../utils/authEvents';

// Create base axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor: Add token to headers
apiClient.interceptors.request.use(
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
            console.error('[API Config] Error attaching token:', error);
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Clear storage
                await clearAllStorage();
                console.warn('[API Config] Token expired, cleared storage');

                // Emit event to notify AuthContext to logout
                authEvents.emit(AUTH_EVENTS.TOKEN_EXPIRED);
            } catch (clearError) {
                console.error('[API Config] Error clearing storage:', clearError);
            }
        }

        // Log error for debugging
        if (error.response) {
            console.error('[API Config] API Error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                url: error.config?.url,
                data: error.response.data,
            });
        } else if (error.request) {
            console.error('[API Config] Network Error:', error.message);
        } else {
            console.error('[API Config] Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export { apiClient, API_BASE_URL };

