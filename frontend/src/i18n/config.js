/**
 * Configuración de i18next para multi-idioma
 * Soporta Español e Inglés con detección automática
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Importar traducciones
import translationES from './locales/es.json';
import translationEN from './locales/en.json';

const resources = {
  es: {
    translation: translationES
  },
  en: {
    translation: translationEN
  }
};

i18n
  // Detectar idioma del navegador
  .use(LanguageDetector)
  // Backend para cargar traducciones
  .use(Backend)
  // Pasar instancia de i18n a react-i18next
  .use(initReactI18next)
  // Inicializar i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto
    supportedLngs: ['es', 'en'], // Idiomas soportados
    
    // Opciones de detección
    detection: {
      // Orden de detección
      order: [
        'localStorage',      // 1. Preferencia guardada
        'navigator',         // 2. Idioma del navegador
        'htmlTag',          // 3. HTML lang attribute
        'path',             // 4. URL path
        'subdomain'         // 5. Subdomain
      ],
      caches: ['localStorage'], // Guardar en localStorage
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },

    interpolation: {
      escapeValue: false // React ya escapa por defecto
    },

    // Debugging
    debug: process.env.NODE_ENV === 'development',

    // React options
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
    }
  });

export default i18n;
