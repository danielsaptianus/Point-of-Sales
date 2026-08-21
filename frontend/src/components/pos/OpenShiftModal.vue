<script setup lang="ts">
import { ref } from 'vue';
import { Store, DollarSign } from 'lucide-vue-next';
import api from '@/plugins/axios';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'shift-opened', shift: any): void;
}>();

const startingCash = ref<number>(0);
const isSubmitting = ref(false);
const errorMessage = ref('');

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
};

const handleOpenShift = async () => {
  if (startingCash.value < 0) {
    errorMessage.value = 'Modal awal tidak valid.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const res = await api.post('/shifts/open', {
      starting_cash: startingCash.value,
    });
    startingCash.value = 0;
    emit('shift-opened', res.data.data || res.data);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Gagal membuka kasir.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">
          <Store :size="24" class="text-primary" />
          <h2>Buka Kasir (Mulai Shift)</h2>
        </div>
      </div>

      <div class="modal-body">
        <p class="text-muted mb-20">
          Silakan masukkan nominal uang modal awal (uang receh/kembalian) yang ada di dalam laci kasir saat ini.
        </p>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label>Modal Awal (Uang Laci) <span class="text-danger">*</span></label>
          <div class="input-with-icon">
            <DollarSign :size="18" class="input-icon" />
            <input 
              type="number" 
              v-model.number="startingCash"
              class="form-control"
              min="0"
              placeholder="0"
            />
          </div>
          <small class="text-muted">Total: {{ formatPrice(startingCash) }}</small>
        </div>
      </div>

      <div class="modal-footer">
        <button 
          class="btn btn-primary btn-block" 
          :disabled="isSubmitting || startingCash < 0"
          @click="handleOpenShift"
        >
          <span v-if="isSubmitting">Memproses...</span>
          <span v-else>Mulai Shift</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: var(--bg-card);
  width: 90%;
  max-width: 400px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: modal-enter 0.3s ease-out;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(var(--primary-rgb), 0.05);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
}

.btn-block {
  width: 100%;
}

.error-banner {
  background: rgba(244, 63, 94, 0.1);
  color: var(--danger);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  font-size: 0.85rem;
  border: 1px solid rgba(244, 63, 94, 0.2);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
}

.input-with-icon input {
  padding-left: 40px;
  font-size: 1.1rem;
  font-weight: 600;
}

.mb-20 { margin-bottom: 20px; }

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
