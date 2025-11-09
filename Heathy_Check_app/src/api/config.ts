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
        // Only auto-logout for authentication endpoints (signin, refresh token)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const url = error.config?.url || '';
            const isAuthEndpoint = url.includes('/signin') || url.includes('/signup') || url.includes('/refresh');

            if (isAuthEndpoint) {
                // Only auto-logout for auth endpoints
                try {
                    await clearAllStorage();
                    console.warn('[API Config] Auth endpoint failed with 401, cleared storage');
                    authEvents.emit(AUTH_EVENTS.TOKEN_EXPIRED);
                } catch (clearError) {
                    console.error('[API Config] Error clearing storage:', clearError);
                }
            } else {
                // For other endpoints, just log warning and let the caller handle it
                console.warn('[API Config] 401 error on non-auth endpoint:', url);
                console.warn('[API Config] Token may be expired, but not auto-logging out. Let caller handle it.');
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

