#!/bin/bash

echo "🚀 Starting deployment process..."

# Build the application
npm run build

# Create necessary directories
mkdir -p build/client
mkdir -p build/server/public

# Ensure correct build structure
if [ -d "dist/public" ]; then
  echo "📦 Copying client files from dist/public to build/client"
  cp -r dist/public/* build/client/
fi

# Create symlink for static files
cd build/server
ln -sf ../client public
cd ../..

# Verify the build structure
if [ -f "build/server/index.js" ] && [ -d "build/client" ]; then
  echo "✅ Build structure verified"
else
  echo "❌ Build structure verification failed"
  exit 1
fi

echo "✨ Deployment preparation complete!"

# deploy.sh
# Script to prepare the application for deployment
# This script is designed to be run before deployment to ensure the build directory structure is correct
# Works for both Replit and Cloud Run environments

echo "🚀 Preparing Media Pulse application for deployment..."

# Environment detection
if [ -n "$K_SERVICE" ]; then
  echo "🌩️ Cloud Run deployment detected"
  DEPLOYMENT_ENV="Cloud Run"
elif [ -n "$REPL_ID" ]; then
  echo "🔄 Replit deployment detected"
  DEPLOYMENT_ENV="Replit"
else
  echo "🖥️ Local deployment"
  DEPLOYMENT_ENV="Local"
fi

# Run the standard build process
echo "📦 Building application..."
NODE_ENV=production npm run build

# Run the enhanced fix-build script to ensure correct directory structure
echo "🔧 Fixing build directory structure..."
node scripts/fix-build.js

# Check if the build structure is valid
if [ -f "build/server/index.js" ] && [ -d "build/client" ]; then
  echo "✅ Build structure verified."
  
  # Make sure the server is configured to serve static files from the client directory
  echo "📂 Server configured to serve files from build/client"
  
  # Create a .env file with the correct PORT for each environment if it doesn't exist
  if [ "$DEPLOYMENT_ENV" = "Cloud Run" ]; then
    echo "PORT=8080" > .env
    echo "📝 Created .env with PORT=8080 for Cloud Run"
  elif [ "$DEPLOYMENT_ENV" = "Replit" ]; then
    echo "PORT=5000" > .env
    echo "📝 Created .env with PORT=5000 for Replit"
  fi
  
  echo "
🟢 Deployment preparation complete! 🟢

Your application is ready for deployment on $DEPLOYMENT_ENV.
The deployment will run: node build/server/index.js

Next steps:"

  if [ "$DEPLOYMENT_ENV" = "Replit" ]; then
    echo "1. Click on the Deploy button in the Replit interface
2. Wait for the deployment to complete
3. Your application will be available at your Replit domain"
  elif [ "$DEPLOYMENT_ENV" = "Cloud Run" ]; then
    echo "1. Deploy to Cloud Run with: gcloud run deploy
2. Wait for the deployment to complete
3. Your application will be available at the Cloud Run service URL"
  else
    echo "1. Follow your platform's deployment procedures
2. The application will run with: NODE_ENV=production node build/server/index.js"
  fi
  
else
  echo "❌ Build structure validation failed!"
  echo "Please check the logs for errors."
  exit 1
fi