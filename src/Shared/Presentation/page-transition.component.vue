<template>
  <transition 
    :name="transitionName"
    mode="out-in"
    @before-enter="beforeEnter"
    @enter="enter"
    @leave="leave"
  >
    <slot />
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const transitionName = ref('fade')

// Determinar el tipo de transición basado en la navegación
const determineTransition = (to, from) => {
  if (!from || !to) return 'fade'
  
  // Navegación entre secciones principales
  const sections = [
    '/experiences',
    '/manage-experiences', 
    '/reservations',
    '/tourist/profile',
    '/agency/profile'
  ]
  
  const fromSection = sections.find(section => from.startsWith(section))
  const toSection = sections.find(section => to.startsWith(section))
  
  if (fromSection && toSection && fromSection !== toSection) {
    return 'slide'
  }
  
  // Navegación dentro de la misma sección
  if (fromSection && toSection && fromSection === toSection) {
    return 'fade'
  }
  
  return 'fade'
}

// Watch para cambios de ruta
watch(() => route.path, (newPath, oldPath) => {
  transitionName.value = determineTransition(newPath, oldPath)
})

// Hooks de transición
const beforeEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateY(20px)'
}

const enter = (el, done) => {
  el.offsetHeight // force reflow
  el.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
  el.style.opacity = '1'
  el.style.transform = 'translateY(0)'
  setTimeout(done, 300)
}

const leave = (el, done) => {
  el.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
  el.style.opacity = '0'
  el.style.transform = 'translateY(-20px)'
  setTimeout(done, 300)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
