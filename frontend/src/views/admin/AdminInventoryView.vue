<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { PackagePlus, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-vue-next';
import { useInventoryStore } from '@/stores/inventory';
import { useProductStore } from '@/stores/products';
import StockAdjustmentModal from '@/components/admin/StockAdjustmentModal.vue';
import type { StockTransaction } from '@/types';

const inventoryStore = useInventoryStore();
const productStore = useProductStore();

const isModalOpen = ref(false);
const filterType = ref<'ALL' | 'IN' | 'OUT' | 'ADJUSTMENT'>('ALL');

onMounted(async () => {
  // Ensure products are loaded so we have product names
  if (productStore.products.length === 0) {
    await productStore.fetchProducts();
  }
  // Load mock history
  inventoryStore.initMockData();
});

const filteredHistory = computed(() => {
  if (filterType.value === 'ALL') return inventoryStore.stockHistory;
  return inventoryStore.stockHistory.filter(h => h.type === filterType.value);
});

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getProductName(id: number, fallback?: string) {
  const p = productStore.products.find(prod => prod.id === id);
  return p ? p.name : (fallback || `Product #${id}`);
}
</script>

<template>
  <div class="inventory-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Inventory Management</h1>
        <p class="page-subtitle">Track stock movements and perform manual adjustments.</p>
      </div>
      <button class="btn-primary" @click="isModalOpen = true">
        <PackagePlus :size="20" />
        <span>Record Movement</span>
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="icon-wrap bg-blue"><Activity :size="24" class="text-blue" /></div>
        <div class="stat-info">
          <span class="stat-label">Total Movements</span>
          <span class="stat-value">{{ inventoryStore.stockHistory.length }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="icon-wrap bg-green"><ArrowDownRight :size="24" class="text-green" /></div>
        <div class="stat-info">
          <span class="stat-label">Stock In (Last 30d)</span>
          <span class="stat-value">{{ inventoryStore.stockHistory.filter(h => h.type === 'IN').length }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="icon-wrap bg-red"><ArrowUpRight :size="24" class="text-red" /></div>
        <div class="stat-info">
          <span class="stat-label">Stock Out (Last 30d)</span>
          <span class="stat-value">{{ inventoryStore.stockHistory.filter(h => h.type === 'OUT').length }}</span>
        </div>
      </div>
    </div>

    <!-- History Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Movement History</h3>
        <div class="filter-tabs">
          <button :class="{ active: filterType === 'ALL' }" @click="filterType = 'ALL'">All</button>
          <button :class="{ active: filterType === 'IN' }" @click="filterType = 'IN'">In</button>
          <button :class="{ active: filterType === 'OUT' }" @click="filterType = 'OUT'">Out</button>
          <button :class="{ active: filterType === 'ADJUSTMENT' }" @click="filterType = 'ADJUSTMENT'">Adjustments</button>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredHistory.length === 0">
              <td colspan="5" class="empty-state">No stock movements found.</td>
            </tr>
            <tr v-for="txn in filteredHistory" :key="txn.id">
              <td class="text-slate-500 text-sm">{{ formatDate(txn.created_at) }}</td>
              <td class="font-medium text-slate-900">{{ getProductName(txn.product_id, txn.product_name) }}</td>
              <td>
                <span class="type-badge" :class="txn.type.toLowerCase()">
                  <ArrowDownRight v-if="txn.type === 'IN'" :size="14" />
                  <ArrowUpRight v-if="txn.type === 'OUT'" :size="14" />
                  <Activity v-if="txn.type === 'ADJUSTMENT'" :size="14" />
                  {{ txn.type }}
                </span>
              </td>
              <td class="font-mono font-bold" :class="txn.type === 'OUT' ? 'text-red' : 'text-slate-900'">
                <span v-if="txn.type === 'IN'">+</span><span v-if="txn.type === 'OUT'">-</span>{{ txn.quantity }}
              </td>
              <td class="text-sm text-slate-500">{{ txn.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <StockAdjustmentModal 
      :is-open="isModalOpen" 
      @close="isModalOpen = false"
      @save="isModalOpen = false"
    />
  </div>
</template>

<style scoped>
.inventory-page {
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue { background-color: #eff6ff; }
.text-blue { color: #3b82f6; }
.bg-green { background-color: #d1fae5; }
.text-green { color: #10b981; }
.bg-red { background-color: #fee2e2; }
.text-red { color: #ef4444; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
}

.filter-tabs {
  display: flex;
  background-color: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
}

.filter-tabs button {
  background: none;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tabs button.active {
  background-color: #ffffff;
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background-color: #f8fafc;
  padding: 12px 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-badge.in {
  background-color: #d1fae5;
  color: #059669;
}

.type-badge.out {
  background-color: #fee2e2;
  color: #dc2626;
}

.type-badge.adjustment {
  background-color: #e0e7ff;
  color: #4338ca;
}

.empty-state {
  text-align: center;
  padding: 48px !important;
  color: #64748b;
}

/* Utils */
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
.text-sm { font-size: 0.875rem; }
.text-slate-500 { color: #64748b; }
.text-slate-900 { color: #0f172a; }
</style>
