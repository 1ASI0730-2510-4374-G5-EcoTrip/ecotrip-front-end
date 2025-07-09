<script setup>
import { onMounted, onBeforeUnmount, computed } from 'vue';
import ReservationsEmergency from "@/Reservations/Presentation/reservations-emergency.component.vue";
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';
import { usePageState } from '@/Shared/Application/page-state.service';

const pageState = usePageState('reservations');

const isAgency = computed(() => {
  const session = AuthSession.fromStorage();
  return session?.isAgency() ?? false;
});

// Guardar estado antes de salir
onBeforeUnmount(() => {
  console.log('[ReservationsView] Saving state before unmount...');
  pageState.saveState({
    scrollPosition: window.scrollY,
    lastVisited: Date.now()
  });
});

// Restaurar estado al montar
onMounted(() => {
  console.log('[ReservationsView] Component mounted, restoring state...');
  if (pageState.hasState()) {
    setTimeout(() => {
      pageState.restoreScroll();
    }, 100);
  }
});
</script>

<template>
  <div class="reservations-page">
    <ReservationsEmergency />
  </div>
</template>

<style scoped>
.reservations-page {
  min-height: 100vh;
  background: #f8f9fa;
}
</style>