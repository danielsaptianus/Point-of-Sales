<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, AlertCircle } from 'lucide-vue-next';
import { useProductStore } from '@/stores/products';
import { useInventoryStore } from '@/stores/inventory';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

const productStore = useProductStore();
const inventoryStore = useInventoryStore();

const selectedProductId = ref<number | ''>('');
const transactionType = ref<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
const quantity = ref<number>(0);
const notes = ref<string>('');
const errorMsg = ref<string>('');

const selectedProduct = computed(() => {
  if (!selectedProductId.value) return null;
  return productStore.products.find(p => p.id === selectedProductId.value) || null;
});

const calculatedNewStock = computed(() => {
  if (!selectedProduct.value) return 0;
  const current = selectedProduct.value.stock_quantity || 0;
  const q = Number(quantity.value) || 0;
  
  if (transactionType.value === 'IN') return current + q;
  if (transactionType.value === 'OUT') return current - q;
  if (transactionType.value === 'ADJUSTMENT') return q; // Adjustment sets explicit new total
  return current;
});

async function handleSave() {
  errorMsg.value = '';
  
  if (!selectedProductId.value) {
    errorMsg.value = 'Please select a product';
    return;
  }
  
  if (quantity.value <= 0 && transactionType.value !== 'ADJUSTMENT') {
    errorMsg.value = 'Quantity must be greater than 0';
    return;
  }

  if (transactionType.value === 'OUT' && calculatedNewStock.value < 0) {
    errorMsg.value = 'Insufficient stock for this operation';
    return;
  }

  try {
    await inventoryStore.recordStockMovement(
      Number(selectedProductId.value),
      quantity.value,
      transactionType.value,
      notes.value
    );
    
    emit('save');
    resetAndClose();
  } catch (e: any) {
    errorMsg.value = e.message || 'An error occurred';
  }
}

function resetAndClose() {
  selectedProductId.value = '';
  transactionType.value = 'IN';
  quantity.value = 0;
  notes.value = '';
  errorMsg.value = '';
  emit('close');
}
</script>

<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @mousedown.self="resetAndClose">
      <div class="modal-container">
        <!-- Modal Header -->
        <div class="modal-header">
          <h2 class="modal-title">Record Stock Movement</h2>
          <button class="close-btn" @click="resetAndClose">
            <X :size="24" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSave" class="stock-form">
            
            <div v-if="errorMsg" class="error-alert">
              <AlertCircle :size="18" />
              <span>{{ errorMsg }}</span>
            </div>

            <div class="form-group">
              <label>Select Product</label>
              <select v-model="selectedProductId" required>
                <option value="" disabled>-- Choose a product --</option>
                <option v-for="product in productStore.products" :key="product.id" :value="product.id">
                  {{ product.name }} (Current: {{ product.stock_quantity || 0 }})
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Movement Type</label>
                <div class="type-selector">
                  <label class="type-radio in">
                    <input type="radio" v-model="transactionType" value="IN" />
                    <span>Stock In</span>
                  </label>
                  <label class="type-radio out">
                    <input type="radio" v-model="transactionType" value="OUT" />
                    <span>Stock Out</span>
                  </label>
                  <label class="type-radio adj">
                    <input type="radio" v-model="transactionType" value="ADJUSTMENT" />
                    <span>Adjustment</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-row quantity-row">
              <div class="form-group flex-1">
                <label>
                  {{ transactionType === 'ADJUSTMENT' ? 'New Total Stock' : 'Quantity' }}
                </label>
                <input v-model.number="quantity" type="number" min="0" required />
              </div>
              
              <div class="preview-box flex-1">
                <span class="preview-label">Resulting Stock:</span>
                <span class="preview-value" :class="{ 'negative': calculatedNewStock < 0 }">
                  {{ calculatedNewStock }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label>Notes / Reason</label>
              <textarea v-model="notes" rows="2" placeholder="e.g. Restock from supplier, expired goods, etc."></textarea>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="resetAndClose">Cancel</button>
              <button type="submit" class="btn-save">Confirm Movement</button>
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
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
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
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
}

.stock-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #fef2f2;
  color: #ef4444;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-row {
  display: flex;
  gap: 16px;
}

.flex-1 {
  flex: 1;
}

.quantity-row {
  align-items: flex-end;
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

.form-group input[type="number"],
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.type-selector {
  display: flex;
  gap: 8px;
}

.type-radio {
  flex: 1;
  position: relative;
  cursor: pointer;
}

.type-radio input {
  position: absolute;
  opacity: 0;
}

.type-radio span {
  display: block;
  text-align: center;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.type-radio.in input:checked + span {
  background-color: #d1fae5;
  border-color: #10b981;
  color: #059669;
}

.type-radio.out input:checked + span {
  background-color: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}

.type-radio.adj input:checked + span {
  background-color: #e0e7ff;
  border-color: #6366f1;
  color: #4338ca;
}

.preview-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  height: 42px;
}

.preview-label {
  font-size: 0.75rem;
  color: #64748b;
}

.preview-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.preview-value.negative {
  color: #ef4444;
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
}

.btn-cancel:hover {
  background-color: #f8fafc;
}

.btn-save {
  padding: 10px 20px;
  background-color: #2563eb;
  border: none;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-save:hover {
  background-color: #1d4ed8;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
