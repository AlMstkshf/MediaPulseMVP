/**
 * Script to update language files from the combined.json format
 * 
 * This script will take the flat key format from combined.json and convert
 * it to the nested object format used in our language files
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define file paths
const rootDir = path.join(__dirname, '..');
const combinedJsonPath = path.join(rootDir, 'attached_assets/combined.json');
const enTranslationsPath = path.join(rootDir, 'client/src/lib/i18n/locales/en.ts');
const arTranslationsPath = path.join(rootDir, 'client/src/lib/i18n/locales/ar.ts');

// Backup the original files
const enBackupPath = `${enTranslationsPath}.update-backup`;
const arBackupPath = `${arTranslationsPath}.update-backup`;

// Function to convert flat keys to nested objects
function flatToNested(flatTranslations: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in flatTranslations) {
    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    if (typeof flatTranslations[key] === 'object' && 'en' in flatTranslations[key] && 'ar' in flatTranslations[key]) {
      // Handle the combined.json format structure
      continue;
    } else {
      current[lastPart] = flatTranslations[key];
    }
  }

  return result;
}

// Function to extract translations by language from the combined format
function extractLanguageFromCombined(combinedJson: Record<string, any>, lang: 'en' | 'ar'): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in combinedJson) {
    if (combinedJson[key] && typeof combinedJson[key] === 'object' && lang in combinedJson[key]) {
      const value = combinedJson[key][lang];
      // Skip empty strings
      if (value !== '') {
        result[key] = value;
      }
    }
  }

  return result;
}

// Function to manually parse a translation file using a more direct approach
function readLanguageFile(filePath: string): { content: string, translations: Record<string, any> } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Since we're working with TypeScript files that export objects, let's use a simple approach:
    // 1. Remove the export statement and comments
    // 2. Extract just the object content between the brackets

    // Find the first occurrence of 'export const' or 'const'
    const startMatch = content.match(/(?:export\s+)?const\s+\w+Translations\s*=\s*\{/);
    if (!startMatch) {
      throw new Error(`Could not find translations object declaration in ${filePath}`);
    }
    
    const startIndex = startMatch.index! + startMatch[0].length - 1; // Position of the opening brace
    
    // Find the matching closing brace by counting braces
    let braceCount = 1;
    let endIndex = startIndex + 1;
    
    while (braceCount > 0 && endIndex < content.length) {
      const char = content[endIndex];
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      endIndex++;
    }
    
    if (braceCount !== 0) {
      throw new Error(`Unbalanced braces in translations file ${filePath}`);
    }
    
    // Get the object content, including both braces
    const objectText = content.substring(startIndex, endIndex);
    
    // Use a safer approach to evaluate the JSON - first try to clean the code
    // Remove comments and clean up the string to make it valid JSON
    let cleanedText = objectText
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/,(\s*\})/g, '$1'); // Remove trailing commas
      
    // Parse the cleaned object text
    try {
      // Try to sanitize and parse as JSON first (safer)
      const jsonText = cleanedText
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure keys are quoted
        .replace(/'/g, '"'); // Replace single quotes with double quotes for JSON
        
      return {
        content,
        translations: JSON.parse(jsonText)
      };
    } catch (jsonError) {
      console.warn(`Failed to parse as JSON, falling back to Function constructor: ${jsonError.message}`);
      
      // Fallback: Use Function constructor (less safe but more flexible)
      const translationsCode = `return ${cleanedText}`;
      const translations = new Function(translationsCode)();
      
      return {
        content,
        translations
      };
    }
  } catch (error) {
    console.error(`Error parsing language file ${filePath}:`, error);
    throw error;
  }
}

// Deep merge function that preserves arrays
function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}

// Main function to update translations
async function updateTranslationsFromCombined() {
  try {
    console.log('Reading combined.json file...');
    const combinedJsonRaw = fs.readFileSync(combinedJsonPath, 'utf8');
    const combinedJson = JSON.parse(combinedJsonRaw);

    // Extract separate language data from combined.json
    console.log('Extracting language data...');
    const enFlatData = extractLanguageFromCombined(combinedJson, 'en');
    const arFlatData = extractLanguageFromCombined(combinedJson, 'ar');

    // Convert flat keys to nested objects
    console.log('Converting to nested structure...');
    const enNestedData = flatToNested(enFlatData);
    const arNestedData = flatToNested(arFlatData);

    // Read existing language files
    console.log('Reading existing language files...');
    const { content: enContent, translations: enTranslations } = readLanguageFile(enTranslationsPath);
    const { content: arContent, translations: arTranslations } = readLanguageFile(arTranslationsPath);

    // Create backups
    console.log('Creating backups of current language files...');
    fs.writeFileSync(enBackupPath, enContent);
    fs.writeFileSync(arBackupPath, arContent);

    // Merge translations
    console.log('Merging translations...');
    const mergedEnTranslations = deepMerge(enTranslations, enNestedData);
    const mergedArTranslations = deepMerge(arTranslations, arNestedData);

    // Write updated content
    console.log('Writing updated language files...');
    const newEnContent = enContent.replace(
      /const enTranslations = ({[\s\S]*?});/,
      `const enTranslations = ${JSON.stringify(mergedEnTranslations, null, 2)};`
    );
    const newArContent = arContent.replace(
      /const arTranslations = ({[\s\S]*?});/,
      `const arTranslations = ${JSON.stringify(mergedArTranslations, null, 2)};`
    );

    fs.writeFileSync(enTranslationsPath, newEnContent);
    fs.writeFileSync(arTranslationsPath, newArContent);

    // Generate summary
    const enKeysCount = Object.keys(enFlatData).length;
    const arKeysCount = Object.keys(arFlatData).length;

    console.log('\nUpdate Summary:');
    console.log('--------------');
    console.log(`English translations updated: ${enKeysCount} keys`);
    console.log(`Arabic translations updated: ${arKeysCount} keys`);
    console.log('\nBackups created:');
    console.log(`- ${enBackupPath}`);
    console.log(`- ${arBackupPath}`);
    console.log('\nLanguage files have been successfully updated!');

  } catch (error) {
    console.error('Error updating translations:', error);
    process.exit(1);
  }
}

// Run the update function
updateTranslationsFromCombined();