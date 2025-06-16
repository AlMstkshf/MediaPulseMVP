import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { supportedLanguages, getDefaultLanguage } from './language-registry';
import { initializeTranslations, getTranslations } from './language-loader';

/**
 * Initialize the i18n system
 */
const LANGUAGE_STORAGE_KEY = 'mediaIntelligence-language';

const initializeI18n = () => {
  try {
    console.log("Initializing i18n...");
    
    // Get all supported language resources
    const resources = initializeTranslations();
    console.log("Available language resources:", Object.keys(resources));
    console.log("Arabic resources loaded:", resources.ar ? "Yes" : "No");
    
    // Check if a language preference is stored in localStorage
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
    let initialLanguage;
    
    if (storedLang) {
      // Use the stored language if it exists and is supported
      const isSupported = supportedLanguages.some(lang => lang.code === storedLang && lang.isActive);
      initialLanguage = isSupported ? storedLang : getDefaultLanguage().code;
      console.log(`Using stored language preference: ${initialLanguage}`);
    } else {
      // Otherwise use the default language
      initialLanguage = getDefaultLanguage().code;
      console.log(`Using default language: ${initialLanguage}`);
    }
    
    i18n.use(initReactI18next).init({
      resources: resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false // Not needed for React
      },
      react: {
        useSuspense: false // Prevents issues with Suspense
      }
    });
    
    // Set document direction based on language
    const language = supportedLanguages.find(lang => lang.code === initialLanguage);
    const isRTL = language?.isRTL || false;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = initialLanguage;
    
    console.log("i18n initialized successfully");
  } catch (error) {
    console.error("Failed to initialize i18n:", error);
  }
};

// Initialize i18n when this module is loaded
initializeI18n();

/**
 * Handle language change, updating document direction and persisting to localStorage
 * @param langCode The language code to change to
 */
export const changeLanguage = (langCode: string) => {
  console.log(`Attempting to change language to: ${langCode}`);
  
  const language = supportedLanguages.find(lang => lang.code === langCode);
  if (!language) {
    console.error(`Language ${langCode} not found in supported languages`);
    return;
  }
  
  // Check if translations for this language are available
  console.log(`Checking translations for ${langCode}...`);
  const hasLanguage = i18n.hasResourceBundle(langCode, 'translation');
  console.log(`i18n has resource bundle for ${langCode}: ${hasLanguage ? 'Yes' : 'No'}`);
  
  // Log the current translations object
  const currentTranslations = i18n.getResourceBundle(langCode, 'translation');
  console.log(`Current translations for ${langCode} loaded:`, currentTranslations ? 'Yes' : 'No');
  
  if (!hasLanguage || !currentTranslations) {
    console.warn(`Adding translations for ${langCode} from source...`);
    // Re-attempt to load translations
    const translations = getTranslations(langCode);
    if (translations) {
      i18n.addResourceBundle(langCode, 'translation', translations, true, true);
    }
  }
  
  // Change i18n language
  i18n.changeLanguage(langCode);
  
  // Update document direction
  document.documentElement.dir = language.isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = langCode;
  
  // Store the language preference in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
  }
  
  console.log(`Language changed to ${langCode} (${language.isRTL ? 'RTL' : 'LTR'})`);
  
  // Verify the change was successful
  console.log(`Current i18n language is now: ${i18n.language}`);
  console.log(`document.documentElement.dir is now: ${document.documentElement.dir}`);
};

export { supportedLanguages };
export default i18n;