#!/bin/bash

# deploy-setup.sh
# Script to prepare the application for deployment

echo "🚀 Preparing application for deployment..."

# Run the build process
echo "📦 Building application..."
npm run build

# If the build was successful, fix the directory structure
if [ $? -eq 0 ]; then
  echo "🔧 Fixing build directory structure..."
  
  # Run the fix-build.js script
  node scripts/fix-build.js
  
  # Check if the build/server/index.js file exists
  if [ -f "build/server/index.js" ]; then
    echo "✅ Build setup completed successfully!"
    echo "The application is ready for deployment."
    
    # Verify the build structure using test-build-structure.js if it exists
    if [ -f "scripts/test-build-structure.js" ]; then
      echo "🔍 Verifying build structure..."
      node scripts/test-build-structure.js
    fi
  else
    echo "❌ Error: build/server/index.js not found!"
    echo "The build process did not complete correctly."
    exit 1
  fi
else
  echo "❌ Build failed!"
  exit 1
fi

echo ""
echo "🚀 To deploy the application:"
echo "1. Make sure all changes are committed"
echo "2. Click on the 'Run' button in Replit"
echo "3. After successful run, click on the 'Deploy' button"