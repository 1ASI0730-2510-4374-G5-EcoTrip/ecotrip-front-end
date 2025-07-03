import axios from 'axios';

// Configurar la URL base dependiendo del entorno
const API_BASE = import.meta.env.PROD 
    ? '/api'  // En producción usa rutas relativas
    : 'http://localhost:3003';  // En desarrollo usa localhost

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
        console.log(`[HttpClient] Making ${config.method.toUpperCase()} request to: ${config.url}`);
        const session = JSON.parse(localStorage.getItem('session'));
        if (session?.id) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${session.id}`;
            console.log('[HttpClient] Added authorization header');
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
            localStorage.clear(); // Limpiar toda la sesión
            
            // Redirigir al login preservando la URL actual
            const currentPath = window.location.pathname;
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(error);
    }
);

export default http;
