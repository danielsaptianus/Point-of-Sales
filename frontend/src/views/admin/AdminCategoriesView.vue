<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus, Search, Edit2, Trash2, LayoutGrid } from 'lucide-vue-next';
import { useProductStore } from '@/stores/products';
import CategoryFormModal from '@/components/admin/CategoryFormModal.vue';
import type { Category } from '@/types';

const productStore = useProductStore();

const isModalOpen = ref(false);
const editingCategory = ref<Category | null>(null);
const searchQuery = ref('');

// Load data on mount
onMounted(async () => {
  // fetchProducts also fetches categories
  if (productStore.categories.length === 0) {
    await productStore.fetchProducts();
  }
});

const filteredCategories = computed(() => {
  // Exclude the 'Semua Kategori' (id: 0) which is just a frontend filter option
  let result = productStore.categories.filter(c => c.id !== 0);
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(c => c.name.toLowerCase().includes(q));
  }
  return result;
});

function openAddModal() {
  editingCategory.value = null;
  isModalOpen.value = true;
}

function openEditModal(category: Category) {
  editingCategory.value = category;
  isModalOpen.value = true;
}

async function handleDelete(category: Category) {
  if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
    await productStore.deleteCategory(category.id);
  }
}

function handleSave() {
  // Form modal handles save via store, modal auto-closes
}
</script>

<template>
  <div class="categories-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Categories</h1>
        <p class="page-subtitle">Manage product categories and groupings.</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <Plus :size="20" />
        <span>Add Category</span>
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="filter-bar">
      <div class="search-box">
        <Search class="search-icon" :size="20" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search categories by name..." 
          class="search-input"
        />
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-12">No</th>
            <th>Icon</th>
            <th>Category Name</th>
            <th>Description</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredCategories.length === 0">
            <td colspan="5" class="empty-state">
              <div class="empty-content">
                <LayoutGrid class="empty-icon" :size="48" />
                <h3>No categories found</h3>
                <p>Try adjusting your search or add a new category.</p>
              </div>
            </td>
          </tr>
          
          <tr v-for="(category, index) in filteredCategories" :key="category.id">
            <td class="text-center text-sm text-slate-500 font-medium">{{ index + 1 }}</td>
            <td>
              <div class="icon-badge">
                <!-- If dynamic icons aren't perfectly mapped, use a fallback layoutgrid -->
                <LayoutGrid :size="18" />
              </div>
            </td>
            <td>
              <span class="category-name">{{ category.name }}</span>
            </td>
            <td>
              <span class="category-desc">{{ category.description || '-' }}</span>
            </td>
            <td>
              <div class="actions">
                <button class="action-btn edit" @click="openEditModal(category)" title="Edit">
                  <Edit2 :size="18" />
                </button>
                <button class="action-btn delete" @click="handleDelete(category)" title="Delete">
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CategoryFormModal 
      :is-open="isModalOpen" 
      :category-to-edit="editingCategory"
      @close="isModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.categories-page {
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

.icon-badge {
  display: inline-flex;
  padding: 8px;
  background-color: #f1f5f9;
  color: #3b82f6;
  border-radius: 8px;
}

.category-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.875rem;
}

.category-desc {
  color: #64748b;
  font-size: 0.875rem;
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
</style>
