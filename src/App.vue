<script setup>
import { useRoute } from 'vue-router';
import DefaultLayout from '@/Shared/Presentation/DefaultLayout.vue';
import Toast from 'primevue/toast';
const route = useRoute();
</script>

<template>
  <Toast position="top-right" />
  <router-view v-slot="{ Component }">
    <template v-if="route.meta.layout === 'auth'">
      <Component :is="Component" />
    </template>
    <template v-else>
      <DefaultLayout>
        <Component :is="Component" />
      </DefaultLayout>
    </template>
  </router-view>
</template>

<style>
:root {
  font-family: 'Montserrat', Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--surface-ground);
}

#app {
  min-height: 100vh;
}
</style>
