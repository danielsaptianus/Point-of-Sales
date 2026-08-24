<script setup lang="ts">
import { ref, computed } from 'vue';
import { LogOut, DollarSign, Calculator, FileText, AlertCircle } from 'lucide-vue-next';
import api from '@/plugins/axios';

const props = defineProps<{
  isOpen: boolean;
  shiftData: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'shift-closed', data: any): void;
}>();

const actualEndingCash = ref<number>(0);
const notes = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const totalCashSales = computed(() => {
  if (!props.shiftData || !props.shiftData.transactions) return 0;
  return props.shiftData.transactions.reduce((sum: number, tx: any) => sum + tx.total, 0);
});

const expectedEndingCash = computed(() => {
  if (!props.shiftData) return 0;
  return props.shiftData.starting_cash + totalCashSales.value;
});

const difference = computed(() => {
  return actualEndingCash.value - expectedEndingCash.value;
});

const handleCloseShift = async () => {
  if (actualEndingCash.value < 0) {
    errorMessage.value = 'Nominal uang fisik tidak valid.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const res = await api.post('/shifts/close', {
      actual_ending_cash: actualEndingCash.value,
      notes: notes.value,
    });
    actualEndingCash.value = 0;
    notes.value = '';
    emit('shift-closed', res.data.data || res.data);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Gagal menutup kasir.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen && shiftData" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title">
          <LogOut :size="24" class="text-danger" />
          <h2>Tutup Kasir (Akhiri Shift)</h2>
        </div>
        <button class="btn-close" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="summary-cards">
          <div class="summary-card">
            <span class="label">Modal Awal</span>
            <span class="value">{{ formatPrice(shiftData.starting_cash) }}</span>
          </div>
          <div class="summary-card">
            <span class="label">Penjualan Tunai</span>
            <span class="value text-success">+ {{ formatPrice(totalCashSales) }}</span>
          </div>
          <div class="summary-card highlight">
            <span class="label">Total Diharapkan di Laci</span>
            <span class="value">{{ formatPrice(expectedEndingCash) }}</span>
          </div>
        </div>

        <div v-if="errorMessage" class="error-banner mt-20">
          <AlertCircle :size="18" />
          <span>{{ errorMessage }}</span>
        </div>

        <div class="form-group mt-20">
          <label>Uang Fisik Aktual di Laci <span class="text-danger">*</span></label>
          <div class="input-with-icon">
            <Calculator :size="18" class="input-icon" />
            <input 
              type="number" 
              v-model.number="actualEndingCash"
              class="form-control"
              min="0"
              placeholder="0"
            />
          </div>
          <div class="difference-text" :class="{'text-danger': difference < 0, 'text-success': difference >= 0}">
            Selisih: {{ difference > 0 ? '+' : '' }}{{ formatPrice(difference) }}
            <span v-if="difference < 0">(Short)</span>
            <span v-else-if="difference > 0">(Over)</span>
            <span v-else>(Balance)</span>
          </div>
        </div>

        <div class="form-group">
          <label>Catatan (Opsional)</label>
          <div class="input-with-icon">
            <FileText :size="18" class="input-icon" style="top: 12px;" />
            <textarea 
              v-model="notes"
              class="form-control"
              placeholder="Ketik catatan jika ada selisih uang..."
              rows="2"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">Batal</button>
        <button 
          class="btn btn-danger" 
          :disabled="isSubmitting || actualEndingCash < 0"
          @click="handleCloseShift"
        >
          <span v-if="isSubmitting">Memproses...</span>
          <span v-else>Akhiri Shift</span>
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
}

.modal-card {
  background: var(--bg-card);
  width: 90%;
  max-width: 500px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: modal-enter 0.3s ease-out;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.summary-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(var(--primary-rgb), 0.03);
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-color);
}

.summary-card {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.summary-card .label {
  color: var(--text-muted);
}

.summary-card .value {
  font-weight: 600;
  color: var(--text-color);
}

.summary-card.highlight {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(0,0,0,0.1);
  font-size: 1.1rem;
}

.summary-card.highlight .value {
  color: var(--primary);
  font-weight: 800;
}

.modal-footer {
  padding: 16px 24px;
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.error-banner {
  background: rgba(244, 63, 94, 0.1);
  color: var(--danger);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 10px;
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
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary);
}

.input-with-icon textarea {
  padding-left: 40px;
}

.difference-text {
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.mt-20 { margin-top: 20px; }

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
