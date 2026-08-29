<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  TrendingUp, 
  CreditCard, 
  Receipt,
  FileText,
  Search,
  Download,
  Loader2
} from 'lucide-vue-next';
import { useReportsStore } from '@/stores/reports';
import { apiClient } from '@/services/api';

// Chart.js setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const reportsStore = useReportsStore();

onMounted(async () => {
  if (reportsStore.transactions.length === 0) {
    await reportsStore.fetchTransactions();
  }
});

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Format date
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Chart Data setup
const chartData = computed(() => {
  const labels = reportsStore.revenueByDay.map(d => d.date);
  const data = reportsStore.revenueByDay.map(d => d.revenue);

  return {
    labels,
    datasets: [
      {
        label: 'Revenue (Rp)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: '#2563eb',
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2563eb',
        pointHoverBackgroundColor: '#2563eb',
        pointHoverBorderColor: '#ffffff',
        fill: true,
        data: data,
        tension: 0.4
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f1f5f9',
        drawBorder: false,
      },
      ticks: {
        callback: function(value: any) {
          return 'Rp ' + (value / 1000) + 'k'; // Format to thousands
        }
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false,
      }
    }
  }
};

const searchQuery = ref('');

const filteredTransactions = computed(() => {
  if (!searchQuery.value) return reportsStore.transactions;
  const q = searchQuery.value.toLowerCase();
  return reportsStore.transactions.filter(t => 
    t.invoice_number.toLowerCase().includes(q) ||
    t.cashier_name.toLowerCase().includes(q)
  );
const startDate = ref('');
const endDate = ref('');
const isExporting = ref(false);

const downloadExcel = async () => {
  try {
    isExporting.value = true;
    const response = await apiClient.get('/reports/export-transactions', {
      params: {
        startDate: startDate.value || undefined,
        endDate: endDate.value || undefined
      },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const filename = `Laporan_Transaksi_${startDate.value || 'All'}_to_${endDate.value || 'All'}.xlsx`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export:', error);
    alert('Gagal mengunduh laporan. Silakan coba lagi.');
  } finally {
    isExporting.value = false;
  }
};

</script>

<template>
  <div class="reports-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Sales Analytics</h1>
        <p class="page-subtitle">Track your revenue and recent transactions.</p>
      </div>
      <div class="flex items-center gap-3">
        <input type="date" v-model="startDate" class="form-input text-sm h-10 w-36" title="Start Date" />
        <span class="text-slate-400">to</span>
        <input type="date" v-model="endDate" class="form-input text-sm h-10 w-36" title="End Date" />
        <button class="btn-outline ml-2 h-10" @click="downloadExcel" :disabled="isExporting">
          <Loader2 v-if="isExporting" class="animate-spin" :size="18" />
          <Download v-else :size="18" />
          <span>{{ isExporting ? 'Exporting...' : 'Export Excel' }}</span>
        </button>
      </div>
    </div>

    <!-- Summary Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Total Revenue</span>
          <div class="metric-icon bg-emerald-100 text-emerald-600">
            <TrendingUp :size="20" />
          </div>
        </div>
        <div class="metric-body">
          <h2 class="metric-value">{{ formatCurrency(reportsStore.totalRevenue) }}</h2>
          <p class="metric-trend positive"><span>+12.5%</span> from last week</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Transactions</span>
          <div class="metric-icon bg-blue-100 text-blue-600">
            <Receipt :size="20" />
          </div>
        </div>
        <div class="metric-body">
          <h2 class="metric-value">{{ reportsStore.totalTransactionsCount }}</h2>
          <p class="metric-trend positive"><span>+5.2%</span> from last week</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-title">Average Order Value</span>
          <div class="metric-icon bg-purple-100 text-purple-600">
            <CreditCard :size="20" />
          </div>
        </div>
        <div class="metric-body">
          <h2 class="metric-value">{{ formatCurrency(reportsStore.averageOrderValue) }}</h2>
          <p class="metric-trend neutral"><span>+0.8%</span> from last week</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="chart-container card">
      <div class="card-header">
        <h3 class="card-title">Revenue (Last 7 Days)</h3>
      </div>
      <div class="chart-wrapper">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Recent Transactions Table -->
    <div class="transactions-container card">
      <div class="card-header">
        <h3 class="card-title">Recent Transactions</h3>
        <div class="search-box">
          <Search class="search-icon" :size="18" />
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search invoice..." 
            class="search-input"
          />
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="w-12">No</th>
              <th>Invoice</th>
              <th>Date</th>
              <th>Cashier</th>
              <th>Status</th>
              <th class="text-right">Total Amount</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="7" class="empty-state">No transactions found.</td>
            </tr>
            <tr v-for="(txn, index) in filteredTransactions" :key="txn.id">
              <td class="text-center text-sm text-slate-500 font-medium">{{ index + 1 }}</td>
              <td>
                <span class="font-mono font-medium text-slate-900">{{ txn.invoice_number }}</span>
              </td>
              <td class="text-sm text-slate-500">{{ formatDate(txn.created_at) }}</td>
              <td class="text-sm text-slate-700">{{ txn.cashier_name }}</td>
              <td>
                <span :class="['status-badge', txn.status.toLowerCase()]">
                  {{ txn.status }}
                </span>
              </td>
              <td class="text-right font-medium text-slate-900">
                {{ formatCurrency(txn.total) }}
              </td>
              <td class="text-center">
                <button class="btn-icon" title="View Details">
                  <FileText :size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports-page {
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

.btn-outline {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background-color: #f8fafc;
  color: #0f172a;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.metric-card {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-emerald-100 { background-color: #d1fae5; }
.text-emerald-600 { color: #059669; }
.bg-blue-100 { background-color: #dbeafe; }
.text-blue-600 { color: #2563eb; }
.bg-purple-100 { background-color: #f3e8ff; }
.text-purple-600 { color: #9333ea; }

.metric-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-value {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
}

.metric-trend {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
  display: flex;
  gap: 4px;
}

.metric-trend.positive span {
  color: #10b981;
  font-weight: 500;
}

.metric-trend.negative span {
  color: #ef4444;
  font-weight: 500;
}

.metric-trend.neutral span {
  color: #64748b;
  font-weight: 500;
}

.card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.card-header {
  padding: 20px 24px;
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

.chart-wrapper {
  padding: 24px;
  height: 350px;
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  transition: all 0.2s;
  width: 250px;
}

.search-box:focus-within {
  background-color: #ffffff;
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
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background-color: #f8fafc;
  padding: 16px 24px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.paid {
  background-color: #d1fae5;
  color: #059669;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge.cancelled {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-icon {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #f1f5f9;
  color: #3b82f6;
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
.text-slate-700 { color: #334155; }
.text-slate-900 { color: #0f172a; }
.text-right { text-align: right; }
.text-center { text-align: center; }
</style>
