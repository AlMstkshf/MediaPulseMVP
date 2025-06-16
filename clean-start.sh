#!/bin/bash
# Reset and restart the server cleanly
# This script ensures all node processes are stopped and ports are freed before starting

echo "🧹 Cleaning up environment before starting server..."

# Kill all node processes
echo "Stopping all Node processes..."
pkill -f node || true

# Extra sleep to ensure ports are released
sleep 2

# Verify port 3000 is free
echo "Checking if port 3000 is available..."
if nc -z localhost 3000 2>/dev/null; then
  echo "🚫 Port 3000 is still in use. Attempting to force kill..."
  fuser -k 3000/tcp || true
  sleep 2
else
  echo "✅ Port 3000 is available"
fi

# Set environment variables
export PORT=3000
export NODE_ENV=production

echo "🚀 Starting Media Pulse server on port 3000..."
echo "Starting in production mode to avoid file watcher limits (ENOSPC errors)"

# Start the server
node unified-server.js