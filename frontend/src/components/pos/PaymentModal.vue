<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCartStore } from '@/stores/cart';
import type { Transaction } from '@/types';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', transaction: Transaction): void;
}>();

const cartStore = useCartStore();

const paymentMethod = ref<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
const cashPaid = ref<number>(0);
const isProcessing = ref<boolean>(false);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
};

// Reset cashPaid to total when modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      cashPaid.value = cartStore.grandTotal;
      paymentMethod.value = 'CASH';
      isProcessing.value = false;
    }
  }
);

const changeAmount = computed(() => {
  if (paymentMethod.value !== 'CASH') return 0;
  return cashPaid.value - cartStore.grandTotal;
});

const isSufficient = computed(() => {
  if (paymentMethod.value !== 'CASH') return true;
  return cashPaid.value >= cartStore.grandTotal;
});

// Quick Cash Suggestions
const quickCashAmounts = computed(() => {
  const total = cartStore.grandTotal;
  const suggestions = [total]; // Pas

  const standardCash = [20000, 50000, 100000, 200000, 500000];
  standardCash.forEach((amount) => {
    if (amount > total && !suggestions.includes(amount)) {
      suggestions.push(amount);
    }
  });

  return suggestions.slice(0, 4);
});

const setQuickCash = (amount: number) => {
  cashPaid.value = amount;
};

