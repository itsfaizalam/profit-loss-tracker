import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to add the auth token to headers
API.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default API;
