import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { StockTransaction } from '@/types';
import { useProductStore } from '@/stores/products';

export const useInventoryStore = defineStore('inventory', () => {
  const stockHistory = ref<StockTransaction[]>([]);
  const productStore = useProductStore();

  async function recordStockMovement(
    productId: number,
    quantity: number,
    type: 'IN' | 'OUT' | 'ADJUSTMENT',
    notes?: string
  ) {
    const product = productStore.products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    // Calculate new stock quantity
    let newQuantity = product.stock_quantity || 0;
    if (type === 'IN') {
      newQuantity += quantity;
    } else if (type === 'OUT') {
      newQuantity -= quantity;
      if (newQuantity < 0) throw new Error('Insufficient stock');
    } else if (type === 'ADJUSTMENT') {
      // For adjustment, the quantity provided is the explicit new total stock,
      // but in the history we might want to record the difference.
      // Or we just record it as adjustment. Let's assume quantity = new total.
      const diff = quantity - newQuantity;
      newQuantity = quantity;
      // Re-assign quantity as the difference for the transaction record if desired,
      // but let's keep it as the absolute value the user entered, and handle diff locally.
    }

    // Update product stock via product store
    await productStore.updateProduct(productId, { stock_quantity: newQuantity });

    // Record the transaction
    const newTransaction: StockTransaction = {
      id: stockHistory.value.length + 1,
      product_id: productId,
      product_name: product.name,
      quantity: quantity, // Amount moved (or new total for adjustment)
      type: type,
      notes: notes,
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
    };

    stockHistory.value.unshift(newTransaction); // Add to beginning of history
    return newTransaction;
  }

  // Generate some initial mock data for the UI
  function initMockData() {
    if (stockHistory.value.length === 0 && productStore.products.length > 0) {
      const p1 = productStore.products[0];
      const p2 = productStore.products[1] || p1;
      
      stockHistory.value = [
        {
          id: 2,
          product_id: p2.id,
          product_name: p2.name,
          quantity: 20,
          type: 'IN',
          notes: 'Restock from supplier',
          status: 'SUCCESS',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: 1,
          product_id: p1.id,
          product_name: p1.name,
          quantity: 50,
          type: 'IN',
          notes: 'Initial inventory',
          status: 'SUCCESS',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        }
      ];
    }
  }

  return {
    stockHistory,
    recordStockMovement,
    initMockData
  };
});
