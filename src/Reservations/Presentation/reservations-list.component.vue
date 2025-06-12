<script setup>
import { ref, onMounted, computed } from 'vue';
import ReservationListItem from '@/Reservations/Presentation/reservations-list-item.component.vue';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';
import { ReservationsApiService } from '@/Reservations/Application/reservations-api.service.js';
import { Reservation } from '@/Reservations/Domain/reservations.entity.js';

const reservationsService = new ReservationsApiService();
const reservations = ref([]);
const loading = ref(true);
const error = ref(null);

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
  if (!session.value?.isValid()) return;

  try {
    const response = isAgency.value
      ? await reservationsService.getReservationsByAgencyId(session.value.userId)
      : await reservationsService.getReservationsByTouristId(session.value.userId);

    reservations.value = response.data.map(res => new Reservation(res));
  } catch (err) {
    console.error('Error loading reservations:', err);
    error.value = 'Could not load reservations';
  } finally {
    loading.value = false;
  }
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