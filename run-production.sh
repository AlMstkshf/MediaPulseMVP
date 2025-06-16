#!/bin/bash
# Quick production mode start script (without building frontend)

# Display banner
echo "----------------------------------------"
echo "   Media Pulse Server - Quick Start    "
echo "----------------------------------------"

# Stop all running processes
echo "Stopping all running processes..."
pkill -f node || true
sleep 2

# Check if port 3000 is free
if nc -z localhost 3000 2>/dev/null; then
  echo "⚠️ Port 3000 is still in use. Attempting to force kill..."
  fuser -k 3000/tcp || true
  sleep 2
  
  # Double-check port
  if nc -z localhost 3000 2>/dev/null; then
    echo "❌ Could not free port 3000. Trying port 4000 instead."
    export PORT=4000
  else
    echo "✅ Port 3000 is now available"
    export PORT=3000
  fi
else
  echo "✅ Port 3000 is available"
  export PORT=3000
fi

# Set up environment
export NODE_ENV=production

echo "Starting server in production mode on port $PORT..."
echo "You can access the server at http://localhost:$PORT"
echo "----------------------------------------"

# Run the server
node unified-server.js