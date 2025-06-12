// auth-api.service.js
import http from '@/Shared/Infrastructure/httpClient';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';

export class AuthApiService {
    static async login(email, password, role) {
        try {
            console.log('AuthApiService: enviando solicitud de login', { email, role });
            
            // JSON Server devuelve un array de resultados para las consultas GET con filtros
            const response = await http.get(`/users?email=${email}&password=${password}&role=${role}`);
            
            console.log('AuthApiService: respuesta recibida:', response.data);
            
            // Verificamos si hay datos y si el array no está vacío
            if (response.data && response.data.length > 0) {
                const userData = response.data[0]; // Tomamos el primer elemento del array (el usuario encontrado)
                
                // Opcional: Una verificación adicional por si el primer elemento no es un usuario válido
                if (userData && userData.email) {
                    return userData; // Devolvemos el objeto de usuario
                }
            }
            
            console.error('AuthApiService: respuesta sin datos válidos o usuario no encontrado');
            return null; // Si no se encuentra un usuario que coincida o el formato no es el esperado
        } catch (error) {
            console.error('AuthApiService: error en login:', error.response || error);
            
            // Si el error es una respuesta HTTP (ej. 404 si el endpoint no existe),
            // lo relanzamos para que AuthService lo maneje específicamente.
            if (error.response && error.response.status === 404) {
                throw new Error('Endpoint de autenticación no encontrado');
            }
            throw error; // Relanzamos cualquier otro tipo de error
        }
    }

    static logout() {
        AuthSession.clear();
    }
}