import * as fs from 'fs';
import * as path from 'path';

// Set up paths
const rootDir = path.resolve('.');
const ATTACHED_EN_PATH = path.join(rootDir, 'attached_assets/en.ts');
const ATTACHED_AR_PATH = path.join(rootDir, 'attached_assets/ar.ts');
const TARGET_EN_PATH = path.join(rootDir, 'client/src/lib/i18n/locales/en.ts');
const TARGET_AR_PATH = path.join(rootDir, 'client/src/lib/i18n/locales/ar.ts');

// Helper function to deep merge objects
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

// Extract translations object from file
function extractTranslations(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // For files with export const enTranslations structure
    let match = content.match(/export const \w+Translations = ({[\s\S]*?});/);
    
    // If the above pattern doesn't match, try alternative (const enTranslations)
    if (!match) {
      match = content.match(/const \w+Translations = ({[\s\S]*?});/);
    }
    
    if (!match) {
      console.error(`Could not extract translations from ${filePath}`);
      return {};
    }
    
    // Clean the JSON string for parsing
    const jsonStr = match[1]
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*$/gm, '')         // Remove // comments
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure keys are quoted
      .replace(/,(\s*[\]}])/g, '$1');    // Remove trailing commas
      
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Error extracting translations from ${filePath}:`, error);
    return {};
  }
}

function extractFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return '';
  }
}

// Count keys in an object (for reporting)
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

// Main function to append translations
function appendTranslations() {
  console.log("Starting translation append process...");
  
  // Read and parse the files
  const targetEnContent = extractFileContent(TARGET_EN_PATH);
  const targetArContent = extractFileContent(TARGET_AR_PATH);
  const attachedEnContent = extractFileContent(ATTACHED_EN_PATH);
  const attachedArContent = extractFileContent(ATTACHED_AR_PATH);
  
  if (!targetEnContent || !targetArContent || !attachedEnContent || !attachedArContent) {
    console.error("Failed to read one or more source files. Aborting.");
    return;
  }
  
  // Extract translations
  const targetEnTranslations = extractTranslations(TARGET_EN_PATH);
  const targetArTranslations = extractTranslations(TARGET_AR_PATH);
  const attachedEnTranslations = extractTranslations(ATTACHED_EN_PATH);
  const attachedArTranslations = extractTranslations(ATTACHED_AR_PATH);
  
  if (Object.keys(targetEnTranslations).length === 0 || 
      Object.keys(targetArTranslations).length === 0 || 
      Object.keys(attachedEnTranslations).length === 0 || 
      Object.keys(attachedArTranslations).length === 0) {
    console.error("Failed to extract translations from one or more files. Aborting.");
    return;
  }
  
  // Merge translations
  const mergedEnTranslations = deepMerge(targetEnTranslations, attachedEnTranslations);
  const mergedArTranslations = deepMerge(targetArTranslations, attachedArTranslations);
  
  // Update files
  const updatedEnContent = targetEnContent.replace(
    /const enTranslations = {[\s\S]*?};/,
    `const enTranslations = ${JSON.stringify(mergedEnTranslations, null, 2)};`
  );
  
  const updatedArContent = targetArContent.replace(
    /const arTranslations = {[\s\S]*?};/,
    `const arTranslations = ${JSON.stringify(mergedArTranslations, null, 2)};`
  );
  
  // Write updated files
  fs.writeFileSync(TARGET_EN_PATH, updatedEnContent);
  fs.writeFileSync(TARGET_AR_PATH, updatedArContent);
  
  // Generate report
  const enKeysCount = {
    original: countKeys(targetEnTranslations),
    attached: countKeys(attachedEnTranslations),
    merged: countKeys(mergedEnTranslations)
  };
  
  const arKeysCount = {
    original: countKeys(targetArTranslations),
    attached: countKeys(attachedArTranslations),
    merged: countKeys(mergedArTranslations)
  };
  
  console.log("\nTranslation Append Report");
  console.log("=======================\n");
  
  console.log("English Translations:");
  console.log(`- Original key count: ${enKeysCount.original}`);
  console.log(`- Attached key count: ${enKeysCount.attached}`);
  console.log(`- Merged key count: ${enKeysCount.merged}`);
  console.log(`- Keys added: ${enKeysCount.merged - enKeysCount.original}\n`);
  
  console.log("Arabic Translations:");
  console.log(`- Original key count: ${arKeysCount.original}`);
  console.log(`- Attached key count: ${arKeysCount.attached}`);
  console.log(`- Merged key count: ${arKeysCount.merged}`);
  console.log(`- Keys added: ${arKeysCount.merged - arKeysCount.original}\n`);
  
  console.log("Translation files have been successfully updated!");
}

// Execute the append function
appendTranslations();