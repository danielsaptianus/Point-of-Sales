<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { Employee } from '@/types';
import { useEmployeeStore } from '@/stores/employees';

const props = defineProps<{
  isOpen: boolean;
  employeeToEdit?: Employee | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

const employeeStore = useEmployeeStore();

const formData = ref({
  employee_number: '',
  first_name: '',
  last_name: '',
  gender: 'L',
  birth_date: '',
  marital_status: '',
  email: '',
  phone: '',
  address: '',
  hire_date: new Date().toISOString().split('T')[0],
  termination_date: '',
  employment_type: '',
  salary: 0,
  bank_name: '',
  bank_account_number: '',
  bank_account_name: '',
  position_id: 2,
  is_active: true
});

watch(
  () => props.employeeToEdit,
  (newVal) => {
    if (newVal) {
      formData.value = {
        employee_number: newVal.employee_number,
        first_name: newVal.first_name,
        last_name: newVal.last_name || '',
        gender: newVal.gender,
        birth_date: newVal.birth_date ? newVal.birth_date.split('T')[0] : '',
        marital_status: newVal.marital_status || '',
        email: newVal.email || '',
        phone: newVal.phone || '',
        address: newVal.address || '',
        hire_date: newVal.hire_date ? newVal.hire_date.split('T')[0] : new Date().toISOString().split('T')[0],
        termination_date: newVal.termination_date ? newVal.termination_date.split('T')[0] : '',
        employment_type: newVal.employment_type || '',
        salary: newVal.salary ? Number(newVal.salary) : 0,
        bank_name: newVal.bank_name || '',
        bank_account_number: newVal.bank_account_number || '',
        bank_account_name: newVal.bank_account_name || '',
        position_id: newVal.position_id,
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
    employee_number: '',
    first_name: '',
    last_name: '',
    gender: 'L',
    birth_date: '',
    marital_status: '',
    email: '',
    phone: '',
    address: '',
    hire_date: new Date().toISOString().split('T')[0],
    termination_date: '',
    employment_type: '',
    salary: 0,
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    position_id: employeeStore.positions.length > 0 ? employeeStore.positions[0].id : 2,
    is_active: true
  };
}

async function handleSave() {
  const dataToSave: any = {
    ...formData.value,
    hire_date: formData.value.hire_date ? new Date(formData.value.hire_date).toISOString() : undefined,
    birth_date: formData.value.birth_date ? new Date(formData.value.birth_date).toISOString() : undefined,
    termination_date: formData.value.termination_date ? new Date(formData.value.termination_date).toISOString() : undefined,
  };

  if (!dataToSave.marital_status) delete dataToSave.marital_status;
  if (!dataToSave.employment_type) delete dataToSave.employment_type;
  if (!dataToSave.salary) delete dataToSave.salary;
  if (!dataToSave.last_name) delete dataToSave.last_name;
  if (!dataToSave.email) delete dataToSave.email;

  if (props.employeeToEdit) {
    await employeeStore.updateEmployee(props.employeeToEdit.id, dataToSave);
  } else {
    await employeeStore.addEmployee(dataToSave);
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
          <h2 class="modal-title">{{ employeeToEdit ? 'Edit Employee' : 'Add New Employee' }}</h2>
          <button class="close-btn" @click="closeModal">
            <X :size="24" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSave" class="employee-form">
            <h3 class="section-title">Personal Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <input v-model="formData.first_name" type="text" required placeholder="First Name" />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input v-model="formData.last_name" type="text" placeholder="Last Name" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Gender</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="formData.gender" value="L">
                    <span>Male (L)</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="formData.gender" value="P">
                    <span>Female (P)</span>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label>Birth Date</label>
                <input v-model="formData.birth_date" type="date" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Marital Status</label>
                <select v-model="formData.marital_status">
                  <option value="">-- Select Status --</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
            </div>

            <h3 class="section-title">Contact Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input v-model="formData.email" type="email" placeholder="example@email.com" />
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input v-model="formData.phone" type="tel" placeholder="08..." />
              </div>
            </div>
            <div class="form-group">
              <label>Address</label>
              <textarea v-model="formData.address" rows="2" placeholder="Full address..."></textarea>
            </div>

            <h3 class="section-title">Employment Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Employee ID (NIP)</label>
                <input v-model="formData.employee_number" type="text" required placeholder="EMP-XXX" />
              </div>
              <div class="form-group">
                <label>Position</label>
                <select v-model="formData.position_id" required>
                  <option v-for="pos in employeeStore.positions" :key="pos.id" :value="pos.id">
                    {{ pos.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Employment Type</label>
                <select v-model="formData.employment_type">
                  <option value="">-- Select Type --</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>
              <div class="form-group">
                <label>Base Salary (Rp)</label>
                <input v-model.number="formData.salary" type="number" min="0" placeholder="e.g 5000000" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Hire Date</label>
                <input v-model="formData.hire_date" type="date" required />
              </div>
              <div class="form-group">
                <label>Termination Date</label>
                <input v-model="formData.termination_date" type="date" />
              </div>
            </div>

            <h3 class="section-title">Bank Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Bank Name</label>
                <input v-model="formData.bank_name" type="text" placeholder="e.g. BCA, Mandiri" />
              </div>
              <div class="form-group">
                <label>Account Number</label>
                <input v-model="formData.bank_account_number" type="text" placeholder="Account Number" />
              </div>
            </div>
            <div class="form-group">
              <label>Account Holder Name</label>
              <input v-model="formData.bank_account_name" type="text" placeholder="Name on bank account" />
            </div>

            <div class="form-row" style="margin-top: 16px;">
              <div class="form-group toggle-group" style="justify-content: flex-start;">
                <label>Account Status</label>
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

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-save">Save Employee</button>
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
  max-width: 650px;
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

.employee-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 16px 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #3b82f6;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
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

.form-group input:not([type="radio"]):not([type="checkbox"]),
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

.radio-group {
  display: flex;
  gap: 16px;
  height: 40px;
  align-items: center;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
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
  margin-top: 16px;
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
