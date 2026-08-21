import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Voucher } from '@/types';
import api from '@/plugins/axios';

export const useVoucherStore = defineStore('vouchers', () => {
  const vouchers = ref<Voucher[]>([]);
  const isLoading = ref<boolean>(false);

  async function fetchVouchers() {
    isLoading.value = true;
    try {
      const res = await api.get('/vouchers');
      vouchers.value = res.data.data || [];
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function addVoucher(voucherData: Partial<Voucher>) {
    try {
      const res = await api.post('/vouchers', voucherData);
      vouchers.value.unshift(res.data.data);
    } catch (error) {
      console.error('Failed to add voucher:', error);
      throw error;
    }
  }

  async function updateVoucher(id: number, voucherData: Partial<Voucher>) {
    try {
      const res = await api.patch(`/vouchers/${id}`, voucherData);
      const index = vouchers.value.findIndex(v => v.id === id);
      if (index !== -1) {
        vouchers.value[index] = res.data.data;
      }
    } catch (error) {
      console.error('Failed to update voucher:', error);
      throw error;
    }
  }

  async function deleteVoucher(id: number) {
    try {
      await api.delete(`/vouchers/${id}`);
      vouchers.value = vouchers.value.filter(v => v.id !== id);
    } catch (error) {
      console.error('Failed to delete voucher:', error);
      throw error;
    }
  }

  return {
    vouchers,
    isLoading,
    fetchVouchers,
    addVoucher,
    updateVoucher,
    deleteVoucher,
  };
});
