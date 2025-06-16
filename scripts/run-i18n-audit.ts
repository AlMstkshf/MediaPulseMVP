import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the new translation files from attached assets
const rootDir = path.join(__dirname, '..');
const newEnTranslationsPath = path.join(rootDir, 'attached_assets/new_en.ts');
const newArTranslationsPath = path.join(rootDir, 'attached_assets/new_ar.ts');

// Check if translation files exist
function loadTranslationModule(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`Translation file not found: ${filePath}`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Extract the translations object using regex
    const match = content.match(/const \w+Translations = ({[\s\S]*?});/);
    if (match && match[1]) {
      // Create a proper JSON string by handling JavaScript comments and trailing commas
      let jsonStr = match[1]
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        // Handle property names without quotes
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        // Remove trailing commas in objects and arrays
        .replace(/,(\s*[\]}])/g, '$1');
      
      return JSON.parse(jsonStr);
    }
    throw new Error('Could not extract translations object from file');
  } catch (error) {
    console.error(`Error parsing translation file ${filePath}:`, error);
    return null;
  }
}

// Deep merge two objects
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        // If property exists in target and is an object, merge recursively
        if (key in target && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          // Otherwise just assign the source value
          output[key] = source[key];
        }
      } else {
        // For non-object values, only add if key doesn't exist in target
        if (!(key in target)) {
          output[key] = source[key];
        }
      }
    }
  }
  
  return output;
}

// Update translation files
function updateTranslationFiles() {
  // Load new translations
  const newEnTranslations = loadTranslationModule(newEnTranslationsPath);
  const newArTranslations = loadTranslationModule(newArTranslationsPath);
  
  if (!newEnTranslations || !newArTranslations) {
    console.error('Failed to load new translations. Aborting.');
    return;
  }
  
  // Define paths for existing translation files
  const existingEnPath = path.join(rootDir, 'client/src/lib/i18n/locales/en.ts');
  const existingArPath = path.join(rootDir, 'client/src/lib/i18n/locales/ar.ts');
  
  // Load existing translations
  const existingEnContent = fs.readFileSync(existingEnPath, 'utf-8');
  const existingArContent = fs.readFileSync(existingArPath, 'utf-8');
  
  // Extract existing translations using regex
  const existingEnMatch = existingEnContent.match(/const enTranslations = ({[\s\S]*?});/);
  const existingArMatch = existingArContent.match(/const arTranslations = ({[\s\S]*?});/);
  
  if (!existingEnMatch || !existingArMatch) {
    console.error('Could not extract existing translations. Aborting.');
    return;
  }
  
  try {
    // Parse existing translations
    let enJsonStr = existingEnMatch[1]
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
      .replace(/,(\s*[\]}])/g, '$1');
    
    let arJsonStr = existingArMatch[1]
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
      .replace(/,(\s*[\]}])/g, '$1');
    
    const existingEn = JSON.parse(enJsonStr);
    const existingAr = JSON.parse(arJsonStr);
    
    // Merge translations (preserving existing keys)
    const mergedEn = deepMerge(existingEn, newEnTranslations);
    const mergedAr = deepMerge(existingAr, newArTranslations);
    
    // Generate new content
    const newEnContent = existingEnContent.replace(
      /const enTranslations = ({[\s\S]*?});/,
      `const enTranslations = ${JSON.stringify(mergedEn, null, 2)};`
    );
    
    const newArContent = existingArContent.replace(
      /const arTranslations = ({[\s\S]*?});/,
      `const arTranslations = ${JSON.stringify(mergedAr, null, 2)};`
    );
    
    // Write updated files
    fs.writeFileSync(existingEnPath, newEnContent);
    fs.writeFileSync(existingArPath, newArContent);
    
    console.log('Translation files updated successfully!');
    
    // Generate report
    generateReport(existingEn, mergedEn, existingAr, mergedAr);
    
  } catch (error) {
    console.error('Error updating translation files:', error);
  }
}

// Generate a report of added translation keys
function generateReport(oldEn: any, newEn: any, oldAr: any, newAr: any) {
  const report = {
    en: {
      keysAdded: findAddedKeys(oldEn, newEn),
      totalKeysBefore: countKeys(oldEn),
      totalKeysAfter: countKeys(newEn)
    },
    ar: {
      keysAdded: findAddedKeys(oldAr, newAr),
      totalKeysBefore: countKeys(oldAr),
      totalKeysAfter: countKeys(newAr)
    }
  };
  
  console.log('\nTranslation Update Report');
  console.log('=======================\n');
  
  console.log('English Translations:');
  console.log(`- Keys before update: ${report.en.totalKeysBefore}`);
  console.log(`- Keys after update: ${report.en.totalKeysAfter}`);
  console.log(`- New keys added: ${report.en.keysAdded.length}`);
  
  if (report.en.keysAdded.length > 0) {
    console.log('\nAdded English keys:');
    report.en.keysAdded.forEach(key => console.log(`- ${key}`));
  }
  
  console.log('\nArabic Translations:');
  console.log(`- Keys before update: ${report.ar.totalKeysBefore}`);
  console.log(`- Keys after update: ${report.ar.totalKeysAfter}`);
  console.log(`- New keys added: ${report.ar.keysAdded.length}`);
  
  if (report.ar.keysAdded.length > 0) {
    console.log('\nAdded Arabic keys:');
    report.ar.keysAdded.forEach(key => console.log(`- ${key}`));
  }
  
  // Write report to file
  fs.writeFileSync(
    path.join(rootDir, 'i18n-update-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\nDetailed report saved to i18n-update-report.json');
}

// Find added keys between old and new translations
function findAddedKeys(oldTranslations: any, newTranslations: any, prefix = ''): string[] {
  const addedKeys: string[] = [];
  
  for (const key in newTranslations) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    
    if (!(key in oldTranslations)) {
      // Key doesn't exist in old translations
      addedKeys.push(currentKey);
    } else if (
      typeof newTranslations[key] === 'object' && 
      newTranslations[key] !== null &&
      typeof oldTranslations[key] === 'object' &&
      oldTranslations[key] !== null
    ) {
      // Recursively check nested objects
      const nestedAdded = findAddedKeys(oldTranslations[key], newTranslations[key], currentKey);
      addedKeys.push(...nestedAdded);
    }
  }
  
  return addedKeys;
}

// Count total number of leaf keys in a translation object
function countKeys(obj: any, prefix = ''): number {
  let count = 0;
  
  for (const key in obj) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Count nested keys
      count += countKeys(obj[key], currentKey);
    } else {
      // Count leaf keys
      count++;
    }
  }
  
  return count;
}

// Run the script
updateTranslationFiles();