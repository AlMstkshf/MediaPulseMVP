import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Paths
const NEW_EN_PATH = path.join(rootDir, 'attached_assets/new_en.ts');
const NEW_AR_PATH = path.join(rootDir, 'attached_assets/new_ar.ts');
const ORIG_EN_PATH = path.join(rootDir, 'client/src/lib/i18n/locales/en.ts.bak');
const ORIG_AR_PATH = path.join(rootDir, 'client/src/lib/i18n/locales/ar.ts.bak');
const DEST_EN_PATH = path.join(rootDir, 'client/src/lib/i18n/locales/en.ts');
const DEST_AR_PATH = path.join(rootDir, 'client/src/lib/i18n/locales/ar.ts');

// Read file and extract translations object
function extractTranslations(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/const \w+Translations = ({[\s\S]*?});/);
  if (!match) {
    throw new Error(`Could not extract translations from ${filePath}`);
  }
  return match[1];
}

// Extract file header (everything before the translations object)
function extractHeader(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/([\s\S]*?)const \w+Translations =/);
  if (!match) {
    throw new Error(`Could not extract header from ${filePath}`);
  }
  return match[1];
}

// Extract file footer (everything after the translations object)
function extractFooter(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/};([\s\S]*?)$/);
  if (!match) {
    return '\n\nexport default enTranslations;\n';
  }
  return match[1];
}

// Main function to merge translations
function mergeTranslations() {
  try {
    // Extract original translations and new translations
    const origEnTransStr = extractTranslations(ORIG_EN_PATH);
    const origArTransStr = extractTranslations(ORIG_AR_PATH);
    const newEnTransStr = extractTranslations(NEW_EN_PATH);
    const newArTransStr = extractTranslations(NEW_AR_PATH);
    
    // Get file headers and footers
    const enHeader = extractHeader(ORIG_EN_PATH);
    const arHeader = extractHeader(ORIG_AR_PATH);
    const enFooter = extractFooter(ORIG_EN_PATH);
    const arFooter = extractFooter(ORIG_AR_PATH);
    
    // Parse the translation strings to objects
    const parseTranslationObject = (str: string): any => {
      try {
        // Remove comments and format JSON properly
        const jsonStr = str
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
          .replace(/\/\/.*$/gm, '')         // Remove // comments
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure keys are quoted
          .replace(/,(\s*[\]}])/g, '$1');    // Remove trailing commas
        
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Error parsing translation object:", e);
        return {};
      }
    };
    
    // Parse the translation objects
    const origEn = parseTranslationObject(origEnTransStr);
    const origAr = parseTranslationObject(origArTransStr);
    const newEn = parseTranslationObject(newEnTransStr);
    const newAr = parseTranslationObject(newArTransStr);
    
    // Merge translations
    const mergedEn = deepMerge(origEn, newEn);
    const mergedAr = deepMerge(origAr, newAr);
    
    // Write merged files
    fs.writeFileSync(DEST_EN_PATH, `${enHeader}const enTranslations = ${JSON.stringify(mergedEn, null, 2)};${enFooter}`);
    fs.writeFileSync(DEST_AR_PATH, `${arHeader}const arTranslations = ${JSON.stringify(mergedAr, null, 2)};${arFooter}`);
    
    // No temp files to clean up
    
    // Generate report
    const enKeysAdded = countKeysAdded(origEn, mergedEn);
    const arKeysAdded = countKeysAdded(origAr, mergedAr);
    const origEnKeyCount = countKeys(origEn);
    const origArKeyCount = countKeys(origAr);
    const mergedEnKeyCount = countKeys(mergedEn);
    const mergedArKeyCount = countKeys(mergedAr);
    
    console.log("\nTranslation Merge Report");
    console.log("=======================\n");
    
    console.log("English Translations:");
    console.log(`- Original key count: ${origEnKeyCount}`);
    console.log(`- New key count: ${countKeys(newEn)}`);
    console.log(`- Merged key count: ${mergedEnKeyCount}`);
    console.log(`- Keys added: ${enKeysAdded}\n`);
    
    console.log("Arabic Translations:");
    console.log(`- Original key count: ${origArKeyCount}`);
    console.log(`- New key count: ${countKeys(newAr)}`);
    console.log(`- Merged key count: ${mergedArKeyCount}`);
    console.log(`- Keys added: ${arKeysAdded}\n`);
    
    console.log("Translation files have been successfully merged!");
    
  } catch (error) {
    console.error("Error merging translations:", error);
  }
}

// Deep merge two objects (prioritizing the second object)
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (typeof source !== 'object' || source === null) {
    return source;
  }
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        // If the key exists in target and is also an object, merge recursively
        if (key in target && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          output[key] = deepMerge(target[key], source[key]);
        } else {
          // Otherwise just assign the source value
          output[key] = source[key];
        }
      } else {
        // For non-objects, assign the source value
        output[key] = source[key];
      }
    }
  }
  
  return output;
}

// Count all keys in an object
function countKeys(obj: any): number {
  let count = 0;
  
  if (typeof obj !== 'object' || obj === null) {
    return 0;
  }
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        count += countKeys(obj[key]);
      } else {
        count++;
      }
    }
  }
  
  return count;
}

// Count keys added in merged object that weren't in original
function countKeysAdded(original: any, merged: any): number {
  const originalKeyCount = countKeys(original);
  const mergedKeyCount = countKeys(merged);
  return mergedKeyCount - originalKeyCount;
}

// Run the merge
mergeTranslations();