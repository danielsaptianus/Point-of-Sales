import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { i18n } from '@/i18n';

export const useAppStore = defineStore('app', () => {
  // State
  const theme = ref<'light' | 'dark'>(
    (localStorage.getItem('app-theme') as 'light' | 'dark') || 'light'
  );
  
  const locale = ref<'en' | 'id'>(
    (localStorage.getItem('app-locale') as 'en' | 'id') || 'en'
  );

  // Actions
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme;
  };

  const setLocale = (newLocale: 'en' | 'id') => {
    locale.value = newLocale;
    // @ts-ignore
    i18n.global.locale.value = newLocale;
  };

  // Watchers for persistence and DOM updates
  watch(theme, (newTheme) => {
    localStorage.setItem('app-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, { immediate: true });

  watch(locale, (newLocale) => {
    localStorage.setItem('app-locale', newLocale);
    // @ts-ignore
    i18n.global.locale.value = newLocale;
  }, { immediate: true });

  return {
    theme,
    locale,
    toggleTheme,
    setTheme,
    setLocale,
  };
});
