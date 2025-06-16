import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Simple language switcher specifically designed for Arabic/English
 * This component takes a direct approach to language switching
 */
const SimpleArabicEnglishSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const switchToArabic = () => {
    // Apply directly to document
    document.documentElement.dir = 'rtl';
    document.body.dir = 'rtl';
    document.documentElement.lang = 'ar';
    document.documentElement.classList.add('rtl-lang');
    document.body.classList.add('rtl');
    
    // Store preference in localStorage
    localStorage.setItem('mediaIntelligence-language', 'ar');
    
    // Change i18n language last
    i18n.changeLanguage('ar');
    
    // Force reload the page to ensure all components update
    window.location.reload();
  };
  
  const switchToEnglish = () => {
    // Apply directly to document
    document.documentElement.dir = 'ltr';
    document.body.dir = 'ltr';
    document.documentElement.lang = 'en';
    document.documentElement.classList.remove('rtl-lang');
    document.body.classList.remove('rtl');
    
    // Store preference in localStorage
    localStorage.setItem('mediaIntelligence-language', 'en');
    
    // Change i18n language last
    i18n.changeLanguage('en');
    
    // No need to force reload for English
  };
  
  const isRTL = i18n.language === 'ar';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2 gap-1">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline mx-1">
            {isRTL ? 'العربية' : 'English'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={switchToArabic}
          disabled={isRTL}
          className={isRTL ? "text-right" : ""}
        >
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={switchToEnglish}
          disabled={!isRTL}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SimpleArabicEnglishSwitcher;