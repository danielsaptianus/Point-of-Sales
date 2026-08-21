<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus, Search, Edit2, Trash2, Ticket } from 'lucide-vue-next';
import { useVoucherStore } from '@/stores/vouchers';
import VoucherFormModal from '@/components/admin/VoucherFormModal.vue';
import type { Voucher } from '@/types';

const voucherStore = useVoucherStore();

const isModalOpen = ref(false);
const editingVoucher = ref<Voucher | null>(null);
const searchQuery = ref('');

// Load data on mount
onMounted(async () => {
  await voucherStore.fetchVouchers();
});

const filteredVouchers = computed(() => {
  let result = voucherStore.vouchers;
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(v => 
      v.code.toLowerCase().includes(q) || 
      v.name.toLowerCase().includes(q)
    );
  }
  return result;
});

function openAddModal() {
  editingVoucher.value = null;
  isModalOpen.value = true;
}

function openEditModal(voucher: Voucher) {
  editingVoucher.value = voucher;
  isModalOpen.value = true;
}

async function handleDelete(voucher: Voucher) {
  if (confirm(`Are you sure you want to delete voucher "${voucher.code}"?`)) {
    await voucherStore.deleteVoucher(voucher.id);
  }
}

function handleSave() {
  // Form modal handles save via store, modal auto-closes
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}
</script>

<template>
  <div class="vouchers-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Vouchers</h1>
        <p class="page-subtitle">Manage discount vouchers and promotions.</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <Plus :size="20" />
        <span>Add Voucher</span>
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="filter-bar">
      <div class="search-box">
        <Search class="search-icon" :size="20" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by code or name..." 
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
            <th>Voucher Info</th>
            <th>Discount</th>
            <th>Limits & Conditions</th>
            <th>Validity</th>
            <th>Status</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredVouchers.length === 0">
            <td colspan="7" class="empty-state">
              <div class="empty-content">
                <Ticket class="empty-icon" :size="48" />
                <h3>No vouchers found</h3>
                <p>Try adjusting your search or add a new voucher.</p>
              </div>
            </td>
          </tr>
          
          <tr v-for="(voucher, index) in filteredVouchers" :key="voucher.id">
            <td class="text-center text-sm text-slate-500 font-medium">{{ index + 1 }}</td>
            <td>
              <div class="voucher-info">
                <span class="voucher-code font-mono">{{ voucher.code }}</span>
                <span class="voucher-name text-sm text-slate-500">{{ voucher.name }}</span>
              </div>
            </td>
            <td>
              <span class="font-medium text-slate-900">
                {{ voucher.discount_type === 'PERCENTAGE' ? voucher.discount_value + '%' : formatCurrency(voucher.discount_value) }}
              </span>
              <div v-if="voucher.discount_type === 'PERCENTAGE' && voucher.max_discount" class="text-xs text-slate-500 mt-1">
                Max: {{ formatCurrency(voucher.max_discount) }}
              </div>
            </td>
            <td>
              <div class="limits-info text-sm text-slate-500">
                <div v-if="voucher.min_transaction">Min trx: {{ formatCurrency(voucher.min_transaction) }}</div>
                <div v-if="voucher.usage_limit">Used: {{ voucher.used_count }} / {{ voucher.usage_limit }}</div>
                <div v-if="!voucher.min_transaction && !voucher.usage_limit">-</div>
              </div>
            </td>
            <td>
              <div class="validity-info text-sm text-slate-500">
                <div>{{ new Date(voucher.start_date).toLocaleDateString('id-ID') }} -</div>
                <div>{{ new Date(voucher.end_date).toLocaleDateString('id-ID') }}</div>
              </div>
            </td>
            <td>
              <span :class="['status-badge', voucher.is_active ? 'active' : 'inactive']">
                {{ voucher.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="action-btn edit" @click="openEditModal(voucher)" title="Edit">
                  <Edit2 :size="18" />
                </button>
                <button class="action-btn delete" @click="handleDelete(voucher)" title="Delete">
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <VoucherFormModal 
      :is-open="isModalOpen" 
      :voucher-to-edit="editingVoucher"
      @close="isModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.vouchers-page {
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

.voucher-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.voucher-code {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.875rem;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
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

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
