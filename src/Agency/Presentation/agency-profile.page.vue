<template>
  <div class="agency-profile">
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spinner pi-spin"></i>
      Cargando...
    </div>
    
    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      {{ error }}
    </div>
    
    <div v-else class="profile-content">
      <div class="header">
        <div class="header-info">
          <h1 class="agency-name">{{ agency.name }}</h1>
          <span class="tax-id">RUC / NIT: {{ agency.taxId }}</span>
        </div>
        <button class="edit-button" @click="editing = true">
          <i class="pi pi-pencil"></i>
          Editar perfil
        </button>
      </div>

      <div class="content-grid">
        <div class="main-col">
          <section class="about-section">
            <h2>Sobre nosotros</h2>
            <p class="agency-description">{{ agency.description }}</p>

            <div class="certifications">
              <h3>Certificaciones</h3>
              <div class="certification-chips">
                <Chip v-for="cert in agency.certifications" 
                      :key="cert" 
                      :label="cert" 
                      class="certification-chip" />
              </div>
            </div>
          </section>

          <section class="stats-section">
            <div class="stat-card">
              <span class="stat-value">{{ agency.rating }}</span>
              <StarRating :rating="agency.rating" :showValue="false" />
              <span class="stat-label">Calificación</span>
            </div>

            <div class="stat-card">
              <span class="stat-value">{{ agency.reviewCount }}</span>
              <span class="stat-label">Reseñas</span>
            </div>

            <div class="stat-card">
              <span class="stat-value">{{ agency.reservationCount }}</span>
              <span class="stat-label">Reservas totales</span>
            </div>
          </section>
        </div>

        <div class="side-col">
          <img :src="agency.avatar" :alt="agency.name" class="agency-logo">
          
          <section class="contact-section">
            <h2>Información de contacto</h2>
            <div class="contact-info">
              <div class="contact-item">
                <i class="pi pi-phone"></i>
                <div>
                  <span class="contact-label">Teléfono</span>
                  <span class="contact-value">{{ agency.contactInfo.phone }}</span>
                </div>
              </div>

              <div class="contact-item">
                <i class="pi pi-envelope"></i>
                <div>
                  <span class="contact-label">Email</span>
                  <span class="contact-value">{{ agency.contactInfo.email }}</span>
                </div>
              </div>

              <div class="contact-item">
                <i class="pi pi-map-marker"></i>
                <div>
                  <span class="contact-label">Dirección</span>
                  <span class="contact-value">{{ agency.contactInfo.address }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="social-section">
            <h2>Redes sociales</h2>
            <div class="social-links">
              <a :href="'https://' + agency.socialLinks.facebook" 
                 target="_blank" 
                 class="social-link facebook">
                <i class="pi pi-facebook"></i>
              </a>
              <a :href="'https://' + agency.socialLinks.instagram" 
                 target="_blank" 
                 class="social-link instagram">
                <i class="pi pi-instagram"></i>
              </a>
              <a :href="'https://wa.me/' + agency.socialLinks.whatsapp" 
                 target="_blank" 
                 class="social-link whatsapp">
                <i class="pi pi-whatsapp"></i>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="editing" 
            modal 
            :header="'Editar perfil de agencia'"
            :style="{width: '500px'}"
            :closable="!loading">
      <AgencyForm :agency="agency" 
                 @cancel="editing = false" 
                 @saved="onSaved" />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import Avatar from "primevue/avatar";
import Dialog from "primevue/dialog";
import Chip from "primevue/chip";
import StarRating from "./StarRating.vue";
import AgencyForm from "./agency-form.component.vue";
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate.js';

const { t } = useI18n();
const router = useRouter();

const agency = ref({
  id: "2",
  name: "Agencia EcoAventura",
  email: "agency@demo.com",
  avatar: "https://i.pravatar.cc/150?u=agency1",
  description: "Ofrecemos las mejores experiencias ecológicas para viajeros responsables y conscientes con el medio ambiente.",
  certifications: ["Turismo Sostenible", "Eco-Friendly Certificado"],
  contactInfo: {
    phone: "555-987-6543",
    address: "Av. Naturaleza 456, Ciudad Eco",
    email: "agency@demo.com"
  },
  socialLinks: {
    facebook: "facebook.com/ecoaventura",
    instagram: "instagram.com/ecoaventura_oficial",
    whatsapp: "555-987-6543"
  },
  rating: 4.8,
  reviewCount: 25,
  reservationCount: 42,
  taxId: "ECOTAX987"
});

const editing = ref(false);
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

    if (!session.isAgency()) {
      await router.push('/experiences');
      return;
    }

    // Simular carga de datos
    setTimeout(() => {
      // Los datos ya están precargados en el ref agency
      loading.value = false;
    }, 500);

  } catch (err) {
    console.error("Error loading agency data:", err);
    error.value = err.message || 'Error al cargar el perfil';
    loading.value = false;
  }
});

const onSaved = async (updatedData) => {
  try {
    loading.value = true;
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 500));
    Object.assign(agency.value, updatedData);
    editing.value = false;
  } catch (error) {
    console.error("Error saving changes:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.agency-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  color: #64748b;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.agency-name {
  font-size: 1.75rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.tax-id {
  color: #64748b;
  font-size: 0.875rem;
}

.edit-button {
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

.edit-button:hover {
  background-color: #036c66;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.about-section,
.stats-section,
.contact-section,
.social-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.agency-description {
  color: #334155;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

h2 {
  font-size: 1.25rem;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
}

h3 {
  font-size: 1rem;
  color: #334155;
  margin: 0 0 1rem 0;
}

.certification-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.certification-chip {
  background-color: #047e77;
  color: white;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
}

.agency-logo {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.contact-item div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-label {
  font-size: 0.875rem;
  color: #64748b;
}

.contact-value {
  color: #0f172a;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  transition: opacity 0.2s;
}

.social-link:hover {
  opacity: 0.8;
}

.social-link.facebook {
  background-color: #1877f2;
}

.social-link.instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.social-link.whatsapp {
  background-color: #25d366;
}

.social-link i {
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .agency-profile {
    padding: 1rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
  }

  .edit-button {
    width: 100%;
    justify-content: center;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>

