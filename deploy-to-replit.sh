#!/bin/bash

# Deployment script for Replit
echo "========================================"
echo "Media Pulse Deployment Script for Replit"
echo "========================================"

# 1. Make sure we're in the correct directory
cd "$(dirname "$0")"
echo "Working directory: $(pwd)"

# 2. Save a copy of the original .replit file if it exists (we can't modify it directly)
if [ -f ".replit" ]; then
  echo "Found .replit file, will follow its deployment configuration"
else
  echo "No .replit file found. This script expects to run in a Replit environment."
  exit 1
fi

# 3. Run our package.json update script to add the replit command
echo "Updating package.json with deployment scripts..."
node fix-package-for-deploy.js

# 4. Generate deployment configuration
echo "Generating deployment configuration..."
node deploy-fix.js

# 5. Build the application for production
echo "Building application for production..."
npm run build
if [ $? -ne 0 ]; then
  echo "Error: Build failed!"
  exit 1
fi

echo "Build completed successfully"

# 6. Test the server connection
echo "Testing production server startup..."
# Start server in background to test it
NODE_ENV=production npx tsx server-unified.js &
SERVER_PID=$!
sleep 5

# Test if server is responding
echo "Checking if server is responding..."
curl -s http://localhost:8080/api/health > /dev/null
if [ $? -ne 0 ]; then
  echo "Error: Server is not responding on port 8080"
  kill $SERVER_PID
  exit 1
else
  echo "Server is responding correctly"
  # Kill the test server
  kill $SERVER_PID
fi

echo "========================================"
echo "Deployment setup complete!"
echo "========================================"
echo ""
echo "Your app is ready to be deployed."
echo "To deploy with Replit:"
echo "1. Click the 'Deploy' button in the Replit interface"
echo "2. Make sure to change the run command to: npm run replit"
echo "3. The app will be deployed to your Replit domain"
echo ""
echo "Domain configuration:"
echo "- Production domain: media-pulse.almstkshf.com"
echo "- For custom domain setup, configure DNS after deployment is complete"
echo ""
echo "NOTE: If the server fails after deployment, please check:"
echo "- Is port 8080 properly exposed? (.replit file should have a mapping for 8080)"
echo "- Did you change the run command to 'npm run replit'?"
echo "========================================"