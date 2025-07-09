<script setup>
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import DefaultLayout from '@/Shared/Presentation/DefaultLayout.vue';
import PageTransition from '@/Shared/Presentation/page-transition.component.vue';
import Toast from 'primevue/toast';

const route = useRoute();

// Watch for route changes to help with debugging
watch(() => route.path, (newPath, oldPath) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Route changed from ${oldPath} to ${newPath}`);
  }
}, { immediate: true });
</script>

<template>
  <Toast position="top-right" />
  <router-view v-slot="{ Component, route }">
    <template v-if="route.meta.layout === 'auth'">
      <PageTransition>
        <Component :is="Component" :key="route.fullPath" />
      </PageTransition>
    </template>
    <template v-else>
      <DefaultLayout>
        <PageTransition>
          <Component :is="Component" :key="route.fullPath" />
        </PageTransition>
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
