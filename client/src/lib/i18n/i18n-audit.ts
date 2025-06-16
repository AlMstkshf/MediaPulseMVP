import { enTranslations } from './locales/en';
import { arTranslations } from './locales/ar';

/**
 * Performs a deep count of all translation keys in an object
 * @param obj - The translation object to count keys in
 * @returns The total number of keys
 */
export function countKeys(obj: Record<string, any>): number {
  let count = 0;
  
  for (const key in obj) {
    count++;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key]) - 1; // Subtract 1 to not double count the parent key
    }
  }
  
  return count;
}

/**
 * Calculates the completeness of a translation compared to English
 * @param locale The locale to check ('en' or 'ar')
 * @returns The percentage of completeness (0-100)
 */
export function calculateCompleteness(locale: string): number {
  if (locale === 'en') return 100;
  
  const englishKeyCount = countKeys(enTranslations);
  const targetKeyCount = locale === 'ar' ? countKeys(arTranslations) : 0;
  
  return Math.round((targetKeyCount / englishKeyCount) * 100);
}

/**
 * Finds missing keys in a target translation compared to English
 * @param targetTranslations The translation object to check
 * @param prefix Optional prefix for nested keys
 * @returns Array of missing key paths
 */
export function findMissingKeys(
  targetTranslations: Record<string, any>, 
  prefix = ''
): string[] {
  const missingKeys: string[] = [];
  
  function traverse(source: Record<string, any>, target: Record<string, any>, path: string) {
    for (const key in source) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in target)) {
        missingKeys.push(currentPath);
      } else if (typeof source[key] === 'object' && source[key] !== null) {
        if (typeof target[key] !== 'object' || target[key] === null) {
          missingKeys.push(`${currentPath} (not an object)`);
        } else {
          traverse(source[key], target[key], currentPath);
        }
      }
    }
  }
  
  traverse(enTranslations, targetTranslations, prefix);
  return missingKeys;
}

/**
 * Generate a full i18n audit report
 * @returns An object containing audit results
 */
export function generateI18nAuditReport() {
  const arMissingKeys = findMissingKeys(arTranslations);
  
  return {
    englishKeyCount: countKeys(enTranslations),
    arabicKeyCount: countKeys(arTranslations),
    arabicCompleteness: calculateCompleteness('ar'),
    arabicMissingKeys: arMissingKeys,
    arabicMissingKeyCount: arMissingKeys.length
  };
}

/**
 * Verify that interpolation variables are consistent between translations
 * This helps catch issues like {{count}} in English vs {count} in Arabic
 * @returns Array of inconsistent interpolation patterns
 */
export function findInterpolationInconsistencies(): { key: string, enPattern: string, arPattern: string }[] {
  const inconsistencies: { key: string, enPattern: string, arPattern: string }[] = [];
  const interpolationRegex = /\{\{([^}]+)\}\}/g;
  
  function checkString(enString: string, arString: string, path: string) {
    // Extract interpolation variables from English string
    const enMatches = [...enString.matchAll(interpolationRegex)].map(m => m[1]);
    
    // Check if the Arabic string has the same variables
    for (const variable of enMatches) {
      if (!arString.includes(`{{${variable}}}`)) {
        inconsistencies.push({
          key: path,
          enPattern: `{{${variable}}}`,
          arPattern: arString.match(/\{\{([^}]+)\}\}/g)?.find(p => p.includes(variable)) || 'missing'
        });
      }
    }
  }
  
  function traverse(enObj: Record<string, any>, arObj: Record<string, any>, path: string) {
    for (const key in enObj) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof enObj[key] === 'string' && typeof arObj[key] === 'string') {
        checkString(enObj[key], arObj[key], currentPath);
      } else if (typeof enObj[key] === 'object' && enObj[key] !== null && 
                 typeof arObj[key] === 'object' && arObj[key] !== null) {
        traverse(enObj[key], arObj[key], currentPath);
      }
    }
  }
  
  traverse(enTranslations, arTranslations, '');
  return inconsistencies;
}