<template>
  <div class="home-page">
    <header class="hero">
      <h1>{{ welcomeMessage }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </header>

    <section class="search-section">
      <div class="search-container">
        <div class="search-row">
          <div class="search-field">
            <i class="pi pi-map-marker"></i>
            <input type="text" v-model="filters.destination" :placeholder="t('search.destination')" />
          </div>
          <div class="search-field">
            <i class="pi pi-calendar"></i>
            <input type="text" v-model="filters.date" :placeholder="t('search.date')" />
          </div>
        </div>
        <div class="search-row">
          <div class="search-field">
            <i class="pi pi-tag"></i>
            <input type="text" v-model="filters.type" :placeholder="t('search.type')" />
          </div>
          <div class="search-field">
            <i class="pi pi-dollar"></i>
            <input type="number" v-model="filters.budget" :placeholder="t('search.budget')" />
          </div>
          <button class="search-button" @click="searchExperiences">
            <i class="pi pi-search"></i>
            {{ t('search.button') }}
          </button>
        </div>
      </div>
    </section>

    <section class="experiences-section">
      <h2>{{ t('home.featuredExperiences') }}</h2>
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <p>{{ t('common.loading') }}</p>
      </div>
      <div v-else-if="error" class="error-state">
        <i class="pi pi-exclamation-triangle"></i>
        <p>{{ error }}</p>
      </div>
      <div v-else class="experiences-grid">
        <experience-card
          v-for="experience in filteredExperiences"
          :key="experience.id"
          :experience="experience"
        />
      </div>
      <div v-if="!loading && filteredExperiences.length === 0" class="no-results">
        <p>{{ t('search.noResults') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate'
import { ExperienceService } from '@/Experience/Application/experience.service'
import ExperienceCard from '../Components/experience-card.component.vue'

const { t } = useI18n()
const experienceService = new ExperienceService()

const loading = ref(true)
const error = ref(null)
const experiences = ref([])
const filters = ref({
  destination: '',
  date: '',
  type: '',
  budget: ''
})

const session = computed(() => AuthSession.fromStorage())
const welcomeMessage = computed(() => {
  if (!session.value?.isValid()) return t('home.welcomeGuest')
  return session.value.isAgency() 
    ? t('home.welcomeAgency') 
    : t('home.welcomeTourist', { name: session.value.name })
})

const subtitle = computed(() => {
  if (!session.value?.isValid()) return t('home.subtitleGuest')
  return session.value.isAgency() 
    ? t('home.subtitleAgency')
    : t('home.subtitleTourist')
})

const filteredExperiences = computed(() => {
  if (!experiences.value.length) return []
  
  return experiences.value.filter(exp => {
    const matchDestination = !filters.value.destination || 
      exp.location.value.toLowerCase().includes(filters.value.destination.toLowerCase())
      
    const matchType = !filters.value.type ||
      exp.title.value.toLowerCase().includes(filters.value.type.toLowerCase())
      
    const matchBudget = !filters.value.budget ||
      exp.price.value <= parseFloat(filters.value.budget)
      
    return matchDestination && matchType && matchBudget
  })
})

onMounted(async () => {
  try {
    loading.value = true
    experiences.value = await experienceService.getAllExperiences()
  } catch (err) {
    console.error('Error loading experiences:', err)
    error.value = t('errors.loadExperiences')
  } finally {
    loading.value = false
  }
})

function searchExperiences() {
  // La búsqueda se realiza automáticamente por el computed filteredExperiences
}
</script>

<style scoped>
.home-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  color: #1e293b;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #64748b;
}

.search-section {
  margin-bottom: 4rem;
}

.search-container {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.search-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-row:last-child {
  margin-bottom: 0;
}

.search-field {
  flex: 1;
  position: relative;
}

.search-field i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-field input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-field input:focus {
  border-color: #06a59b;
  outline: none;
}

.search-button {
  padding: 0.75rem 2rem;
  background: #06a59b;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-button:hover {
  background: #047e77;
}

.experiences-section {
  margin-top: 3rem;
}

.experiences-section h2 {
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 2rem;
}

.experiences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.loading-state,
.error-state,
.no-results {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.loading-state i,
.error-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-state {
  color: #dc2626;
}

@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
  }
  
  .search-field {
    margin-bottom: 1rem;
  }
  
  .search-button {
    width: 100%;
    justify-content: center;
  }
  
  .experiences-grid {
    grid-template-columns: 1fr;
  }
}
</style>
