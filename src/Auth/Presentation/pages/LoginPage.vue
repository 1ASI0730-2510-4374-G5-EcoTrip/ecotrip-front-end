<template>  <div class="login-container">
    <div class="login-box">
      <div class="login-header">        <img src="@/assets/img/logo-eco-trip.png" alt="EcoTrip" class="login-logo" />
        <h1>¡Bienvenido a EcoTrip!</h1>
        <p class="subtitle">Descubre experiencias sostenibles</p>
      </div>

      <form @submit.prevent="onLogin" class="login-form">
        <div class="role-selector">
          <div 
            class="role-card" 
            :class="{ active: selectedRole === 'tourist' }"
            @click="selectedRole = 'tourist'"
          >
            <i class="pi pi-user role-icon"></i>
            <div class="role-info">
              <h3>Turista</h3>
              <p>Descubre experiencias únicas</p>
            </div>
          </div>
          <div 
            class="role-card"
            :class="{ active: selectedRole === 'agency' }"
            @click="selectedRole = 'agency'"
          >
            <i class="pi pi-briefcase role-icon"></i>
            <div class="role-info">
              <h3>Agencia</h3>
              <p>Gestiona tus experiencias</p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <span class="p-input-icon-left">
            <i class="pi pi-envelope"></i>
            <InputText
              id="email"
              v-model="email"
              type="email"
              class="p-inputtext-lg"
              :class="{ 'p-invalid': !!error }"
              :placeholder="selectedRole === 'tourist' ? 'tourist@demo.com' : 'agency@demo.com'"
              required
            />
          </span>
        </div>

        <div class="form-group">
          <span class="p-input-icon-left">
            <i class="pi pi-lock"></i>
            <InputText
              id="password"
              v-model="password"
              type="password"
              class="p-inputtext-lg"
              :class="{ 'p-invalid': !!error }"
              placeholder="Contraseña"
              required
            />
          </span>
        </div>

        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-circle"></i>
          {{ error }}
        </div>

        <Button
          type="submit"
          :label="loading ? 'Iniciando sesión...' : 'Iniciar Sesión'"
          :disabled="loading || !canSubmit"
          :loading="loading"
          class="p-button-lg"
        />

        <div class="divider">
          <span>¿No tienes una cuenta?</span>
        </div>

        <Button
          type="button"
          label="Crear cuenta nueva"
          class="p-button-outlined p-button-lg"
          @click="router.push('/register')"
        />
      </form>
    </div>
    
    <div class="login-banner">
      <div class="banner-content">
        <h2>Descubre nuevas aventuras</h2>
        <p>Conecta con experiencias sostenibles y auténticas</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '@/Auth/Application/auth.service';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const selectedRole = ref('tourist');
const router = useRouter();
const authService = new AuthService();

const canSubmit = computed(() => email.value.trim() && password.value.trim());

async function onLogin() {
  if (loading.value || !canSubmit.value) return;
  
  loading.value = true;
  error.value = '';

  try {
    const credentials = {
      email: email.value,
      password: password.value,
      role: selectedRole.value
    };

    console.log('LoginPage: Intentando login con:', { 
      email: credentials.email, 
      role: credentials.role 
    });

    const session = await authService.login(credentials);
    console.log('LoginPage: Login exitoso:', session);

    if (!session || !session.role) {
      throw new Error('No se recibió una sesión válida');
    }

    // Redirigir según el rol
    const redirectPath = session.role === 'agency' ? '/manage-experiences' : '/experiences';
    console.log('LoginPage: Redirigiendo a', redirectPath);
    await router.push(redirectPath);

  } catch (err) {
    console.error('Error en login:', err);
    error.value = err.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #ebf9f7 0%, #dcf2ef 100%);
}

.login-box {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(4px);
  margin: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  width: 80px;
  height: auto;
  margin-bottom: 1rem;
}

.login-header h1 {
  font-size: 2rem;
  margin: 0;
  font-weight: 600;
  color: #047e77;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
}

.subtitle {
  color: var(--text-color-secondary);
  margin: 0.5rem 0 0;
  font-size: 1.1rem;
}

.login-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.role-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.role-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid var(--surface-border);
  border-radius: 12px;
  background: var(--surface-card);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.role-card:hover {
  transform: translateY(-2px);
}

.role-card.active {
  border-color: #06a59b;
  background: rgba(6, 165, 155, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 165, 155, 0.15);
}

.role-icon {
  font-size: 2rem !important;
  color: #06a59b;
  background: rgba(6, 165, 155, 0.08);
  padding: 0.5rem;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-info {
  text-align: left;
}

.role-info h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color);
}

.role-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group :deep(.p-inputtext) {
  width: 100%;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--red-600);
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  background-color: var(--red-50);
  font-size: 0.875rem;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 2rem 0;
  color: var(--text-color-secondary);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--surface-border);
}

.divider span {
  padding: 0 1rem;
}

.login-banner {
  flex: 1;
  background: linear-gradient(135deg, #06a59b 0%, #047e77 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  color: white;
  padding: 2rem;
}

.banner-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.banner-content h2 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
}

.banner-content p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
}

.login-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('@/assets/img/logo-eco-trip.png') center/30% no-repeat;
  opacity: 0.15;
}

:deep(.p-button) {
  width: 100%;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

:deep(.p-button-lg) {
  padding: 1rem;
  font-size: 1.1rem;
  background-color: #06a59b;
  border-color: #06a59b;
  box-shadow: 0 2px 4px rgba(6, 165, 155, 0.2);
}

:deep(.p-button-lg:hover) {
  background-color: #047e77 !important;
  border-color: #047e77 !important;
  box-shadow: 0 4px 8px rgba(6, 165, 155, 0.3);
  transform: translateY(-1px);
}

:deep(.p-button-lg:active) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(6, 165, 155, 0.2);
}

:deep(.p-button-outlined) {
  border: 2px solid #06a59b;
  color: #06a59b;
  background-color: rgba(6, 165, 155, 0.02);
  box-shadow: none;
}

:deep(.p-button-outlined:hover) {
  background: rgba(6, 165, 155, 0.08);
  border-color: #06a59b;
  color: #06a59b;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(6, 165, 155, 0.1);
}

:deep(.p-inputtext) {
  padding: 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 2px solid var(--surface-border);
}

:deep(.p-inputtext:hover) {
  border-color: #047e77;
}

:deep(.p-inputtext:focus) {
  box-shadow: 0 0 0 2px rgba(4, 126, 119, 0.2);
  border-color: #047e77;
}

@media (max-width: 1024px) {
  .login-container {
    flex-direction: column-reverse;
  }

  .login-banner {
    padding: 3rem 2rem;
  }

  .banner-content h2 {
    font-size: 2rem;
  }

  .banner-content p {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .login-banner {
    display: none;
  }
  
  .login-box {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .role-selector {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .login-box {
    padding: 1.5rem;
  }

  .role-selector {
    flex-direction: column;
  }

  .role-card {
    width: 100%;
  }
}
</style>
