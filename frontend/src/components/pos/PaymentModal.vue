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

const activeTab = ref<'CASH' | 'EWALLET' | 'TRANSFER'>('CASH');
const selectedMethod = ref<string>('CASH');
const cashPaid = ref<number>(0);
const isProcessing = ref<boolean>(false);
const errorMessage = ref<string>('');

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
      activeTab.value = 'CASH';
      selectedMethod.value = 'CASH';
      isProcessing.value = false;
      errorMessage.value = '';
    }
  }
);

const changeAmount = computed(() => {
  if (selectedMethod.value !== 'CASH') return 0;
  return cashPaid.value - cartStore.grandTotal;
});

const isSufficient = computed(() => {
  if (selectedMethod.value !== 'CASH') return true;
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
  errorMessage.value = '';
  try {
    const tx = await cartStore.checkout({
      method: selectedMethod.value,
      amountPaid: selectedMethod.value === 'CASH' ? cashPaid.value : cartStore.grandTotal,
      change: Math.max(0, changeAmount.value),
    });

    emit('success', tx);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || error.message || 'Terjadi kesalahan saat memproses pembayaran.';
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
          :class="{ active: activeTab === 'CASH' }"
          @click="activeTab = 'CASH'; selectedMethod = 'CASH'"
        >
          <Banknote :size="18" />
          <span>Tunai (Cash)</span>
        </button>
        <button
          class="method-tab"
          :class="{ active: activeTab === 'EWALLET' }"
          @click="activeTab = 'EWALLET'; selectedMethod = 'QRIS'"
        >
          <QrCode :size="18" />
          <span>E-Wallet & QRIS</span>
        </button>
        <button
          class="method-tab"
          :class="{ active: activeTab === 'TRANSFER' }"
          @click="activeTab = 'TRANSFER'; selectedMethod = 'BCA_VA'"
        >
          <CreditCard :size="18" />
          <span>Transfer / VA</span>
        </button>
      </div>

      <!-- Tab Content: CASH -->
      <div v-if="activeTab === 'CASH'" class="tab-body">
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

      <!-- Tab Content: EWALLET -->
      <div v-else-if="activeTab === 'EWALLET'" class="tab-body">
        <div class="method-grid">
          <button class="method-card" :class="{ active: selectedMethod === 'QRIS' }" @click="selectedMethod = 'QRIS'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" class="method-logo" />
            <span>QRIS Umum</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'GOPAY' }" @click="selectedMethod = 'GOPAY'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg" alt="GoPay" class="method-logo" />
            <span>GoPay</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'SHOPEEPAY' }" @click="selectedMethod = 'SHOPEEPAY'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg" alt="ShopeePay" class="method-logo" />
            <span>ShopeePay</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'OVO' }" @click="selectedMethod = 'OVO'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/OVO_logo.svg" alt="OVO" class="method-logo" />
            <span>OVO</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'DANA' }" @click="selectedMethod = 'DANA'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" alt="DANA" class="method-logo" />
            <span>DANA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'LINKAJA' }" @click="selectedMethod = 'LINKAJA'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/LinkAja.svg" alt="LinkAja" class="method-logo" />
            <span>LinkAja</span>
          </button>
        </div>
      </div>

      <!-- Tab Content: TRANSFER -->
      <div v-else-if="activeTab === 'TRANSFER'" class="tab-body">
        <div class="method-grid">
          <button class="method-card" :class="{ active: selectedMethod === 'BCA_VA' }" @click="selectedMethod = 'BCA_VA'">
            <div class="bank-logo bca">BCA</div>
            <span>BCA VA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'MANDIRI_VA' }" @click="selectedMethod = 'MANDIRI_VA'">
            <div class="bank-logo mandiri">Mandiri</div>
            <span>Mandiri VA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'BNI_VA' }" @click="selectedMethod = 'BNI_VA'">
            <div class="bank-logo bni">BNI</div>
            <span>BNI VA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'BRI_VA' }" @click="selectedMethod = 'BRI_VA'">
            <div class="bank-logo bri">BRI</div>
            <span>BRI VA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'PERMATA_VA' }" @click="selectedMethod = 'PERMATA_VA'">
            <div class="bank-logo permata">Permata</div>
            <span>Permata VA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'CIMB_VA' }" @click="selectedMethod = 'CIMB_VA'">
            <div class="bank-logo cimb">CIMB</div>
            <span>CIMB Niaga</span>
          </button>
        </div>
      </div>
      <!-- Error Message -->
      <div v-if="errorMessage" class="error-banner">
        <AlertCircle :size="18" />
        <span>{{ errorMessage }}</span>
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

.error-banner {
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: var(--danger);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 500;
}

.modal-footer {
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

.error-banner {
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: var(--danger);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  font-weight: 500;
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

.method-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.method-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-main);
  font-weight: 600;
  font-size: 0.85rem;
}
.method-card:hover {
  background: var(--bg-card-hover);
}
.method-card.active {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
}
.method-logo {
  width: 40px;
  height: 24px;
  object-fit: contain;
}
.bank-logo {
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: -0.5px;
  font-style: italic;
  width: 40px;
  text-align: center;
}
.bca { color: #0066AE; }
.mandiri { color: #003D79; }
.bni { color: #005E6A; color: #F15A23; } /* BNI uses orange/teal */
.bri { color: #00529C; }
.permata { color: #006885; }
.cimb { color: #8A1538; }

</style>
