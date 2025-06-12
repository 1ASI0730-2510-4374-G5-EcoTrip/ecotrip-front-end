<script setup>
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import ReservationList from "@/Reservations/Presentation/reservations-list.component.vue";
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';
import { computed } from 'vue';

const isAgency = computed(() => {
  const session = AuthSession.fromStorage();
  return session?.isAgency() ?? false;
});
</script>

<template>
  <div class="p-fluid px-3 py-3 reservations-container">
    <div class="reservations-container-header">
      <h3 class="reservations-tittle">
        {{ isAgency ? 'Reservas recibidas' : 'Mis reservas' }}
      </h3>
    </div>

    <div class="reservations-container-search-revenues">
      <div class="reservations-container-search">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText :placeholder="'Buscar reservas...'" class="search-box" />
        </IconField>
      </div>

      <div v-if="isAgency" class="reservations-container-revenues">
        <div class="reservations-container-revenues-total">
          <h4>Ingresos totales: S/ 2540</h4>
        </div>
      </div>
    </div>
  </div>

  <ReservationList />

</template>

<style scoped>
.reservations-tittle {
  font-size: 2rem;
  padding: 2rem 2.5rem 1rem;
}

.reservations-container-search-revenues {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 1rem 2.5rem;
  width: 100%;
}

.reservations-container-search {
  flex: 1;
}

.search-box {
  width: 100%;
  height: 3.5rem;
  border-radius: 1rem;
}

.reservations-container-revenues {
  flex-shrink: 0;
}

.reservations-container-revenues-total {
  background: #67B7B6;
  padding: 1rem 2rem;
  border-radius: 10px;
}

.reservations-container-revenues-total h4 {
  color: black;
  background: #67B7B6;
  font-size: 1.3rem;
  margin: 0;
}
</style>