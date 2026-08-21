<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { Voucher } from '@/types';
import { useVoucherStore } from '@/stores/vouchers';

const props = defineProps<{
  isOpen: boolean;
  voucherToEdit?: Voucher | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

const voucherStore = useVoucherStore();

const formData = ref({
  code: '',
  name: '',
  description: '',
  discount_type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  discount_value: 0,
  max_discount: null as number | null,
  min_transaction: null as number | null,
  usage_limit: null as number | null,
  start_date: '',
  end_date: '',
  is_active: true,
});

watch(
  () => props.voucherToEdit,
  (newVal) => {
    if (newVal) {
      formData.value = {
        code: newVal.code,
        name: newVal.name,
        description: newVal.description || '',
        discount_type: newVal.discount_type,
        discount_value: newVal.discount_value,
        max_discount: newVal.max_discount ?? null,
        min_transaction: newVal.min_transaction ?? null,
        usage_limit: newVal.usage_limit ?? null,
        start_date: newVal.start_date ? new Date(newVal.start_date).toISOString().slice(0, 16) : '',
        end_date: newVal.end_date ? new Date(newVal.end_date).toISOString().slice(0, 16) : '',
        is_active: newVal.is_active,
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  formData.value = {
    code: '',
    name: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: 0,
    max_discount: null,
    min_transaction: null,
    usage_limit: null,
    start_date: new Date().toISOString().slice(0, 16),
    end_date: tomorrow.toISOString().slice(0, 16),
    is_active: true,
  };
}

async function handleSave() {
  const payload = {
    ...formData.value,
    start_date: new Date(formData.value.start_date).toISOString(),
    end_date: new Date(formData.value.end_date).toISOString(),
    discount_value: Number(formData.value.discount_value),
    max_discount: formData.value.max_discount ? Number(formData.value.max_discount) : undefined,
    min_transaction: formData.value.min_transaction ? Number(formData.value.min_transaction) : undefined,
    usage_limit: formData.value.usage_limit ? Number(formData.value.usage_limit) : undefined,
  };

  try {
    if (props.voucherToEdit) {
      await voucherStore.updateVoucher(props.voucherToEdit.id, payload);
    } else {
      await voucherStore.addVoucher(payload as any);
    }
    emit('save');
    closeModal();
  } catch (error) {
    alert('Gagal menyimpan voucher. Silakan periksa kembali data Anda.');
  }
}

function closeModal() {
  emit('close');
}
</script>

<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @mousedown.self="closeModal">
      <div class="modal-container">
        <!-- Modal Header -->
        <div class="modal-header">
          <h2 class="modal-title">{{ voucherToEdit ? 'Edit Voucher' : 'Add New Voucher' }}</h2>
          <button class="close-btn" @click="closeModal">
            <X :size="24" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSave" class="voucher-form">
            <div class="form-row">
              <div class="form-group half-width">
                <label>Voucher Code</label>
                <input v-model="formData.code" type="text" required placeholder="e.g. DISC20" />
              </div>
              <div class="form-group half-width">
                <label>Voucher Name</label>
                <input v-model="formData.name" type="text" required placeholder="e.g. Diskon 20%" />
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea v-model="formData.description" rows="2" placeholder="Brief description..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label>Discount Type</label>
                <select v-model="formData.discount_type" required>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (Rp)</option>
                </select>
              </div>
              <div class="form-group half-width">
                <label>Discount Value</label>
                <input v-model="formData.discount_value" type="number" required min="0" placeholder="e.g. 20 for 20%" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label>Max Discount (Optional)</label>
                <input v-model="formData.max_discount" type="number" min="0" placeholder="e.g. 50000" />
                <span class="help-text">Leave empty for no limit</span>
              </div>
              <div class="form-group half-width">
                <label>Min Transaction (Optional)</label>
                <input v-model="formData.min_transaction" type="number" min="0" placeholder="e.g. 100000" />
                <span class="help-text">Leave empty for no minimum</span>
              </div>
            </div>
            
            <div class="form-group">
                <label>Usage Limit (Optional)</label>
                <input v-model="formData.usage_limit" type="number" min="1" placeholder="e.g. 100" />
                <span class="help-text">Leave empty for unlimited usage</span>
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label>Start Date</label>
                <input v-model="formData.start_date" type="datetime-local" required />
              </div>
              <div class="form-group half-width">
                <label>End Date</label>
                <input v-model="formData.end_date" type="datetime-local" required />
              </div>
            </div>

            <div class="form-group checkbox-group">
              <input v-model="formData.is_active" type="checkbox" id="isActive" />
              <label for="isActive">Is Active</label>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-save">Save Voucher</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.close-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: 75vh;
}

.voucher-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.half-width {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #0f172a;
  background-color: #ffffff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.checkbox-group input {
  width: 16px;
  height: 16px;
}

.checkbox-group label {
  margin: 0;
  cursor: pointer;
}

.help-text {
  font-size: 0.75rem;
  color: #64748b;
}

.modal-footer {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 10px 16px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #f8fafc;
  color: #0f172a;
}

.btn-save {
  padding: 10px 20px;
  background-color: #2563eb;
  border: none;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background-color: #1d4ed8;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: modal-pop 0.3s ease-out;
}

@keyframes modal-pop {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
