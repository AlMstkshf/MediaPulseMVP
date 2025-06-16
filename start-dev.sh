#!/bin/bash

# This script starts the application with consistent port configuration
# for Replit compatibility

# Set environment variables
export PORT=5000
export VITE_PORT=5000

# Kill any existing processes using these ports
echo "Ensuring ports are free..."
fuser -k 5000/tcp 2>/dev/null || true

# Run the replit-fix script to ensure correct deployment structure
echo "Running deployment fixes..."
bash replit-fix.sh

# Start the application with explicit port settings
echo "Starting application with consistent port configuration (5000)..."
npx concurrently "nodemon" "npx vite --port 5000"