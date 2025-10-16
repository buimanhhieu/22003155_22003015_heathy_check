import axios from 'axios';


const API_BASE_URL = 'http://192.168.39.112:8080/api/auth';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default authApi;
