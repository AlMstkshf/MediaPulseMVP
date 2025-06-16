// Script to modify package.json for deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the existing package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add a new script for deployment that uses our unified approach
packageJson.scripts.replit = "NODE_ENV=development tsx server-unified.js";

// Update the start script to also use our unified approach
packageJson.scripts.start = "NODE_ENV=production tsx server-unified.js";

// Add a script for testing the server in development mode
packageJson.scripts.test_server = "tsx server-unified.js";

// Write the modified package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Successfully updated package.json with deployment scripts');
console.log('-> Now "npm run replit" and "npm run start" will use the unified server approach');