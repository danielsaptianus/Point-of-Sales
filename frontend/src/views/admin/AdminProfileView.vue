<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useEmployeeStore } from '@/stores/employees';
import api from '@/plugins/axios';
import { User, Mail, Shield, AlertCircle, Users, AlertTriangle } from 'lucide-vue-next';

const authStore = useAuthStore();
const employeeStore = useEmployeeStore();
const user = authStore.user;

const isAdmin = computed(() => {
  const positionName = user?.position?.name?.toLowerCase() || '';
  return positionName.includes('admin') || positionName.includes('manager');
});

const activeTab = ref('profile');

const profileForm = ref({
  first_name: user?.first_name || '',
  last_name: user?.last_name || '',
  email: user?.email || '',
  gender: user?.gender || 'L',
  birth_date: user?.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
  marital_status: user?.marital_status || '',
  phone: user?.phone || '',
  address: user?.address || '',
  employee_number: user?.employee_number || '',
  employment_type: user?.employment_type || '',
  salary: user?.salary || 0,
  hire_date: user?.hire_date ? new Date(user.hire_date).toISOString().split('T')[0] : '',
  termination_date: user?.termination_date ? new Date(user.termination_date).toISOString().split('T')[0] : '',
  bank_name: user?.bank_name || '',
  bank_account_number: user?.bank_account_number || '',
  bank_account_name: user?.bank_account_name || '',
});

const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
});

const employeePasswordForm = ref({
  employee_id: '',
  new_password: '',
  confirm_password: '',
  admin_password: ''
});

// Since we haven't created the backend endpoint for edit profile yet, this will just show a UI success state
const isSaving = ref(false);
const saveSuccess = ref(false);
const successMessage = ref('Changes saved successfully!');
const errorMessage = ref('');

onMounted(async () => {
  if (isAdmin.value && employeeStore.employees.length === 0) {
    await employeeStore.fetchEmployees();
  }
});

const handleProfileSave = async () => {
  isSaving.value = true;
  saveSuccess.value = false;
  errorMessage.value = '';
  
  try {
    const response = await api.patch(`/users/${user?.id}`, {
      first_name: profileForm.value.first_name,
      last_name: profileForm.value.last_name,
      email: profileForm.value.email,
      gender: profileForm.value.gender,
      birth_date: profileForm.value.birth_date,
      marital_status: profileForm.value.marital_status,
      phone: profileForm.value.phone,
      address: profileForm.value.address,
      employee_number: profileForm.value.employee_number,
      employment_type: profileForm.value.employment_type,
      salary: profileForm.value.salary,
      hire_date: profileForm.value.hire_date || null,
      termination_date: profileForm.value.termination_date || null,
      bank_name: profileForm.value.bank_name,
      bank_account_number: profileForm.value.bank_account_number,
      bank_account_name: profileForm.value.bank_account_name,
    });
    
    // Update local store if needed
    if (authStore.user) {
      authStore.user.first_name = profileForm.value.first_name;
      authStore.user.last_name = profileForm.value.last_name;
      authStore.user.email = profileForm.value.email;
      authStore.user.gender = profileForm.value.gender;
      authStore.user.birth_date = profileForm.value.birth_date;
      authStore.user.marital_status = profileForm.value.marital_status;
      authStore.user.phone = profileForm.value.phone;
      authStore.user.address = profileForm.value.address;
      authStore.user.employee_number = profileForm.value.employee_number;
      authStore.user.employment_type = profileForm.value.employment_type;
      authStore.user.salary = profileForm.value.salary;
      authStore.user.hire_date = profileForm.value.hire_date;
      authStore.user.termination_date = profileForm.value.termination_date;
      authStore.user.bank_name = profileForm.value.bank_name;
      authStore.user.bank_account_number = profileForm.value.bank_account_number;
      authStore.user.bank_account_name = profileForm.value.bank_account_name;
    }

    successMessage.value = 'Profile updated successfully!';
    saveSuccess.value = true;
    
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to update profile';
  } finally {
    isSaving.value = false;
  }
};

const handlePasswordSave = () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    errorMessage.value = 'Passwords do not match';
    return;
  }
  
  isSaving.value = true;
  saveSuccess.value = false;
  errorMessage.value = '';
  
  setTimeout(() => {
    isSaving.value = false;
    successMessage.value = 'Password updated successfully!';
    saveSuccess.value = true;
    passwordForm.value = { current_password: '', new_password: '', confirm_password: '' };
    
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  }, 1000);
};
</script>

