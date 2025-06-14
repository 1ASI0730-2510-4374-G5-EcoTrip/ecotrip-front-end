export class AuthSession {
    static STORAGE_KEY = 'session';

    constructor(id, email, name, role, avatar) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.avatar = avatar;
        this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        console.log('Created session:', this);
    }

    static fromStorage() {
        const stored = localStorage.getItem(AuthSession.STORAGE_KEY);
        if (!stored) {
            console.log('[AuthSession] No hay sesión almacenada');
            localStorage.clear();
            return null;
        }

        try {
            const data = JSON.parse(stored);
            console.log('[AuthSession] Datos de sesión encontrados:', data);
            const session = new AuthSession(
                data.id,
                data.email,
                data.name,
                data.role,
                data.avatar
            );
            
            // Verificar validez antes de devolver
            if (!session.isValid()) {
                console.log('Sesión expirada o inválida, limpiando...');
                localStorage.removeItem(AuthSession.STORAGE_KEY);
                return null;
            }
            
            console.log('Sesión recuperada correctamente:', session);
            return session;
        } catch (error) {
            console.error('Error al procesar la sesión:', error);
            localStorage.removeItem(AuthSession.STORAGE_KEY);
            return null;
        }
    }

    save() {
        const sessionData = {
            id: this.id,
            email: this.email,
            name: this.name,
            role: this.role,
            avatar: this.avatar,
            expiresAt: this.expiresAt.toISOString()
        };
        
        localStorage.setItem(AuthSession.STORAGE_KEY, JSON.stringify(sessionData));
        console.log('Session saved:', sessionData);
    }

    static clear() {
        localStorage.removeItem(AuthSession.STORAGE_KEY);
        console.log('Session cleared');
    }

    isValid() {
        return this.id && this.role && new Date() < new Date(this.expiresAt);
    }

    isAgency() {
        return this.role === 'agency';
    }

    isTourist() {
        return this.role === 'tourist';
    }
}
