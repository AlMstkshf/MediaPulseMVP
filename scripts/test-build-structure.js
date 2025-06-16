/**
 * Test Build Structure Script
 * 
 * This script checks the build structure to ensure it meets the requirements for deployment.
 * It verifies that all necessary files and directories exist and reports any issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Define the expected directory structure
const expectedStructure = {
  'build/': {
    'client/': {
      'index.html': true
    },
    'server/': {
      'index.js': true
    }
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}=== Media Pulse Build Structure Test ===${colors.reset}`);
console.log(`Running in: ${rootDir}\n`);

// Test function to check if a file or directory exists
function testPath(relativePath, isFile = false) {
  const fullPath = path.resolve(rootDir, relativePath);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    if (isFile && !stats.isFile()) {
      console.log(`${colors.red}✗ ${relativePath} exists but is not a file${colors.reset}`);
      return false;
    } else if (!isFile && !stats.isDirectory()) {
      console.log(`${colors.red}✗ ${relativePath} exists but is not a directory${colors.reset}`);
      return false;
    }
    console.log(`${colors.green}✓ ${relativePath} exists${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}✗ ${relativePath} does not exist${colors.reset}`);
    return false;
  }
}

// Check if build directory structure exists
let buildStructureValid = true;

// Check build directory
buildStructureValid = testPath('build') && buildStructureValid;

// Check client directory and index.html
buildStructureValid = testPath('build/client') && buildStructureValid;
buildStructureValid = testPath('build/client/index.html', true) && buildStructureValid;

// Check server directory and index.js
buildStructureValid = testPath('build/server') && buildStructureValid;
buildStructureValid = testPath('build/server/index.js', true) && buildStructureValid;

// Check alternate structure (dist directory)
console.log(`\n${colors.cyan}=== Checking Alternate Directory Structure ===${colors.reset}`);

let distStructureExists = false;
if (testPath('dist')) {
  distStructureExists = true;
  
  // Check dist/public
  if (testPath('dist/public')) {
    // List files in dist/public
    const publicFiles = fs.readdirSync(path.resolve(rootDir, 'dist/public'));
    console.log(`${colors.blue}Files in dist/public:${colors.reset}`);
    publicFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
  // Check dist/server
  if (testPath('dist/server')) {
    // List files in dist/server
    const serverFiles = fs.readdirSync(path.resolve(rootDir, 'dist/server'));
    console.log(`${colors.blue}Files in dist/server:${colors.reset}`);
    serverFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
  }
}

// Final results
console.log(`\n${colors.cyan}=== Test Results ===${colors.reset}`);

if (buildStructureValid) {
  console.log(`${colors.green}✓ Build structure is valid for deployment${colors.reset}`);
} else {
  console.log(`${colors.red}✗ Build structure has issues${colors.reset}`);
  
  // Provide suggestions if there are issues
  if (distStructureExists) {
    console.log(`\n${colors.yellow}Suggestions:${colors.reset}`);
    console.log(`1. Run the fix-build script: ${colors.cyan}node scripts/fix-build.js${colors.reset}`);
    console.log(`2. Or run the deploy script: ${colors.cyan}./deploy.sh${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}Suggestions:${colors.reset}`);
    console.log(`1. Run the build command: ${colors.cyan}npm run build${colors.reset}`);
    console.log(`2. Then run the fix-build script: ${colors.cyan}node scripts/fix-build.js${colors.reset}`);
  }
}

// Exit with appropriate code
process.exit(buildStructureValid ? 0 : 1);