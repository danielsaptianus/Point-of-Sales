<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProductStore } from '@/stores/products';
import type { Transaction } from '@/types';
import CategoryFilter from '@/components/pos/CategoryFilter.vue';
import ProductCard from '@/components/pos/ProductCard.vue';
import CartSidebar from '@/components/pos/CartSidebar.vue';
import PaymentModal from '@/components/pos/PaymentModal.vue';
import ReceiptModal from '@/components/pos/ReceiptModal.vue';
import {
  ShoppingBag,
  Search,
  LogOut,
  User as UserIcon,
  Clock,
  RefreshCw,
  PackageOpen,
  Sparkles,
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const productStore = useProductStore();

// Modals State
const showPaymentModal = ref(false);
const showReceiptModal = ref(false);
const currentTransaction = ref<Transaction | null>(null);

// Clock state
const currentTime = ref(new Date().toLocaleTimeString('id-ID'));
let timerInterval: any = null;

onMounted(() => {
  productStore.fetchProducts();
  timerInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('id-ID');
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const handleOpenPayment = () => {
  showPaymentModal.value = true;
};

const handlePaymentSuccess = (tx: Transaction) => {
  showPaymentModal.value = false;
  currentTransaction.value = tx;
  showReceiptModal.value = true;
};

const handleNewTransaction = () => {
  showReceiptModal.value = false;
  currentTransaction.value = null;
};
</script>

<template>
  <div class="pos-layout">
    <!-- Top Navigation Header -->
    <header class="pos-header">
      <!-- Left: Logo & Brand -->
      <div class="brand-section">
        <div class="logo-badge">
          <ShoppingBag :size="20" />
        </div>
        <div class="brand-info">
          <span class="brand-name">Arto POS</span>
          <span class="brand-sub">Register #01</span>
        </div>
      </div>

      <!-- Center: Search Bar -->
      <div class="search-section">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input
            type="text"
            v-model="productStore.searchQuery"
            placeholder="Cari menu, makanan, minuman, atau scan SKU..."
            class="search-input"
          />
          <button
            v-if="productStore.searchQuery"
            class="clear-search-btn"
            @click="productStore.setSearch('')"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Right: Clock, Cashier Info, Logout -->
      <div class="header-right">
        <div class="time-chip">
          <Clock :size="14" />
          <span class="mono">{{ currentTime }}</span>
        </div>

        <div class="cashier-chip">
          <div class="cashier-avatar">
            <UserIcon :size="16" />
          </div>
          <div class="cashier-info">
            <span class="cashier-name">{{ authStore.cashierName }}</span>
            <span class="cashier-role">Kasir Aktif</span>
          </div>
        </div>

        <button class="btn-logout" title="Keluar dari sesi kasir" @click="handleLogout">
          <LogOut :size="18" />
        </button>
      </div>
    </header>

    <!-- Main Workspace (Catalog + Cart) -->
    <div class="pos-workspace">
      <!-- Left Column: Catalog -->
      <main class="pos-catalog">
        <!-- Category Filter Pills -->
        <div class="catalog-top">
          <CategoryFilter />
        </div>

        <!-- Products Grid -->
        <div class="catalog-content">
          <div v-if="productStore.filteredProducts.length === 0" class="empty-products">
            <PackageOpen :size="48" class="empty-icon" />
            <h3>Tidak Ada Produk Ditemukan</h3>
            <p>Coba gunakan kata kunci pencarian lain atau pilih kategori lain.</p>
          </div>

          <div v-else class="products-grid">
            <ProductCard
              v-for="product in productStore.filteredProducts"
              :key="product.id"
              :product="product"
            />
          </div>
        </div>
      </main>

      <!-- Right Column: Cart Sidebar -->
      <CartSidebar @open-payment="handleOpenPayment" />
    </div>

    <!-- Modals -->
    <PaymentModal
      :isOpen="showPaymentModal"
      @close="showPaymentModal = false"
      @success="handlePaymentSuccess"
    />

    <ReceiptModal
      :isOpen="showReceiptModal"
      :transaction="currentTransaction"
      @new-transaction="handleNewTransaction"
    />
  </div>
</template>

<style scoped>
.pos-layout {
  min-height: 100vh;
  background-color: var(--bg-dark);
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.pos-header {
  height: 72px;
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
}

.logo-badge {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.brand-sub {
  font-size: 0.72rem;
  color: var(--primary);
  font-weight: 600;
}

.search-section {
  flex: 1;
  max-width: 540px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--text-dim);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 38px 10px 42px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  color: var(--text-main);
  font-family: var(--font-sans);
  font-size: 0.88rem;
  outline: none;
  transition: all var(--transition-fast);
}

.search-input:focus {
  border-color: var(--primary);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 2px 6px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.time-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.cashier-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px 4px 6px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
}

.cashier-avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
  background: var(--accent-indigo);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cashier-info {
  display: flex;
  flex-direction: column;
}

.cashier-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
}

.cashier-role {
  font-size: 0.68rem;
  color: var(--primary);
  font-weight: 600;
}

.btn-logout {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-logout:hover {
  background: var(--danger-light);
  color: var(--danger);
  border-color: rgba(244, 63, 94, 0.3);
}

/* Workspace Layout */
.pos-workspace {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 72px);
}

.pos-catalog {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.catalog-top {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-dark);
}

.catalog-content {
  flex: 1;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
}

.empty-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-dim);
}

.empty-icon {
  margin-bottom: 12px;
  color: var(--text-dim);
}

.empty-products h3 {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.empty-products p {
  font-size: 0.85rem;
  max-width: 300px;
}
</style>
