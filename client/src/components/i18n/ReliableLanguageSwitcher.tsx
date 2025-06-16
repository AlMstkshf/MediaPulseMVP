import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import i18next from 'i18next';

// Import direct translation fix to ensure all translations are available
import DirectTranslationFix from './DirectTranslationFix';

const ReliableLanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  
  // Apply RTL styling on component mount based on current language
  useEffect(() => {
    const applyRTLStyling = (language: string) => {
      if (language === 'ar') {
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
    };
    
    // Apply RTL styling based on current language
    applyRTLStyling(currentLanguage);
    
    // Set up language change listener
    const handleLanguageChanged = (lng: string) => {
      console.log(`Language changed to: ${lng}`);
      setCurrentLanguage(lng);
      applyRTLStyling(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);
  
  const changeLanguage = (language: string) => {
    // Apply direct translation fix first
    if (language === 'ar') {
      // First check if we have Arabic resource bundle
      if (!i18next.hasResourceBundle('ar', 'translation')) {
        // Create empty bundle if it doesn't exist
        i18next.addResourceBundle('ar', 'translation', {}, true, true);
      }
    }
    
    // Set preference in localStorage
    localStorage.setItem('mediaIntelligence-language', language);
    
    // Change language
    i18n.changeLanguage(language);
    
    // Update state
    setCurrentLanguage(language);
    
    console.log(`Language switched to ${language}`);
  };
  
  return (
    <>
      {/* Include DirectTranslationFix component to ensure translations are available */}
      <DirectTranslationFix />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-2 gap-1">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline mx-1">
              {currentLanguage === 'ar' ? 'العربية' : 'English'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => changeLanguage('en')}
            disabled={currentLanguage === 'en'}
          >
            English
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => changeLanguage('ar')}
            disabled={currentLanguage === 'ar'}
            className={currentLanguage === 'ar' ? "text-right" : ""}
          >
            العربية
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ReliableLanguageSwitcher;