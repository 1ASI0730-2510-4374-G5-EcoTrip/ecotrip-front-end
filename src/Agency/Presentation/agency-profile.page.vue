<template>
  <div class="agency-profile">
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spinner pi-spin"></i>
      {{ t('common.loading') }}
    </div>
    
    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      {{ error }}
    </div>
    
    <div v-else>
      <div class="header">
        <h1 class="agency-name">{{ agency.name }}</h1>
        <button class="add-experience-button" @click="editing = true">
          {{ t('agencyProfile.edit') }}
        </button>
      </div>

      <div class="content-grid">
        <div class="main-col">
          <p class="tax-id"><strong>RUC / NIT:</strong> {{ agency.taxId }}</p>
          <p class="description">{{ agency.description }}</p>

          <div class="stats">
            <div class="stat-item">
              <div class="stat-number">{{ agency.rating.toFixed(1) }}</div>
              <div class="stat-stars">
                <StarRating :rating="agency.rating" />
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-number">{{ agency.reviewCount }}</div>
              <div class="stat-label">{{ t('agencyProfile.reviews') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ agency.reservationCount }}</div>
              <div class="stat-label">{{ t('agencyProfile.reservations') }}</div>
            </div>
          </div>

          <!-- Reseñas -->
          <div class="reviews">
            <div
                v-for="rev in agency.reviews.slice(0, 2)"
                :key="rev.id"
                class="review-item"
            >
              <Avatar :image="rev.avatar" shape="circle" size="large" />
              <div class="review-content">
                <div class="review-header">
                  <span class="reviewer">{{ rev.name }}</span>
                  <span class="review-date">{{ rev.date }}</span>
                </div>
                <StarRating :rating="rev.rating" />
                <p class="review-text">{{ rev.comment }}</p>
              </div>
            </div>
            <a href="#" class="view-more" @click.prevent="showReviews = true">
              {{ t('agencyProfile.viewMore') }} &rsaquo;
            </a>
          </div>
        </div>

        <div class="side-col">
          <img :src="agency.avatarUrl" alt="Logo Agencia" class="agency-logo" />
          <p class="contact">{{ agency.contact.email }}</p>
          <p class="contact">{{ agency.contact.phone }}</p>
          <div class="social-icons">
            <a :href="agency.socialLinks.facebook" target="_blank">
              <i class="pi pi-facebook pi-2x"></i>
            </a>
            <a :href="agency.socialLinks.instagram" target="_blank">
              <i class="pi pi-instagram pi-2x"></i>
            </a>
            <a :href="agency.socialLinks.whatsapp" target="_blank">
              <i class="pi pi-whatsapp pi-2x"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="editing" modal :closable="false" :style="{ width: '600px' }">
      <template #header>
        <h2 class="dialog-title">{{ t('agencyProfile.editprofile') }}</h2>
      </template>
      <AgencyForm :agency="agency" @cancel="editing = false" @saved="onSaved" />
    </Dialog>

    <Dialog v-model:visible="showReviews" modal :style="{ width: '600px' }" :closable="true">
      <template #header>
        <h2 class="dialog-title">{{ t('agencyProfile.reviewsTitle') }}</h2>
      </template>

      <div v-if="agency.reviews.length" class="review-summary">
        <div class="rating-left">
          <span class="rating-number">{{ agency.rating.toFixed(1) }}</span>
          <StarRating :rating="agency.rating" :showText="true" />
        </div>
        <div class="rating-right">
          <span class="review-count">{{ agency.reviewCount }} {{ t('agencyProfile.reviews') }}</span>
        </div>
      </div>

      <hr />

      <div class="review-list">
        <div v-for="rev in agency.reviews" :key="rev.id" class="review-item">
          <Avatar :image="rev.avatar" shape="circle" size="large" />
          <div class="review-content">
            <div class="review-header">
              <strong>{{ rev.name }}</strong>
              <small>{{ rev.date }}</small>
            </div>
            <StarRating :rating="rev.rating" />
            <p class="review-text">{{ rev.comment }}</p>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import Avatar from "primevue/avatar";
import Dialog from "primevue/dialog";
import StarRating from "./StarRating.vue";
import AgencyForm from "./agency-form.component.vue";
import { AgenciesApiService } from "@/Agency/Application/agencies-api.service.js";
import { ReviewsApiService } from "@/Agency/Application/reviews-api.service.js";
import { AuthSession } from "@/Auth/Domain/auth-session.aggregate.js";
import { useRouter } from "vue-router";

const router = useRouter();
const { t } = useI18n();

const agency = ref({
  id: "",
  name: "",
  taxId: "",
  description: "",
  rating: 0,
  reviewCount: 0,
  reservationCount: 0,
  avatarUrl: "",
  contact: { email: "", phone: "" },
  socialLinks: { facebook: "", instagram: "", whatsapp: "" },
  reviews: [],
});

