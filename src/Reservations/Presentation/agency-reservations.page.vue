<template>
  <div class="agency-reservations">
    <div class="header">
      <div>
        <h1>Mis Reservas</h1>
        <p class="subtitle">Reservas de tus experiencias</p>
      </div>
      <div class="filters">
        <select v-model="selectedStatus" @change="filterReservations" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
        <select v-model="selectedExperience" @change="filterReservations" class="filter-select">
          <option value="">Todas las experiencias</option>
          <option v-for="experience in myExperiences" :key="experience.id" :value="experience.id">
            {{ experience.title }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="pi pi-spinner pi-spin"></i>
      <span>Cargando reservas...</span>
    </div>

    <div v-else-if="error" class="error">
      <i class="pi pi-exclamation-triangle"></i>
      <span>{{ error }}</span>
    </div>

    <div v-else class="content">
      <div class="stats">
        <div class="stat-card">
          <div class="stat-number">{{ reservations.length }}</div>
          <div class="stat-label">Total Reservas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ pendingReservations }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ confirmedReservations }}</div>
          <div class="stat-label">Confirmadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalRevenue }}</div>
          <div class="stat-label">Ingresos Total</div>
        </div>
      </div>

      <div v-if="filteredReservations.length === 0" class="empty-state">
        <i class="pi pi-calendar-times"></i>
        <h3>No hay reservas</h3>
        <p v-if="selectedStatus || selectedExperience">
          No hay reservas que coincidan con los filtros seleccionados.
        </p>
        <p v-else>
          Aún no tienes reservas para tus experiencias.
        </p>
      </div>

      <div v-else class="reservations-list">
        <div
          v-for="reservation in filteredReservations"
          :key="reservation.id"
          class="reservation-card"
          :class="{ 'pending': reservation.status === 'pending', 'confirmed': reservation.status === 'confirmed', 'cancelled': reservation.status === 'cancelled' }"
        >
          <div class="reservation-header">
            <div class="reservation-info">
              <h3 class="experience-title">{{ reservation.experienceTitle }}</h3>
              <p class="reservation-date">
                <i class="pi pi-calendar"></i>
                {{ formatDate(reservation.date) }}
              </p>
              <p class="reservation-location">
                <i class="pi pi-map-marker"></i>
                {{ reservation.experienceLocation }}
              </p>
            </div>
            <div class="reservation-status">
              <span class="status-badge" :class="reservation.status">
                {{ getStatusLabel(reservation.status) }}
              </span>
              <div class="reservation-price">
                €{{ reservation.totalPrice }}
              </div>
            </div>
          </div>

          <div class="reservation-details">
            <div class="customer-info">
              <h4>Información del Cliente</h4>
              <p class="customer-name">
                <i class="pi pi-user"></i>
                {{ getCustomerName(reservation.userId) }}
              </p>
              <p class="participants">
                <i class="pi pi-users"></i>
                {{ reservation.participants }} participante(s)
              </p>
              <p class="booking-date">
                <i class="pi pi-clock"></i>
                Reservado el {{ formatDate(reservation.bookingDate) }}
              </p>
            </div>

            <div class="reservation-actions" v-if="reservation.status === 'pending'">
              <button 
                @click="updateReservationStatus(reservation.id, 'confirmed')"
                class="btn-confirm"
                :disabled="updatingStatus"
              >
                <i class="pi pi-check"></i>
                Confirmar
              </button>
              <button 
                @click="updateReservationStatus(reservation.id, 'cancelled')"
                class="btn-cancel"
                :disabled="updatingStatus"
              >
                <i class="pi pi-times"></i>
                Cancelar
              </button>
            </div>
          </div>

          <div v-if="reservation.customerInfo?.specialRequests" class="special-requests">
            <h4>Solicitudes Especiales</h4>
            <p>{{ reservation.customerInfo.specialRequests }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';
import { ExperienceService } from '@/Experience/Application/experience.service';

const experienceService = new ExperienceService();

const reservations = ref([]);
const myExperiences = ref([]);
const customers = ref([]);
const loading = ref(true);
const error = ref(null);
const updatingStatus = ref(false);

const selectedStatus = ref('');
const selectedExperience = ref('');

const filteredReservations = computed(() => {
  let filtered = [...reservations.value];

  if (selectedStatus.value) {
    filtered = filtered.filter(r => r.status === selectedStatus.value);
  }

  if (selectedExperience.value) {
    filtered = filtered.filter(r => r.experienceId === selectedExperience.value);
  }

  return filtered.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
});

const pendingReservations = computed(() => {
  return reservations.value.filter(r => r.status === 'pending').length;
});

const confirmedReservations = computed(() => {
  return reservations.value.filter(r => r.status === 'confirmed').length;
});

const totalRevenue = computed(() => {
  const total = reservations.value
    .filter(r => r.status === 'confirmed')
    .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  return `€${total}`;
});

const loadAgencyReservations = async () => {
  try {
    loading.value = true;
    error.value = null;

    const session = AuthSession.fromStorage();
    if (!session?.isAgency()) {
      throw new Error('Acceso denegado: Solo para agencias');
    }

    // Cargar experiencias de la agencia
    const allExperiences = await experienceService.getAllExperiences();
    myExperiences.value = allExperiences.filter(exp => {
      const agencyId = exp.agencyId || exp.agency?.id;
      return agencyId === session.userId;
    });

    console.log('[AgencyReservations] My experiences:', myExperiences.value);

    // Cargar todas las reservas
    const reservationsResponse = await fetch('http://localhost:3003/reservations');
    const allReservations = await reservationsResponse.json();

    // Filtrar reservas de experiencias de esta agencia
    const myExperienceIds = myExperiences.value.map(exp => exp.id);
    reservations.value = allReservations.filter(reservation => 
      myExperienceIds.includes(reservation.experienceId)
    );

    console.log('[AgencyReservations] Filtered reservations:', reservations.value);

    // Cargar información de clientes
    const customersResponse = await fetch('http://localhost:3003/users');
    const allCustomers = await customersResponse.json();
    customers.value = allCustomers.filter(user => user.role === 'tourist');

  } catch (err) {
    console.error('[AgencyReservations] Error loading reservations:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const updateReservationStatus = async (reservationId, newStatus) => {
  try {
    updatingStatus.value = true;

    const response = await fetch(`http://localhost:3003/reservations/${reservationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      // Actualizar el estado local
      const index = reservations.value.findIndex(r => r.id === reservationId);
      if (index !== -1) {
        reservations.value[index].status = newStatus;
      }
      
      // Mostrar confirmación
      const action = newStatus === 'confirmed' ? 'confirmada' : 'cancelada';
      alert(`Reserva ${action} exitosamente`);
    } else {
      throw new Error('Error al actualizar el estado de la reserva');
    }

  } catch (err) {
    console.error('[AgencyReservations] Error updating reservation:', err);
    alert('Error al actualizar el estado de la reserva');
  } finally {
    updatingStatus.value = false;
  }
};

const getCustomerName = (userId) => {
  const customer = customers.value.find(c => c.id === userId);
  return customer?.name || 'Cliente no encontrado';
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada'
  };
  return labels[status] || status;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const filterReservations = () => {
  // Los filtros se manejan automáticamente via computed
};

onMounted(() => {
  loadAgencyReservations();
});
</script>

<style scoped>
.agency-reservations {
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

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #1e293b;
  font-size: 0.875rem;
}

.filter-select:focus {
  outline: none;
  border-color: #047e77;
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
  font-size: 2rem;
  font-weight: 700;
  color: #047e77;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
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

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reservation-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border-left: 4px solid #e2e8f0;
}

.reservation-card.pending {
  border-left-color: #f59e0b;
}

.reservation-card.confirmed {
  border-left-color: #10b981;
}

.reservation-card.cancelled {
  border-left-color: #ef4444;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.experience-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.reservation-date,
.reservation-location {
  color: #64748b;
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reservation-status {
  text-align: right;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.reservation-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #047e77;
}

.reservation-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.customer-info h4 {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.customer-name,
.participants,
.booking-date {
  color: #64748b;
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reservation-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-confirm,
.btn-cancel {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-confirm {
  background: #10b981;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #059669;
}

.btn-cancel {
  background: #ef4444;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background: #dc2626;
}

.btn-confirm:disabled,
.btn-cancel:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.special-requests {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  margin-top: 1rem;
}

.special-requests h4 {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.special-requests p {
  color: #64748b;
  margin: 0;
  font-style: italic;
}

@media (max-width: 768px) {
  .agency-reservations {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .filters {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .stats {
    grid-template-columns: 1fr;
  }
  
  .reservation-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .reservation-status {
    text-align: left;
  }
  
  .reservation-details {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
