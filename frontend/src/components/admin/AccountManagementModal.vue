<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Lock, Mail, KeyRound } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  mode: 'create' | 'reset';
  employeeId: number;
  employeeName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: any): void;
}>();

const formData = ref({
  email: '',
  new_password: '',
  admin_password: '',
});

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      formData.value = {
        email: '',
        new_password: '',
        admin_password: '',
      };
    }
  }
);

function handleSubmit() {
  const payload: any = {
    employee_id: props.employeeId,
    new_password: formData.value.new_password,
    admin_password: formData.value.admin_password,
  };

  if (props.mode === 'create') {
    payload.email = formData.value.email;
  }

  emit('submit', payload);
}
</script>

<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @mousedown.self="emit('close')">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="icon-circle">
              <KeyRound v-if="mode === 'reset'" :size="24" class="text-primary" />
              <Mail v-else :size="24" class="text-primary" />
            </div>
            <div>
              <h2 class="modal-title">{{ mode === 'create' ? 'Create User Account' : 'Reset Password' }}</h2>
              <p class="modal-subtitle">For employee: <strong>{{ employeeName }}</strong></p>
            </div>
          </div>
          <button class="close-btn" @click="emit('close')">
            <X :size="24" />
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="account-form">
            <div class="alert warning-alert">
              <Lock :size="16" />
              <span>This is a sensitive action. You must verify your Admin password to proceed.</span>
            </div>

            <!-- Email (Only for create) -->
            <div class="form-group" v-if="mode === 'create'">
              <label>Account Email</label>
              <input 
                v-model="formData.email" 
                type="email" 
                required 
                placeholder="Enter email for login" 
              />
            </div>

            <!-- New Password -->
            <div class="form-group">
              <label>New Password (for employee)</label>
              <input 
                v-model="formData.new_password" 
                type="password" 
                required 
                placeholder="Min. 6 characters" 
                minlength="6"
              />
            </div>

            <!-- Admin Password Verification -->
            <div class="form-group admin-verify">
              <label>Your Admin Password</label>
              <input 
                v-model="formData.admin_password" 
                type="password" 
                required 
                placeholder="Verify it's you" 
              />
            </div>

            <!-- Footer -->
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="emit('close')">Cancel</button>
              <button type="submit" class="btn-save">{{ mode === 'create' ? 'Create Account' : 'Reset Password' }}</button>
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
  background-color: rgba(15, 23, 42, 0.5);
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
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.modal-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.close-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
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
}

.account-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.warning-alert {
  background-color: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
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

.form-group input {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #0f172a;
  background-color: #ffffff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.admin-verify {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
}

.admin-verify label {
  color: #ef4444;
}

.admin-verify input:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
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
  padding: 10px 24px;
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

/* Animations */
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
