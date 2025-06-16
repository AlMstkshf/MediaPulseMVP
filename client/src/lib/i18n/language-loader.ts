import i18n from 'i18next';
import { supportedLanguages, Language } from './language-registry';
import enTranslations from './locales/en';
import arTranslations from './locales/ar';

// Debug the loaded translations for validation
console.log('Loaded translation modules:');
console.log('- English translations keys:', Object.keys(enTranslations).length > 0 ? 'Available' : 'Empty');
console.log('- Arabic translations keys:', Object.keys(arTranslations).length > 0 ? 'Available' : 'Empty');

// Built-in translations
const builtInTranslations: Record<string, any> = {
  en: enTranslations,
  ar: arTranslations
};

// Additional dynamically loaded translations
let dynamicTranslations: Record<string, any> = {};

/**
 * Updates translations for a specific language
 * @param langCode Language code
 * @param translations Translation object
 */
export function updateTranslations(langCode: string, translations: Record<string, any>): void {
  // Update the stored translations
  dynamicTranslations[langCode] = translations;
  
  // If the language is already loaded in i18n, update it
  if (i18n.hasResourceBundle(langCode, 'translation')) {
    i18n.addResourceBundle(langCode, 'translation', translations, true, true);
  }
}

/**
 * Load a language that was not included at build time
 * @param language The language configuration object
 * @param translations The translations object
 */
export async function loadLanguage(language: Language, translations: Record<string, any>): Promise<void> {
  const { code } = language;
  
  // Store the translations
  dynamicTranslations[code] = translations;
  
  // Add the resource bundle to i18next
  i18n.addResourceBundle(code, 'translation', translations, true, true);
  
  console.log(`Language ${code} loaded successfully`);
}

/**
 * Get all available translations for a language
 * @param langCode The language code
 * @returns The combined translations (built-in + dynamic)
 */
export function getTranslations(langCode: string): Record<string, any> {
  const builtIn = builtInTranslations[langCode] || {};
  const dynamic = dynamicTranslations[langCode] || {};
  
  // Merge built-in and dynamic translations, with dynamic taking precedence
  return { ...builtIn, ...dynamic };
}

/**
 * Initialize i18n with all available languages (built-in + dynamic)
 */
export function initializeTranslations(): Record<string, any> {
  const resources: Record<string, any> = {};
  
  // Add all supported languages to the resources
  supportedLanguages.forEach(lang => {
    if (lang.isActive) {
      try {
        const translations = getTranslations(lang.code);
        
        // Debug output to verify translations are loaded
        const translationCount = countKeys(translations);
        console.log(`Loaded ${translationCount} translations for ${lang.code}`);
        
        if (translationCount === 0) {
          console.error(`No translations found for ${lang.code}. Using fallback.`);
          // Force load from built-in translations as fallback
          const fallbackTranslations = lang.code === 'ar' ? arTranslations : 
                                     lang.code === 'en' ? enTranslations : {};
          resources[lang.code] = { translation: fallbackTranslations };
        } else {
          resources[lang.code] = { translation: translations };
        }
      } catch (error) {
        console.error(`Error loading translations for ${lang.code}:`, error);
        // Force load from built-in translations as fallback
        const fallbackTranslations = lang.code === 'ar' ? arTranslations : 
                                   lang.code === 'en' ? enTranslations : {};
        resources[lang.code] = { translation: fallbackTranslations };
      }
    }
  });
  
  return resources;
}

/**
 * Calculate language translation completeness compared to English
 * @param langCode The language code to check
 * @returns A number from 0-100 representing the percentage of completeness
 */
export function calculateCompleteness(langCode: string): number {
  if (langCode === 'en') return 100; // English is our baseline
  
  const englishTranslations = getTranslations('en');
  const targetTranslations = getTranslations(langCode);
  
  // Count the number of keys in English
  const englishKeyCount = countKeys(englishTranslations);
  
  // Count the number of keys in the target language
  const targetKeyCount = countKeys(targetTranslations);
  
  // Calculate completeness
  return Math.round((targetKeyCount / englishKeyCount) * 100);
}

/**
 * Helper function to recursively count all keys in a translation object
 */
function countKeys(obj: any, prefix = ''): number {
  let count = 0;
  
  for (const key in obj) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively count keys in nested objects
      count += countKeys(obj[key], currentKey);
    } else {
      // Count leaf values
      count++;
    }
  }
  
  return count;
}

export default {
  updateTranslations,
  loadLanguage,
  getTranslations,
  initializeTranslations,
  calculateCompleteness
};