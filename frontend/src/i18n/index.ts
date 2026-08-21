import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import id from './locales/id.json';

// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = typeof en;

export const i18n = createI18n<[MessageSchema], 'en' | 'id'>({
  legacy: false, // you must set `false`, to use Composition API
  locale: 'en', // default locale
  fallbackLocale: 'en',
  messages: {
    en,
    id,
  },
});
