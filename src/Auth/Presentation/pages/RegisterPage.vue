<template>
  <div class="register-container">
    <div class="register-box">
      <h2>Únete a EcoTrip</h2>
      <p class="subtitle">Crea tu cuenta para comenzar</p>

      <form @submit.prevent="onRegister">
        <label for="name">Nombre completo</label>
        <pv-input-text
            id="name"
            v-model="name"
            class="input"
            placeholder="Tu nombre"
            required
        />

        <label for="email">Email</label>
        <pv-input-text
            id="email"
            v-model="email"
            type="email"
            class="input"
            placeholder="usuario@ejemplo.com"
            required
        />

        <label for="password">Contraseña</label>
        <pv-input-text
            id="password"
            v-model="password"
            type="password"
            class="input"
            placeholder="••••••••"
            required
        />

        <label for="confirm">Confirmar contraseña</label>
        <pv-input-text
            id="confirm"
            v-model="confirmPassword"
            type="password"
            class="input"
            placeholder="••••••••"
            required
        />

        <label>Tipo de cuenta</label>
        <div class="role-selector">
          <div 
            class="role-card" 
            :class="{ active: role === 'tourist' }"
            @click="role = 'tourist'"
          >
            <i class="pi pi-user"></i>
            <h3>Viajero</h3>
            <p>Descubre experiencias sostenibles</p>
          </div>
          <div 
            class="role-card"
            :class="{ active: role === 'agency' }"
            @click="role = 'agency'"
          >
            <i class="pi pi-briefcase"></i>
            <h3>Proveedor</h3>
            <p>Ofrece experiencias ecológicas</p>
          </div>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <pv-button
            label="Crear cuenta"
            class="register-button"
            type="submit"
            :disabled="!canSubmit"
        />
      </form>

      <p class="login">
        ¿Ya tienes cuenta?
        <a @click.prevent="$router.push('/login')">Inicia sesión</a>
      </p>
    </div>
    <div class="register-banner"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '@/Auth/Application/auth.service.js'
import { UserRole } from '@/Auth/Domain/user-role.value-object.js'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref(UserRole.TOURIST)
const error = ref('')

const authService = new AuthService()
const router = useRouter()

const canSubmit = computed(() => {
  return (
    name.value.trim() &&
    email.value.trim() &&
    password.value &&
    confirmPassword.value &&
    password.value === confirmPassword.value
  )
})

async function onRegister() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  try {
    await authService.register({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    })
    
    alert('¡Cuenta creada! Ya puedes iniciar sesión.')
    router.push('/login')
  } catch (err) {
    console.error(err)
    error.value = 'No se pudo crear la cuenta. Intenta de nuevo.'
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}
.register-box {
  width: 50%;
  padding: 40px;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.register-box h2 {
  color: #047e77;
  font-size: 32px;
  margin-bottom: 8px;
}
.subtitle {
  font-size: 14px;
  margin-bottom: 24px;
  color: #666;
}
label {
  display: block;
  margin-top: 12px;
  font-weight: 500;
}
.input {
  margin-top: 4px;
  margin-bottom: 16px;
  width: 100%;
  border-radius: 12px;
  padding: .75rem;
}
.role-selector {
  display: flex;
  gap: 16px;
  margin: 16px 0;
}
.role-card {
  flex: 1;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
.role-card:hover {
  border-color: #047e77;
}
.role-card.active {
  border-color: #047e77;
  background: #f0f9f9;
}
.role-card i {
  font-size: 24px;
  color: #047e77;
  margin-bottom: 8px;
}
.role-card h3 {
  margin: 8px 0;
  color: #333;
}
.role-card p {
  font-size: 14px;
  color: #666;
}
.error {
  color: red;
  margin-bottom: 12px;
}
.register-button {
  width: 100%;
  background-color: #047e77;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-weight: bold;
  font-size: 16px;
  margin-top: 8px;
}
.login {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
}
.login a {
  color: #047e77;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}
.register-banner {
  width: 50%;
  background: linear-gradient(135deg,#00b8a9,#00796b);
}
</style>
