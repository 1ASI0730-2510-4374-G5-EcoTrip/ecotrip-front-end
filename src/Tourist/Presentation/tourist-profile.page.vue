<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from 'vue-router';
import Avatar from "primevue/avatar";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Chip from "primevue/chip";
import Button from "primevue/button";
import { TouristApiService } from "@/Tourist/Application/tourist-api.service.js";
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';

const { t } = useI18n();
const router = useRouter();

const tourist = ref({
  id: "",
  name: "",
  email: "",
  avatar: "",
  preferences: {
    adventureTypes: [],
    sustainability: true
  },
  contactInfo: {
    phone: "",
    address: ""
  }
});

const editing = ref(false);
const showBookings = ref(false);
const reservations = ref([]);
const loading = ref(false);
const error = ref(null);

const touristService = new TouristApiService();

onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const session = AuthSession.fromStorage();
    if (!session?.isValid()) {
      await router.push('/login');
      return;
    }

    if (!session.isTourist()) {
      await router.push('/experiences');
      return;
    }

    const userId = session.userId;
    if (!userId) {
      throw new Error(t('errors.noUserId'));
    }

    const resp = await touristService.getProfile(userId);
    if (!resp.data) {
      throw new Error(t('errors.profileNotFound'));
    }
    
    tourist.value = resp.data;

    // Load booked experiences
    const reservationsResp = await touristService.getBookedExperiences(userId);
    reservations.value = reservationsResp.data || [];
  } catch (err) {
    console.error("Error loading tourist data:", err);
    error.value = err.message || t('errors.loadProfile');
  } finally {
    loading.value = false;
  }
});

async function saveProfile() {
  if (!tourist.value.id) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const updated = await touristService.updateProfile(tourist.value.id, tourist.value);
    tourist.value = updated.data;
    editing.value = false;
  } catch (err) {
    console.error("Error updating profile:", err);
    error.value = err.message || t('errors.updateProfile');
  } finally {
    loading.value = false;
  }
}

async function addAdventureType(type) {
  if (!tourist.value.preferences.adventureTypes.includes(type)) {
    tourist.value.preferences.adventureTypes.push(type);
  }
}

async function removeAdventureType(type) {
  const index = tourist.value.preferences.adventureTypes.indexOf(type);
  if (index > -1) {
    tourist.value.preferences.adventureTypes.splice(index, 1);
  }
}
</script>

<template>
  <div class="tourist-profile">
    <div v-if="loading" class="loading-overlay">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
    </div>

    <div v-if="error" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ error }}
    </div>

    <!-- HEADER -->
    <div class="header">
      <h1 class="tourist-name">{{ tourist.name }}</h1>
      <button class="edit-profile-button" @click="editing = true">
        {{ t('touristProfile.edit') }}
      </button>
    </div>

    <div class="content-grid">
      <div class="main-col">
        <h2>{{ t('touristProfile.preferences') }}</h2>
        <div class="adventure-types">
          <Chip v-for="type in tourist.preferences.adventureTypes" 
                :key="type" 
                :label="type"
                class="adventure-type-chip" />
        </div>

        <div class="eco-preference">
          <h3>{{ t('touristProfile.sustainability') }}</h3>
          <p v-if="tourist.preferences.sustainability">
            {{ t('touristProfile.ecoFriendlyYes') }}
            <i class="pi pi-check-circle" style="color: green"></i>
          </p>
          <p v-else>{{ t('touristProfile.ecoFriendlyNo') }}</p>
        </div>

        <div class="contact-info">
          <h3>{{ t('touristProfile.contactInfo') }}</h3>
          <p><strong>{{ t('touristProfile.email') }}:</strong> {{ tourist.email }}</p>
          <p><strong>{{ t('touristProfile.phone') }}:</strong> {{ tourist.contactInfo.phone }}</p>
          <p><strong>{{ t('touristProfile.address') }}:</strong> {{ tourist.contactInfo.address }}</p>
        </div>
      </div>

      <div class="bookings-col">
        <h2>{{ t('touristProfile.bookings') }}</h2>
        <div v-if="reservations.length > 0" class="bookings-list">
          <div v-for="booking in reservations" :key="booking.id" class="booking-card">
            <h3>{{ booking.experienceName }}</h3>
            <p>{{ booking.date }}</p>
            <p>{{ booking.status }}</p>
          </div>
        </div>
        <p v-else>{{ t('touristProfile.noBookings') }}</p>
      </div>
    </div>

    <!-- Edit Profile Dialog -->
    <Dialog v-model:visible="editing" 
            :modal="true" 
            :header="t('touristProfile.editProfile')"
            :closable="!loading"
            class="edit-dialog">
      <div class="edit-form">
        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-triangle"></i>
          {{ error }}
        </div>

        <div class="form-field">
          <label>{{ t('touristProfile.name') }}</label>
          <InputText v-model="tourist.name" />
        </div>
        <div class="form-field">
          <label>{{ t('touristProfile.phone') }}</label>
          <InputText v-model="tourist.contactInfo.phone" />
        </div>
        <div class="form-field">
          <label>{{ t('touristProfile.address') }}</label>
          <Textarea v-model="tourist.contactInfo.address" rows="3" />
        </div>
        <div class="form-actions">
          <Button @click="saveProfile" 
                 :label="t('touristProfile.save')" 
                 :loading="loading"
                 severity="primary" />
          <Button @click="editing = false" 
                 :label="t('touristProfile.cancel')" 
                 :disabled="loading"
                 severity="secondary" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.tourist-profile {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--surface-border);
}

.tourist-name {
  font-size: 2rem;
  color: #0f172a;
  margin: 0;
}

.edit-profile-button {
  background-color: #047e77;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-profile-button:hover {
  background-color: #036c66;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.main-col {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bookings-col {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.booking-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.booking-card h3 {
  margin: 0 0 0.5rem;
  color: #0f172a;
}

.adventure-types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.adventure-type-chip {
  background-color: #047e77;
  color: white;
}

.edit-dialog {
  max-width: 500px;
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #475569;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.error-message {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  color: #991b1b;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message i {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .tourist-profile {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
