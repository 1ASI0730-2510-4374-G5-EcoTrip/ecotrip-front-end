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
import { Tourist } from "@/Tourist/Domain/tourist.entity.js";
import { TouristApiService } from "@/Tourist/Application/tourist-api.service.js";
import { TouristService } from "@/Tourist/Application/tourist.service.js";
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';

const { t } = useI18n();
const router = useRouter();
const touristApiService = new TouristApiService();
const touristService = new TouristService(touristApiService);

const tourist = ref(new Tourist({
  id: "",
  name: "",
  email: "",
  avatar: "",
  preferences: {
    adventureTypes: [],
    sustainability: false
  },
  contactInfo: {
    phone: "",
    address: ""
  }
}));

const editing = ref(false);
const reservations = ref([]);
const loading = ref(false);
const error = ref(null);

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
      throw new Error('No se pudo identificar al usuario');
    }    console.log('[TouristProfilePage] Getting data for user:', userId);
    
    // Load profile and reservations in parallel
    const [profileData, bookingsData] = await Promise.all([
      touristService.getProfile(userId),
      touristService.getBookedExperiences(userId)
    ]);

    console.log('[TouristProfilePage] Profile data received:', profileData);
    console.log('[TouristProfilePage] Bookings data received:', bookingsData);

    if (!profileData) {
      throw new Error('No se pudo cargar el perfil del usuario');
    }

    tourist.value = {
      ...tourist.value,  // Mantener la estructura existente
      ...profileData,    // Sobrescribir con los nuevos datos
      preferences: {
        adventureTypes: profileData.preferences?.adventureTypes || [],
        sustainability: Boolean(profileData.preferences?.sustainability)
      },
      contactInfo: {
        phone: profileData.contactInfo?.phone || '',
        address: profileData.contactInfo?.address || ''
      }
    };
    
    console.log('[TouristProfilePage] Updated tourist data:', tourist.value);
    reservations.value = bookingsData || [];

  } catch (err) {
    console.error("Error loading tourist data:", err);
    error.value = err.message || 'Error al cargar el perfil';
  } finally {
    loading.value = false;
  }
});

async function saveProfile() {
  try {
    loading.value = true;
    error.value = null;

    const session = AuthSession.fromStorage();
    if (!session?.userId) {
      throw new Error('No se pudo identificar al usuario');
    }

    await touristService.updateProfile(tourist.value);
    editing.value = false;
  } catch (err) {
    console.error("Error updating profile:", err);
    error.value = err.message || 'Error al guardar los cambios';
  } finally {
    loading.value = false;
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

    <div v-else>
      <!-- Header -->
      <div class="header">
        <div class="profile-header">
          <Avatar :image="tourist.avatar" size="xlarge" shape="circle" />
          <div class="profile-info">
            <h1 class="tourist-name">{{ tourist.name }}</h1>
            <p class="tourist-email">{{ tourist.email }}</p>
          </div>
        </div>
        <button class="edit-profile-button" @click="editing = true">
          <i class="pi pi-pencil"></i>
          <span>Editar perfil</span>
        </button>
      </div>

      <div class="content-grid">
        <div class="main-col">
          <!-- Preferencias -->
          <section class="preferences-section">
            <h2>Preferencias de viaje</h2>
            
            <div class="adventure-types">
              <h3>Tipos de aventura preferidos</h3>
              <div class="adventure-chips">
                <Chip v-for="type in tourist.preferences.adventureTypes" 
                      :key="type" 
                      :label="type"
                      class="adventure-type-chip" />
              </div>
            </div>

            <div class="eco-preference">
              <h3>Preferencia de sostenibilidad</h3>
              <div class="sustainability-status">
                <i :class="['pi', tourist.preferences.sustainability ? 'pi-check-circle' : 'pi-times-circle']"
                   :style="{ color: tourist.preferences.sustainability ? '#047e77' : '#dc2626' }"></i>
                <span>{{ tourist.preferences.sustainability ? 'Interesado en experiencias eco-amigables' : 'Sin preferencias eco-amigables' }}</span>
              </div>
            </div>
          </section>

          <!-- Información de contacto -->
          <section class="contact-section">
            <h2>Información de contacto</h2>
            <div class="contact-details">
              <div class="contact-item">
                <i class="pi pi-phone"></i>
                <div>
                  <h4>Teléfono</h4>
                  <p>{{ tourist.contactInfo.phone || 'No especificado' }}</p>
                </div>
              </div>
              <div class="contact-item">
                <i class="pi pi-map-marker"></i>
                <div>
                  <h4>Dirección</h4>
                  <p>{{ tourist.contactInfo.address || 'No especificada' }}</p>
                </div>
              </div>
              <div class="contact-item">
                <i class="pi pi-envelope"></i>
                <div>
                  <h4>Email</h4>
                  <p>{{ tourist.email }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Reservas -->
        <div class="side-col">
          <section class="bookings-section">
            <h2>Mis reservas</h2>
            <div v-if="reservations.length > 0" class="bookings-list">
              <div v-for="booking in reservations" :key="booking.id" class="booking-card">
                <div class="booking-header">
                  <h3>{{ booking.experienceName }}</h3>
                  <span :class="['status-badge', booking.status.toLowerCase()]">
                    {{ booking.status }}
                  </span>
                </div>
                <p class="booking-date">
                  <i class="pi pi-calendar"></i>
                  {{ new Date(booking.date).toLocaleDateString() }}
                </p>
              </div>
            </div>
            <div v-else class="empty-bookings">
              <i class="pi pi-calendar-times"></i>
              <p>Aún no tienes reservas</p>
              <router-link to="/experiences" class="browse-link">
                Explorar experiencias
              </router-link>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <Dialog v-model:visible="editing" 
            modal 
            :header="'Editar perfil'"
            :style="{width: '450px'}"
            :closable="!loading">
      <div class="edit-form">
        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-triangle"></i>
          {{ error }}
        </div>

        <div class="form-field">
          <label>Nombre</label>
          <InputText v-model="tourist.name" class="w-full" />
        </div>
        
        <div class="form-field">
          <label>Teléfono</label>
          <InputText v-model="tourist.contactInfo.phone" class="w-full" />
        </div>

        <div class="form-field">
          <label>Dirección</label>
          <Textarea v-model="tourist.contactInfo.address" rows="3" class="w-full" />
        </div>

        <div class="dialog-footer">
          <Button label="Cancelar" 
                  severity="secondary" 
                  @click="editing = false"
                  :disabled="loading" />
          <Button label="Guardar" 
                  @click="saveProfile"
                  :loading="loading" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.tourist-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tourist-name {
  font-size: 1.75rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.tourist-email {
  color: #64748b;
  margin: 0;
}

.edit-profile-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #047e77;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
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

.preferences-section, .contact-section, .bookings-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.25rem;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
}

h3 {
  font-size: 1rem;
  color: #334155;
  margin: 1.5rem 0 1rem 0;
}

.adventure-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.adventure-type-chip {
  background-color: #047e77;
  color: white;
}

.sustainability-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #334155;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.contact-item i {
  color: #047e77;
  font-size: 1.25rem;
}

.contact-item h4 {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.contact-item p {
  margin: 0.25rem 0 0 0;
  color: #0f172a;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.booking-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.booking-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.confirmed {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.booking-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.empty-bookings {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.empty-bookings i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.browse-link {
  display: inline-block;
  margin-top: 1rem;
  color: #047e77;
  text-decoration: none;
  font-weight: 500;
}

.browse-link:hover {
  text-decoration: underline;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .tourist-profile {
    padding: 1rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .profile-header {
    width: 100%;
  }

  .edit-profile-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
