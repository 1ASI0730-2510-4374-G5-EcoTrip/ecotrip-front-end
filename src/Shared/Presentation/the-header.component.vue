<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/Shared/Presentation/language-switcher.component.vue'

const route = useRoute()
const { t } = useI18n()

const pageTitles = {
  ExperienceList: 'Explorar Experiencias',
  ManageExperiences: 'Gestionar Experiencias',
  AgencyProfile: 'Mi Perfil',
  TouristProfile: 'Mi Perfil',
  Reservations: 'Mis Reservas'
}

const subtitle = computed(() => {
  return pageTitles[route.name] || 'Inicio'
})
</script>

<template>
  <div class="header-container">
    <h2 class="subtitle">{{ subtitle }}</h2>
    <LanguageSwitcher/>
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  height: 85px;
  border-bottom: 3px solid #ddd;
}
.subtitle {
  color: #000;
  font-weight: 600;
  font-size: 20px;
}
</style>
