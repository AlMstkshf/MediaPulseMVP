import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ComponentReference {
  filePath: string;
  lineNumber: number;
  componentName: string;
  textContent: string;
}

// Find all TSX files in the client/src directory
function findTsxFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Scan files for data-component-name attributes
function scanForComponentNameAttributes(files: string[]): ComponentReference[] {
  const results: ComponentReference[] = [];

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for data-component-name attribute
      const componentNameMatch = line.match(/data-component-name=["']([^"']*)["']/);
      if (componentNameMatch) {
        // Look for text content in the same or adjacent lines
        const lineNumber = index + 1;
        const componentName = componentNameMatch[1];
        
        // Try to extract text content from the current line and nearby lines
        let textContent = '';
        for (let i = Math.max(0, index - 2); i <= Math.min(lines.length - 1, index + 2); i++) {
          const textMatch = lines[i].match(/>([^<>{]*)</);
          if (textMatch && textMatch[1].trim()) {
            textContent = textMatch[1].trim();
            break;
          }
        }
        
        results.push({
          filePath: path.relative(path.join(__dirname), filePath),
          lineNumber,
          componentName,
          textContent
        });
      }
    });
  });

  return results;
}

// Check if translation files exist and create them if not
function ensureTranslationFiles(components: ComponentReference[]): void {
  const localesDir = path.join(__dirname, 'client/src/locales');
  
  // Ensure locales directory exists
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }
  
  const languages = ['en', 'ar']; // Add more languages as needed
  
  languages.forEach(lang => {
    const langDir = path.join(localesDir, lang);
    
    // Ensure language directory exists
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    // Create namespace files with component translations
    const commonFile = path.join(langDir, 'common.json');
    let commonTranslations = {};
    
    if (fs.existsSync(commonFile)) {
      try {
        commonTranslations = JSON.parse(fs.readFileSync(commonFile, 'utf-8'));
      } catch (e) {
        console.error(`Error parsing ${commonFile}:`, e);
      }
    }
    
    // Add component entries
    components.forEach(component => {
      if (component.textContent && !commonTranslations[component.componentName]) {
        commonTranslations[component.componentName] = lang === 'en' ? component.textContent : '';
      }
    });
    
    // Write back to file
    fs.writeFileSync(commonFile, JSON.stringify(commonTranslations, null, 2));
  });
}

// Generate a report of all components with data-component-name
function generateReport(components: ComponentReference[]): void {
  console.log('\nComponents with data-component-name:');
  console.log('=================================\n');
  
  components.forEach(comp => {
    console.log(`Component: ${comp.componentName}`);
    console.log(`File: ${comp.filePath}:${comp.lineNumber}`);
    if (comp.textContent) {
      console.log(`Text: "${comp.textContent}"`);
    } else {
      console.log('Text: None found');
    }
    console.log('----------------------');
  });
  
  console.log('\nSummary:');
  console.log(`Total components found: ${components.length}`);
  console.log(`Components with text content: ${components.filter(c => c.textContent).length}`);
  console.log(`Components without text content: ${components.filter(c => !c.textContent).length}`);
}

// Main function
function main() {
  const clientSrcDir = path.join(__dirname, 'client/src');
  const tsxFiles = findTsxFiles(clientSrcDir);
  console.log(`Found ${tsxFiles.length} TSX files`);
  
  const components = scanForComponentNameAttributes(tsxFiles);
  console.log(`Found ${components.length} components with data-component-name`);
  
  if (components.length > 0) {
    ensureTranslationFiles(components);
    generateReport(components);
  } else {
    console.log('No components with data-component-name attribute found.');
  }
}

// Run the script
main();