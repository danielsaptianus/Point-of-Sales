<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus, Search, Edit2, Trash2, Box } from 'lucide-vue-next';
import { useProductStore } from '@/stores/products';
import ProductFormModal from '@/components/admin/ProductFormModal.vue';
import type { Product } from '@/types';

const productStore = useProductStore();

const isModalOpen = ref(false);
const editingProduct = ref<Product | null>(null);

const searchQuery = ref('');
const selectedCategory = ref<number>(1);

// Load data on mount
onMounted(async () => {
  await productStore.fetchProducts();
});

const filteredProducts = computed(() => {
  let result = productStore.products;
  
  // Filter by category
  if (selectedCategory.value !== 1) {
    result = result.filter(p => p.category_id === selectedCategory.value);
  }
  
  // Filter by search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q)
    );
  }
  
  return result;
});

function getCategoryName(id: number) {
  const cat = productStore.categories.find(c => c.id === id);
  return cat ? cat.name : 'Unknown';
}

function openAddModal() {
  editingProduct.value = null;
  isModalOpen.value = true;
}

function openEditModal(product: Product) {
  editingProduct.value = product;
  isModalOpen.value = true;
}

async function handleDelete(product: Product) {
  if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
    await productStore.deleteProduct(product.id);
  }
}

function handleSave() {
  // Modal automatically closes and state updates since we use Pinia
}
</script>

<template>
  <div class="products-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Products Catalog</h1>
        <p class="page-subtitle">Manage your products, pricing, and inventory.</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <Plus :size="20" />
        <span>Add Product</span>
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="filter-bar">
      <div class="search-box">
        <Search class="search-icon" :size="20" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search products by name or SKU..." 
          class="search-input"
        />
      </div>
      
      <div class="category-filter">
        <select v-model="selectedCategory" class="filter-select">
          <option v-for="category in productStore.categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Product Info</th>
            <th>Category</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="7" class="empty-state">
              <div class="empty-content">
                <Box class="empty-icon" :size="48" />
                <h3>No products found</h3>
                <p>Try adjusting your search or add a new product.</p>
              </div>
            </td>
          </tr>
          
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>
              <div class="product-info">
                <div class="product-img">
                  <img :src="product.image" alt="product" v-if="product.image" />
                  <Box v-else :size="24" class="fallback-icon" />
                </div>
                <div class="product-details">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-desc" v-if="product.description">{{ product.description.substring(0, 30) }}...</span>
                </div>
              </div>
            </td>
            <td>
              <span class="category-badge">{{ getCategoryName(product.category_id) }}</span>
            </td>
            <td class="font-mono text-sm text-slate-500">{{ product.sku }}</td>
            <td class="font-medium text-slate-900">Rp {{ product.price.toLocaleString('id-ID') }}</td>
            <td>
              <span :class="['stock-badge', (product.stock_quantity || 0) <= 5 ? 'low-stock' : 'in-stock']">
                {{ product.stock_quantity || 0 }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', product.is_active ? 'active' : 'inactive']">
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="action-btn edit" @click="openEditModal(product)" title="Edit">
                  <Edit2 :size="18" />
                </button>
                <button class="action-btn delete" @click="handleDelete(product)" title="Delete">
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ProductFormModal 
      :is-open="isModalOpen" 
      :product-to-edit="editingProduct"
      @close="isModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.products-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  margin: 4px 0 0 0;
  color: #64748b;
  font-size: 0.875rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  color: #94a3b8;
  margin-right: 8px;
}

.search-input {
  border: none;
  background: none;
  outline: none;
  width: 100%;
  color: #334155;
  font-size: 0.875rem;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  color: #334155;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
}

.table-container {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background-color: #f8fafc;
  padding: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fallback-icon {
  color: #94a3b8;
}

.product-details {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.875rem;
}

.product-desc {
  font-size: 0.75rem;
  color: #64748b;
}

.category-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.stock-badge {
  font-weight: 600;
  font-size: 0.875rem;
}

.stock-badge.in-stock {
  color: #10b981;
}

.stock-badge.low-stock {
  color: #ef4444;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #059669;
}

.status-badge.inactive {
  background-color: #f1f5f9;
  color: #64748b;
}

.actions-col {
  width: 100px;
  text-align: right;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit {
  color: #3b82f6;
  background-color: #eff6ff;
}

.action-btn.edit:hover {
  background-color: #dbeafe;
}

.action-btn.delete {
  color: #ef4444;
  background-color: #fef2f2;
}

.action-btn.delete:hover {
  background-color: #fee2e2;
}

.empty-state {
  text-align: center;
  padding: 48px !important;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 8px;
}

.empty-content h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #334155;
  font-weight: 600;
}

.empty-content p {
  margin: 0;
  font-size: 0.875rem;
}

/* Typography utilities */
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.font-medium { font-weight: 500; }
.text-sm { font-size: 0.875rem; }
.text-slate-500 { color: #64748b; }
.text-slate-900 { color: #0f172a; }
</style>
