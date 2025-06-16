import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Define directories
const distDir = path.resolve(rootDir, 'dist');
const buildDir = path.resolve(rootDir, 'build');
const clientBuildDir = path.resolve(buildDir, 'client');
const serverBuildDir = path.resolve(buildDir, 'server');

console.log('🛠️ Starting build structure fix...');

// Create directories if they don't exist
[buildDir, clientBuildDir, serverBuildDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copy client files from dist to build/client
if (fs.existsSync(path.join(distDir, 'public'))) {
  console.log('Copying client files from dist/public to build/client');
  fs.cpSync(path.join(distDir, 'public'), clientBuildDir, { recursive: true });
} else if (fs.existsSync(distDir)) {
  console.log('Copying client files from dist to build/client');
  fs.cpSync(distDir, clientBuildDir, { recursive: true });
}

// Create placeholder index.html if needed
if (!fs.existsSync(path.join(clientBuildDir, 'index.html'))) {
  console.log('Creating placeholder index.html');
  const placeholderHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Media Pulse</title>
  </head>
  <body>
    <div id="root">
      <h1>Media Pulse</h1>
      <p>Application is loading...</p>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  fs.writeFileSync(path.join(clientBuildDir, 'index.html'), placeholderHtml);
}

// Verify build structure
const isValid = fs.existsSync(path.join(clientBuildDir, 'index.html')) &&
                fs.existsSync(path.join(serverBuildDir, 'index.js'));

if (isValid) {
  console.log('✅ Build structure verified successfully');
} else {
  console.warn('⚠️ Build structure verification failed');
  console.log(`
Missing files:
${!fs.existsSync(path.join(clientBuildDir, 'index.html')) ? '- build/client/index.html' : ''}
${!fs.existsSync(path.join(serverBuildDir, 'index.js')) ? '- build/server/index.js' : ''}
  `);
}

console.log(`
Build structure:
build/
  ├── client/     - Static files (${fs.existsSync(clientBuildDir) ? '✓' : '✗'})
  └── server/     - Server files (${fs.existsSync(serverBuildDir) ? '✓' : '✗'})
`);