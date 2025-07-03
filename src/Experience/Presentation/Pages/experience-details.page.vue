<template>
  <div class="experience-details">
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      Cargando experiencia...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      {{ error }}
    </div>

    <div v-else class="content">
      <div class="header">
        <div class="header-content">
          <h1>{{ experience.title.value }}</h1>
          <div class="meta-info">
            <span class="location">
              <i class="pi pi-map-marker"></i>
              {{ experience.getLocationText() }}
            </span>
            <span class="duration">
              <i class="pi pi-clock"></i>
              {{ experience.getDurationText() }}
            </span>
            <span class="price">{{ experience.getFormattedPrice() }}</span>
          </div>
        </div>
        <div v-if="isAgencyOwner" class="actions">
          <button class="edit-button" @click="editExperience">
            <i class="pi pi-pencil"></i> Editar
          </button>
        </div>
      </div>

      <div class="main-content">
        <div class="gallery">
          <img :src="experience.images[0]" :alt="experience.title.value" class="main-image">
          <div class="thumbnail-list" v-if="experience.images.length > 1">
            <img v-for="(image, index) in experience.images.slice(1)"
                :key="index"
                :src="image"
                :alt="experience.title.value"
                class="thumbnail">
          </div>
        </div>

        <div class="details">
          <div class="eco-badge" v-if="experience.isEcoFriendly()">
            <i class="pi pi-leaf"></i>
            Experiencia Eco-friendly
          </div>

          <section class="description">
            <h2>Descripción</h2>
            <p>{{ experience.description.value }}</p>
          </section>

          <div class="info-columns">
            <section class="included">
              <h2>Incluye</h2>
              <ul>
                <li v-for="(item, index) in experience.included" :key="index">
                  <i class="pi pi-check"></i>
                  {{ item }}
                </li>
              </ul>
            </section>

            <section class="not-included">
              <h2>No Incluye</h2>
              <ul>
                <li v-for="(item, index) in experience.notIncluded" :key="index">
                  <i class="pi pi-times"></i>
                  {{ item }}
                </li>
              </ul>
            </section>
          </div>

          <section class="important-info" v-if="experience.important">
            <h2>Información Importante</h2>
            <p>{{ experience.important }}</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ExperienceService } from '../../Application/experience.service';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';

const route = useRoute();
const router = useRouter();
const experienceService = new ExperienceService();

const experience = ref(null);
const loading = ref(true);
const error = ref(null);

const isAgencyOwner = computed(() => {
  const session = AuthSession.fromStorage();
  return session?.isAgency() && experience.value?.agencyId === session.userId;
});

onMounted(async () => {
  try {
    experience.value = await experienceService.getExperienceById(route.params.id);
  } catch (err) {
    console.error('Error loading experience:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

function editExperience() {
  router.push(`/manage-experiences/${experience.value.id.value}/edit`);
}
</script>

<style scoped>
.experience-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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

.content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  padding: 2rem;
  background: linear-gradient(to right, #047e77, #00b8a9);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header h1 {
  margin: 0 0 1rem;
  font-size: 2rem;
}

.meta-info {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.location,
.duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price {
  font-size: 1.5rem;
  font-weight: 600;
}

.edit-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #047e77;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background: #f0f9f9;
}

.main-content {
  padding: 2rem;
}

.gallery {
  margin-bottom: 2rem;
}

.main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.thumbnail-list {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.thumbnail:hover {
  opacity: 0.8;
}

.details {
  max-width: 800px;
  margin: 0 auto;
}

.eco-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ecfdf5;
  color: #047857;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 2rem;
}

h2 {
  color: #1e293b;
  margin-bottom: 1rem;
}

.info-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.included i {
  color: #047e77;
}

.not-included i {
  color: #dc2626;
}

.important-info {
  padding: 1rem;
  background: #fef3c7;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .info-columns {
    grid-template-columns: 1fr;
  }

  .meta-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
  }

  .actions {
    align-self: flex-end;
  }
}
</style>
