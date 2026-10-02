import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import gu from './locales/gu.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  gu: { translation: gu },
};

// Auto-detect saved language or default to English
const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('queuesmart_lang') || 'en' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export const changeLanguage = (lng: 'en' | 'hi' | 'gu') => {
  i18n.changeLanguage(lng);
  if (typeof window !== 'undefined') {
    localStorage.setItem('queuesmart_lang', lng);
  }
};

export default i18n;