<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">{{ $t('settings.edit_profile') }}</h1>
      <p class="page-subtitle">Manage your personal information and security preferences.</p>
    </div>
    
    <div class="profile-layout">
      <!-- Left sidebar tabs -->
      <div class="profile-tabs card">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'; errorMessage = ''"
        >
          <User :size="18" />
          <span>Personal Info</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'security' }"
          @click="activeTab = 'security'; errorMessage = ''"
        >
          <Shield :size="18" />
          <span>Security & Password</span>
        </button>
      </div>
      
      <!-- Right content area -->
      <div class="profile-content card">
        <!-- Success message -->
        <transition name="fade">
          <div v-if="saveSuccess" class="success-alert">
            <AlertCircle :size="18" />
            <span>{{ successMessage }}</span>
          </div>
        </transition>

        <!-- Error message -->
        <transition name="fade">
          <div v-if="errorMessage" class="error-alert">
            <AlertTriangle :size="18" />
            <span>{{ errorMessage }}</span>
          </div>
        </transition>
        
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="tab-pane">
          <h2 class="section-title">Personal Information</h2>
          <p class="section-desc">Update your photo and personal details.</p>
          
          <div class="divider"></div>
          
          <div class="avatar-section">
            <div class="avatar-large">
              {{ profileForm.email.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="avatar-actions">
              <button class="btn-outline">Change Photo</button>
              <button class="btn-text">Remove</button>
            </div>
          </div>
          
          <form @submit.prevent="handleProfileSave" class="settings-form">
            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <div class="input-with-icon">
                  <User class="input-icon" :size="18" />
                  <input type="text" v-model="profileForm.first_name" required />
                </div>
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <div class="input-with-icon">
                  <User class="input-icon" :size="18" />
                  <input type="text" v-model="profileForm.last_name" />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Gender</label>
                <div class="radio-group" style="display: flex; gap: 16px; margin-top: 8px;">
                  <label class="radio-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="radio" v-model="profileForm.gender" value="L">
                    <span>Male (L)</span>
                  </label>
                  <label class="radio-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="radio" v-model="profileForm.gender" value="P">
                    <span>Female (P)</span>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label>Birth Date</label>
                <input v-model="profileForm.birth_date" type="date" class="select-input" style="width: 100%;" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Marital Status</label>
                <select v-model="profileForm.marital_status" class="select-input">
                  <option value="">-- Select Status --</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
            </div>

            <h3 class="section-title" style="margin-top: 16px;">Contact Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Email Address</label>
                <div class="input-with-icon">
                  <Mail class="input-icon" :size="18" />
                  <input type="email" v-model="profileForm.email" required />
                </div>
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input v-model="profileForm.phone" type="tel" placeholder="08..." class="select-input" />
              </div>
            </div>

            <div class="form-group">
              <label>Address</label>
              <textarea v-model="profileForm.address" rows="3" placeholder="Full address..." class="select-input" style="padding: 10px 12px; font-family: inherit; resize: vertical;"></textarea>
            </div>

            <h3 class="section-title" style="margin-top: 16px;">Employment Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Employee ID (NIP)</label>
                <input v-model="profileForm.employee_number" type="text" placeholder="EMP-XXX" class="select-input" />
              </div>
              <div class="form-group">
                <label>Employment Type</label>
                <select v-model="profileForm.employment_type" class="select-input">
                  <option value="">-- Select Type --</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Hire Date</label>
                <input v-model="profileForm.hire_date" type="date" class="select-input" style="width: 100%;" />
              </div>
              <div class="form-group">
                <label>Termination Date</label>
                <input v-model="profileForm.termination_date" type="date" class="select-input" style="width: 100%;" />
              </div>
            </div>
            
            <div class="form-group">
              <label>Salary (Rp)</label>
              <input v-model="profileForm.salary" type="number" placeholder="5000000" class="select-input" />
            </div>

            <h3 class="section-title" style="margin-top: 16px;">Bank Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Bank Name</label>
                <input v-model="profileForm.bank_name" type="text" placeholder="BCA / Mandiri / dll" class="select-input" />
              </div>
              <div class="form-group">
                <label>Account Number</label>
                <input v-model="profileForm.bank_account_number" type="text" placeholder="1234567890" class="select-input" />
              </div>
            </div>
            <div class="form-group">
              <label>Account Name</label>
              <input v-model="profileForm.bank_account_name" type="text" placeholder="John Doe" class="select-input" />
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
        
        <!-- Security Tab -->
        <div v-if="activeTab === 'security'" class="tab-pane">
          <h2 class="section-title">Password Settings</h2>
          <p class="section-desc">Ensure your account is using a long, random password to stay secure.</p>
          
          <div class="divider"></div>
          
          <form @submit.prevent="handlePasswordSave" class="settings-form">
            <div class="form-group">
              <label>Current Password</label>
              <input type="password" v-model="passwordForm.current_password" required />
            </div>
            
            <div class="form-group">
              <label>New Password</label>
              <input type="password" v-model="passwordForm.new_password" required minlength="6" />
            </div>
            
            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" v-model="passwordForm.confirm_password" required minlength="6" />
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isSaving">
                {{ isSaving ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 8px;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
}

.page-subtitle {
  margin: 4px 0 0 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.profile-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.profile-tabs {
  display: flex;
  flex-direction: row;
  padding: 12px;
  gap: 8px;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  background-color: var(--bg-card-hover);
  color: var(--text-main);
}

.tab-btn.active {
  background-color: var(--primary-light);
  color: var(--primary);
}

.profile-content {
  padding: 32px;
  position: relative;
}

.section-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-main);
}

.section-desc {
  margin: 4px 0 0 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.divider {
  height: 1px;
  background-color: var(--border);
  margin: 24px 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  box-shadow: var(--shadow-md);
}

.avatar-actions {
  display: flex;
  gap: 12px;
}

.btn-outline {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-dark);
  color: var(--text-main);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background-color: var(--bg-card-hover);
}

.btn-text {
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: var(--danger);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-text:hover {
  background-color: var(--danger-light);
}

.settings-form {
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
  color: var(--text-main);
}

.form-group input, .select-input {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-main);
  background-color: var(--bg-input);
  outline: none;
  transition: all 0.2s;
}

.form-group input:focus, .select-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.form-group input[readonly] {
  background-color: var(--bg-sidebar);
  color: var(--text-muted);
  cursor: not-allowed;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-dim);
}

.input-with-icon input {
  padding-left: 36px;
  width: 100%;
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.btn-primary {
  padding: 10px 20px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-alert {
  position: absolute;
  top: 32px;
  right: 32px;
  background-color: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 10;
}

.error-alert {
  position: absolute;
  top: 32px;
  right: 32px;
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 10;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
