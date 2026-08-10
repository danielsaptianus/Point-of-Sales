<script setup lang="ts">
import { computed } from 'vue';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cart';
import { Plus, ShoppingBag, AlertCircle } from 'lucide-vue-next';

const props = defineProps<{
  product: Product;
}>();

const cartStore = useCartStore();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
};

const stockStatus = computed(() => {
  const stock = props.product.stock_quantity ?? 25;
  if (stock <= 0) return { label: 'Habis', type: 'danger' };
  if (stock < 10) return { label: `Sisa ${stock}`, type: 'warning' };
  return { label: `Stok ${stock}`, type: 'success' };
});

const handleAddToCart = () => {
  cartStore.addItem(props.product);
};
</script>

<template>
  <div class="product-card" @click="handleAddToCart">
    <div class="card-header">
      <span class="sku-badge mono">{{ product.sku }}</span>
      <span
        class="stock-badge"
        :class="{
          'stock-success': stockStatus.type === 'success',
          'stock-warning': stockStatus.type === 'warning',
          'stock-danger': stockStatus.type === 'danger',
        }"
      >
        <span class="stock-dot"></span>
        {{ stockStatus.label }}
      </span>
    </div>

    <div class="product-icon-wrap">
      <div class="icon-avatar">
        <ShoppingBag :size="28" class="icon-svg" />
      </div>
    </div>

    <div class="card-body">
      <h3 class="product-title" :title="product.name">{{ product.name }}</h3>
      <p class="product-desc" v-if="product.description">{{ product.description }}</p>
    </div>

    <div class="card-footer">
      <div class="price-box">
        <span class="price-label">Harga</span>
        <span class="price-val mono">{{ formatPrice(product.price) }}</span>
      </div>

      <button class="add-btn" title="Tambah ke keranjang" @click.stop="handleAddToCart">
        <Plus :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  position: relative;
  transition: all var(--transition-normal);
  user-select: none;
}

.product-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(16, 185, 129, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.45);
}

.product-card:active {
  transform: translateY(0);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sku-badge {
  font-size: 0.72rem;
  color: var(--text-dim);
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
}

.stock-badge {
  font-size: 0.72rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.stock-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.stock-success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}
.stock-success .stock-dot {
  background: #34d399;
}

.stock-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}
.stock-warning .stock-dot {
  background: #fbbf24;
}

.stock-danger {
  background: rgba(244, 63, 94, 0.15);
  color: #f87171;
}
.stock-danger .stock-dot {
  background: #f87171;
}

.product-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
}

.icon-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  transition: all var(--transition-bounce);
}

.product-card:hover .icon-avatar {
  transform: scale(1.08);
  color: #ffffff;
  background: var(--primary-gradient);
}

.card-body {
  flex: 1;
}

.product-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}

.card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.price-box {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.price-val {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
}

.add-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: var(--bg-input);
  border: 1px solid var(--border-light);
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-btn:hover {
  background: var(--primary-gradient);
  color: #ffffff;
  border-color: transparent;
  transform: scale(1.05);
}
</style>
