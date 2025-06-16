export interface Language {
  code: string;
  name: {
    english: string;
    native: string;
  };
  isRTL: boolean;
  isActive: boolean;
  isDefault?: boolean;
  completeness?: number; // 0-100 percentage of translation completeness
}

// Registry of all supported languages
export const supportedLanguages: Language[] = [
  {
    code: 'en',
    name: {
      english: 'English',
      native: 'English'
    },
    isRTL: false,
    isActive: true,
    isDefault: true,
    completeness: 100
  },
  {
    code: 'ar',
    name: {
      english: 'Arabic',
      native: 'العربية'
    },
    isRTL: true,
    isActive: true,
    completeness: 100
  }
];

// Function to add a new language to the registry
export function addLanguage(language: Language): Language[] {
  // Check if language already exists
  const exists = supportedLanguages.find(lang => lang.code === language.code);
  if (exists) {
    throw new Error(`Language with code ${language.code} already exists`);
  }
  
  supportedLanguages.push(language);
  return [...supportedLanguages];
}

// Function to update a language in the registry
export function updateLanguage(code: string, updates: Partial<Language>): Language[] {
  const index = supportedLanguages.findIndex(lang => lang.code === code);
  if (index === -1) {
    throw new Error(`Language with code ${code} not found`);
  }
  
  supportedLanguages[index] = { ...supportedLanguages[index], ...updates };
  return [...supportedLanguages];
}

// Function to toggle language active status
export function toggleLanguageActive(code: string): Language[] {
  const index = supportedLanguages.findIndex(lang => lang.code === code);
  if (index === -1) {
    throw new Error(`Language with code ${code} not found`);
  }
  
  supportedLanguages[index].isActive = !supportedLanguages[index].isActive;
  return [...supportedLanguages];
}

// Function to set a language as default
export function setDefaultLanguage(code: string): Language[] {
  const langIndex = supportedLanguages.findIndex(lang => lang.code === code);
  if (langIndex === -1) {
    throw new Error(`Language with code ${code} not found`);
  }
  
  // Remove default flag from all languages
  supportedLanguages.forEach((lang, index) => {
    supportedLanguages[index].isDefault = false;
  });
  
  // Set new default
  supportedLanguages[langIndex].isDefault = true;
  
  return [...supportedLanguages];
}

// Helper to get active languages only
export function getActiveLanguages(): Language[] {
  return supportedLanguages.filter(lang => lang.isActive);
}

// Helper to get the default language
export function getDefaultLanguage(): Language {
  const defaultLang = supportedLanguages.find(lang => lang.isDefault);
  return defaultLang || supportedLanguages[0]; // Fallback to first language if no default is set
}

export default supportedLanguages;