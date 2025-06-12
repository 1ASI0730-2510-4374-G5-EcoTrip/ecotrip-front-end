<template>
  <div class="manage-experiences">
    <div class="header">
      <h1>Gestionar Experiencias</h1>
      <router-link to="/manage-experiences/create" class="create-button">
        <i class="pi pi-plus"></i> Nueva Experiencia
      </router-link>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      Cargando experiencias...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      {{ error }}
    </div>

    <div v-else>
      <div v-if="experiences.length === 0" class="empty-state">
        <i class="pi pi-info-circle"></i>
        <p>No has creado ninguna experiencia aún</p>
        <router-link to="/manage-experiences/create" class="create-link">
          Crear mi primera experiencia
        </router-link>
      </div>

      <div v-else class="experiences-table">
        <DataTable :value="experiences" :paginator="true" :rows="10"
                  :rowsPerPageOptions="[5,10,20]" responsiveLayout="scroll">
          <Column field="title.value" header="Título">
            <template #body="{ data }">
              <router-link :to="'/experiences/' + data.id.value">
                {{ data.title.value }}
              </router-link>
            </template>
          </Column>
          <Column field="location.value" header="Ubicación" />
          <Column field="price.value" header="Precio">
            <template #body="{ data }">
              {{ data.getFormattedPrice() }}
            </template>
          </Column>
          <Column headerStyle="width:4rem">
            <template #body="{ data }">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-text"
                      @click="editExperience(data.id.value)" />
            </template>
          </Column>
          <Column headerStyle="width:4rem">
            <template #body="{ data }">
              <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                      @click="confirmDelete(data)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Dialog v-model:visible="showDeleteDialog" modal :style="{width: '450px'}"
            header="Confirmar Eliminación">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem" />
        <span>¿Estás seguro de que deseas eliminar esta experiencia?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
        <Button label="Sí" icon="pi pi-check" class="p-button-danger" @click="deleteExperience" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ExperienceService } from '@/Experience/Application/experience.service';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const router = useRouter();
const experienceService = new ExperienceService();

const experiences = ref([]);
const loading = ref(true);
const error = ref(null);
const showDeleteDialog = ref(false);
const experienceToDelete = ref(null);

onMounted(async () => {
  const session = AuthSession.fromStorage();
  if (!session?.isAgency()) {
    router.push('/experiences');
    return;
  }

  await loadExperiences(session.userId);
});

async function loadExperiences(agencyId) {
  try {
    loading.value = true;
    experiences.value = await experienceService.getExperiencesByAgency(agencyId);
  } catch (err) {
    console.error('Error loading experiences:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function editExperience(id) {
  router.push(`/manage-experiences/${id}/edit`);
}

function confirmDelete(experience) {
  experienceToDelete.value = experience;
  showDeleteDialog.value = true;
}

async function deleteExperience() {
  try {
    loading.value = true;
    await experienceService.deleteExperience(experienceToDelete.value.id.value);
    experiences.value = experiences.value.filter(
      exp => exp.id.value !== experienceToDelete.value.id.value
    );
    showDeleteDialog.value = false;
    experienceToDelete.value = null;
  } catch (err) {
    console.error('Error deleting experience:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.manage-experiences {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #047e77;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
}

.create-button:hover {
  background-color: #036c66;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-color-secondary);
}

.loading-state i,
.error-state i,
.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-state {
  color: var(--red-600);
}

.empty-state {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.create-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #047e77;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.create-link:hover {
  background: #036c66;
}

.experiences-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0;
}
</style>
