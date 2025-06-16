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

const SimpleLanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (language: string) => {
    // Apply directly to document
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
    
    // Store preference in localStorage
    localStorage.setItem('mediaIntelligence-language', language);
    
    // Change i18n language
    i18n.changeLanguage(language);
    
    console.log(`Language switched to ${language}`);
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
          onClick={() => changeLanguage('ar')}
          disabled={isRTL}
          className={isRTL ? "text-right" : ""}
        >
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage('en')}
          disabled={!isRTL}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SimpleLanguageSwitcher;