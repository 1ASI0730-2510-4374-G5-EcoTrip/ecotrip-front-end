export class UserCredentials {
    constructor({ email, password }) {
        this.email = email?.trim();
        this.password = password?.trim();
    }    validate() {
        if (!this.email?.trim() || !this.password?.trim()) {
            throw new Error('Email y contraseña son requeridos');
        }
        return true;
    }
}
