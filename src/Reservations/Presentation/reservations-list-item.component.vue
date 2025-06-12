<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  people: {
    type: Number,
    required: true,
  },
  totalPaid: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'pending'
  },
  showActions: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const statusColor = computed(() => {
  switch (props.status) {
    case 'confirmed': return 'var(--green-500)';
    case 'cancelled': return 'var(--red-500)';
    default: return 'var(--yellow-500)';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'confirmed': return 'Confirmada';
    case 'cancelled': return 'Cancelada';
    default: return 'Pendiente';
  }
});
</script>

<template>
  <div class="reservations-list-container">
    <div class="reservations-info-container">
      <div class="reservations-info-profile">
        <img src="https://i.pravatar.cc/150?u=tourist1" alt="Foto" class="profile-photo" />
        <div class="profile-info">
          <h1>{{ name }}</h1>
          <span class="status-badge" :style="{ backgroundColor: statusColor }">
            {{ statusText }}
          </span>
        </div>
      </div>

      <div class="reservations-info-total">
        <div>
          <h2>Fecha</h2>
          <h3>{{ date }}</h3>
        </div>
        <div>
          <h2>Experiencia</h2>
          <h3>{{ experience }}</h3>
        </div>
        <div>
          <h2>Personas</h2>
          <h3>{{ people }}</h3>
        </div>
        <div>
          <h2>Total</h2>
          <h3>S/ {{ totalPaid }}</h3>
        </div>
      </div>

      <div v-if="showActions && status === 'pending'" class="action-buttons">
        <button class="action-btn confirm" @click="$emit('confirm')">
          <i class="pi pi-check"></i> Confirmar
        </button>
        <button class="action-btn cancel" @click="$emit('cancel')">
          <i class="pi pi-times"></i> Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reservations-info-container {
  width: 100%;
  border: 1px solid var(--surface-200);
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 1rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.reservations-info-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--surface-200);
}

.profile-photo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reservations-info-total {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem 0;
  text-align: center;
}

h1 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin: 0;
}

h2 {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
}

h3 {
  font-size: 1rem;
  color: var(--text-color);
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-200);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn.confirm {
  background: var(--green-500);
  color: white;
}

.action-btn.confirm:hover {
  background: var(--green-600);
}

.action-btn.cancel {
  background: var(--red-500);
  color: white;
}

.action-btn.cancel:hover {
  background: var(--red-600);
}

@media (max-width: 768px) {
  .reservations-info-total {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>