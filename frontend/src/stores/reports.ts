import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Transaction } from '@/types';

export const useReportsStore = defineStore('reports', () => {
  // Generate some realistic mock data for the last 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mockTransactions: Transaction[] = [];
  
  let currentId = 1;
  // Generate 20 random transactions spread over the last 7 days
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 7); // 0 to 6 days ago
    const txDate = new Date(today);
    txDate.setDate(txDate.getDate() - daysAgo);
    txDate.setHours(Math.floor(Math.random() * 10) + 9); // between 9 AM and 7 PM
    txDate.setMinutes(Math.floor(Math.random() * 60));

    const subtotal = Math.floor(Math.random() * 500000) + 50000; // 50k to 550k
    const tax = subtotal * 0.11;
    const total = subtotal + tax;

    mockTransactions.push({
      id: currentId++,
      invoice_number: `INV-${txDate.getFullYear()}${(txDate.getMonth()+1).toString().padStart(2,'0')}${txDate.getDate().toString().padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`,
      subtotal,
      tax,
      discount: 0,
      total,
      status: Math.random() > 0.1 ? 'PAID' : 'PENDING',
      user_id: 1,
      cashier_name: Math.random() > 0.5 ? 'Budi Santoso' : 'Siti Aminah',
      created_at: txDate.toISOString(),
      items: [
        {
          product_id: 1,
          product_name: 'Espresso',
          price: 25000,
          quantity: Math.floor(subtotal / 25000) || 1,
          subtotal: subtotal
        }
      ],
      payment: {
        payment_method: Math.random() > 0.3 ? 'CASH' : 'QRIS',
        amount_paid: total,
        change: 0
      }
    });
  }

  // Sort by created_at descending
  mockTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const transactions = ref<Transaction[]>(mockTransactions);
  const isLoading = ref(false);

  // Computed Metrics
  const totalRevenue = computed(() => {
    return transactions.value
      .filter(t => t.status === 'PAID')
      .reduce((sum, t) => sum + t.total, 0);
  });

  const totalTransactionsCount = computed(() => {
    return transactions.value.filter(t => t.status === 'PAID').length;
  });

  const averageOrderValue = computed(() => {
    if (totalTransactionsCount.value === 0) return 0;
    return totalRevenue.value / totalTransactionsCount.value;
  });

  // Data grouped by day for the chart
  const revenueByDay = computed(() => {
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
      if (t.status !== 'PAID') return;
      const txDate = new Date(t.created_at);
      const dayData = last7Days.find(d => 
        d.rawDate.getDate() === txDate.getDate() && 
        d.rawDate.getMonth() === txDate.getMonth()
      );
      if (dayData) {
        dayData.revenue += t.total;
      }
    });

    return last7Days;
  });

  async function fetchTransactions() {
    isLoading.value = true;
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    isLoading.value = false;
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
