import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    withCredentials: true,
});

// Header fijo (siempre presente)
axiosInstance.defaults.headers.common['X-Tenant-Id'] = 'nivo-a';
export default axiosInstance;