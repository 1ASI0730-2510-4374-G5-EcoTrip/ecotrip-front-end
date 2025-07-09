<template>
  <div class="experience-list">
    <div class="header">
      <div class="header-content">
        <h1>Explorar Experiencias</h1>
        <p class="subtitle">Descubre aventuras únicas y sostenibles</p>
      </div>
      <button v-if="isAgency" @click="createNewExperience" class="create-button">
        <i class="pi pi-plus"></i> Nueva Experiencia
      </button>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filters-section">
      <div class="search-container">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Buscar experiencias..."
          v-model="searchQuery"
          class="search-input"
        />
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Tipo:</label>
          <select v-model="selectedType" class="filter-select">
            <option value="">Todos</option>
            <option v-for="type in experienceTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Dificultad:</label>
          <select v-model="selectedDifficulty" class="filter-select">
            <option value="">Todas</option>
            <option value="Fácil">Fácil</option>
            <option value="Moderado">Moderado</option>
            <option value="Difícil">Difícil</option>
            <option value="Moderado a Difícil">Moderado a Difícil</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Precio:</label>
          <select v-model="selectedPriceRange" class="filter-select">
            <option value="">Cualquier precio</option>
            <option value="0-100">€0 - €100</option>
            <option value="101-300">€101 - €300</option>
            <option value="301-500">€301 - €500</option>
            <option value="501+">€501+</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="onlyEcoFriendly" />
            <span class="checkmark"></span>
            Solo eco-friendly
          </label>
        </div>

        <button @click="clearFilters" class="clear-filters-btn">
          <i class="pi pi-times"></i>
          Limpiar
        </button>
      </div>
    </div>

    <!-- Contador de resultados -->
    <div class="results-info" v-if="!loading && !error">
      <p>
        {{ filteredExperiences.length }} experiencia{{ filteredExperiences.length !== 1 ? 's' : '' }} encontrada{{ filteredExperiences.length !== 1 ? 's' : '' }}
      </p>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      Cargando experiencias...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      {{ error }}
    </div>

    <div v-else-if="filteredExperiences.length === 0" class="empty-state">
      <i class="pi pi-search"></i>
      <h3>No se encontraron experiencias</h3>
      <p>Intenta modificar los filtros para encontrar más resultados</p>
    </div>

    <div v-else class="experiences-grid">
      <experience-card
        v-for="experience in filteredExperiences"
        :key="experience.id"
        :experience="experience"
        @click="viewExperience(experience.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';
import { ExperienceService } from '@/Experience/Application/experience.service';
import ExperienceCard from '../Components/experience-card.component.vue';

const router = useRouter();
const experienceService = new ExperienceService();

const experiences = ref([]);
const loading = ref(true);
const error = ref(null);
const isAgency = ref(false);

// Filtros
const searchQuery = ref('');
const selectedType = ref('');
const selectedDifficulty = ref('');
const selectedPriceRange = ref('');
const onlyEcoFriendly = ref(false);

// Computed para tipos de experiencia únicos
const experienceTypes = computed(() => {
  const types = experiences.value.map(exp => exp.type?.value || exp.type).filter(Boolean);
  return [...new Set(types)];
});

// Computed para experiencias filtradas
const filteredExperiences = computed(() => {
  let filtered = experiences.value;

  // Filtro por búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(exp => {
      const title = (exp.title?.value || exp.title || '').toLowerCase();
      const description = (exp.description || '').toLowerCase();
      const location = (exp.location?.value || exp.location || '').toLowerCase();
      const type = (exp.type?.value || exp.type || '').toLowerCase();
      
      return title.includes(query) || 
             description.includes(query) || 
             location.includes(query) || 
             type.includes(query);
    });
  }

  // Filtro por tipo
  if (selectedType.value) {
    filtered = filtered.filter(exp => 
      (exp.type?.value || exp.type) === selectedType.value
    );
  }

  // Filtro por dificultad
  if (selectedDifficulty.value) {
    filtered = filtered.filter(exp => 
      (exp.difficultyLevel?.value || exp.difficultyLevel) === selectedDifficulty.value
    );
  }

  // Filtro por precio
  if (selectedPriceRange.value) {
    filtered = filtered.filter(exp => {
      const price = exp.price?.amount || 0;
      
      switch (selectedPriceRange.value) {
        case '0-100':
          return price >= 0 && price <= 100;
        case '101-300':
          return price >= 101 && price <= 300;
        case '301-500':
          return price >= 301 && price <= 500;
        case '501+':
          return price >= 501;
        default:
          return true;
      }
    });
  }

  // Filtro por eco-friendly
  if (onlyEcoFriendly.value) {
    filtered = filtered.filter(exp => exp.isSustainable === true);
  }

  return filtered;
});

onMounted(async () => {
  const session = AuthSession.fromStorage();
  isAgency.value = session?.isAgency() ?? false;

  try {
    loading.value = true;
    experiences.value = await experienceService.getAllExperiences();
  } catch (err) {
    console.error('Error loading experiences:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

function createNewExperience() {
  router.push('/manage-experiences/create');
}

function viewExperience(id) {
  router.push(`/experiences/${id}`);
}

function clearFilters() {
  searchQuery.value = '';
  selectedType.value = '';
  selectedDifficulty.value = '';
  selectedPriceRange.value = '';
  onlyEcoFriendly.value = false;
}
</script>
    loading.value = true;
    experiences.value = await experienceService.getAllExperiences();
  } catch (err) {
    console.error('Error loading experiences:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

function createNewExperience() {
  router.push('/manage-experiences/create');
}

function viewExperience(id) {
  router.push(`/experiences/${id}`);
}

function clearFilters() {
  searchQuery.value = '';
  selectedType.value = '';
  selectedDifficulty.value = '';
  selectedPriceRange.value = '';
  onlyEcoFriendly.value = false;
}
</script>

<style scoped>
.experience-list {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #047e77 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #047e77 0%, #10b981 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(4, 126, 119, 0.2);
  white-space: nowrap;
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(4, 126, 119, 0.3);
}

.filters-section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border: 1px solid #f1f5f9;
}

.search-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-container i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s;
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: #047e77;
  background: white;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  color: #374151;
  min-width: 150px;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #047e77;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
  margin-top: 1.5rem;
}

.checkbox-label input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-label input[type="checkbox"]:checked {
  background: #047e77;
  border-color: #047e77;
}

.checkbox-label input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  margin-top: 1.5rem;
}

.clear-filters-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.results-info {
  margin-bottom: 1.5rem;
}

.results-info p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.experiences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.loading-state i,
.error-state i,
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.error-state {
  color: #ef4444;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #374151;
  margin: 1rem 0 0.5rem 0;
}

.empty-state p {
  color: #64748b;
  margin: 0;
}

@media (max-width: 1200px) {
  .experiences-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .experience-list {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
    min-width: auto;
  }
  
  .experiences-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .filters-section {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}
</style>
