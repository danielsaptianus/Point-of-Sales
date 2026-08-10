<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  Lock,
  Mail,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('kasir@arto-pos.id');
const password = ref('password123');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Mohon isi email dan password';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login(email.value, password.value);
    router.push('/pos');
  } catch (err: any) {
    errorMessage.value = err.message || 'Login gagal, periksa email & password';
  } finally {
    isLoading.value = false;
  }
};

const fillDemo = (role: 'cashier' | 'admin') => {
  if (role === 'cashier') {
    email.value = 'kasir@arto-pos.id';
    password.value = 'kasir123';
  } else {
    email.value = 'admin@arto-pos.id';
    password.value = 'admin123';
  }
};
</script>

<template>
  <div class="login-wrapper">
    <!-- Ambient Background Glows -->
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>

    <div class="login-container">
      <!-- Brand Header -->
      <div class="brand-hero">
        <div class="logo-box">
          <ShoppingBag :size="32" class="logo-icon" />
        </div>
        <h1 class="brand-title">Arto POS</h1>
        <p class="brand-tagline">Sistem Kasir & Point of Sales Modern</p>
      </div>

      <!-- Login Form Card -->
      <div class="glass-panel login-card">
        <div class="card-title-row">
          <h2>Masuk ke Mesin Kasir</h2>
          <span class="badge badge-primary">
            <ShieldCheck :size="12" /> v1.0
          </span>
        </div>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Email Input -->
          <div class="input-group">
            <label class="input-label">Email Kasir / Admin</label>
            <div class="input-with-icon">
              <Mail :size="18" class="input-icon" />
              <input
                type="email"
                v-model="email"
                required
                placeholder="nama@arto-pos.id"
                class="input-field"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div class="input-group">
            <label class="input-label">Password</label>
            <div class="input-with-icon">
              <Lock :size="18" class="input-icon" />
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                required
                placeholder="••••••••"
                class="input-field"
              />
              <button
                type="button"
                class="eye-btn"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </div>
          </div>

          <!-- Quick Demo Buttons -->
          <div class="demo-shortcuts">
            <span class="demo-label">Akun Cepat:</span>
            <button type="button" class="demo-chip" @click="fillDemo('cashier')">
              Kasir Budi
            </button>
            <button type="button" class="demo-chip" @click="fillDemo('admin')">
              Admin Pusat
            </button>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary btn-submit"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">Masuk ke Kasir</span>
            <span v-else>Memeriksa...</span>
            <ArrowRight :size="18" />
          </button>
        </form>
      </div>

      <!-- Footer Info -->
      <footer class="login-footer">
        <p>© 2026 Arto POS System. Terhubung dengan NestJS & PostgreSQL</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-dark);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  opacity: 0.25;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: #10b981;
  top: -100px;
  right: -100px;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: #6366f1;
  bottom: -150px;
  left: -150px;
}

.login-container {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-hero {
  text-align: center;
  margin-bottom: 28px;
}

.logo-box {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  margin: 0 auto 16px auto;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
}

.brand-title {
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.brand-tagline {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.login-card {
  width: 100%;
  padding: 32px 28px;
  box-shadow: var(--shadow-lg);
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-title-row h2 {
  font-size: 1.25rem;
}

.error-banner {
  background: var(--danger-light);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: var(--danger);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-dim);
  pointer-events: none;
}

.input-with-icon .input-field {
  padding-left: 44px;
  padding-right: 44px;
}

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.eye-btn:hover {
  color: var(--text-main);
}

.demo-shortcuts {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.demo-label {
  font-size: 0.78rem;
  color: var(--text-dim);
}

.demo-chip {
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.demo-chip:hover {
  background: var(--bg-card-hover);
  color: var(--primary);
  border-color: var(--primary);
}

.btn-submit {
  margin-top: 8px;
  padding: 14px;
  font-size: 1rem;
  width: 100%;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-dim);
}
</style>
