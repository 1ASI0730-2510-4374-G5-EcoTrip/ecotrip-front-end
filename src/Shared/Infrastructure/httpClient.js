import axios from 'axios';

const API_BASE = 'http://localhost:3003';

const http = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Request interceptor
http.interceptors.request.use(
    config => {
        const token = localStorage.getItem('userId'); // Usamos userId como token por ahora
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor
http.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Limpiar datos de sesión
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            
            // Redirigir al login preservando la URL actual
            const currentPath = window.location.pathname;
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(error);
    }
);

export default http;
