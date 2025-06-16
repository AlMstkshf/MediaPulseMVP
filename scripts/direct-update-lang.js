// A direct, simpler approach to update language files using Node.js built-in modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define file paths
const combinedJsonPath = path.join(__dirname, '../attached_assets/combined.json');
const enTranslationsPath = path.join(__dirname, '../client/src/lib/i18n/locales/en.ts');
const arTranslationsPath = path.join(__dirname, '../client/src/lib/i18n/locales/ar.ts');

// Create backup copies
fs.copyFileSync(enTranslationsPath, `${enTranslationsPath}.backup-${Date.now()}`);
fs.copyFileSync(arTranslationsPath, `${arTranslationsPath}.backup-${Date.now()}`);

console.log('Backups created successfully');

// Read the combined.json file
const combinedJson = JSON.parse(fs.readFileSync(combinedJsonPath, 'utf8'));

// Function to convert flat keys (with dots) to nested structure
function flatToNested(obj) {
  const result = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const parts = key.split('.');
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      current[parts[parts.length - 1]] = value;
    }
  }
  
  return result;
}

// Extract English and Arabic translations
const enTranslations = {};
const arTranslations = {};

for (const key in combinedJson) {
  if (combinedJson[key] && combinedJson[key].en) {
    enTranslations[key] = combinedJson[key].en;
  }
  if (combinedJson[key] && combinedJson[key].ar) {
    arTranslations[key] = combinedJson[key].ar;
  }
}

// Convert to nested structure
const nestedEn = flatToNested(enTranslations);
const nestedAr = flatToNested(arTranslations);

// Read existing files
const existingEnContent = fs.readFileSync(enTranslationsPath, 'utf8');
const existingArContent = fs.readFileSync(arTranslationsPath, 'utf8');

// Create new content by replacing the translations object
const newEnContent = existingEnContent.replace(
  /(export const enTranslations =\s*)([\s\S]*?)(;)/,
  `$1${JSON.stringify(nestedEn, null, 2)}$3`
);

const newArContent = existingArContent.replace(
  /(export const arTranslations =\s*)([\s\S]*?)(;)/,
  `$1${JSON.stringify(nestedAr, null, 2)}$3`
);

// Write the updated files
fs.writeFileSync(enTranslationsPath, newEnContent);
fs.writeFileSync(arTranslationsPath, newArContent);

console.log('English translations updated with', Object.keys(enTranslations).length, 'keys');
console.log('Arabic translations updated with', Object.keys(arTranslations).length, 'keys');
console.log('Language files updated successfully!');