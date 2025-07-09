<template>
  <router-link :to="'/experiences/' + experience.id" class="experience-card">
    <div class="image-container">
      <img :src="getImageUrl()" :alt="getTitle()" class="experience-image" @error="onImageError">
      <div class="image-overlay">
        <div class="difficulty-badge">{{ getDifficulty() }}</div>
        <div class="eco-badge" v-if="isEcoFriendly()">
          <i class="pi pi-leaf"></i>
          Eco
        </div>
      </div>
    </div>
    
    <div class="experience-content">
      <div class="experience-header">
        <h3 class="experience-title">{{ getTitle() }}</h3>
        <div class="price-container">
          <span class="experience-price">{{ getFormattedPrice() }}</span>
          <span class="price-per">por persona</span>
        </div>
      </div>
      
      <p class="experience-location">
        <i class="pi pi-map-marker"></i>
        {{ getLocation() }}
      </p>
      
      <p class="experience-duration">
        <i class="pi pi-clock"></i>
        {{ getDurationText() }}
      </p>
      
      <div class="experience-type">
        <i class="pi pi-tag"></i>
        {{ getType() }}
      </div>
      
      <div class="experience-footer">
        <div class="rating-container" v-if="hasRating()">
          <div class="stars">
            <i class="pi pi-star-fill" v-for="star in getFullStars()" :key="'full-' + star"></i>
            <i class="pi pi-star" v-for="star in getEmptyStars()" :key="'empty-' + star"></i>
          </div>
          <span class="rating-text">{{ getRating() }} ({{ getReviewCount() }})</span>
        </div>
        <div class="participants">
          <i class="pi pi-users"></i>
          Máx. {{ getMaxParticipants() }}
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
const props = defineProps({
  experience: {
    type: Object,
    required: true
  }
});

// Helper methods for data extraction
const getTitle = () => {
  return props.experience?.title?.value || props.experience?.title || 'Experiencia';
};

const getImageUrl = () => {
  const images = props.experience?.images;
  if (Array.isArray(images) && images.length > 0) {
    return images[0];
  }
  return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
};

const getLocation = () => {
  return props.experience?.location?.value || props.experience?.location || 'Ubicación no disponible';
};

const getType = () => {
  return props.experience?.type?.value || props.experience?.type || 'Aventura';
};

const getDifficulty = () => {
  return props.experience?.difficultyLevel?.value || props.experience?.difficultyLevel || 'Moderado';
};

const getMaxParticipants = () => {
  return props.experience?.maxParticipants?.value || props.experience?.maxParticipants || '8';
};

const getDurationText = () => {
  const duration = props.experience?.duration;
  if (duration?.value && duration?.unit) {
    const units = {
      'hours': 'horas',
      'days': 'días',
      'minutes': 'minutos'
    };
    return `${duration.value} ${units[duration.unit] || duration.unit}`;
  }
  return 'Duración no disponible';
};

const getFormattedPrice = () => {
  const price = props.experience?.price;
  if (price?.amount && price?.currency) {
    const symbol = price.currency === 'EUR' ? '€' : '$';
    return `${symbol} ${price.amount}`;
  }
  return 'Precio no disponible';
};

const isEcoFriendly = () => {
  return props.experience?.isSustainable === true;
};

const hasRating = () => {
  return props.experience?.rating && props.experience?.reviewCount;
};

const getRating = () => {
  return props.experience?.rating || 0;
};

const getReviewCount = () => {
  return props.experience?.reviewCount || 0;
};

const getFullStars = () => {
  return Math.floor(getRating());
};

const getEmptyStars = () => {
  return 5 - getFullStars();
};

const onImageError = (event) => {
  event.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
};
</script>

<style scoped>
.experience-card {
  display: block;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  border: 1px solid #f1f5f9;
}

.experience-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-color: #e2e8f0;
}

.image-container {
  position: relative;
  overflow: hidden;
}

.experience-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.experience-card:hover .experience-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.difficulty-badge {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.eco-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.experience-content {
  padding: 1.5rem;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.experience-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
  flex: 1;
  line-height: 1.3;
}

.price-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.experience-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #047e77;
  white-space: nowrap;
  line-height: 1;
}

.price-per {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
}

.experience-location,
.experience-duration,
.experience-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  margin: 0.75rem 0;
  font-size: 0.875rem;
}

.experience-location i,
.experience-duration i,
.experience-type i {
  color: #047e77;
  width: 16px;
}

.experience-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  color: #fbbf24;
  font-size: 0.875rem;
}

.rating-text {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.participants {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.participants i {
  color: #047e77;
}

@media (max-width: 768px) {
  .experience-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .price-container {
    align-items: flex-start;
    text-align: left;
  }
  
  .experience-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}
</style>
