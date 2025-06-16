#!/bin/bash

# Deployment script for Media Intelligence Platform
echo "===== Starting Media Intelligence Platform Deployment ====="

# 1. Set environment to production
export NODE_ENV=production
export PORT=8080

# 2. Stop any running processes
echo "Stopping any running processes..."
pkill -f "node" || true

# 3. Install dependencies
echo "Installing dependencies..."
npm install

# 4. Build the application (if needed)
echo "Building the application..."
npm run build

# 5. Start the application using the reliable script
echo "Starting the application..."
bash start-reliable.sh

echo "===== Deployment Complete ====="
echo "The application should now be running at https://media-pulse.almstkshf.com"
echo "or at your Replit URL."