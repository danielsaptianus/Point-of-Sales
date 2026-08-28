import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem, Product, Transaction } from '@/types';
import api from '@/plugins/axios';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore();
  const items = ref<CartItem[]>([]);
  const discountPercent = ref<number>(0);
  const appliedVoucher = ref<any>(null);
  const voucherDiscountAmount = ref<number>(0);
  const voucherError = ref<string>('');
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
    if (appliedVoucher.value) {
      return voucherDiscountAmount.value;
    }
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
    removeVoucher(); // Reset voucher if manual percent is set
  }

  async function applyVoucher(code: string) {
    try {
      voucherError.value = '';
      const response = await api.post('/vouchers/validate', {
        code,
        subtotal: subtotal.value,
      });
      appliedVoucher.value = response.data.data.voucher;
      voucherDiscountAmount.value = response.data.data.discount_amount;
      discountPercent.value = 0; // Reset manual discount
      return true;
    } catch (error: any) {
      voucherError.value = error.response?.data?.message || 'Gagal menggunakan voucher';
      return false;
    }
  }

  function removeVoucher() {
    appliedVoucher.value = null;
    voucherDiscountAmount.value = 0;
    voucherError.value = '';
  }

  function clearCart() {
    items.value = [];
    discountPercent.value = 0;
    removeVoucher();
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
    method: string;
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

    if (appliedVoucher.value) {
      payload.voucher_code = appliedVoucher.value.code;
    }

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
    appliedVoucher,
    voucherDiscountAmount,
    voucherError,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    clearCart,
    applyVoucher,
    removeVoucher,
    holdCurrentCart,
    restoreHeldCart,
    checkout,
  };
});
