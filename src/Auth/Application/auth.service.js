import { AuthApiService } from '@/Auth/Application/auth-api.service';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';

export class AuthService {
    constructor() {}    async login({ email, password, role }) {
        try {
            console.log('AuthService: iniciando login con', { email, role });
            const userData = await AuthApiService.login(email, password, role);
            
            if (!userData) {
                console.error('AuthService: datos de usuario nulos después del login');
                throw new Error('Credenciales incorrectas');
            }
            
            const session = new AuthSession(
                userData.id,
                userData.email,
                userData.name,
                userData.role,
                userData.avatar
            );
            session.save();
            
            console.log('AuthService: login exitoso, sesión creada:', session);
            return session;
        } catch (error) {
            console.error('AuthService: error en autenticación:', error);
            if (error.response?.status === 401 || error.response?.status === 400) {
                throw new Error('Credenciales incorrectas');
            }
            throw new Error('Error al iniciar sesión. Por favor, intenta nuevamente.');
        }
    }

    logout() {
        console.log('AuthService: cerrando sesión');
        AuthApiService.logout();
    }

    getCurrentSession() {
        return AuthSession.fromStorage();
    }

    isAuthenticated() {
        const session = this.getCurrentSession();
        return session?.isValid() ?? false;
    }
}
