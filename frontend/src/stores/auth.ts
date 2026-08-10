import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { MOCK_USER } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(
    localStorage.getItem('arto_user')
      ? JSON.parse(localStorage.getItem('arto_user')!)
      : MOCK_USER
  );
  const token = ref<string | null>(localStorage.getItem('arto_token') || 'demo_jwt_token');

  const isAuthenticated = computed(() => !!user.value);
  const cashierName = computed(() => {
    if (!user.value) return 'Kasir Demo';
    if (user.value.employee) {
      return `${user.value.employee.first_name} ${user.value.employee.last_name}`;
    }
    return user.value.email;
  });

  async function login(email: string, _pass: string): Promise<boolean> {
    // In demo / integrated mode, save session
    const loggedUser: User = {
      ...MOCK_USER,
      email: email || MOCK_USER.email,
    };
    user.value = loggedUser;
    token.value = 'jwt_token_' + Date.now();
    localStorage.setItem('arto_user', JSON.stringify(loggedUser));
    localStorage.setItem('arto_token', token.value);
    return true;
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('arto_user');
    localStorage.removeItem('arto_token');
  }

  return {
    user,
    token,
    isAuthenticated,
    cashierName,
    login,
    logout,
  };
});
