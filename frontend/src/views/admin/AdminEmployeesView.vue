<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { UserPlus, Search, Edit2, Trash2, Users, Briefcase } from 'lucide-vue-next';
import { useEmployeeStore } from '@/stores/employees';
import type { Employee } from '@/types';

const router = useRouter();
const employeeStore = useEmployeeStore();

const searchQuery = ref('');
const selectedPosition = ref<number | 'ALL'>('ALL');

onMounted(async () => {
  if (employeeStore.employees.length === 0) {
    await employeeStore.fetchEmployees();
  }
});

const filteredEmployees = computed(() => {
  let result = employeeStore.employees;
  
  if (selectedPosition.value !== 'ALL') {
    result = result.filter(e => e.position_id === selectedPosition.value);
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(e => 
      e.first_name.toLowerCase().includes(q) || 
      (e.last_name || '').toLowerCase().includes(q) ||
      e.employee_number.toLowerCase().includes(q)
    );
  }
  
  return result;
});

function openAddModal() {
  router.push('/admin/employees/new');
}

function openEditModal(emp: Employee) {
  router.push(`/admin/employees/edit/${emp.id}`);
}

async function handleDelete(emp: Employee) {
  if (confirm(`Are you sure you want to delete ${emp.first_name} ${emp.last_name}?`)) {
    await employeeStore.deleteEmployee(emp.id);
  }
}
</script>

<template>
  <div class="employees-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Employee Management</h1>
        <p class="page-subtitle">Manage staff, assign roles, and control access.</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <UserPlus :size="20" />
        <span>Add Employee</span>
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="filter-bar">
      <div class="search-box">
        <Search class="search-icon" :size="20" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by name or NIP..." 
          class="search-input"
        />
      </div>
      
      <div class="category-filter">
        <select v-model="selectedPosition" class="filter-select">
          <option value="ALL">All Positions</option>
          <option v-for="pos in employeeStore.positions" :key="pos.id" :value="pos.id">
            {{ pos.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-12">No</th>
            <th>Employee</th>
            <th>Contact Info</th>
            <th>Position</th>
            <th>Hire Date</th>
            <th>Status</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredEmployees.length === 0">
            <td colspan="7" class="empty-state">
              <div class="empty-content">
                <Users class="empty-icon" :size="48" />
                <h3>No employees found</h3>
                <p>Try adjusting your filters or add a new employee.</p>
              </div>
            </td>
          </tr>
          
          <tr v-for="(emp, index) in filteredEmployees" :key="emp.id">
            <td class="text-center text-sm text-slate-500 font-medium">{{ index + 1 }}</td>
            <td>
              <div class="employee-info">
                <div class="avatar">
                  {{ emp.first_name.charAt(0).toUpperCase() }}{{ (emp.last_name || '').charAt(0).toUpperCase() }}
                </div>
                <div class="employee-details">
                  <span class="employee-name">{{ emp.first_name }} {{ emp.last_name }}</span>
                  <span class="employee-nip font-mono">{{ emp.employee_number }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="contact-info">
                <span class="text-sm text-slate-900">{{ emp.phone || '-' }}</span>
                <span class="text-xs text-slate-500">{{ emp.address?.substring(0, 30) || '-' }}{{ emp.address && emp.address.length > 30 ? '...' : '' }}</span>
              </div>
            </td>
            <td>
              <div class="position-badge-wrap">
                <Briefcase :size="14" class="text-slate-400" />
                <span class="position-badge">{{ emp.position?.name || 'Unassigned' }}</span>
              </div>
            </td>
            <td class="text-sm text-slate-500">
              {{ emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }}
            </td>
            <td>
              <span :class="['status-badge', emp.is_active ? 'active' : 'inactive']">
                {{ emp.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="action-btn edit" @click="openEditModal(emp)" title="Edit">
                  <Edit2 :size="18" />
                </button>
                <button class="action-btn delete" @click="handleDelete(emp)" title="Delete">
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.employees-page {
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

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.employee-details {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.875rem;
}

.employee-nip {
  font-size: 0.75rem;
  color: #64748b;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.position-badge-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.position-badge {
  color: #334155;
  font-size: 0.875rem;
  font-weight: 500;
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
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.text-slate-500 { color: #64748b; }
.text-slate-900 { color: #0f172a; }
.text-slate-400 { color: #94a3b8; }
</style>
