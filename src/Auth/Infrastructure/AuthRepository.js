import http from '@/Shared/Infrastructure/httpClient.js';

export class AuthApiService {
    async login({ email, password, role }) {
        try {
            console.log('AuthApiService: Intentando login con:', { email, role });
            
            const response = await http.post('/auth/login', {
                email,
                password,
                role
            });
            
            if (!response.data) {
                console.error('AuthApiService: No se recibieron datos del servidor');
                throw new Error('Credenciales incorrectas');
            }

            console.log('AuthApiService: Login exitoso:', response.data);
            return response.data;
        } catch (error) {
            console.error('[AuthApiService] Error en login:', error);
            throw error;
        }
    }
}
