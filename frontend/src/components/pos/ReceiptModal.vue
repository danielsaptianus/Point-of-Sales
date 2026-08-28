<script setup lang="ts">
import type { Transaction } from '@/types';
import { Printer, PlusCircle, CheckCircle2, Clock, CreditCard } from 'lucide-vue-next';

import { ref, watch, onUnmounted } from 'vue';
import api from '@/plugins/axios';
import { printReceiptBluetooth } from '@/services/bluetoothPrinter';

const props = defineProps<{
  isOpen: boolean;
  transaction: Transaction | null;
}>();

const emit = defineEmits<{
  (e: 'new-transaction'): void;
}>();

const localTx = ref<Transaction | null>(null);
let pollInterval: any = null;

const checkStatus = async () => {
  if (!localTx.value || localTx.value.status !== 'PENDING') {
    stopPolling();
    return;
  }
  try {
    console.log(`Polling status for TX ${localTx.value.id}...`);
    const res = await api.get(`/sales/${localTx.value.id}?t=${Date.now()}`);
    const updated = res.data.data;
    console.log('Polled data:', updated);
    
    if (updated && updated.status !== 'PENDING') {
      console.log('Status changed to:', updated.status);
      localTx.value = updated;
      stopPolling();
    }
  } catch (error) {
    console.error('Failed to poll status', error);
  }
};

const startPolling = () => {
  stopPolling();
  if (localTx.value && localTx.value.status === 'PENDING') {
    pollInterval = setInterval(checkStatus, 3000);
  }
};

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

watch(
  () => props.transaction,
  (newTx) => {
    if (newTx) {
      localTx.value = JSON.parse(JSON.stringify(newTx));
      if (props.isOpen) startPolling();
    } else {
      localTx.value = null;
      stopPolling();
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (!open) {
      stopPolling();
    } else if (localTx.value && localTx.value.status === 'PENDING') {
      startPolling();
    }
  }
);

onUnmounted(() => {
  stopPolling();
});

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

const handlePrintBluetooth = async () => {
  if (!localTx.value) return;
  try {
    const success = await printReceiptBluetooth(localTx.value);
    if (success) {
      alert('Berhasil mengirim data cetak ke printer Bluetooth!');
    }
  } catch (err: any) {
    alert('Terjadi kesalahan tidak terduga: ' + err.message);
  }
};

const handlePrint = () => {
  const receiptEl = document.getElementById('printable-receipt');
  if (!receiptEl) return;
  
  const printContents = receiptEl.innerHTML;
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  const iframeDoc = iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>Struk Pembayaran</title>
          <style>
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 12px; 
              margin: 0 auto; 
              padding: 10px; 
              color: #000;
              width: 100%;
              max-width: 300px; /* Lebar standar kertas thermal 80mm/58mm */
            }
            .receipt-header { text-align: center; margin-bottom: 10px; }
            .store-name { font-size: 16px; font-weight: bold; margin: 0 0 2px 0; }
            .store-info { font-size: 10px; margin: 0; }
            .receipt-divider { 
              border-bottom: 1px dashed #000; 
              margin: 8px 0; 
              color: transparent; 
            }
            .receipt-divider-thin { border-bottom: 1px solid #000; margin: 4px 0; }
            .meta-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .receipt-items { margin: 10px 0; }
            .receipt-item { margin-bottom: 6px; }
            .item-line-1 { font-weight: bold; }
            .item-line-2 { display: flex; justify-content: space-between; }
            .receipt-totals { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
            .total-row { display: flex; justify-content: space-between; }
            .grand-total { font-size: 14px; font-weight: bold; margin: 4px 0; }
            .receipt-footer { text-align: center; font-size: 10px; margin-top: 15px; }
            
            /* Sembunyikan elemen yang tidak perlu dicetak jika terbawa */
            .modal-actions, .success-top-badge, .btn { display: none !important; }
            
            @page { margin: 0; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Hapus iframe setelah dialog print ditutup
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 300);
  }
};
</script>

<template>
  <div v-if="isOpen && localTx" class="modal-overlay">
    <div class="modal-card receipt-modal">
      <div class="success-top-badge">
        <CheckCircle2 v-if="localTx.status === 'PAID'" :size="28" class="success-icon" />
        <Clock v-else :size="28" class="warning-icon" />
        
        <h3>{{ localTx.status === 'PAID' ? 'Transaksi Berhasil!' : 'Menunggu Pembayaran' }}</h3>
        <p>{{ localTx.status === 'PAID' ? 'Pembayaran telah diterima dan dicatat ke sistem' : 'Silakan selesaikan pembayaran online via Midtrans' }}</p>
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
            <span>No: {{ localTx.invoice_number }}</span>
          </div>
          <div class="meta-row">
            <span>Tgl: {{ formatDate(localTx.created_at) }}</span>
          </div>
          <div class="meta-row">
            <span>Kasir: {{ localTx.cashier_name }}</span>
          </div>
          <div class="meta-row">
            <span>Status: <strong>{{ localTx.status }}</strong></span>
          </div>
        </div>

        <div class="receipt-divider">--------------------------------</div>

        <!-- Items -->
        <div class="receipt-items mono">
          <div v-for="item in localTx.items" :key="item.product_id" class="receipt-item">
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
            <span>{{ formatPrice(localTx.subtotal) }}</span>
          </div>
          <div v-if="localTx.discount > 0" class="total-row">
            <span>Diskon:</span>
            <span>-{{ formatPrice(localTx.discount) }}</span>
          </div>
          <div class="total-row">
            <span>PPN (11%):</span>
            <span>{{ formatPrice(localTx.tax) }}</span>
          </div>
          <div class="receipt-divider-thin"></div>
          <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>{{ formatPrice(localTx.total) }}</span>
          </div>
          <div class="total-row">
            <span>Metode:</span>
            <span>{{ localTx.payment?.payment_method || 'CASH' }}</span>
          </div>
          <div v-if="localTx.payment?.payment_method === 'CASH'" class="total-row">
            <span>Bayar:</span>
            <span>{{ formatPrice(localTx.payment?.amount_paid || 0) }}</span>
          </div>
          <div v-if="localTx.payment?.payment_method === 'CASH'" class="total-row">
            <span>Kembali:</span>
            <span>{{ formatPrice(localTx.payment?.change || 0) }}</span>
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
        <a 
          v-if="localTx.payment?.checkout_url && localTx.status === 'PENDING'"
          :href="localTx.payment.checkout_url"
          target="_blank"
          class="btn btn-warning midtrans-btn"
        >
          <CreditCard :size="18" />
          <span>Buka Midtrans</span>
        </a>
        
        <button class="btn btn-outline" @click="handlePrintBluetooth">
          <Printer :size="18" /> Cetak Struk
        </button>
        <button class="btn btn-primary" @click="emit('new-transaction')">
          <PlusCircle :size="18" />
          <span>Selesai</span>
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

.warning-icon {
  color: #f59e0b;
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
</style>
