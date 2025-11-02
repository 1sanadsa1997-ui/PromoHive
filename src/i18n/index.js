import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import arTranslations from './locales/ar.json'
import enTranslations from './locales/en.json'
import trTranslations from './locales/tr.json'

const resources = {
  ar: {
    translation: arTranslations
  },
  en: {
    translation: enTranslations
  },
  tr: {
    translation: trTranslations
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    
    react: {
      useSuspense: false
    }
  })

export default i18n
