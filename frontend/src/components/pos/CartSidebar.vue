<script setup lang="ts">
import { ref } from 'vue';
import { useCartStore } from '@/stores/cart';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  ArrowRight,
  Sparkles,
  Percent,
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'open-payment'): void;
}>();

const cartStore = useCartStore();
const showDiscountInput = ref(false);
const customDiscount = ref(cartStore.discountPercent);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
};

const applyDiscount = (percent: number) => {
  cartStore.setDiscount(percent);
  customDiscount.value = percent;
};

const handleHoldOrder = () => {
  if (cartStore.items.length === 0) return;
  cartStore.holdCurrentCart();
};
</script>

<template>
  <aside class="cart-sidebar">
    <!-- Header -->
    <div class="cart-header">
      <div class="header-title">
        <ShoppingBag :size="22" class="title-icon" />
        <h2>Pesanan Kasir</h2>
        <span class="cart-count badge badge-primary mono">{{ cartStore.itemCount }}</span>
      </div>

      <div class="header-actions" v-if="cartStore.items.length > 0">
        <button
          class="btn-action-icon"
          title="Tahan Pesanan (Hold)"
          @click="handleHoldOrder"
        >
          <Clock :size="16" />
        </button>
        <button
          class="btn-action-icon danger"
          title="Kosongkan Keranjang"
          @click="cartStore.clearCart"
        >
          <Trash2 :size="16" />
        </button>
      </div>
    </div>

    <!-- Held Orders Notification Banner if any -->
    <div v-if="cartStore.heldCarts.length > 0" class="held-orders-banner">
      <div class="held-info">
        <Clock :size="14" />
        <span>{{ cartStore.heldCarts.length }} Transaksi Ditahan</span>
      </div>
      <div class="held-chips">
        <button
          v-for="hold in cartStore.heldCarts"
          :key="hold.id"
          class="held-chip"
          @click="cartStore.restoreHeldCart(hold.id)"
        >
          Pulihkan ({{ hold.items.length }} item)
        </button>
      </div>
    </div>

    <!-- Items List -->
    <div class="cart-items-wrapper">
      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <div class="empty-icon-wrap">
          <ShoppingBag :size="40" />
        </div>
        <p class="empty-text">Keranjang Masih Kosong</p>
        <span class="empty-sub">Pilih produk di katalog untuk menambahkan pesanan</span>
      </div>

      <div v-else class="items-list">
        <div
          v-for="item in cartStore.items"
          :key="item.product.id"
          class="cart-item-row"
        >
          <div class="item-main">
            <div class="item-info">
              <h4 class="item-name">{{ item.product.name }}</h4>
              <span class="item-unit-price mono">{{ formatPrice(item.product.price) }}</span>
            </div>
            <span class="item-subtotal mono">{{ formatPrice(item.product.price * item.quantity) }}</span>
          </div>

          <div class="item-controls">
            <div class="qty-stepper">
              <button
                class="stepper-btn"
                @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)"
              >
                <Minus :size="14" />
              </button>
              <span class="qty-val mono">{{ item.quantity }}</span>
              <button
                class="stepper-btn"
                @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)"
              >
                <Plus :size="14" />
              </button>
            </div>

            <button
              class="item-delete-btn"
              title="Hapus item"
              @click="cartStore.removeItem(item.product.id)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart Footer & Checkout Summary -->
    <div class="cart-footer">
      <!-- Discount Quick Bar -->
      <div class="discount-section">
        <div class="discount-header">
          <span class="section-label">
            <Percent :size="13" /> Diskon
          </span>
          <button
            class="toggle-discount-btn"
            @click="showDiscountInput = !showDiscountInput"
          >
            {{ showDiscountInput ? 'Sembunyikan' : 'Atur Diskon' }}
          </button>
        </div>

        <div v-if="showDiscountInput" class="discount-pills">
          <button
            v-for="d in [0, 5, 10, 15, 20]"
            :key="d"
            class="discount-pill"
            :class="{ active: cartStore.discountPercent === d }"
            @click="applyDiscount(d)"
          >
            {{ d === 0 ? '0%' : `${d}%` }}
          </button>
        </div>
      </div>

      <!-- Bill Breakdown -->
      <div class="summary-card">
        <div class="summary-row">
          <span class="summary-label">Subtotal</span>
          <span class="summary-val mono">{{ formatPrice(cartStore.subtotal) }}</span>
        </div>

        <div v-if="cartStore.discountAmount > 0" class="summary-row text-discount">
          <span class="summary-label">Diskon ({{ cartStore.discountPercent }}%)</span>
          <span class="summary-val mono">-{{ formatPrice(cartStore.discountAmount) }}</span>
        </div>

        <div class="summary-row">
          <span class="summary-label">PPN (11%)</span>
          <span class="summary-val mono">{{ formatPrice(cartStore.taxAmount) }}</span>
        </div>

        <div class="summary-divider"></div>

        <div class="summary-row total-row">
          <span class="total-label">Total Tagihan</span>
          <span class="total-val mono">{{ formatPrice(cartStore.grandTotal) }}</span>
        </div>
      </div>

      <!-- Pay Button -->
      <button
        class="btn btn-primary btn-checkout"
        :disabled="cartStore.items.length === 0"
        @click="emit('open-payment')"
      >
        <span>Proses Pembayaran</span>
        <ArrowRight :size="18" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.cart-sidebar {
  width: 380px;
  background: var(--bg-sidebar);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 72px);
  position: sticky;
  top: 72px;
}

