<script setup lang="ts">
import { useProductStore } from '@/stores/products';
import {
  LayoutGrid,
  Utensils,
  Coffee,
  CupSoda,
  Cake,
  Percent,
} from 'lucide-vue-next';

const productStore = useProductStore();

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Utensils':
      return Utensils;
    case 'Coffee':
      return Coffee;
    case 'CupSoda':
      return CupSoda;
    case 'Cake':
      return Cake;
    case 'Percent':
      return Percent;
    case 'LayoutGrid':
    default:
      return LayoutGrid;
  }
};
</script>

<template>
  <div class="category-filter-bar">
    <button
      v-for="cat in productStore.categories"
      :key="cat.id"
      class="cat-chip"
      :class="{ active: productStore.selectedCategoryId === cat.id }"
      @click="productStore.setCategory(cat.id)"
    >
      <component :is="getIcon(cat.icon)" class="cat-icon" :size="18" />
      <span>{{ cat.name }}</span>
    </button>
  </div>
</template>

<style scoped>
.category-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px 12px 2px;
  scrollbar-width: thin;
}

.cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
  user-select: none;
}

.cat-chip:hover {
  background: var(--bg-card-hover);
  color: var(--text-main);
  border-color: rgba(15, 23, 42, 0.15);
  transform: translateY(-1px);
}

.cat-chip.active {
  background: var(--primary-gradient);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4px 16px var(--primary-glow);
}

.cat-icon {
  flex-shrink: 0;
}
</style>
