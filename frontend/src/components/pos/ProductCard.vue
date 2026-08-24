<script setup lang="ts">
import { computed } from 'vue';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cart';
import { Plus } from 'lucide-vue-next';

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

const initials = computed(() => {
  const words = props.product.name.split(' ');
  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return props.product.name.substring(0, 2).toUpperCase();
});

const avatarColor = computed(() => {
  const colors = [
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // blue
    'linear-gradient(135deg, #10b981 0%, #059669 100%)', // emerald
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // orange
    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', // purple
    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', // pink
  ];
  let sum = 0;
  for (let i = 0; i < props.product.name.length; i++) {
    sum += props.product.name.charCodeAt(i);
  }
  return colors[sum % colors.length];
});

const handleAddToCart = () => {
  if ((props.product.stock_quantity ?? 0) <= 0) return;
  cartStore.addItem(props.product);
};
</script>

<template>
  <div class="product-card" :class="{'out-of-stock': stockStatus.type === 'danger'}" @click="handleAddToCart">
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
      <div class="icon-avatar" :style="{ background: avatarColor }">
        <span class="avatar-text">{{ initials }}</span>
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

      <button class="add-btn" :disabled="stockStatus.type === 'danger'" title="Tambah ke keranjang" @click.stop="handleAddToCart">
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

.product-card.out-of-stock {
  opacity: 0.6;
  cursor: not-allowed;
}

.product-card:not(.out-of-stock):hover {
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
  background: var(--bg-input);
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
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: all var(--transition-bounce);
}

.avatar-text {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 1px;
}

.product-card:hover .icon-avatar {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
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

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-btn:not(:disabled):hover {
  background: var(--primary-gradient);
  color: #ffffff;
  border-color: transparent;
  transform: scale(1.05);
}
</style>
