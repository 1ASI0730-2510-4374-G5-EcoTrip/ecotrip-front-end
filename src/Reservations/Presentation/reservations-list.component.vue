<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import ReservationListItem from '@/Reservations/Presentation/reservations-list-item.component.vue';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';
import { ReservationsApiService } from '@/Reservations/Application/reservations-api.service.js';
import { Reservation } from '@/Reservations/Domain/reservations.entity.js';
import { usePageState } from '@/Shared/Application/page-state.service';

const reservationsService = new ReservationsApiService();
const reservations = ref([]);
const loading = ref(true);
const error = ref(null);
const pageState = usePageState('reservations');

const session = computed(() => AuthSession.fromStorage());
const isAgency = computed(() => session.value?.isAgency() ?? false);

const filteredReservations = computed(() => {
  return reservations.value.sort((a, b) => b.date - a.date);
});

async function handleStatusChange(reservationId, newStatus) {
  try {
    await reservationsService.updateReservationStatus(reservationId, newStatus);
    const index = reservations.value.findIndex(r => r.id === reservationId);
    if (index !== -1) {
      reservations.value[index].status = newStatus;
    }
  } catch (err) {
    console.error('Error updating reservation status:', err);
    alert('Could not update reservation status');
  }
}

onMounted(async () => {
  console.log('[ReservationsList] Component mounted, loading reservations...');
  
  if (!session.value?.isValid()) {
    console.log('[ReservationsList] No valid session, skipping load');
    loading.value = false;
    return;
  }

  // Verificar si hay datos cacheados
  const cachedData = pageState.getData();
  if (cachedData && cachedData.length > 0) {
    console.log('[ReservationsList] Using cached data');
    reservations.value = cachedData;
    loading.value = false;
    return;
  }

  // Timeout para evitar que se cuelgue la carga
  const timeoutId = setTimeout(() => {
    console.log('[ReservationsList] Loading timeout reached, setting empty state');
    if (loading.value) {
      loading.value = false;
      error.value = 'La carga de reservas tomó demasiado tiempo';
      reservations.value = [];
    }
  }, 8000); // 8 segundos timeout

  try {
    const response = isAgency.value
      ? await reservationsService.getReservationsByAgencyId(session.value.userId)
      : await reservationsService.getReservationsByTouristId(session.value.userId);

    clearTimeout(timeoutId); // Limpiar timeout si la carga fue exitosa

    if (response.error) {
      console.log('[ReservationsList] API returned error:', response.error);
      error.value = response.error;
      reservations.value = [];
    } else {
      reservations.value = response.data.map(res => new Reservation(res));
      // Guardar en cache
      pageState.saveData(reservations.value);
    }
    
  } catch (err) {
    clearTimeout(timeoutId); // Limpiar timeout si hubo error
    console.error('Error loading reservations:', err);
    
    // Usar el manejo de errores del pageState
    pageState.handleError(err);
    
    error.value = 'Could not load reservations';
    reservations.value = [];
  } finally {
    loading.value = false;
  }
});

// Limpiar cualquier subscription o timer antes de desmontar
onBeforeUnmount(() => {
  console.log('[ReservationsList] Component unmounting, saving data...');
  pageState.saveData(reservations.value);
});
</script>

<template>
  <div class="reservations-list">
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner loading-icon"></i>
      <p>Loading reservations...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle error-icon"></i>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="filteredReservations.length === 0" class="empty-state">
      <i class="pi pi-calendar-times empty-icon"></i>
      <p>{{ isAgency ? 'No hay reservas pendientes' : 'Aún no tienes reservas' }}</p>
    </div>
    
    <ReservationListItem 
      v-else
      v-for="reservation in filteredReservations"
      :key="reservation.id"
      :name="isAgency ? reservation.tourist.name : reservation.agency.name"
      :date="reservation.formattedDate"
      :experience="reservation.experience.name"
      :people="reservation.numberOfPeople"
      :total-paid="reservation.totalPrice"
      :status="reservation.status"
      :show-actions="isAgency"
      @confirm="handleStatusChange(reservation.id, 'confirmed')"
      @cancel="handleStatusChange(reservation.id, 'cancelled')"
    />
  </div>
</template>

<style scoped>
.reservations-list {
  padding: 1rem 2rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  background: #f9fafb;
  border-radius: 12px;
  margin: 2rem;
  color: var(--text-color-secondary);
}

.loading-icon,
.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-icon {
  color: var(--primary-color);
}

.error-icon {
  color: var(--red-500);
}

.empty-icon {
  color: #9ca3af;
}

.error-state p {
  color: var(--red-600);
}

.empty-state p {
  color: #4b5563;
  font-size: 1.1rem;
}
</style>