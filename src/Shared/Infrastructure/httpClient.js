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
        console.error('[HttpClient] Response error:', error);
        
        if (error.response?.status === 401) {
            // Limpiar datos de sesión
            localStorage.clear();
            
            // Solo redirigir si no estamos ya en login
            if (!window.location.pathname.includes('/login')) {
                const currentPath = window.location.pathname;
                console.log('[HttpClient] Redirecting to login due to 401');
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }
        }
        
        // Para otros errores, no bloquear la aplicación
        return Promise.reject(error);
    }
);

export default http;
