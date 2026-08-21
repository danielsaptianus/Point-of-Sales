import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { StockTransaction } from '@/types';
import { useProductStore } from '@/stores/products';
import api from '@/plugins/axios';

export const useInventoryStore = defineStore('inventory', () => {
  const stockHistory = ref<StockTransaction[]>([]);
  const productStore = useProductStore();

  async function fetchStockHistory() {
    try {
      const res = await api.get('/stocks');
      const stocks = res.data.data || [];
      
      // We map it to StockTransaction for the UI
      stockHistory.value = stocks.map((s: any) => ({
        id: s.id,
        product_id: s.product_id,
        // The backend transformStock doesn't return product_name directly, but we can look it up from productStore
        product_name: productStore.products.find(p => p.id === s.product_id)?.name || 'Unknown',
        quantity: s.quantity,
        type: s.type,
        notes: s.notes,
        status: 'SUCCESS',
        created_at: s.created_at,
      }));
    } catch (error) {
      console.error('Failed to fetch stock history:', error);
    }
  }

  async function recordStockMovement(
    productId: number,
    quantity: number,
    type: 'IN' | 'OUT' | 'ADJUSTMENT',
    notes?: string
  ) {
    const product = productStore.products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    let actualQuantity = quantity;
    if (type === 'OUT') {
      actualQuantity = -quantity; // Backend sums up the stocks, so OUT should be negative
    } else if (type === 'ADJUSTMENT') {
      // Backend sums up the stock logs.
      // An adjustment meant to set the stock to `quantity` requires us to insert the difference.
      const currentStock = product.stock_quantity || 0;
      actualQuantity = quantity - currentStock; 
    }

    try {
      const res = await api.post('/stocks', {
        product_id: productId,
        quantity: actualQuantity,
        type: type,
        notes: notes || 'Manual adjustment'
      });
      
      // Update local product store stock sum
      const newStockSum = (product.stock_quantity || 0) + actualQuantity;
      product.stock_quantity = newStockSum; // Optimistic UI update

      // Refetch history
      await fetchStockHistory();
      
      return res.data.data;
    } catch (error) {
      console.error('Failed to record stock movement:', error);
      throw error;
    }
  }

  function initMockData() {
    fetchStockHistory();
  }

  return {
    stockHistory,
    recordStockMovement,
    initMockData,
    fetchStockHistory
  };
});
