import axios from 'axios';


const API_BASE_URL = 'http://192.168.39.112:8080/api/auth';
// const API_BASE_URL = 'http://172.20.10.8:8080/api/auth';
<<<<<<< HEAD
const API_BASE_URL = 'http://172.20.10.9:8080/api/auth';
=======
>>>>>>> fab567acd725547d66669d1b5e7271ab9b878361
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
