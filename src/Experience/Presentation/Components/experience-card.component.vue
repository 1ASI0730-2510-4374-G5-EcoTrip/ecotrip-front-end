<template>
  <router-link :to="'/experiences/' + experience.id" class="experience-card">
    <img :src="experience.images[0]" :alt="experience.title.value" class="experience-image">
    <div class="experience-content">
      <div class="experience-header">
        <h3 class="experience-title">{{ experience.title.value }}</h3>
        <span class="experience-price">{{ experience.getFormattedPrice() }}</span>
      </div>
      <p class="experience-location">
        <i class="pi pi-map-marker"></i>
        {{ experience.getLocationText() }}
      </p>
      <p class="experience-duration">
        <i class="pi pi-clock"></i>
        {{ experience.getDurationText() }}
      </p>
      <div class="experience-footer">
        <div class="eco-badge" v-if="experience.isEcoFriendly()">
          <i class="pi pi-leaf"></i> Eco-friendly
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  experience: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.experience-card {
  display: block;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
}

.experience-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.experience-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.experience-content {
  padding: 1.5rem;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.experience-title {
  font-size: 1.25rem;
  margin: 0;
  color: #1e293b;
  flex: 1;
  margin-right: 1rem;
}

.experience-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #047e77;
  white-space: nowrap;
}

.experience-location,
.experience-duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  margin: 0.5rem 0;
}

.experience-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.eco-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ecfdf5;
  color: #047857;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.eco-badge i {
  font-size: 1rem;
}
</style>
