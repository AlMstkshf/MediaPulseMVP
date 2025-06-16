
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { enTranslations } from '../client/src/lib/i18n/locales/en.js';

// ES modules dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to recursively find all TypeScript/JavaScript/TSX files
function findFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findFiles(filePath, fileList);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to extract translation keys from a file
function extractKeysFromFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys: string[] = [];

  // Enhanced patterns for React components
  const patterns = [
    // Basic t function calls
    /t\(['"]([^'"]+)['"]\)/g,                    // t('key') or t("key")
    /t`([^`]+)`/g,                               // t`key`
    
    // JSX attribute patterns
    /\b(?:title|label|placeholder|alt|aria-label|description|tooltip|text|message|error|hint|help)=\{t\(['"]([^'"]+)['"]\)\}/g,
    
    // Destructured t usage
    /const\s*{\s*t\s*}\s*=\s*useTranslation\(\)/g,
    
    // Direct component text content
    />\s*\{t\(['"]([^'"]+)['"]\)\}\s*</g,
    
    // Template literal interpolation
    /\$\{t\(['"]([^'"]+)['"]\)\}/g,
    
    // Common component props
    /(?:label|title|description|placeholder|tooltip|error)Props=\{t\(['"]([^'"]+)['"]\)\}/g,
    
    // Error messages and validations
    /(?:error|validation)Message=\{t\(['"]([^'"]+)['"]\)\}/g,
    
    // Button and link text
    /<(?:Button|Link)[^>]*>\s*\{t\(['"]([^'"]+)['"]\)\}\s*</g,
    
    // Headings and text content
    /<(?:h1|h2|h3|h4|h5|h6|p|span)[^>]*>\s*\{t\(['"]([^'"]+)['"]\)\}\s*</g,
    
    // Dialog and modal content
    /<(?:Dialog|Modal)[^>]*title=\{t\(['"]([^'"]+)['"]\)\}/g,
    
    // Form labels and placeholders
    /<(?:Input|TextArea|Select)[^>]*placeholder=\{t\(['"]([^'"]+)['"]\)\}/g,
    
    // Error boundary fallback text
    /fallback=\{t\(['"]([^'"]+)['"]\)\}/g,
    
    // Toast and notification messages
    /toast\(.*t\(['"]([^'"]+)['"]\).*\)/g,
    
    // Alert and confirmation messages
    /alert\(t\(['"]([^'"]+)['"]\)\)/g,
    
    // Menu and navigation items
    /label:\s*t\(['"]([^'"]+)['"]\)/g
  ];

  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) keys.push(match[1]);
    }
  });

  return [...new Set(keys)]; // Remove duplicates
}

// Main function to analyze translation usage
function analyzeTranslations() {
  const clientDir = path.join(__dirname, '../client/src');
  const files = findFiles(clientDir);

  const usedKeys = new Set<string>();
  const allDefinedKeys = new Set<string>();
  const keysByFile: { [key: string]: string[] } = {};

  // Get all defined keys from translations
  function extractDefinedKeys(obj: any, prefix = '') {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        extractDefinedKeys(obj[key], fullKey);
      } else {
        allDefinedKeys.add(fullKey);
      }
    });
  }

  extractDefinedKeys(enTranslations);

  // Find all used keys in code
  files.forEach(file => {
    const relativePath = path.relative(clientDir, file);
    const keys = extractKeysFromFile(file);
    if (keys.length > 0) {
      keysByFile[relativePath] = keys;
      keys.forEach(key => usedKeys.add(key));
    }
  });

  // Generate report
  console.log('Translation Keys Analysis Report');
  console.log('===============================\n');

  console.log('Keys by File:');
  Object.entries(keysByFile).forEach(([file, keys]) => {
    console.log(`\n${file}:`);
    keys.forEach(key => console.log(`  - ${key}`));
  });

  console.log('\nSummary:');
  console.log('--------');
  console.log('Total defined keys:', allDefinedKeys.size);
  console.log('Total used keys:', usedKeys.size);

  const unusedKeys = [...allDefinedKeys].filter(key => !usedKeys.has(key));
  const undefinedKeys = [...usedKeys].filter(key => !allDefinedKeys.has(key));

  if (unusedKeys.length > 0) {
    console.log('\nUnused translation keys:', unusedKeys.length);
    unusedKeys.forEach(key => console.log(`- ${key}`));
  }

  if (undefinedKeys.length > 0) {
    console.log('\nUndefined translation keys:', undefinedKeys.length);
    undefinedKeys.forEach(key => console.log(`- ${key}`));
  }

  // Save report to file
  const report = {
    summary: {
      totalDefinedKeys: allDefinedKeys.size,
      totalUsedKeys: usedKeys.size,
      unusedKeysCount: unusedKeys.length,
      undefinedKeysCount: undefinedKeys.length
    },
    keysByFile,
    unusedKeys,
    undefinedKeys
  };

  fs.writeFileSync(
    'translation-analysis-report.json', 
    JSON.stringify(report, null, 2)
  );
  console.log('\nDetailed report saved to translation-analysis-report.json');
}

// Run the analysis
analyzeTranslations();
