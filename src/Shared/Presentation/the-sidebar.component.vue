<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]" aria-label="Main Navigation">
    <div class="logoCompany">      <img
          src="@/assets/img/logo-eco-trip.png"
          alt="Logo"
          class="logo-img"
          width="40"
          height="40"
      />
      <h1>{{ t('sidevar.logo') }}</h1>
    </div>    <nav v-if="!isCollapsed" class="content-nav">
      <ul>
        <li v-for="link in links" :key="link.path">
          <RouterLink :to="link.path" class="menu-item">
            <i :class="link.icon" style="margin-right:0.5rem"></i>
            <span>{{ link.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-button" @click="handleLogout">
        <i class="pi pi-sign-out"></i>
        <span v-if="!isCollapsed">Cerrar sesión</span>
      </button>
      <button class="toggle-button" @click="emit('toggle')">
        <i :class="isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate'

const props = defineProps({ isCollapsed: Boolean })
const emit = defineEmits(['toggle'])
const router = useRouter()
const { t } = useI18n()

const isAgency = computed(() => {
  const session = AuthSession.fromStorage()
  return session?.isAgency() ?? false
})

const handleLogout = async () => {
  AuthSession.clear()
  await router.push('/login')
}

const links = computed(() => {
  if (isAgency.value) {
    return [
      { label: 'Inicio',                   path: '/experiences',       icon: 'pi pi-home' },
      { label: 'Gestionar Experiencias',   path: '/manage-experiences',icon: 'pi pi-list' },
      { label: 'Reservas',                 path: '/reservations',      icon: 'pi pi-calendar' },
      { label: 'Mi Perfil',                path: '/agency/profile',    icon: 'pi pi-user' }
    ]
  } else {
    return [
      { label: 'Inicio',                   path: '/experiences',       icon: 'pi pi-home' },
      { label: 'Mis Reservas',             path: '/reservations',      icon: 'pi pi-calendar' },
      { label: 'Mi Perfil',                path: '/tourist/profile',   icon: 'pi pi-user' }
    ]
  }
})
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #fff;
  border-right: 3px solid #ddd;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
}
.sidebar.collapsed { width: 50px; }

.logoCompany {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.content-nav { flex-grow: 1; }
ul { list-style: none; padding: 0; }
li { margin: 1rem 0; }

.menu-item {
  display: flex;
  align-items: center;
  padding: .5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  color: #000;
}
.menu-item.router-link-active {
  background: #99D3D2;
  font-weight: bold;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background: #dc2626;
}

.toggle-button {
  background: var(--primary-color, #2196f3);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem;
  cursor: pointer;
  width: 100%;
}
</style>
