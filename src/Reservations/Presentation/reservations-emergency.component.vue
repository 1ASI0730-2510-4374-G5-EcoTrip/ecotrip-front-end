<template>
  <div class="reservations-emergency">
    <div class="header">
      <h2>{{ isAgency ? 'Reservas recibidas' : 'Mis reservas' }}</h2>
      <button @click="refreshReservations" class="refresh-button" :disabled="loading">
        <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
        Actualizar
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <i class="pi pi-spinner pi-spin"></i>
        <span>Cargando reservas...</span>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-message">
        <i class="pi pi-exclamation-triangle"></i>
        <span>{{ error }}</span>
      </div>
      <button @click="refreshReservations" class="retry-button">
        <i class="pi pi-refresh"></i>
        Reintentar
      </button>
    </div>

    <div v-else-if="reservations.length === 0" class="empty-state">
      <div class="empty-message">
        <i class="pi pi-calendar"></i>
        <h3>No tienes reservas</h3>
        <p>{{ isAgency ? 'Aún no has recibido reservas' : 'No has realizado ninguna reserva' }}</p>
      </div>
    </div>

    <div v-else class="reservations-list">
      <div v-for="reservation in reservations" :key="reservation.id" class="reservation-card">
        <div class="reservation-header">
          <h4>{{ reservation.experienceTitle || 'Experiencia' }}</h4>
          <span class="status" :class="getStatusClass(reservation.status)">
            {{ getStatusText(reservation.status) }}
          </span>
        </div>
        
        <div class="reservation-details">
          <div class="detail-item">
            <i class="pi pi-calendar"></i>
            <span>{{ formatDate(reservation.date) }}</span>
          </div>
          <div class="detail-item">
            <i class="pi pi-users"></i>
            <span>{{ reservation.participants }} personas</span>
          </div>
          <div class="detail-item">
            <i class="pi pi-dollar"></i>
            <span>{{ formatPrice(reservation.totalPrice) }}</span>
          </div>
        </div>
        
        <div v-if="isAgency" class="reservation-actions">
          <button @click.stop="updateStatus(reservation.id, 'confirmed')" 
                  :disabled="reservation.status === 'confirmed'"
                  class="action-button confirm">
            <i class="pi pi-check"></i>
            Confirmar
          </button>
          <button @click.stop="updateStatus(reservation.id, 'cancelled')" 
                  :disabled="reservation.status === 'cancelled'"
                  class="action-button cancel">
            <i class="pi pi-times"></i>
            Cancelar
          </button>
        </div>
        <div v-else class="reservation-actions">
          <button @click.stop="cancelReservation(reservation.id)" 
                  :disabled="reservation.status === 'cancelled'"
                  class="action-button cancel">
            <i class="pi pi-times"></i>
            Cancelar Reserva
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';
import { usePageState } from '@/Shared/Application/page-state.service';

const pageState = usePageState('reservations');
const reservations = ref([]);
const loading = ref(false);
const error = ref(null);

const session = computed(() => AuthSession.fromStorage());
const isAgency = computed(() => session.value?.isAgency() ?? false);

// Datos de ejemplo para evitar bloqueos
const mockReservations = [
  {
    id: 1,
    experienceTitle: 'Senderismo en la Cordillera',
    date: '2024-08-15',
    participants: 2,
    totalPrice: 120,
    status: 'confirmed'
  },
  {
    id: 2,
    experienceTitle: 'Avistamiento de Aves',
    date: '2024-08-20',
    participants: 3,
    totalPrice: 180,
    status: 'pending'
  }
];

const refreshReservations = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    console.log('[ReservationsEmergency] Loading reservations from API...');
    
    // Intentar cargar desde la API real
    const response = await fetch('http://localhost:3003/reservations');
    
    if (response.ok) {
      const data = await response.json();
      console.log('[ReservationsEmergency] Loaded reservations:', data);
      
      // Filtrar reservas según el usuario
      const userReservations = data.filter(reservation => {
        if (isAgency.value) {
          return reservation.agencyId === session.value.userId;
        } else {
          return reservation.userId === session.value.userId;
        }
      });
      
      reservations.value = userReservations;
      
    } else {
      console.log('[ReservationsEmergency] API not available, using mock data');
      reservations.value = mockReservations;
    }
    
    // Guardar en cache
    pageState.saveData(reservations.value);
    
  } catch (err) {
    console.error('Error loading reservations:', err);
    console.log('[ReservationsEmergency] Using mock data as fallback');
    reservations.value = mockReservations;
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (reservationId, newStatus) => {
  console.log(`[ReservationsEmergency] Updating reservation ${reservationId} to ${newStatus}`);
  
  const reservation = reservations.value.find(r => r.id === reservationId);
  if (reservation) {
    const previousStatus = reservation.status;
    reservation.status = newStatus;
    
    try {
      // Intentar actualizar en la API
      const response = await fetch(`http://localhost:3003/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        console.log(`[ReservationsEmergency] Successfully updated reservation ${reservationId} to ${newStatus}`);
        
        // Guardar estado actualizado
        pageState.saveData(reservations.value);
        
        // Mostrar mensaje de confirmación
        alert(`Reserva ${newStatus === 'confirmed' ? 'confirmada' : 'cancelada'} exitosamente`);
        
      } else {
        throw new Error('API response not ok');
      }
      
    } catch (error) {
      console.error('Error updating reservation:', error);
      // Revertir cambio en caso de error
      reservation.status = previousStatus;
      alert('Error al actualizar la reserva. Por favor intenta de nuevo.');
    }
  }
};

const cancelReservation = async (reservationId) => {
  console.log(`[ReservationsEmergency] Cancelling reservation ${reservationId}`);
  
  if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
    await updateStatus(reservationId, 'cancelled');
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatPrice = (price) => {
  return `S/ ${price}`;
};

const getStatusClass = (status) => {
  switch (status) {
    case 'confirmed': return 'status-confirmed';
    case 'cancelled': return 'status-cancelled';
    case 'pending': return 'status-pending';
    default: return 'status-unknown';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'confirmed': return 'Confirmada';
    case 'cancelled': return 'Cancelada';
    case 'pending': return 'Pendiente';
    default: return 'Desconocido';
  }
};

onMounted(async () => {
  // Verificar datos en cache
  const cachedData = pageState.getData();
  if (cachedData && cachedData.length > 0) {
    reservations.value = cachedData;
  } else {
    await refreshReservations();
  }
});
</script>

<style scoped>
.reservations-emergency {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  color: #1f2937;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #047e77;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background: #065f5a;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  color: #6b7280;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.empty-message {
  color: #6b7280;
}

.empty-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.reservations-list {
  display: grid;
  gap: 1.5rem;
}

.reservation-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reservation-header h4 {
  margin: 0;
  color: #1f2937;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.reservation-details {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.reservation-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.confirm {
  background: #10b981;
  color: white;
}

.action-button.confirm:hover:not(:disabled) {
  background: #059669;
}

.action-button.cancel {
  background: #ef4444;
  color: white;
}

.action-button.cancel:hover:not(:disabled) {
  background: #dc2626;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
  }

  .reservation-details {
    flex-direction: column;
    gap: 0.5rem;
  }

  .reservation-actions {
    justify-content: center;
  }
}
</style>
