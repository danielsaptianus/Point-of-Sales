<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { X } from 'lucide-vue-next';
import type { Product } from '@/types';
import { useProductStore } from '@/stores/products';

const props = defineProps<{
  isOpen: boolean;
  productToEdit?: Product | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

const productStore = useProductStore();

// Default form state
const formData = ref({
  name: '',
  sku: '',
  category_id: 1,
  price: 0,
  stock_quantity: 0,
  description: '',
  is_active: true
});

// Watch for productToEdit changes to populate the form
watch(
  () => props.productToEdit,
  (newVal) => {
    if (newVal) {
      formData.value = {
        name: newVal.name,
        sku: newVal.sku,
        category_id: newVal.category_id,
        price: newVal.price,
        stock_quantity: newVal.stock_quantity || 0,
        description: newVal.description || '',
        is_active: newVal.is_active,
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  formData.value = {
    name: '',
    sku: '',
    category_id: productStore.categories.length > 0 ? productStore.categories[0].id : 1,
    price: 0,
    stock_quantity: 0,
    description: '',
    is_active: true
  };
}

async function handleSave() {
  if (props.productToEdit) {
    // Edit mode
    const { name, sku, category_id, price, description, is_active } = formData.value;
    await productStore.updateProduct(props.productToEdit.id, {
      name, sku, category_id, price, description, is_active
    });
  } else {
    // Add mode
    const { name, sku, category_id, price, description, is_active, stock_quantity } = formData.value;
    await productStore.addProduct({
      name, sku, category_id, price, description, is_active, initial_stock: stock_quantity
    } as any);
  }
  emit('save');
  closeModal();
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
          <h2 class="modal-title">{{ productToEdit ? 'Edit Product' : 'Add New Product' }}</h2>
          <button class="close-btn" @click="closeModal">
            <X :size="24" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSave" class="product-form">
            <div class="form-row">
              <div class="form-group">
                <label>Product Name</label>
                <input v-model="formData.name" type="text" required placeholder="Enter product name" />
              </div>
              <div class="form-group">
                <label>SKU (Stock Keeping Unit)</label>
                <input v-model="formData.sku" type="text" required placeholder="e.g. PRD-001" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <select v-model="formData.category_id" required>
                  <option v-for="category in productStore.categories.filter(c => c.id !== 0)" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Price (Rp)</label>
                <input v-model.number="formData.price" type="number" min="0" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Initial Stock</label>
                <input v-model.number="formData.stock_quantity" type="number" min="0" required />
              </div>
              <div class="form-group toggle-group">
                <label>Status</label>
                <div class="toggle-container">
                  <span class="status-text" :class="{ 'active': formData.is_active }">
                    {{ formData.is_active ? 'Active' : 'Inactive' }}
                  </span>
                  <label class="switch">
                    <input type="checkbox" v-model="formData.is_active">
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea v-model="formData.description" rows="3" placeholder="Brief description of the product..."></textarea>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-save">Save Product</button>
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
  max-height: 70vh;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
.form-group select,
.form-group textarea {
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
.form-group select:focus,
.form-group textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.toggle-group {
  justify-content: center;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 40px;
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.status-text.active {
  color: #10b981;
}

/* Toggle Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #10b981;
}

input:focus + .slider {
  box-shadow: 0 0 1px #10b981;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
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

/* Transitions */
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

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
