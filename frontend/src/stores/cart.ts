import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem, Product, Transaction } from '@/types';
import api from '@/plugins/axios';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore();
  const items = ref<CartItem[]>([]);
  const discountPercent = ref<number>(0);
  const taxRate = ref<number>(0.11); // 11% PPN standard
  const heldCarts = ref<{ id: string; name: string; items: CartItem[]; date: Date }[]>([]);

  // Calculations
  const itemCount = computed(() => {
    return items.value.reduce((acc, item) => acc + item.quantity, 0);
  });

  const subtotal = computed(() => {
    return items.value.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  });

  const discountAmount = computed(() => {
    return (subtotal.value * discountPercent.value) / 100;
  });

  const taxableAmount = computed(() => {
    return Math.max(0, subtotal.value - discountAmount.value);
  });

  const taxAmount = computed(() => {
    return Math.round(taxableAmount.value * taxRate.value);
  });

  const grandTotal = computed(() => {
    return taxableAmount.value + taxAmount.value;
  });

  // Actions
  function addItem(product: Product) {
    const maxStock = product.stock_quantity ?? 0;
    if (maxStock <= 0) return;

    const existingIndex = items.value.findIndex((i) => i.product.id === product.id);
    if (existingIndex > -1) {
      if (items.value[existingIndex].quantity < maxStock) {
        items.value[existingIndex].quantity += 1;
      }
    } else {
      items.value.push({
        product,
        quantity: 1,
      });
    }
  }

  function removeItem(productId: number) {
    items.value = items.value.filter((i) => i.product.id !== productId);
  }

  function updateQuantity(productId: number, qty: number) {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    const item = items.value.find((i) => i.product.id === productId);
    if (item) {
      const maxStock = item.product.stock_quantity ?? 0;
      item.quantity = Math.min(qty, maxStock);
    }
  }

  function setDiscount(percent: number) {
    discountPercent.value = Math.max(0, Math.min(100, percent));
  }

  function clearCart() {
    items.value = [];
    discountPercent.value = 0;
  }

  function holdCurrentCart(label?: string) {
    if (items.value.length === 0) return;
    heldCarts.value.push({
      id: 'HOLD-' + Date.now(),
      name: label || `Pending Order #${heldCarts.value.length + 1}`,
      items: [...items.value],
      date: new Date(),
    });
    clearCart();
  }

  function restoreHeldCart(holdId: string) {
    const foundIndex = heldCarts.value.findIndex((h) => h.id === holdId);
    if (foundIndex > -1) {
      items.value = [...heldCarts.value[foundIndex].items];
      heldCarts.value.splice(foundIndex, 1);
    }
  }

  async function checkout(paymentData: {
    method: 'CASH' | 'QRIS' | 'TRANSFER';
    amountPaid: number;
    change: number;
  }): Promise<any> {
    const payload: any = {
      payment_method: paymentData.method === 'CASH' ? 'CASH' : 'MIDTRANS_REDIRECT',
      online_payment_type: paymentData.method === 'CASH' ? undefined : paymentData.method,
      items: items.value.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    };

    // If there is a way to set a voucher code in the future, we will attach it here
    // payload.voucher_code = 'XYZ';

    try {
      const response = await api.post('/sales', payload);
      clearCart();
      return response.data.data;
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  }

  return {
    items,
    discountPercent,
    taxRate,
    heldCarts,
    itemCount,
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    clearCart,
    holdCurrentCart,
    restoreHeldCart,
    checkout,
  };
});
