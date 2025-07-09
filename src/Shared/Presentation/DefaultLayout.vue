<template>  <div class="app-container">
    <div class="main-header">
      <div class="header-content">
        <div class="header-left">
          <router-link :to="getHomeRedirect()" class="logo-link">
            <img src="@/assets/img/logo-eco-trip.png" alt="Logo" class="logo" />
            <span class="logo-text">EcoTrip</span>
          </router-link>
        </div>
        
        <nav v-if="isAuthenticated" class="main-nav">
          <!-- Tourist Navigation -->
          <template v-if="!isAgency">
            <router-link to="/experiences" class="nav-link" active-class="router-link-active" exact>
              <i class="pi pi-compass"></i>
              <span>Explorar experiencias</span>
            </router-link>
            <router-link to="/reservations" class="nav-link" active-class="router-link-active">
              <i class="pi pi-calendar"></i>
              <span>Reservas</span>
            </router-link>
            <router-link to="/tourist/profile" class="nav-link" active-class="router-link-active">
              <i class="pi pi-user"></i>
              <span>Perfil</span>
            </router-link>
          </template>

          <!-- Agency Navigation -->
          <template v-else>
            <router-link to="/manage-experiences" class="nav-link" active-class="router-link-active">
              <i class="pi pi-list"></i>
              <span>Gestionar experiencias</span>
            </router-link>
            <router-link to="/reservations" class="nav-link" active-class="router-link-active">
              <i class="pi pi-calendar"></i>
              <span>Reservas</span>
            </router-link>
            <router-link to="/agency/profile" class="nav-link" active-class="router-link-active">
              <i class="pi pi-user"></i>
              <span>Perfil</span>
            </router-link>
          </template>
        </nav>

        <div v-if="isAuthenticated" class="header-right">
          <button class="logout-btn" @click="handleLogout">
            <i class="pi pi-sign-out"></i>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>

    <main class="main-content">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <i class="pi pi-spinner pi-spin"></i>
          <span>Cargando...</span>
        </div>
      </div>
      <router-view v-if="isAuthenticated" :key="$route.fullPath"></router-view>
    </main>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate'
import { navigationService } from '@/Shared/Application/navigation.service'

const router = useRouter()
const route = useRoute()

// Computed properties for reactive state
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

const isLoading = computed(() => navigationService.loading)

// Watch for authentication changes
watch([isAuthenticated], ([newAuth]) => {
  if (!newAuth && route.path !== '/login') {
    console.log('[DefaultLayout] Authentication lost, redirecting to login');
    router.push('/login');
  }
}, { immediate: true });

// Watch for route changes to update current section
watch(() => route.path, (newPath) => {
  console.log('[DefaultLayout] Route changed to:', newPath);
  
  // Actualizar sección actual
  if (newPath.startsWith('/experiences')) {
    navigationService.setCurrentSection('experiences');
  } else if (newPath.startsWith('/manage-experiences')) {
    navigationService.setCurrentSection('manage-experiences');
  } else if (newPath.startsWith('/reservations')) {
    navigationService.setCurrentSection('reservations');
  } else if (newPath.startsWith('/agency/profile')) {
    navigationService.setCurrentSection('agency-profile');
  } else if (newPath.startsWith('/tourist/profile')) {
    navigationService.setCurrentSection('tourist-profile');
  }
});

const handleLogout = async () => {
  try {
    navigationService.setLoading(true);
    navigationService.clearHistory();
    AuthSession.clear();
    await router.push('/login');
  } catch (error) {
    console.error('Error during logout:', error);
    // Force navigation even if there's an error
    window.location.href = '/login';
  } finally {
    navigationService.setLoading(false);
  }
}

const getHomeRedirect = () => {
  const session = AuthSession.fromStorage();
  if (!session?.isValid()) {
    return '/login';
  }
  return session.isAgency() ? '/manage-experiences' : '/experiences';
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.main-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #047e77;
}

.logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #047e77;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  text-decoration: none;
  color: #475569;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 500;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(4, 126, 119, 0.1);
  color: #047e77;
}

.nav-link.router-link-active {
  background: #047e77;
  color: white;
}

.nav-link i {
  font-size: 1.2rem;
}

.header-right {
  display: flex;
  align-items: center;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  background: none;
  color: #475569;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 500;
}

.logout-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.loading-spinner i {
  font-size: 1.5rem;
  color: #047e77;
}

.loading-spinner span {
  font-weight: 500;
  color: #374151;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .main-nav {
    width: 100%;
    justify-content: center;
  }

  .header-right {
    width: 100%;
    justify-content: center;
  }
}
</style>
