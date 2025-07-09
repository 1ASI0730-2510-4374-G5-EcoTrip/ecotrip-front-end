<template>
  <div class="experience-details">
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      Cargando experiencia...
    </div>

    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      {{ error }}
    </div>

    <div v-else class="content">
      <!-- Navegación -->
      <div class="navigation-section">
        <button @click="goBack" class="back-button">
          <i class="pi pi-arrow-left"></i>
          Regresar a experiencias
        </button>
      </div>

      <!-- Hero Section -->
      <div class="hero-section">
        <div class="image-gallery">
          <img :src="getMainImage()" :alt="getTitle()" class="main-image" @error="onImageError">
          <div class="image-thumbnails" v-if="experience.images && experience.images.length > 1">
            <img v-for="(image, index) in experience.images.slice(1, 4)" 
                 :key="index"
                 :src="image"
                 :alt="`${getTitle()} - imagen ${index + 2}`"
                 class="thumbnail"
                 @click="changeMainImage(image)"
                 @error="onImageError">
          </div>
        </div>
        
        <div class="hero-info">
          <div class="badges">
            <span class="eco-badge" v-if="experience.isSustainable">
              <i class="pi pi-leaf"></i> Eco-friendly
            </span>
            <span class="difficulty-badge">{{ getDifficulty() }}</span>
          </div>
          
          <h1 class="title">{{ getTitle() }}</h1>
          
          <div class="meta-info">
            <div class="meta-item">
              <i class="pi pi-map-marker"></i>
              <span>{{ getLocation() }}</span>
            </div>
            <div class="meta-item">
              <i class="pi pi-clock"></i>
              <span>{{ getDurationText() }}</span>
            </div>
            <div class="meta-item">
              <i class="pi pi-users"></i>
              <span>Máximo {{ experience.maxParticipants }} personas</span>
            </div>
          </div>
          
          <div class="rating-section" v-if="experience.rating">
            <div class="stars">
              <i class="pi pi-star-fill" v-for="star in getFullStars()" :key="'full-' + star"></i>
              <i class="pi pi-star" v-for="star in getEmptyStars()" :key="'empty-' + star"></i>
            </div>
            <span class="rating-text">{{ experience.rating }} ({{ experience.reviewCount }} reseñas)</span>
          </div>
        </div>
      </div>

      <div class="main-content">
        <!-- Description Section -->
        <div class="content-section">
          <div class="left-column">
            <section class="description-section">
              <h2>Sobre esta experiencia</h2>
              <p class="description">{{ getDescription() }}</p>
            </section>

            <!-- What's Included -->
            <section class="included-section">
              <h3>¿Qué incluye?</h3>
              <ul class="included-list">
                <li v-for="(item, index) in experience.includedItems" :key="index">
                  <i class="pi pi-check"></i>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>

            <!-- Requirements -->
            <section class="requirements-section" v-if="experience.requirements">
              <h3>Requisitos</h3>
              <ul class="requirements-list">
                <li v-for="(req, index) in experience.requirements" :key="index">
                  <i class="pi pi-info-circle"></i>
                  <span>{{ req }}</span>
                </li>
              </ul>
            </section>

            <!-- Sustainability -->
            <section class="sustainability-section" v-if="experience.isSustainable">
              <h3>Compromiso con la sostenibilidad</h3>
              <div class="sustainability-content">
                <div class="certifications" v-if="experience.ecoCertifications">
                  <h4>Certificaciones:</h4>
                  <div class="cert-badges">
                    <span v-for="cert in experience.ecoCertifications" :key="cert" class="cert-badge">
                      {{ cert }}
                    </span>
                  </div>
                </div>
                
                <div class="practices" v-if="experience.sustainablePractices">
                  <h4>Prácticas sostenibles:</h4>
                  <ul>
                    <li v-for="practice in experience.sustainablePractices" :key="practice">
                      {{ practice }}
                    </li>
                  </ul>
                </div>
                
                <div class="community-impact" v-if="experience.localCommunityImpact">
                  <h4>Impacto en la comunidad local:</h4>
                  <p>{{ experience.localCommunityImpact }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Booking Card -->
          <div class="booking-card">
            <div class="price-section">
              <span class="price">{{ getFormattedPrice() }}</span>
              <span class="price-unit">por persona</span>
            </div>

            <div class="booking-form">
              <div class="form-group">
                <label>Fecha</label>
                <select v-model="selectedDate" class="date-select">
                  <option value="">Selecciona una fecha</option>
                  <option v-for="date in getAvailableDates()" :key="date" :value="date">
                    {{ formatDate(date) }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Número de personas</label>
                <div class="counter">
                  <button @click="decrementParticipants" :disabled="participants <= 1">-</button>
                  <span>{{ participants }}</span>
                  <button @click="incrementParticipants" :disabled="participants >= experience.maxParticipants">+</button>
                </div>
              </div>

              <div class="total-section">
                <div class="total-breakdown">
                  <div class="breakdown-item">
                    <span>{{ getFormattedPrice() }} × {{ participants }} personas</span>
                    <span>{{ getFormattedTotal() }}</span>
                  </div>
                </div>
                <div class="total-final">
                  <strong>Total: {{ getFormattedTotal() }}</strong>
                </div>
              </div>

              <button 
                class="book-button" 
                @click="bookExperience"
                :disabled="!selectedDate || bookingLoading"
              >
                <i class="pi pi-spin pi-spinner" v-if="bookingLoading"></i>
                <span v-else>{{ isLoggedIn ? 'Reservar ahora' : 'Inicia sesión para reservar' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ExperienceService } from '../../Application/experience.service';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';

const route = useRoute();
const router = useRouter();
const experienceService = new ExperienceService();

const experience = ref(null);
const loading = ref(true);
const error = ref(null);

// Booking form state
const selectedDate = ref('');
const participants = ref(1);
const bookingLoading = ref(false);
const mainImage = ref('');

// Función para regresar manteniendo el estado
const goBack = () => {
  router.push('/experiences');
};

const isLoggedIn = computed(() => {
  const session = AuthSession.fromStorage();
  return session?.isValid();
});

const isAgencyOwner = computed(() => {
  const session = AuthSession.fromStorage();
  return session?.isAgency() && experience.value?.agencyId === session.userId;
});

onMounted(async () => {
  try {
    loading.value = true;
    experience.value = await experienceService.getExperienceById(route.params.id);
    mainImage.value = getMainImage();
  } catch (err) {
    console.error('Error loading experience:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

// Helper functions
function getExperienceId() {
  return experience.value?.id?.value || experience.value?.id;
}

function getTitle() {
  return experience.value?.title?.value || experience.value?.title || 'Experiencia';
}

function getDescription() {
  return experience.value?.description || 'Descripción no disponible';
}

function getLocation() {
  return experience.value?.location?.value || experience.value?.location || 'Ubicación no disponible';
}

function getDifficulty() {
  return experience.value?.difficultyLevel?.value || experience.value?.difficultyLevel || 'Moderado';
}

function getDurationText() {
  const duration = experience.value?.duration;
  if (duration?.value && duration?.unit) {
    const units = {
      'hours': 'horas',
      'days': 'días',
      'minutes': 'minutos'
    };
    return `${duration.value} ${units[duration.unit] || duration.unit}`;
  }
  return 'Duración no disponible';
}

function getFormattedPrice() {
  const price = experience.value?.price;
  if (price?.amount && price?.currency) {
    const symbol = price.currency === 'EUR' ? '€' : '$';
    return `${symbol}${price.amount}`;
  }
  return 'Precio no disponible';
}

function getFormattedTotal() {
  const price = experience.value?.price;
  if (price?.amount && price?.currency) {
    const symbol = price.currency === 'EUR' ? '€' : '$';
    const total = price.amount * participants.value;
    return `${symbol}${total}`;
  }
  return 'Total no disponible';
}

function getMainImage() {
  const images = experience.value?.images;
  if (Array.isArray(images) && images.length > 0) {
    return images[0];
  }
  return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
}

function changeMainImage(newImage) {
  mainImage.value = newImage;
}

function onImageError(event) {
  event.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
}

function getAvailableDates() {
  return experience.value?.availableDates || [];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getFullStars() {
  return Math.floor(experience.value?.rating || 0);
}

function getEmptyStars() {
  return 5 - getFullStars();
}

function incrementParticipants() {
  if (participants.value < experience.value?.maxParticipants) {
    participants.value++;
  }
}

function decrementParticipants() {
  if (participants.value > 1) {
    participants.value--;
  }
}

async function bookExperience() {
  console.log('[ExperienceDetails] Book experience clicked');
  
  if (!isLoggedIn.value) {
    console.log('[ExperienceDetails] User not logged in, redirecting to login');
    router.push('/login');
    return;
  }

  if (!selectedDate.value) {
    alert('Por favor selecciona una fecha');
    return;
  }

  try {
    bookingLoading.value = true;
    const session = AuthSession.fromStorage();
    
    const reservationData = {
      experienceId: getExperienceId(),
      userId: session.userId,
      agencyId: experience.value.agencyId,
      date: selectedDate.value,
      participants: participants.value,
      totalPrice: experience.value.price.amount * participants.value,
      status: 'pending',
      bookingDate: new Date().toISOString(),
      experienceTitle: getTitle(),
      experienceLocation: getLocation(),
      experienceDuration: getDurationText()
    };

    console.log('[ExperienceDetails] Creating reservation:', reservationData);

    // Hacer la reserva usando el httpClient
    const response = await fetch('http://localhost:3003/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('[ExperienceDetails] Reservation created successfully:', result);
      
      alert('¡Reserva realizada con éxito!');
      
      // Resetear formulario
      selectedDate.value = '';
      participants.value = 1;
      
      // Opcional: redirigir a reservas
      router.push('/reservations');
    } else {
      throw new Error('Error al crear la reserva');
    }
    
  } catch (error) {
    console.error('[ExperienceDetails] Error booking experience:', error);
    alert('Error al realizar la reserva. Inténtalo de nuevo.');
  } finally {
    bookingLoading.value = false;
  }
}

function editExperience() {
  router.push(`/manage-experiences/${getExperienceId()}/edit`);
}
</script>

<style scoped>
.experience-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem;
  color: #64748b;
}

.loading-state i,
.error-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.error-state {
  color: #ef4444;
}

.hero-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.image-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-thumbnails {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.thumbnail {
  width: 100px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.thumbnail:hover {
  border-color: #047e77;
  transform: scale(1.05);
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.eco-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
}

.difficulty-badge {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  font-size: 1rem;
}

.meta-item i {
  color: #047e77;
  font-size: 1.125rem;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  color: #fbbf24;
  font-size: 1.125rem;
}

.rating-text {
  color: #64748b;
  font-weight: 500;
}

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}

.content-section {
  display: contents;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.left-column section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.left-column h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.left-column h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.left-column h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.description {
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.included-list,
.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.included-list li,
.requirements-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #64748b;
}

.included-list i {
  color: #10b981;
  font-size: 1rem;
}

.requirements-list i {
  color: #3b82f6;
  font-size: 1rem;
}

.cert-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.cert-badge {
  padding: 0.25rem 0.75rem;
  background: #ecfdf5;
  color: #047857;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.practices ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.practices li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.practices li:last-child {
  border-bottom: none;
}

.booking-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.price-section {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.price {
  font-size: 2.5rem;
  font-weight: 800;
  color: #047e77;
  display: block;
  margin-bottom: 0.5rem;
}

.price-unit {
  color: #64748b;
  font-size: 1rem;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.date-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #374151;
}

.date-select:focus {
  outline: none;
  border-color: #047e77;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem;
}

.counter button {
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 600;
  transition: all 0.2s;
}

.counter button:hover:not(:disabled) {
  background: #047e77;
  color: white;
}

.counter button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.counter span {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.total-section {
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #64748b;
}

.total-final {
  display: flex;
  justify-content: space-between;
  font-size: 1.125rem;
  color: #1e293b;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.book-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #047e77 0%, #10b981 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.book-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(4, 126, 119, 0.3);
}

.book-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .experience-details {
    padding: 1rem;
  }
  
  .hero-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .main-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .meta-info {
    gap: 0.75rem;
  }
  
  .image-thumbnails {
    flex-wrap: wrap;
  }
  
  .thumbnail {
    width: 80px;
    height: 60px;
  }
  
  .booking-card {
    position: static;
    margin-top: 2rem;
  }
  
  .left-column section {
    padding: 1.5rem;
  }
}

.hero-section {
  margin-bottom: 2rem;
}

.main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.thumbnail-list {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.thumbnail:hover {
  opacity: 0.8;
}

.details {
  max-width: 800px;
  margin: 0 auto;
}

.eco-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ecfdf5;
  color: #047857;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 2rem;
}

h2 {
  color: #1e293b;
  margin-bottom: 1rem;
}

.info-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.included i {
  color: #047e77;
}

.not-included i {
  color: #dc2626;
}

.important-info {
  padding: 1rem;
  background: #fef3c7;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .info-columns {
    grid-template-columns: 1fr;
  }

  .meta-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
  }

  .actions {
    align-self: flex-end;
  }
}

.navigation-section {
  margin-bottom: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.back-button:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.back-button i {
  font-size: 1rem;
}
</style>