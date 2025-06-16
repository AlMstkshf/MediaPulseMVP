import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface EnsureDashboardTranslationsProps {
  children: React.ReactNode;
}

/**
 * Component that ensures dashboard translations are loaded in both languages
 * This is particularly important for fallback behavior
 */
const EnsureDashboardTranslations: React.FC<EnsureDashboardTranslationsProps> = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Ensure both English and Arabic translations are loaded
    const loadAllLanguages = async () => {
      try {
        console.log('Loading translations for en and ar...');
        
        // Check current loaded namespaces
        const currentlyLoadedAr = i18n.hasResourceBundle('ar', 'translation');
        const currentlyLoadedEn = i18n.hasResourceBundle('en', 'translation');
        
        console.log(`Currently loaded languages - AR: ${currentlyLoadedAr}, EN: ${currentlyLoadedEn}`);
        
        // Force loading of English translations first if not already loaded
        if (!currentlyLoadedEn) {
          await i18n.loadLanguages('en');
        }
        
        // Then force loading of Arabic translations if not already loaded
        if (!currentlyLoadedAr) {
          await i18n.loadLanguages('ar');
        }
        
        console.log('All translations loaded successfully');
      } catch (error) {
        console.error('Error ensuring dashboard translations:', error);
      }
    };

    loadAllLanguages();
  }, [i18n]);

  return <>{children}</>;
};

export default EnsureDashboardTranslations;