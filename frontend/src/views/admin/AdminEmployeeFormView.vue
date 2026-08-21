<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmployeeStore } from '@/stores/employees';
import { ArrowLeft, UserPlus, KeyRound, ShieldCheck } from 'lucide-vue-next';
import AccountManagementModal from '@/components/admin/AccountManagementModal.vue';

const route = useRoute();
const router = useRouter();
const employeeStore = useEmployeeStore();

const isEditMode = ref(false);
const isSaving = ref(false);
const employeeData = ref<any>(null);

const isAccountModalOpen = ref(false);
const accountModalMode = ref<'create' | 'reset'>('create');
const accountError = ref('');
const accountSuccess = ref('');

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

onMounted(async () => {
  // Ensure we have positions/employees loaded
  if (employeeStore.employees.length === 0) {
    await employeeStore.fetchEmployees();
  }
  
  if (route.params.id) {
    isEditMode.value = true;
    const empId = Number(route.params.id);
    let emp = employeeStore.employees.find(e => e.id === empId);
    
    if (emp) {
      formData.value = {
        employee_number: emp.employee_number,
        first_name: emp.first_name,
        last_name: emp.last_name || '',
        gender: emp.gender,
        birth_date: emp.birth_date ? emp.birth_date.split('T')[0] : '',
        marital_status: emp.marital_status || '',
        email: emp.email || '',
        phone: emp.phone || '',
        address: emp.address || '',
        hire_date: emp.hire_date ? emp.hire_date.split('T')[0] : new Date().toISOString().split('T')[0],
        termination_date: emp.termination_date ? emp.termination_date.split('T')[0] : '',
        employment_type: emp.employment_type || '',
        salary: emp.salary ? Number(emp.salary) : 0,
        bank_name: emp.bank_name || '',
        bank_account_number: emp.bank_account_number || '',
        bank_account_name: emp.bank_account_name || '',
        position_id: emp.position_id,
        is_active: emp.is_active,
      };
      employeeData.value = emp;
    } else {
      router.push('/admin/employees'); // not found
    }
  } else {
    // New mode, set default position
    if (employeeStore.positions.length > 0) {
      formData.value.position_id = employeeStore.positions[0].id;
    }
  }
});

async function handleSave() {
  isSaving.value = true;
  try {
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

    if (isEditMode.value) {
      await employeeStore.updateEmployee(Number(route.params.id), dataToSave);
    } else {
      await employeeStore.addEmployee(dataToSave);
    }
    router.push('/admin/employees');
  } catch (error) {
    console.error("Error saving employee", error);
  } finally {
    isSaving.value = false;
  }
}

function handleCancel() {
  router.push('/admin/employees');
}

function openAccountModal(mode: 'create' | 'reset') {
  accountModalMode.value = mode;
  isAccountModalOpen.value = true;
  accountError.value = '';
  accountSuccess.value = '';
}

async function handleAccountAction(payload: any) {
  try {
    accountError.value = '';
    accountSuccess.value = '';
    
    if (accountModalMode.value === 'create') {
      await employeeStore.createEmployeeUser(payload);
      accountSuccess.value = 'User account created successfully! Employee is now linked.';
      // Refresh employee data to show the new user
      await employeeStore.fetchEmployees();
      const emp = employeeStore.employees.find(e => e.id === Number(route.params.id));
      if (emp) employeeData.value = emp;
    } else {
      await employeeStore.resetEmployeePassword(payload);
      accountSuccess.value = 'Password reset successfully!';
    }
    
    isAccountModalOpen.value = false;
  } catch (error: any) {
    accountError.value = error.response?.data?.message || 'An error occurred during account management.';
  }
}
</script>

<template>
  <div class="employee-form-page">
    <div class="page-header">
      <button class="back-btn" @click="handleCancel">
        <ArrowLeft :size="20" />
      </button>
      <div>
        <h1 class="page-title">{{ isEditMode ? 'Edit Employee' : 'Add New Employee' }}</h1>
        <p class="page-subtitle">{{ isEditMode ? 'Update existing employee details.' : 'Register a new staff member to the system.' }}</p>
      </div>
    </div>

    <div class="card form-card">
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
          <textarea v-model="formData.address" rows="3" placeholder="Full address..."></textarea>
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

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="handleCancel" :disabled="isSaving">Cancel</button>
          <button type="submit" class="btn-save" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Employee' }}
          </button>
        </div>
      </form>

      <!-- Account Management Section (Only in Edit Mode) -->
      <div v-if="isEditMode && employeeData" class="account-section">
        <h3 class="section-title account-title">
          <ShieldCheck :size="20" /> User Account & Credentials
        </h3>
        
        <div v-if="accountError" class="alert-box error">{{ accountError }}</div>
        <div v-if="accountSuccess" class="alert-box success">{{ accountSuccess }}</div>

        <div class="account-card">
          <div class="account-status">
            <template v-if="employeeData.user_id">
              <div class="status-indicator active"></div>
              <div class="status-info">
                <h4>Account Linked</h4>
                <p>Email: <strong>{{ employeeData.user?.email || 'Unknown Email' }}</strong></p>
              </div>
            </template>
            <template v-else>
              <div class="status-indicator inactive"></div>
              <div class="status-info">
                <h4>No Account</h4>
                <p>This employee cannot log into the system yet.</p>
              </div>
            </template>
          </div>

          <div class="account-actions">
            <button 
              v-if="!employeeData.user_id" 
              type="button" 
              class="btn-create-account" 
              @click="openAccountModal('create')"
            >
              <UserPlus :size="18" /> Create Account
            </button>
            
            <button 
              v-else 
              type="button" 
              class="btn-reset-password" 
              @click="openAccountModal('reset')"
            >
              <KeyRound :size="18" /> Reset Password
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Modals -->
    <AccountManagementModal
      :is-open="isAccountModalOpen"
      :mode="accountModalMode"
      :employee-id="employeeData?.id || 0"
      :employee-name="employeeData?.first_name + ' ' + (employeeData?.last_name || '')"
      @close="isAccountModalOpen = false"
      @submit="handleAccountAction"
    />

  </div>
</template>

<style scoped>
.employee-form-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.back-btn:hover {
  background-color: #f8fafc;
  color: #0f172a;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  margin: 4px 0 0 0;
  color: #64748b;
  font-size: 0.875rem;
}

.card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.form-card {
  padding: 32px;
}

.employee-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  margin: 16px 0 8px 0;
  font-size: 1.125rem;
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

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
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

.btn-cancel:hover:not(:disabled) {
  background-color: #f8fafc;
  color: #0f172a;
}

.btn-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-save {
  padding: 10px 24px;
  background-color: #2563eb;
  border: none;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Account Section Styles */
.account-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.account-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
}

.account-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.account-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.active {
  background-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.status-indicator.inactive {
  background-color: #94a3b8;
}

.status-info h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #0f172a;
}

.status-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.account-actions {
  display: flex;
  gap: 12px;
}

.btn-create-account {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-account:hover {
  background-color: #2563eb;
}

.btn-reset-password {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #ffffff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset-password:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.alert-box {
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.alert-box.error {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.alert-box.success {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
</style>