const handleConfirmPayment = async () => {
  if (!isSufficient.value || isProcessing.value) return;

  isProcessing.value = true;
  try {
    const tx = await cartStore.checkout({
      method: paymentMethod.value,
      amountPaid: paymentMethod.value === 'CASH' ? cashPaid.value : cartStore.grandTotal,
      change: Math.max(0, changeAmount.value),
    });

    emit('success', tx);
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card payment-modal">
      <!-- Header -->
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Pembayaran Transaksi</h2>
          <p class="modal-subtitle">Pilih metode dan selesaikan transaksi kasir</p>
        </div>
        <button class="close-btn" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <!-- Bill Total Header -->
      <div class="total-banner">
        <span class="total-banner-label">Total yang Harus Dibayar</span>
        <span class="total-banner-val mono">{{ formatPrice(cartStore.grandTotal) }}</span>
      </div>

      <!-- Method Tabs -->
      <div class="payment-tabs">
        <button
          class="method-tab"
          :class="{ active: paymentMethod === 'CASH' }"
          @click="paymentMethod = 'CASH'"
        >
          <Banknote :size="18" />
          <span>Tunai (Cash)</span>
        </button>
        <button
          class="method-tab"
          :class="{ active: paymentMethod === 'QRIS' }"
          @click="paymentMethod = 'QRIS'"
        >
          <QrCode :size="18" />
          <span>QRIS Digital</span>
        </button>
        <button
          class="method-tab"
          :class="{ active: paymentMethod === 'TRANSFER' }"
          @click="paymentMethod = 'TRANSFER'"
        >
          <CreditCard :size="18" />
          <span>Transfer / Debit</span>
        </button>
      </div>

      <!-- Tab Content: CASH -->
      <div v-if="paymentMethod === 'CASH'" class="tab-body">
        <div class="input-group">
          <label class="input-label">Nominal Uang Diterima (Rp)</label>
          <input
            type="number"
            v-model.number="cashPaid"
            class="input-field cash-input mono"
            placeholder="0"
            step="1000"
            min="0"
          />
        </div>

        <!-- Quick Cash Buttons -->
        <div class="quick-cash-row">
          <button
            v-for="amt in quickCashAmounts"
            :key="amt"
            class="quick-cash-btn"
            :class="{ active: cashPaid === amt }"
            @click="setQuickCash(amt)"
          >
            <span class="mono">{{ amt === cartStore.grandTotal ? 'Uang Pas' : formatPrice(amt) }}</span>
          </button>
        </div>

        <!-- Change Calculation Box -->
        <div
          class="change-box"
          :class="{
            'change-positive': changeAmount >= 0,
            'change-negative': changeAmount < 0,
          }"
        >
          <div class="change-info">
            <span class="change-label">{{ changeAmount >= 0 ? 'Kembalian' : 'Uang Kurang' }}</span>
            <span class="change-val mono">{{ formatPrice(Math.abs(changeAmount)) }}</span>
          </div>
          <CheckCircle2 v-if="changeAmount >= 0" :size="24" class="change-icon" />
          <AlertCircle v-else :size="24" class="change-icon" />
        </div>
      </div>

      <!-- Tab Content: QRIS -->
      <div v-else-if="paymentMethod === 'QRIS'" class="tab-body qris-tab">
        <div class="qris-box">
          <div class="qris-header">
            <span class="qris-brand">QRIS ARTO POS</span>
            <span class="badge badge-primary">Siap Scan</span>
          </div>
          <div class="qris-mock-qr">
            <!-- Simulated QR code SVG -->
            <svg viewBox="0 0 100 100" class="qr-svg">
              <rect width="100" height="100" fill="#ffffff" rx="8" />
              <rect x="10" y="10" width="25" height="25" fill="#000000" />
              <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
              <rect x="18" y="18" width="9" height="9" fill="#000000" />
              <rect x="65" y="10" width="25" height="25" fill="#000000" />
              <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
              <rect x="73" y="18" width="9" height="9" fill="#000000" />
              <rect x="10" y="65" width="25" height="25" fill="#000000" />
              <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
              <rect x="18" y="73" width="9" height="9" fill="#000000" />
              <rect x="42" y="15" width="16" height="6" fill="#000000" />
              <rect x="42" y="28" width="16" height="6" fill="#000000" />
              <rect x="42" y="42" width="16" height="16" fill="#10B981" />
              <rect x="65" y="45" width="25" height="10" fill="#000000" />
              <rect x="42" y="65" width="48" height="25" fill="#000000" rx="2" />
            </svg>
          </div>
          <p class="qris-instructions">Arahkan kamera e-wallet / mobile banking pelanggan ke QR code di atas</p>
        </div>
      </div>

      <!-- Tab Content: TRANSFER -->
      <div v-else class="tab-body transfer-tab">
        <div class="bank-card">
          <div class="bank-title">Rekening Tujuan Toko</div>
          <div class="bank-row">
            <span>BCA: <strong>8820-1928-3921</strong></span>
            <span>a/n Arto Point of Sales</span>
          </div>
          <div class="bank-row">
            <span>Mandiri: <strong>137-00-9821-441</strong></span>
            <span>a/n Arto Point of Sales</span>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">
          Batal
        </button>
        <button
          class="btn btn-primary btn-confirm"
          :disabled="!isSufficient || isProcessing"
          @click="handleConfirmPayment"
        >
          <span v-if="!isProcessing">Konfirmasi & Selesai</span>
          <span v-else>Memproses...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-modal {
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.modal-subtitle {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.close-btn {
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  color: var(--text-main);
  background: var(--bg-card-hover);
}

.total-banner {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%);
  border: 1px solid rgba(37, 99, 235, 0.3);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.total-banner-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.total-banner-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
}

.payment-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.method-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.method-tab:hover {
  background: var(--bg-card-hover);
  color: var(--text-main);
}

.method-tab.active {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 0 16px rgba(37, 99, 235, 0.2);
}

.tab-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.cash-input {
  font-size: 1.4rem;
  font-weight: 700;
  padding: 14px 18px;
  color: #ffffff;
}

.quick-cash-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.quick-cash-btn {
  padding: 10px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-cash-btn:hover {
  background: var(--bg-card-hover);
  border-color: rgba(255, 255, 255, 0.2);
}

.quick-cash-btn.active {
  background: var(--accent-indigo);
  color: #fff;
  border-color: transparent;
}

.change-box {
  padding: 14px 18px;
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.change-positive {
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(37, 99, 235, 0.3);
  color: var(--primary);
}

.change-negative {
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: var(--danger);
}

.change-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.change-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.change-val {
  font-size: 1.3rem;
  font-weight: 800;
}

.qris-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.qris-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.qris-brand {
  font-weight: 700;
  font-size: 0.9rem;
}

.qris-mock-qr {
  width: 160px;
  height: 160px;
  background: #ffffff;
  padding: 8px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.qr-svg {
  width: 100%;
  height: 100%;
}

.qris-instructions {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.bank-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bank-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
  border-bottom: 1px solid var(--border);
  padding-bottom: 6px;
}

.bank-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-confirm {
  flex: 1;
  padding: 12px 20px;
}
</style>
