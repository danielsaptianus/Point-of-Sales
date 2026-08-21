<script setup lang="ts">
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  DollarSign,
  ArrowRightLeft,
  Clock
} from 'lucide-vue-next';
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const stats = ref([
  {
    title: 'Total Revenue',
    value: 'Rp 0',
    change: 'Live',
    isPositive: true,
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100'
  },
  {
    title: 'Orders',
    value: '0',
    change: 'Live',
    isPositive: true,
    icon: ShoppingCart,
    color: 'text-blue-500',
    bg: 'bg-blue-100'
  },
  {
    title: 'Products',
    value: '0',
    change: 'Live',
    isPositive: true,
    icon: Package,
    color: 'text-orange-500',
    bg: 'bg-orange-100'
  },
  {
    title: 'Active Users',
    value: '0',
    change: 'Live',
    isPositive: true,
    icon: Users,
    color: 'text-purple-500',
    bg: 'bg-purple-100'
  },
  {
    title: 'Total Movement',
    value: '0',
    change: 'Live',
    isPositive: true,
    icon: ArrowRightLeft,
    color: 'text-indigo-500',
    bg: 'bg-indigo-100'
  }
]);

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Revenue',
      data: [] as number[],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderWidth: 2.5,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#3b82f6',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }
  ]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#f8fafc',
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: function(context: any) {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(context.parsed.y);
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f1f5f9',
      },
      border: { display: false },
      ticks: {
        color: '#64748b',
        font: { family: "'Inter', sans-serif", size: 11 },
        callback: function(value: any) {
          return new Intl.NumberFormat('id-ID', { notation: "compact" }).format(value);
        }
      }
    },
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: '#64748b',
        font: { family: "'Inter', sans-serif", size: 11 }
      }
    }
  }
};

const recentTransactions = ref<any[]>([]);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'PAID':
    case 'SETTLEMENT': return 'badge-success';
    case 'PENDING': return 'badge-warning';
    case 'CANCEL':
    case 'EXPIRE': return 'badge-danger';
    default: return 'badge-neutral';
  }
};

const fetchDashboardStats = async () => {
  try {
    const res = await api.get('/reports/dashboard');
    const data = res.data.data;
    
    stats.value[0].value = formatCurrency(data.total_revenue);
    stats.value[1].value = formatNumber(data.total_orders);
    stats.value[2].value = formatNumber(data.total_products);
    stats.value[3].value = formatNumber(data.active_users);
    stats.value[4].value = formatNumber(data.total_movement);
  } catch (error) {
    console.error('Failed to fetch dashboard stats', error);
  }
};

const fetchRevenueAnalytics = async () => {
  try {
    const res = await api.get('/reports/revenue-analytics');
    const data = res.data.data;
    
    data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    chartData.value = {
      labels: data.map((item: any) => {
        const d = new Date(item.date);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }),
      datasets: [{
        ...chartData.value.datasets[0],
        data: data.map((item: any) => item.revenue)
      }]
    };
  } catch (error) {
    console.error('Failed to fetch analytics', error);
  }
};

const fetchRecentTransactions = async () => {
  try {
    const res = await api.get('/reports/recent-transactions');
    recentTransactions.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch recent transactions', error);
  }
};

onMounted(() => {
  fetchDashboardStats();
  fetchRevenueAnalytics();
  fetchRecentTransactions();
});
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">Dashboard Overview</h1>
      <p class="page-subtitle">Welcome back, here's what's happening with your store today.</p>
    </div>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.title" class="stat-card">
        <div class="stat-header">
          <div :class="['icon-wrapper', stat.bg, stat.color]">
            <component :is="stat.icon" :size="24" />
          </div>
          <div :class="['change-badge', stat.isPositive ? 'positive' : 'negative']">
            <TrendingUp v-if="stat.isPositive" :size="14" />
            <TrendingUp v-else :size="14" class="rotate-180" />
            <span>{{ stat.change }}</span>
          </div>
        </div>
        
        <div class="stat-content">
          <h3 class="stat-title">{{ stat.title }}</h3>
          <p class="stat-value">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">Revenue Analytics</h3>
          <p class="card-subtitle">Last 7 days performance</p>
        </div>
        <div class="chart-container">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="list-card">
        <div class="card-header">
          <h3 class="card-title">Recent Transactions</h3>
          <p class="card-subtitle">Latest store orders</p>
        </div>
        <div class="transactions-list">
          <div v-if="recentTransactions.length === 0" class="empty-state">
            <Clock :size="24" class="empty-icon" />
            <p>No recent transactions found.</p>
          </div>
          <div v-else class="transaction-item" v-for="tx in recentTransactions" :key="tx.id">
            <div class="tx-info">
              <div class="tx-avatar">
                <ShoppingCart :size="16" />
              </div>
              <div class="tx-details">
                <p class="tx-id">Order #{{ String(tx.id).padStart(4, '0') }}</p>
                <p class="tx-date">{{ formatDate(tx.created_at) }}</p>
              </div>
            </div>
            <div class="tx-amount">
              <p class="amount-val">{{ formatCurrency(tx.total) }}</p>
              <span :class="['badge', getStatusClass(tx.status)]">{{ tx.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-emerald-500 { color: #10b981; }
.bg-emerald-100 { background-color: #d1fae5; }
.text-blue-500 { color: #3b82f6; }
.bg-blue-100 { background-color: #dbeafe; }
.text-orange-500 { color: #f97316; }
.bg-orange-100 { background-color: #ffedd5; }
.text-purple-500 { color: #a855f7; }
.bg-purple-100 { background-color: #f3e8ff; }
.text-indigo-500 { color: #6366f1; }
.bg-indigo-100 { background-color: #e0e7ff; }

.change-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.change-badge.positive {
  background-color: #d1fae5;
  color: #059669;
}

.change-badge.negative {
  background-color: #fee2e2;
  color: #dc2626;
}

.rotate-180 { transform: rotate(180deg); }

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-title {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.chart-card, .list-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 24px;
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
}

.card-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.chart-container {
  height: 320px;
  width: 100%;
  position: relative;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  gap: 8px;
  font-size: 0.875rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.transaction-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.tx-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tx-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.tx-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tx-id {
  margin: 0;
  font-weight: 600;
  font-size: 0.875rem;
  color: #0f172a;
}

.tx-date {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.tx-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.amount-val {
  margin: 0;
  font-weight: 700;
  font-size: 0.875rem;
  color: #0f172a;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-success { background-color: #d1fae5; color: #059669; }
.badge-warning { background-color: #fef3c7; color: #d97706; }
.badge-danger { background-color: #fee2e2; color: #dc2626; }
.badge-neutral { background-color: #f1f5f9; color: #475569; }

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
