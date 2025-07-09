<template>
  <div class="manage-experiences">
    <div class="header">
      <div>
        <h1>Gestionar Experiencias</h1>
        <p class="subtitle">Administra las experiencias de tu agencia</p>
      </div>
      <button @click="createNewExperience" class="btn-primary">
        <i class="pi pi-plus"></i>
        Nueva Experiencia
      </button>
    </div>

    <div v-if="loading" class="loading">
      <i class="pi pi-spinner pi-spin"></i>
      <span>Cargando experiencias...</span>
    </div>

    <div v-else-if="error" class="error">
      <i class="pi pi-exclamation-triangle"></i>
      <span>{{ error }}</span>
    </div>

    <div v-else class="content">
      <div class="stats">
        <div class="stat-card">
          <div class="stat-number">{{ myExperiences.length }}</div>
          <div class="stat-label">Experiencias</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalReservations }}</div>
          <div class="stat-label">Reservas Totales</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ activeExperiences }}</div>
          <div class="stat-label">Activas</div>
        </div>
      </div>

      <div class="experiences-grid">
        <div v-for="experience in myExperiences" :key="experience.id" class="experience-card">
          <div class="card-image">
            <img :src="getExperienceImage(experience)" :alt="experience.title">
            <div class="card-overlay">
              <div class="actions">
                <button @click="editExperience(experience)" class="btn-action edit">
                  <i class="pi pi-pencil"></i>
                </button>
                <button @click="deleteExperience(experience)" class="btn-action delete">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="card-title">{{ experience.title }}</h3>
            <p class="card-location">
              <i class="pi pi-map-marker"></i>
              {{ experience.location }}
            </p>
            <p class="card-description">{{ truncateDescription(experience.description) }}</p>
            
            <div class="card-meta">
              <span class="difficulty">{{ experience.difficultyLevel || experience.difficulty || 'Moderado' }}</span>
              <span class="price">{{ getFormattedPrice(experience) }}</span>
            </div>
            
            <div class="card-stats">
              <div class="stat">
                <i class="pi pi-calendar"></i>
                <span>{{ getExperienceReservations(experience.id) }} reservas</span>
              </div>
              <div class="stat">
                <i class="pi pi-users"></i>
                <span>Max {{ experience.maxParticipants || experience.maxGroupSize || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="myExperiences.length === 0" class="empty-state">
        <i class="pi pi-calendar-plus"></i>
        <h3>No tienes experiencias creadas</h3>
        <p>Crea tu primera experiencia para empezar a recibir reservas</p>
        <button @click="createNewExperience" class="btn-primary">
          <i class="pi pi-plus"></i>
          Crear primera experiencia
        </button>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button @click="closeDeleteModal" class="btn-close">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que quieres eliminar la experiencia "{{ experienceToDelete?.title }}"?</p>
          <p class="warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-secondary">Cancelar</button>
          <button @click="confirmDelete" class="btn-danger" :disabled="deleting">
            <i class="pi pi-spinner pi-spin" v-if="deleting"></i>
            <span v-else>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ExperienceService } from '../../Application/experience.service';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';

const router = useRouter();
const experienceService = new ExperienceService();

const myExperiences = ref([]);
const reservations = ref([]);
const loading = ref(true);
const error = ref(null);
const showDeleteModal = ref(false);
const experienceToDelete = ref(null);
const deleting = ref(false);

const totalReservations = computed(() => {
  return reservations.value.length;
});

const activeExperiences = computed(() => {
  return myExperiences.value.filter(exp => exp.status !== 'inactive').length;
});

// Load agency experiences
const loadMyExperiences = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const session = AuthSession.fromStorage();
    if (!session?.isAgency()) {
      throw new Error('Acceso denegado: Solo para agencias');
    }
    
    // Cargar todas las experiencias y filtrar por agencia
    const allExperiences = await experienceService.getAllExperiences();
    console.log('[ManageExperiences] All experiences:', allExperiences);
    console.log('[ManageExperiences] Current agency ID:', session.userId);
    
    myExperiences.value = allExperiences.filter(exp => {
      const agencyId = exp.agencyId || exp.agency?.id;
      console.log('[ManageExperiences] Experience agencyId:', agencyId, 'Session userId:', session.userId);
      return agencyId === session.userId;
    });
    
    console.log('[ManageExperiences] Filtered experiences:', myExperiences.value);
    
    // Cargar reservas
    await loadReservations();
    
  } catch (err) {
    console.error('[ManageExperiences] Error loading experiences:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Load reservations for agency experiences
const loadReservations = async () => {
  try {
    const response = await fetch('http://localhost:3003/reservations');
    const allReservations = await response.json();
    
    // Filtrar reservas de experiencias de esta agencia
    const myExperienceIds = myExperiences.value.map(exp => exp.id);
    reservations.value = allReservations.filter(reservation => 
      myExperienceIds.includes(reservation.experienceId)
    );
    
    console.log('[ManageExperiences] My reservations:', reservations.value);
  } catch (err) {
    console.error('[ManageExperiences] Error loading reservations:', err);
  }
};

// Helper functions
const getExperienceImage = (experience) => {
  if (experience.images && experience.images.length > 0) {
    return experience.images[0];
  }
  return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400';
};

const truncateDescription = (description) => {
  if (!description) return 'Sin descripción';
  return description.length > 100 ? description.substring(0, 100) + '...' : description;
};

const getFormattedPrice = (experience) => {
  const price = experience.price;
  if (typeof price === 'object' && price.amount) {
    return `€${price.amount}`;
  }
  return `€${price || 60}`;
};

const getExperienceReservations = (experienceId) => {
  return reservations.value.filter(r => r.experienceId === experienceId).length;
};

// Actions
const createNewExperience = () => {
  router.push('/manage-experiences/create');
};

const editExperience = (experience) => {
  router.push(`/manage-experiences/${experience.id}/edit`);
};

const deleteExperience = (experience) => {
  experienceToDelete.value = experience;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  experienceToDelete.value = null;
};

const confirmDelete = async () => {
  if (!experienceToDelete.value) return;
  
  try {
    deleting.value = true;
    
    const response = await fetch(`http://localhost:3003/experiences/${experienceToDelete.value.id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      // Remover de la lista local
      myExperiences.value = myExperiences.value.filter(
        exp => exp.id !== experienceToDelete.value.id
      );
      
      alert('Experiencia eliminada exitosamente');
      closeDeleteModal();
    } else {
      throw new Error('Error al eliminar la experiencia');
    }
    
  } catch (err) {
    console.error('[ManageExperiences] Error deleting experience:', err);
    alert('Error al eliminar la experiencia');
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  loadMyExperiences();
});
</script>

<style scoped>
.manage-experiences {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  margin: 0.5rem 0 0 0;
}

.btn-primary {
  background: #047e77;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.btn-primary:hover {
  background: #065f5a;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.loading i, .error i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #047e77;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-weight: 600;
}

.experiences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.experience-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.experience-card:hover {
  transform: translateY(-4px);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.experience-card:hover .card-overlay {
  opacity: 1;
}

.actions {
  display: flex;
  gap: 1rem;
}

.btn-action {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.btn-action:hover {
  transform: scale(1.1);
}

.btn-action.edit {
  background: #3b82f6;
  color: white;
}

.btn-action.delete {
  background: #ef4444;
  color: white;
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.card-location {
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
}

.card-description {
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 1rem 0;
}

.difficulty {
  background: #e2e8f0;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #047e77;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 0.875rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #64748b;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 1rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  min-width: 400px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 1.5rem;
}

.warning {
  color: #ef4444;
  font-weight: 600;
  margin-top: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-danger:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .manage-experiences {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .stats {
    grid-template-columns: 1fr;
  }
  
  .experiences-grid {
    grid-template-columns: 1fr;
  }
}
</style>