const editing = ref(false);
const showReviews = ref(false);
const loading = ref(true);
const error = ref(null);

const agencyService = new AgenciesApiService();
const reviewService = new ReviewsApiService();

onBeforeMount(async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const session = AuthSession.fromStorage();
    if (!session?.isValid()) {
      await router.push('/login');
      return;
    }

    if (!session.isAgency()) {
      await router.push('/experiences');
      return;
    }

    if (!session.userId) {
      throw new Error('No valid session found');
    }

    const resp = await agencyService.getProfile(session.userId);
    if (!resp.data) {
      throw new Error('Agency profile not found');
    }
    
    const data = resp.data;

    const reviewsResp = await reviewService.getReviewsByAgencyId(data.id);
    const reviews = (reviewsResp.data || []).map((review) => ({
      ...review,
      rating: Number(review.rating),
    }));

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = reviews.length ? (total / reviews.length).toFixed(1) : 0;

    agency.value = {
      id: data.id,
      name: data.name,
      taxId: data.taxId,
      description: data.description,
      rating: Number(average),
      reviewCount: reviews.length,
      reservationCount: data.reservationCount || 0,
      avatarUrl: data.avatarUrl,
      contact: {
        email: data.contactEmail,
        phone: data.contactPhone,
      },
      socialLinks: {
        facebook: data.socialLinksFacebook || '',
        instagram: data.socialLinksInstagram || '',
        whatsapp: data.socialLinksWhatsapp || '',
      },
      reviews,
    };
  } catch (err) {
    console.error('Error loading agency data:', err);
    error.value = err.message || 'Error loading profile';
  } finally {
    loading.value = false;
  }
});

async function onSaved(updated) {
  try {
    loading.value = true;
    const updatedResp = await agencyService.updateProfile(updated.id, updated);

    agency.value = {
      ...updated,
      contact: {
        email: updated.contactEmail,
        phone: updated.contactPhone,
      },
      socialLinks: {
        facebook: updated.socialLinksFacebook,
        instagram: updated.socialLinksInstagram,
        whatsapp: updated.socialLinksWhatsapp,
      },
      reviews: agency.value.reviews
    };

    editing.value = false;
  } catch (error) {
    console.error("Error saving changes:", error);
    error.value = t('common.errorSaving');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.agency-profile {
  max-width: 1300px;
  margin: 0 auto;
  padding: 1rem;
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}


.agency-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
}

.add-experience-button {
  background-color: #318C8B;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-experience-button:hover {
  background-color: #bae6fd;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.tax-id {
  margin: 0 0 0.5rem;
  font-weight: 500;
}

.description {
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

.stats {
  display: flex;
  justify-content: space-between;
  background-color: #fef3c7;
  border-radius: 12px;
  padding: 1.25rem;
  max-width: 600px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  background-color: transparent;
}

.stat-item + .stat-item {
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}
.stat-number {
  font-size: 1.4rem;
  font-weight: bold;
  color: #0f172a;
}

.stat-label {
  font-size: 0.9rem;
  color: #334155;
}
.stat-stars {
  display: flex;
  justify-content: center;
}
.stat-item span,
.stat-item {
  background-color: transparent !important;
  box-shadow: none !important;
}
.stat-item span {
  display: inline;
}
.stat-item * {
  background-color: transparent !important;
}
.reviews {
  margin-top: 1rem;
}

.review-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.review-content {
  flex: 1;
}

.review-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.95rem;
}

.review-date {
  color: #64748b;
  font-size: 0.85rem;
}

.review-text {
  margin-top: 0.5rem;
  line-height: 1.5;
  color: #1e293b;
}

.view-more {
  display: inline-block;
  margin-top: 0.5rem;
  color: #318C8B;
  font-weight: 500;
  text-decoration: none;
}

.view-more:hover {
  text-decoration: underline;
}

.side-col {
  text-align: center;
  border-left: 1px solid #e5e7eb;
  padding-left: 1.5rem;
}

.agency-logo {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.contact {
  margin: 0.5rem 0;
  line-height: 1.4;
  color: #1e293b;
}

.social-icons a {
  margin: 0 0.5rem;
  color: #000;
}

.dialog-title {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 600;
}

.review-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #000;
}

.rating-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #000;
}

.rating-number {
  font-size: 2rem;
  font-weight: bold;
}

.review-count {
  font-size: 1rem;
  font-weight: 500;
  color: #475569;
}


.review-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: #000;
}
.social-icons a i {
  font-size: 1.8rem;
  transition: color 0.2s ease;
}

.social-icons a i:hover {
  color: #318C8B;
}
.agency-logo {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto 1rem auto;
}


</style>

