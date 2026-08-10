<script setup lang="ts">
import type { Transaction } from '@/types';
import { Printer, PlusCircle, CheckCircle2 } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  transaction: Transaction | null;
}>();

const emit = defineEmits<{
  (e: 'new-transaction'): void;
}>();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (isoString?: string) => {
  if (!isoString) return new Date().toLocaleString('id-ID');
  return new Date(isoString).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const handlePrint = () => {
  window.print();
};
</script>

<template>
  <div v-if="isOpen && transaction" class="modal-overlay">
    <div class="modal-card receipt-modal">
      <div class="success-top-badge">
        <CheckCircle2 :size="28" class="success-icon" />
        <h3>Transaksi Berhasil!</h3>
        <p>Pembayaran telah diterima dan dicatat ke sistem</p>
      </div>

      <!-- Printable Thermal Paper Receipt -->
      <div class="thermal-receipt" id="printable-receipt">
        <div class="receipt-header">
          <h2 class="store-name">ARTO POINT OF SALES</h2>
          <p class="store-info">Jl. Sudirman No. 108, Jakarta Pusat</p>
          <p class="store-info">Telp: (021) 555-0192</p>
        </div>

        <div class="receipt-divider">--------------------------------</div>

        <div class="receipt-meta mono">
          <div class="meta-row">
            <span>No: {{ transaction.invoice_number }}</span>
          </div>
          <div class="meta-row">
            <span>Tgl: {{ formatDate(transaction.created_at) }}</span>
          </div>
          <div class="meta-row">
            <span>Kasir: {{ transaction.cashier_name }}</span>
          </div>
        </div>

        <div class="receipt-divider">--------------------------------</div>

        <!-- Items -->
        <div class="receipt-items mono">
          <div v-for="item in transaction.items" :key="item.product_id" class="receipt-item">
            <div class="item-line-1">{{ item.product_name }}</div>
            <div class="item-line-2">
              <span>{{ item.quantity }} x {{ formatPrice(item.price) }}</span>
              <span>{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>
        </div>

        <div class="receipt-divider">--------------------------------</div>

        <!-- Totals -->
        <div class="receipt-totals mono">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>{{ formatPrice(transaction.subtotal) }}</span>
          </div>
          <div v-if="transaction.discount > 0" class="total-row">
            <span>Diskon:</span>
            <span>-{{ formatPrice(transaction.discount) }}</span>
          </div>
          <div class="total-row">
            <span>PPN (11%):</span>
            <span>{{ formatPrice(transaction.tax) }}</span>
          </div>
          <div class="receipt-divider-thin"></div>
          <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>{{ formatPrice(transaction.total) }}</span>
          </div>
          <div class="total-row">
            <span>Metode:</span>
            <span>{{ transaction.payment?.payment_method || 'CASH' }}</span>
          </div>
          <div v-if="transaction.payment?.payment_method === 'CASH'" class="total-row">
            <span>Bayar:</span>
            <span>{{ formatPrice(transaction.payment.amount_paid) }}</span>
          </div>
          <div v-if="transaction.payment?.payment_method === 'CASH'" class="total-row">
            <span>Kembali:</span>
            <span>{{ formatPrice(transaction.payment.change) }}</span>
          </div>
        </div>

        <div class="receipt-divider">--------------------------------</div>

        <div class="receipt-footer">
          <p>*** TERIMA KASIH ***</p>
          <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="handlePrint">
          <Printer :size="18" />
          <span>Cetak Struk</span>
        </button>
        <button class="btn btn-primary" @click="emit('new-transaction')">
          <PlusCircle :size="18" />
          <span>Transaksi Baru</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.receipt-modal {
  padding: 24px;
  max-width: 440px;
}

.success-top-badge {
  text-align: center;
  margin-bottom: 20px;
}

.success-icon {
  color: var(--primary);
  margin-bottom: 8px;
}

.success-top-badge h3 {
  font-size: 1.2rem;
}

.success-top-badge p {
  font-size: 0.82rem;
  color: var(--text-muted);
}

/* Thermal receipt layout */
.thermal-receipt {
  background: #fdfdfd;
  color: #111111;
  padding: 20px 18px;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
}

.receipt-header {
  text-align: center;
}

.store-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #000000;
  margin-bottom: 2px;
}

.store-info {
  font-size: 0.72rem;
  color: #555555;
}

.receipt-divider {
  text-align: center;
  color: #888888;
  margin: 6px 0;
  overflow: hidden;
  white-space: nowrap;
  letter-spacing: -1px;
}

.receipt-divider-thin {
  height: 1px;
  background: #cccccc;
  margin: 4px 0;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 2px;
}

.receipt-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-line-1 {
  font-weight: 600;
}

.item-line-2 {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #333333;
}

.receipt-totals {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.total-row {
  display: flex;
  justify-content: space-between;
}

.grand-total {
  font-size: 0.95rem;
  font-weight: 800;
  color: #000000;
}

.receipt-footer {
  text-align: center;
  font-size: 0.72rem;
  color: #555555;
  margin-top: 4px;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media print {
  body * {
    visibility: hidden;
  }
  #printable-receipt, #printable-receipt * {
    visibility: visible;
  }
  #printable-receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none;
    padding: 0;
  }
}
</style>
