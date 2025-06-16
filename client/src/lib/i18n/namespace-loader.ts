import i18n from 'i18next';
import { getTranslations } from './language-loader';

/**
 * Load a specific translation namespace for a given language
 * @param namespace The namespace to load
 * @param langCode The language code to load the namespace for
 */
export function loadNamespace(namespace: string, langCode: string): void {
  try {
    // Check if the namespace is already loaded
    if (i18n.hasResourceBundle(langCode, namespace)) {
      console.log(`Namespace ${namespace} already loaded for ${langCode}`);
      return;
    }
    
    // Get all translations for the language
    const allTranslations = getTranslations(langCode);
    
    // Extract only the namespace portion
    if (allTranslations && allTranslations[namespace]) {
      console.log(`Loading namespace ${namespace} for ${langCode}`);
      i18n.addResourceBundle(langCode, namespace, allTranslations[namespace], true, true);
    } else {
      console.warn(`Namespace ${namespace} not found for ${langCode}`);
    }
  } catch (error) {
    console.error(`Error loading namespace ${namespace} for ${langCode}:`, error);
  }
}

/**
 * Ensure a specific section of translations exists for all languages
 * Use this to make sure important namespaces are available when needed
 * @param namespaces Array of namespaces to ensure are loaded
 */
export function ensureNamespaces(namespaces: string[]): void {
  const languages = i18n.languages;
  
  languages.forEach(langCode => {
    namespaces.forEach(namespace => {
      loadNamespace(namespace, langCode);
    });
  });
}

/**
 * Forces a translation key to be available with a given value
 * Use this as a last resort for critical messages that must be available
 * @param langCode Language code
 * @param key The full translation key (e.g., "dashboard.widgets.title")
 * @param value The translation value
 */
export function forceTranslation(langCode: string, key: string, value: string): void {
  try {
    // Split the key into namespace and actual key
    const parts = key.split('.');
    if (parts.length < 2) {
      console.error('Invalid translation key format. Must be namespace.key');
      return;
    }
    
    const namespace = parts[0];
    const actualKey = parts.slice(1).join('.');
    
    // Make sure the namespace exists
    if (!i18n.hasResourceBundle(langCode, namespace)) {
      i18n.addResourceBundle(langCode, namespace, {}, true, true);
    }
    
    // Add the translation 
    i18n.addResource(langCode, namespace, actualKey, value);
    
    console.log(`Force-added translation for ${key} in ${langCode}`);
  } catch (error) {
    console.error(`Error forcing translation for ${key} in ${langCode}:`, error);
  }
}

export default {
  loadNamespace,
  ensureNamespaces,
  forceTranslation
};