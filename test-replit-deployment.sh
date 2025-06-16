#!/bin/bash

# Test script for Replit deployment
echo "Testing Replit deployment configuration..."

# Check that our configuration files exist
echo "Checking configuration files..."
if [ -f "deployment.config.json" ]; then
  echo "✓ deployment.config.json exists"
else
  echo "✗ deployment.config.json missing"
fi

if [ -f "server-unified.js" ]; then
  echo "✓ server-unified.js exists"
else
  echo "✗ server-unified.js missing"
fi

# Check that we have the replit script in package.json
echo "Checking package.json for replit script..."
if grep -q '"replit"' package.json; then
  echo "✓ replit script found in package.json"
else
  echo "✗ replit script missing from package.json"
fi

# Check port 8080 is exposed in .replit
echo "Checking .replit for port 8080 exposure..."
if grep -q "localPort = 8080" .replit; then
  echo "✓ Port 8080 is exposed in .replit"
else
  echo "✗ Port 8080 is not properly exposed in .replit"
fi

# Check that our domain is configured
echo "Checking domain configuration..."
if grep -q "media-pulse.almstkshf.com" server-unified.js; then
  echo "✓ Domain is configured in server-unified.js"
else
  echo "✗ Domain is not configured in server-unified.js"
fi

echo ""
echo "✓ Verification complete."
echo ""
echo "To deploy your application:"
echo "1. Run: ./deploy-to-replit.sh"
echo "2. Navigate to the Deployment tab in Replit"
echo "3. Change the Run Command to: npm run replit"
echo "4. Click Deploy"