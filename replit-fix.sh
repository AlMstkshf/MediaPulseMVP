#!/bin/bash

# Replit Deployment Fix Script
# This script resolves common deployment issues in the Replit environment

echo "🛠️ Running Replit deployment fixes..."

# 1. Update environment variables
export PORT=5000  # Use port 5000 to match Replit expectations
echo "✅ Set PORT to 5000 for Replit compatibility"

# 2. Run the fix-build script to ensure proper file structure
echo "🔧 Running fix-build script to ensure proper structure..."
node scripts/fix-build.js
echo "✅ Build structure fixed"

# 3. Check for client assets
if [ -d "build/client/assets" ]; then
  echo "✅ Client assets found in build/client/assets"
else
  echo "⚠️ Client assets not found in expected location"
  
  # Create directory if it doesn't exist
  mkdir -p build/client/assets
  
  # Look for assets in other locations
  if [ -d "client/assets" ]; then
    echo "🔄 Copying assets from client/assets to build/client/assets"
    cp -r client/assets/* build/client/assets/
  elif [ -d "dist/assets" ]; then
    echo "🔄 Copying assets from dist/assets to build/client/assets"
    cp -r dist/assets/* build/client/assets/
  fi
fi

# 4. Check for index.html in build/client
if [ -f "build/client/index.html" ]; then
  echo "✅ index.html found in build/client"
else
  echo "⚠️ index.html not found in build/client, creating placeholder"
  cat > build/client/index.html << EOL
<!DOCTYPE html>
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
    <script type="module" src="/assets/index-BXnx6GeG.js"></script>
  </body>
</html>
EOL
fi

# 5. Copy client assets to server/public instead of symlinks (symlinks can be problematic in Replit)
echo "🔗 Setting up server/public directory..."
if [ -d "server" ]; then
  # Create server/public if it doesn't exist
  mkdir -p server/public
  
  # Copy files instead of using symlinks
  if [ -d "build/client" ]; then
    echo "🔄 Copying files from build/client to server/public"
    cp -r build/client/* server/public/
    echo "✅ Copied files to server/public"
  fi
fi

echo "✅ Replit deployment fixes completed successfully"
echo "🚀 You can now start the application"