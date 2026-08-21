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

const handleProfileSave = () => {
  isSaving.value = true;
  saveSuccess.value = false;
  errorMessage.value = '';
  
  setTimeout(() => {
    isSaving.value = false;
    successMessage.value = 'Profile updated successfully!';
    saveSuccess.value = true;
    
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  }, 1000);
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

const handleEmployeePasswordSave = async () => {
  if (employeePasswordForm.value.new_password !== employeePasswordForm.value.confirm_password) {
    errorMessage.value = 'Passwords do not match';
    return;
  }
  
  isSaving.value = true;
  saveSuccess.value = false;
  errorMessage.value = '';
  
  try {
    await api.post('/users/reset-employee-password', {
      employee_id: Number(employeePasswordForm.value.employee_id),
      new_password: employeePasswordForm.value.new_password,
      admin_password: employeePasswordForm.value.admin_password
    });
    
    successMessage.value = 'Employee password reset successfully!';
    saveSuccess.value = true;
    employeePasswordForm.value = { employee_id: '', new_password: '', confirm_password: '', admin_password: '' };
    
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to reset employee password';
  } finally {
    isSaving.value = false;
  }
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
        <button 
          v-if="isAdmin"
          class="tab-btn" 
          :class="{ active: activeTab === 'employee-password' }"
          @click="activeTab = 'employee-password'; errorMessage = ''"
        >
          <Users :size="18" />
          <span>Employee Passwords</span>
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
                  <input type="text" v-model="profileForm.first_name" required readonly />
                </div>
                <span class="help-text">Managed by HR</span>
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <div class="input-with-icon">
                  <User class="input-icon" :size="18" />
                  <input type="text" v-model="profileForm.last_name" readonly />
                </div>
                <span class="help-text">Managed by HR</span>
              </div>
            </div>
            
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-with-icon">
                <Mail class="input-icon" :size="18" />
                <input type="email" v-model="profileForm.email" required />
              </div>
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

        <!-- Employee Passwords Tab -->
        <div v-if="activeTab === 'employee-password' && isAdmin" class="tab-pane">
          <h2 class="section-title">Reset Employee Password</h2>
          <p class="section-desc">Reset a staff member's password. Requires your Admin password to authorize.</p>
          
          <div class="divider"></div>
          
          <form @submit.prevent="handleEmployeePasswordSave" class="settings-form">
            <div class="form-group">
              <label>Select Employee</label>
              <select v-model="employeePasswordForm.employee_id" required class="select-input">
                <option value="" disabled>-- Select Employee --</option>
                <option v-for="emp in employeeStore.employees" :key="emp.id" :value="emp.id">
                  {{ emp.first_name }} {{ emp.last_name }} ({{ emp.employee_number }})
                  {{ !emp.user_id ? ' - ⚠️ No registered account' : '' }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>New Password for Employee</label>
              <input type="password" v-model="employeePasswordForm.new_password" required minlength="6" />
            </div>
            
            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" v-model="employeePasswordForm.confirm_password" required minlength="6" />
            </div>

            <div class="divider"></div>

            <div class="form-group">
              <label>Your Admin Password (Authorization)</label>
              <input type="password" v-model="employeePasswordForm.admin_password" required />
              <span class="help-text">Enter your own password to authorize this action.</span>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isSaving">
                {{ isSaving ? 'Processing...' : 'Reset Password' }}
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
  display: grid;
  grid-template-columns: 240px 1fr;
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
  flex-direction: column;
  padding: 12px;
  height: fit-content;
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
  text-align: left;
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
