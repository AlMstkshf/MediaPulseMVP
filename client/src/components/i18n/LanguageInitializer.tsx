import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Component that initializes the language direction and settings
 * based on the stored language preference or browser settings
 */
const LanguageInitializer: React.FC = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Try to get stored language preference from localStorage
    const storedLanguage = localStorage.getItem('mediaIntelligence-language');
    
    // If storedLanguage is null, use browser language or default to English
    const defaultLanguage = 
      storedLanguage || 
      (navigator.language.startsWith('ar') ? 'ar' : 'en');
    
    // Apply RTL styling if language is Arabic
    if (defaultLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.documentElement.classList.add('rtl-lang');
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.dir = 'ltr';
      document.documentElement.lang = 'en';
      document.documentElement.classList.remove('rtl-lang');
      document.body.classList.remove('rtl');
    }
    
    // Set the language in i18n (this may already be done by i18next-browser-languagedetector)
    if (i18n.language !== defaultLanguage) {
      console.log(`Initializing language to: ${defaultLanguage}`);
      i18n.changeLanguage(defaultLanguage);
    }
    
    // Log current language state for debugging
    console.log('Language Initializer:', {
      storedLanguage,
      browserLanguage: navigator.language,
      i18nLanguage: i18n.language,
      finalLanguage: defaultLanguage,
      documentDir: document.documentElement.dir,
      documentLang: document.documentElement.lang
    });
  }, [i18n]);

  return null; // This component doesn't render anything
};

export default LanguageInitializer;