<template>
  <div class="app-container">    <header class="main-header">
      <div class="header-left">
        <img src="@/assets/img/logo-eco-trip.png" alt="Logo" class="logo" />
        <h1>EcoTrip</h1>
      </div>
      
      <nav class="main-nav">
        <router-link to="/experiences" class="nav-link">
          <i class="pi pi-home"></i> Inicio
        </router-link>
        <router-link to="/experiences" class="nav-link">
          <i class="pi pi-compass"></i> Explorar experiencias
        </router-link>
        <router-link to="/reservations" class="nav-link">
          <i class="pi pi-calendar"></i> Mis Reservas
        </router-link>
        <router-link :to="profilePath" class="nav-link">
          <i class="pi pi-user"></i> Mi Perfil
        </router-link>
      </nav>

      <div class="header-right">
        <button class="logout-btn" @click="handleLogout">
          <i class="pi pi-sign-out"></i> Cerrar sesión
        </button>
      </div>
    </header>

    <main class="main-content">
      <router-view v-if="isAuthenticated"></router-view>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate'

const router = useRouter()
const session = computed(() => AuthSession.fromStorage())

const isAuthenticated = computed(() => {
  return session.value?.isValid() ?? false;
})

const isAgency = computed(() => {
  return session.value?.isAgency() ?? false;
})

const profilePath = computed(() => {
  return isAgency.value ? '/agency/profile' : '/tourist/profile';
})

const handleLogout = () => {
  AuthSession.clear();
  router.push('/login');
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-layout {
  flex: 1;
  display: flex;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.main-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 40px;
  width: auto;
}

.header-left h1 {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin: 0;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: var(--primary-50);
  color: var(--primary-color);
}

.nav-link i {
  font-size: 1.2rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 76px);
}
</style>
