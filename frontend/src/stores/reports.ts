import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Transaction } from '@/types';
import api from '@/plugins/axios';

export const useReportsStore = defineStore('reports', () => {
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);

  // Computed Metrics
  const totalRevenue = computed(() => {
    return transactions.value
      .filter(t => t.status === 'PAID' || t.status === 'SETTLEMENT')
      .reduce((sum, t) => sum + t.total, 0);
  });

  const totalTransactionsCount = computed(() => {
    return transactions.value.filter(t => t.status === 'PAID' || t.status === 'SETTLEMENT').length;
  });

  const averageOrderValue = computed(() => {
    if (totalTransactionsCount.value === 0) return 0;
    return totalRevenue.value / totalTransactionsCount.value;
  });

  // Data grouped by day for the chart
  const revenueByDay = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        rawDate: d,
        revenue: 0
      };
    });

    transactions.value.forEach(t => {
      if (t.status !== 'PAID' && t.status !== 'SETTLEMENT') return;
      const txDate = new Date(t.created_at);
      const dayData = last7Days.find(d => 
        d.rawDate.getDate() === txDate.getDate() && 
        d.rawDate.getMonth() === txDate.getMonth() &&
        d.rawDate.getFullYear() === txDate.getFullYear()
      );
      if (dayData) {
        dayData.revenue += t.total;
      }
    });

    return last7Days;
  });

  async function fetchTransactions() {
    isLoading.value = true;
    try {
      const res = await api.get('/sales');
      // The backend returns an array of transactions in res.data.data
      const backendTxns = res.data.data || [];
      
      // Map it to frontend expectations
      transactions.value = backendTxns.map((t: any) => ({
        id: t.id,
        invoice_number: t.invoice_number,
        subtotal: t.subtotal,
        tax: t.tax || 0,
        discount: t.discount || 0,
        total: t.total,
        status: t.status,
        user_id: t.user_id,
        cashier_name: t.cashier_name || `Cashier #${t.user_id}`,
        created_at: t.created_at,
        items: t.transaction_items || [],
        payment: t.payment || null
      }));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    transactions,
    isLoading,
    totalRevenue,
    totalTransactionsCount,
    averageOrderValue,
    revenueByDay,
    fetchTransactions
  };
});