.cart-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title h2 {
  font-size: 1.1rem;
  font-weight: 700;
}

.title-icon {
  color: var(--primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-action-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-action-icon:hover {
  background: var(--bg-card-hover);
  color: var(--text-main);
}

.btn-action-icon.danger:hover {
  background: var(--danger-light);
  color: var(--danger);
  border-color: rgba(244, 63, 94, 0.3);
}

.held-orders-banner {
  background: rgba(245, 158, 11, 0.1);
  border-bottom: 1px solid rgba(245, 158, 11, 0.25);
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.held-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #fbbf24;
}

.held-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.held-chip {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: #fbbf24;
  color: #000;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

.cart-items-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.empty-cart {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-dim);
  padding: 20px 0;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.03);
  border: 1px dashed rgba(15, 23, 42, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.empty-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 0.8rem;
  max-width: 200px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item-row {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all var(--transition-fast);
}

.cart-item-row:hover {
  border-color: rgba(15, 23, 42, 0.15);
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

.item-unit-price {
  font-size: 0.78rem;
  color: var(--text-dim);
}

.item-subtotal {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
}

.item-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qty-stepper {
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.stepper-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.stepper-btn:hover {
  background: rgba(15, 23, 42, 0.05);
}

.qty-val {
  min-width: 32px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.item-delete-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.item-delete-btn:hover {
  color: var(--danger);
}

.cart-footer {
  background: var(--bg-dark);
  border-top: 1px solid var(--border);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.discount-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.discount-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.toggle-discount-btn {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: var(--primary);
  cursor: pointer;
  font-weight: 600;
}

.discount-pills {
  display: flex;
  gap: 6px;
}

.discount-pill {
  flex: 1;
  padding: 6px 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.discount-pill.active {
  background: var(--accent-indigo);
  color: #fff;
  border-color: transparent;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.84rem;
}

.summary-label {
  color: var(--text-muted);
}

.summary-val {
  color: var(--text-main);
  font-weight: 500;
}

.text-discount .summary-val {
  color: #f43f5e;
}

.summary-divider {
  height: 1px;
  background: var(--border);
  margin: 6px 0;
}

.total-row {
  font-size: 1.1rem;
}

.total-label {
  font-weight: 700;
  color: var(--text-main);
}

.total-val {
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--primary);
}

.btn-checkout {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .cart-sidebar {
    width: 320px;
  }
}
</style>
