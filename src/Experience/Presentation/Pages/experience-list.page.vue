<template>
  <div class="experience-list">
    <div class="header">
      <h1>Experiencias</h1>
      <button v-if="isAgency" @click="createNewExperience" class="create-button">
        <i class="pi pi-plus"></i> Nueva Experiencia
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      Cargando experiencias...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      {{ error }}
    </div>

    <div v-else class="experiences-grid">
      <experience-card
        v-for="experience in experiences"
        :key="experience.id"
        :experience="experience"
        @click="viewExperience(experience.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
</script>

<style scoped>
.experience-list {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #047e77;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-button:hover {
  background-color: #036c66;
}

.experiences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-color-secondary);
}

.loading-state i,
.error-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-state {
  color: var(--red-600);
}
</style>
