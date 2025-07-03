<template>
  <div class="experience-form">
    <div class="header">
      <h1>{{ isEditing ? 'Editar Experiencia' : 'Nueva Experiencia' }}</h1>
    </div>

    <form @submit.prevent="saveExperience" class="form-content">
      <div class="form-group">
        <label>Título</label>
        <input-text v-model="form.title" required />
      </div>

      <div class="form-group">
        <label>Descripción</label>
        <textarea v-model="form.description" class="form-textarea" required></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Ubicación</label>
          <input-text v-model="form.location" required />
        </div>
        <div class="form-group">
          <label>Duración</label>
          <input-text v-model="form.duration" placeholder="Ej: 2 días" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Precio (S/)</label>
          <input-number v-model="form.price" mode="currency" currency="PEN" required />
        </div>
        <div class="form-group">
          <label>Máximo de Participantes</label>
          <input-number v-model="form.maxGroupSize" :min="1" required />
        </div>
      </div>

      <div class="form-group">
        <label>Imágenes (URLs)</label>
        <div class="images-list">
          <div v-for="(url, index) in form.images" :key="index" class="image-item">
            <input-text v-model="form.images[index]" placeholder="https://" />
            <button type="button" class="remove-button" @click="removeImage(index)">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
        <button type="button" class="add-button" @click="addImage">
          <i class="pi pi-plus"></i> Agregar Imagen
        </button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Incluye</label>
          <div class="items-list">
            <div v-for="(item, index) in form.included" :key="index" class="list-item">
              <input-text v-model="form.included[index]" />
              <button type="button" class="remove-button" @click="removeIncluded(index)">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>
          <button type="button" class="add-button" @click="addIncluded">
            <i class="pi pi-plus"></i> Agregar Item
          </button>
        </div>

        <div class="form-group">
          <label>No Incluye</label>
          <div class="items-list">
            <div v-for="(item, index) in form.notIncluded" :key="index" class="list-item">
              <input-text v-model="form.notIncluded[index]" />
              <button type="button" class="remove-button" @click="removeNotIncluded(index)">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>
          <button type="button" class="add-button" @click="addNotIncluded">
            <i class="pi pi-plus"></i> Agregar Item
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>Información Importante</label>
        <textarea v-model="form.important" class="form-textarea"></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="cancel-button" @click="cancel">Cancelar</button>
        <button type="submit" class="save-button" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import { ExperienceService } from '../../Application/experience.service';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';

const route = useRoute();
const router = useRouter();
const experienceService = new ExperienceService();

const isEditing = computed(() => !!route.params.id);
const loading = ref(false);
const error = ref(null);

const form = ref({
  title: '',
  description: '',
  location: '',
  duration: '',
  price: 0,
  maxGroupSize: 10,
  images: [''],
  included: [''],
  notIncluded: [''],
  important: '',
  categories: [],
  sustainability: {
    ecoCertifications: [],
    sustainablePractices: [],
    localCommunityImpact: ''
  },
  difficulty: 'medium',
  languages: ['Español']
});

onMounted(async () => {
  const session = AuthSession.fromStorage();
  if (!session?.isAgency()) {
    router.push('/experiences');
    return;
  }

  if (isEditing.value) {
    try {
      loading.value = true;
      const experience = await experienceService.getExperienceById(route.params.id);
      form.value = {
        title: experience.title.value,
        description: experience.description.value,
        location: experience.location.value,
        duration: experience.duration.value,
        price: experience.price.value,
        maxGroupSize: experience.maxGroupSize,
        images: [...experience.images],
        included: [...experience.included],
        notIncluded: [...experience.notIncluded],
        important: experience.important,
        categories: [...experience.categories],
        sustainability: {...experience.sustainability},
        difficulty: experience.difficulty,
        languages: [...experience.languages]
      };
    } catch (err) {
      console.error('Error loading experience:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }
});

async function saveExperience() {
  try {
    loading.value = true;
    const session = AuthSession.fromStorage();
    
    const experienceData = {
      ...form.value,
      agencyId: session.userId
    };

    if (isEditing.value) {
      await experienceService.updateExperience(route.params.id, experienceData);
    } else {
      await experienceService.createExperience(experienceData);
    }

    router.push('/manage-experiences');
  } catch (err) {
    console.error('Error saving experience:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function cancel() {
  router.push('/manage-experiences');
}

function addImage() {
  form.value.images.push('');
}

function removeImage(index) {
  form.value.images.splice(index, 1);
}

function addIncluded() {
  form.value.included.push('');
}

function removeIncluded(index) {
  form.value.included.splice(index, 1);
}

function addNotIncluded() {
  form.value.notIncluded.push('');
}

function removeNotIncluded(index) {
  form.value.notIncluded.splice(index, 1);
}
</script>

<style scoped>
.experience-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.form-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #1e293b;
}

.form-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  resize: vertical;
}

.images-list,
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.image-item,
.list-item {
  display: flex;
  gap: 0.5rem;
}

.remove-button {
  padding: 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-button:hover {
  background: #fecaca;
}

.add-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #e0f2f1;
  color: #047e77;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover {
  background: #b2dfdb;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.cancel-button,
.save-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background: #e2e8f0;
  color: #475569;
}

.cancel-button:hover {
  background: #cbd5e1;
}

.save-button {
  background: #047e77;
  color: white;
}

.save-button:hover:not(:disabled) {
  background: #036c66;
}

.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
