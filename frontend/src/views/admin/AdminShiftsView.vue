<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Store, Calendar, Search } from 'lucide-vue-next';
import api from '@/plugins/axios';

const shifts = ref<any[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');

const fetchShifts = async () => {
  isLoading.value = true;
  try {
    const res = await api.get('/shifts');
    shifts.value = res.data.data || res.data;
  } catch (error) {
    console.error('Failed to fetch shifts', error);
  } finally {
    isLoading.value = false;
  }
};

const formatPrice = (price: number | null) => {
  if (price === null || price === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

onMounted(() => {
  fetchShifts();
});
</script>

<template>
  <div class="admin-shifts-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <Store class="mr-2 text-primary" :size="28" />
          Manajemen Shift Kasir
        </h1>
        <p class="text-muted">Pantau rekapitulasi laci kasir dan selisih penerimaan tunai harian.</p>
      </div>
    </div>

    <div class="card table-card">
      <div class="card-header">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari nama kasir..." 
            class="form-control"
          />
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Kasir</th>
                <th>Waktu Mulai</th>
                <th>Waktu Selesai</th>
                <th>Modal Awal</th>
                <th>Sistem (Tunai)</th>
                <th>Fisik Aktual</th>
                <th>Selisih</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="8" class="text-center py-4">Memuat data...</td>
              </tr>
              <tr v-else-if="shifts.length === 0">
                <td colspan="8" class="text-center py-4">Tidak ada data shift</td>
              </tr>
              <tr v-else v-for="shift in shifts" :key="shift.id">
                <td>
                  <div class="fw-bold">{{ shift.user?.employee?.first_name }} {{ shift.user?.employee?.last_name || '' }}</div>
                  <small class="text-muted">{{ shift.user?.email }}</small>
                </td>
                <td>{{ formatDate(shift.start_time) }}</td>
                <td>{{ formatDate(shift.end_time) }}</td>
                <td>{{ formatPrice(shift.starting_cash) }}</td>
                <td>{{ formatPrice(shift.expected_ending_cash) }}</td>
                <td>{{ formatPrice(shift.actual_ending_cash) }}</td>
                <td>
                  <span 
                    class="badge" 
                    :class="{
                      'badge-success': shift.difference >= 0 && shift.difference !== null,
                      'badge-danger': shift.difference < 0,
                      'badge-secondary': shift.difference === null
                    }"
                  >
                    {{ shift.difference !== null ? (shift.difference > 0 ? '+' : '') + formatPrice(shift.difference) : '-' }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="shift.status === 'OPEN' ? 'badge-primary' : 'badge-secondary'">
                    {{ shift.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}
.page-title {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.table-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}
.card-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
}
.search-box {
  position: relative;
  width: 300px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 10px;
  color: var(--text-muted);
}
.search-box input {
  padding-left: 38px;
}
.badge-success { background: rgba(16, 185, 129, 0.15); color: #059669; }
.badge-danger { background: rgba(244, 63, 94, 0.15); color: #e11d48; }
.badge-primary { background: rgba(var(--primary-rgb), 0.15); color: var(--primary); }
.badge-secondary { background: #f1f5f9; color: #64748b; }
.mr-2 { margin-right: 8px; }
.py-4 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.text-center { text-align: center; }
.fw-bold { font-weight: 600; }
</style>
