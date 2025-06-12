<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ExperienceCard from '@/Experience/Presentation/experience-card.component.vue'
import { ExperiencesApiService } from '@/Experience/Infrastructure/experience.api'
import { ExperienceMapper } from '@/Experience/Application/ExperienceMapper.js'

const experiencesApiService = new ExperiencesApiService();
const { t } = useI18n()
const user = 'Marcia Melgarejo'

const destination = ref('')
const day = ref('')
const experienceType = ref('')
const budget = ref('')

const experiences = ref([])
const filteredExperiences = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await experiencesApiService.getExperiences();
    experiences.value = ExperienceMapper.toEntitiesFromResponse(response);
  } catch (error) {
    console.error('Error al cargar experiencias:', error);
  } finally {
    loading.value = false;
  }
});

const filterExperiences = () => {
  const noFiltersApplied = !destination.value && !day.value && !experienceType.value && !budget.value;

  if (noFiltersApplied) {
    filteredExperiences.value = [];
    return;
  }

  filteredExperiences.value = experiences.value.filter((exp) => {
    const matchesDestination = !destination.value || 
        exp.location.toLowerCase().includes(destination.value.toLowerCase());
    
    const matchesDay = !day.value || 
        (exp.frequencies && exp.frequencies.some(f => f.toLowerCase().includes(day.value.toLowerCase())));
    
    const matchesType = !experienceType.value || 
        exp.title.toLowerCase().includes(experienceType.value.toLowerCase());
    
    const matchesBudget = !budget.value || 
        exp.price <= parseFloat(budget.value);

    return matchesDestination && matchesDay && matchesType && matchesBudget;
  });
}

const hasResults = computed(() => {
  return filteredExperiences.value.length > 0;
});
</script>

<template>
  <div class="home-view">
    <main class="main-content">
      <h3 class="greetings">{{ $t('home.greeting', { user }) }}</h3>
      <p class="welcome-message">{{ $t('home.greetingSubtitle') }}</p>

      <div class="search-container">
        <div class="row">
          <input type="text" :placeholder="$t('home.destination')" class="input" v-model="destination" />
          <input type="text" :placeholder="$t('home.day')" class="input" v-model="day" />
        </div>

        <div class="row">
          <input type="text" :placeholder="$t('home.experienceType')" class="input" v-model="experienceType" />
          <input type="number" :placeholder="$t('home.budget')" class="input" v-model="budget" />
          <button class="search-button" @click="filterExperiences">{{ $t('home.search') }}</button>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ $t('common.loading') }}</p>
      </div>
      
      <template v-else>
        <p class="recommendation-title">{{ $t('home.recommendations') }}</p>
        
        <div v-if="hasResults" class="recommendation-grid">
          <ExperienceCard
              v-for="experience in filteredExperiences"
              :key="experience.id"
              :experience="experience"
          />
        </div>
        
        <div v-else-if="filteredExperiences.length === 0 && destination.value || day.value || experienceType.value || budget.value" class="no-results">
          <i class="pi pi-search" style="font-size: 2rem; color: var(--text-color-secondary);"></i>
          <p>{{ $t('home.noResults') }}</p>
        </div>
        
        <div v-else class="explore-prompt">
          <p>{{ $t('home.explorePrompt') }}</p>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.home-view {
  color: black;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.greetings {
  font-size: 36px;
  font-weight: 700;
}

.welcome-message {
  font-size: 1.2rem;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
}

.search-container {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.row:last-child {
  margin-bottom: 0;
}

.input {
  flex: 1 1 250px;
  height: 48px;
  font-size: 16px;
  padding: 0 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.search-button {
  height: 48px;
  padding: 0 1.5rem;
  background-color: black;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #333;
}

.loading-container, .no-results, .explore-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
}

.recommendation-title {
  font-weight: 600;
  font-size: 1.2rem;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
  }
  
  .input, .search-button {
    width: 100%;
  }
}
</style>