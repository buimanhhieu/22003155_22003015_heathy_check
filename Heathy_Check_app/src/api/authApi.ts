import { apiClient, API_BASE_URL } from './config';
import axios, { AxiosInstance } from 'axios';

// Create auth API instance with specific base path
// Use a separate instance to avoid conflicts with other endpoints
const authApi: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Auth endpoints don't need token in request interceptor (login/signup)
// But we can reuse the response interceptor logic if needed

export default authApi;
