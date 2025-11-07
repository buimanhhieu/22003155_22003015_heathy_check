import axios from 'axios';


const API_BASE_URL = 'http://192.168.1.196:8080/api/auth';

// const API_BASE_URL = 'http://192.168.39.112:8080/api/auth';
<<<<<<< HEAD
// const API_BASE_URL = 'http://172.20.10.8:8080/api/auth';
// const API_BASE_URL = 'http://172.20.10.9:8080/api/auth';
=======
>>>>>>> 6d3b43fdf2ffa3b9008c3e36f4f9c426ec94df9d

// const API_BASE_URL = 'http://192.168.178.194:8080/api/auth';
// const API_BASE_URL = 'http://192.168.1.192:8080/api/auth';
// const API_BASE_URL = 'http://172.20.10.9:8080/api/auth';
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default authApi;
