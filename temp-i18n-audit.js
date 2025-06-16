// Temporary script to audit translations

// Import the translations
import { enTranslations } from './client/src/lib/i18n/locales/en.js';
import { arTranslations } from './client/src/lib/i18n/locales/ar.js';

/**
 * Performs a deep count of all translation keys in an object
 * @param obj - The translation object to count keys in
 * @returns The total number of keys
 */
function countKeys(obj) {
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
 */
function calculateCompleteness() {
  const englishKeyCount = countKeys(enTranslations);
  const arabicKeyCount = countKeys(arTranslations);
  
  return {
    englishKeyCount,
    arabicKeyCount,
    completeness: Math.round((arabicKeyCount / englishKeyCount) * 100)
  };
}

/**
 * Finds missing keys in a target translation compared to English
 */
function findMissingKeys(sourceObj, targetObj, prefix = '') {
  const missingKeys = [];
  
  function traverse(source, target, path) {
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
  
  traverse(sourceObj, targetObj, prefix);
  return missingKeys;
}

// Run the audit
const completeness = calculateCompleteness();
const arabicMissingKeys = findMissingKeys(enTranslations, arTranslations);
const englishMissingKeys = findMissingKeys(arTranslations, enTranslations);

console.log('===== Translation Audit Results =====');
console.log(`English key count: ${completeness.englishKeyCount}`);
console.log(`Arabic key count: ${completeness.arabicKeyCount}`);
console.log(`Arabic completeness: ${completeness.completeness}%`);
console.log(`\nMissing keys in Arabic (${arabicMissingKeys.length}):`);
if (arabicMissingKeys.length > 0) {
  arabicMissingKeys.slice(0, 20).forEach(key => console.log(` - ${key}`));
  if (arabicMissingKeys.length > 20) {
    console.log(`... and ${arabicMissingKeys.length - 20} more`);
  }
}

console.log(`\nMissing keys in English (${englishMissingKeys.length}):`);
if (englishMissingKeys.length > 0) {
  englishMissingKeys.slice(0, 20).forEach(key => console.log(` - ${key}`));
  if (englishMissingKeys.length > 20) {
    console.log(`... and ${englishMissingKeys.length - 20} more`);
  }
}

// Find pages with hardcoded fallback strings
console.log('\n===== Pages with Hardcoded Fallback Text =====');
console.log('These pages use hardcoded English text as fallback in t() function calls.');
console.log('They should be updated to use translation keys from the locale files instead.');
console.log('Affected pages:');
console.log('- client/src/pages/context-hints.tsx');
console.log('- client/src/pages/cookie-test.tsx');
console.log('- client/src/pages/dashboard.tsx');
console.log('- client/src/pages/dashboard-vertical.tsx');
console.log('- client/src/pages/dialog-demo.tsx');
console.log('- client/src/pages/entity-monitoring.tsx');
console.log('- client/src/pages/entity-test.tsx');
console.log('- client/src/pages/excellence-indicators.tsx');
console.log('- client/src/pages/legal/*.tsx');
console.log('- client/src/pages/media-center.tsx');
console.log('- client/src/pages/monitoring.tsx');
console.log('- client/src/pages/reporting.tsx');
console.log('- client/src/pages/reports-dashboard.tsx');
console.log('- client/src/pages/settings.tsx');
console.log('- client/src/pages/social-media.tsx');
console.log('- client/src/pages/support-ticket-detail.tsx');
console.log('- client/src/pages/tutorials.tsx');
console.log('- client/src/pages/users.tsx');

// Show example of the problem and solution
console.log('\n===== Example Problem and Solution =====');
console.log('Problem:');
console.log('  {t(\'entity.testPage\', \'Entity Monitoring Test Page\')}');
console.log('Solution:');
console.log('  {t(\'entity.testPage\')}');
console.log('  (And ensure "entity.testPage" exists in both en.ts and ar.ts language files)');