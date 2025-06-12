<template>
  <div class="star-rating">
    <div class="stars">
      <span
          v-for="index in 5"
          :key="index"
          class="star"
          :class="{ filled: index <= Math.floor(rating), half: index === Math.ceil(rating) && rating % 1 >= 0.5 }"
      >
        <i class="pi pi-star-fill" v-if="index <= Math.floor(rating)"></i>
        <i class="pi pi-star-half" v-else-if="index === Math.ceil(rating) && rating % 1 >= 0.5"></i>
        <i class="pi pi-star" v-else></i>
      </span>
    </div>
    <span v-if="showText" class="rating-text">{{ rating.toFixed(1) }} de 5</span>
  </div>
</template>

<script setup>
defineProps({
  rating: {
    type: Number,
    required: true
  },
  showText: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
  gap: 4px;
  font-size: 1.3rem;
}

.star {
  color: #d1d5db;
}

.star.filled i,
.star.half i {
  color: #facc15;
}

.rating-text {
  font-size: 0.95rem;
  color: #475569;
  font-weight: 500;
}
</style>
