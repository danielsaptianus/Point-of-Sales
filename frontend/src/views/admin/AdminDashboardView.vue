<script setup lang="ts">
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  DollarSign,
  ArrowRightLeft
} from 'lucide-vue-next';
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';

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

onMounted(() => {
  fetchDashboardStats();
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

    <!-- Additional placeholder content for dashboard -->
    <div class="dashboard-content">
      <div class="chart-card">
        <h3 class="card-title">Revenue Analytics</h3>
        <div class="chart-placeholder">
          <p>Chart component will be implemented here</p>
        </div>
      </div>
      
      <div class="list-card">
        <h3 class="card-title">Recent Transactions</h3>
        <div class="list-placeholder">
          <p>Recent transaction list will be displayed here</p>
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

/* Tailwind-like color classes mapped to actual colors since we use vanilla CSS */
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

.rotate-180 {
  transform: rotate(180deg);
}

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
}

.card-title {
  margin: 0 0 16px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
}

.chart-placeholder, .list-placeholder {
  height: 300px;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.875rem;
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
