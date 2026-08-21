import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/plugins/axios';

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  position: {
    id: number;
    name: string;
  };
  permissions: string[];
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(
    localStorage.getItem('arto_user')
      ? JSON.parse(localStorage.getItem('arto_user')!)
      : null
  );

  const isAuthenticated = computed(() => !!user.value);
  
  const cashierName = computed(() => {
    if (!user.value) return 'Kasir';
    return `${user.value.first_name} ${user.value.last_name}`;
  });

  async function login(email: string, pass: string): Promise<boolean> {
    try {
      const response = await api.post('/auth/login', {
        email,
        password: pass,
      });
      const userData = response.data.data.user;
      user.value = userData;
      localStorage.setItem('arto_user', JSON.stringify(userData));
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Email atau password salah');
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      user.value = null;
      localStorage.removeItem('arto_user');
      window.location.href = '/login';
    }
  }

  return {
    user,
    isAuthenticated,
    cashierName,
    login,
    logout,
  };
});
