<template>
  <nav class="navbar">
    <div class="logo">
      <router-link :to="homePath" class="home-link">
        <img src="@/assets/img/logo-eco-trip.png" alt="EcoTrip" class="nav-logo" />
      </router-link>
    </div>
    <div class="nav-links">
      <router-link :to="homePath" class="nav-link" exact-active-class="router-link-active">
        <i class="pi pi-home"></i>
        {{ t('nav.home') }}
      </router-link>
      <router-link to="/experiences" class="nav-link" active-class="router-link-active">
        <i class="pi pi-compass"></i>
        {{ t('nav.explore') }}
      </router-link>
      <template v-if="isAgency">
        <router-link to="/manage-experiences" class="nav-link" active-class="router-link-active">
          <i class="pi pi-list"></i>
          {{ t('nav.manageExperiences') }}
        </router-link>
        <router-link to="/agency/profile" class="nav-link" active-class="router-link-active">
          <i class="pi pi-user"></i>
          {{ t('nav.profile') }}
        </router-link>
      </template>
      <template v-else>
        <router-link to="/tourist/profile" class="nav-link" active-class="router-link-active">
          <i class="pi pi-user"></i>
          {{ t('nav.profile') }}
        </router-link>
        <router-link to="/bookings" class="nav-link" active-class="router-link-active">
          <i class="pi pi-calendar"></i>
          {{ t('nav.myBookings') }}
        </router-link>
      </template>
    </div>
    <div class="user-menu">
      <language-switcher />
      <button class="logout-btn" @click="handleLogout">
        <i class="pi pi-sign-out"></i>
        {{ t('nav.logout') }}
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate'
import { AuthService } from '@/Auth/Application/auth.service'
import LanguageSwitcher from './language-switcher.component.vue'

const router = useRouter()
const { t } = useI18n()

const session = computed(() => AuthSession.fromStorage())
const isAgency = computed(() => session.value?.isAgency() ?? false)

// Calcular la ruta del home según el rol
const homePath = computed(() => {
  if (!session.value?.isValid()) return '/login'
  return isAgency.value ? '/manage-experiences' : '/experiences'
})

const authService = new AuthService()

async function handleLogout() {
  try {
    // First clear the session
    AuthSession.clear()
    // Then call logout service
    await authService.logout()
    // Finally redirect to login
    await router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
    // Even if there's an error, we should still redirect to login
    await router.push('/login')
  }
}
</script>

<style scoped>
.navbar {
  background: var(--bg-secondary);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.logo {
  padding: 0.5rem;
}

.logo img {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.home-link {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.home-link:hover {
  background: rgba(6, 165, 155, 0.1);
  transform: scale(1.02);
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(6, 165, 155, 0.1);
  color: #06a59b;
}

.nav-link.router-link-active {
  background: #06a59b;
  color: white;
}

.nav-link i {
  font-size: 1.2rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}
</style>