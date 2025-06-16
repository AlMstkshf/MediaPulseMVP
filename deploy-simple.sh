#!/bin/bash
# Simple deployment script for Replit

echo "====================================="
echo "   Media Pulse Simplified Deployment "
echo "====================================="

# Stop all running processes
echo "→ Stopping all Node processes..."
pkill -f node || true
sleep 2

# Check if port 3000 is free
echo "→ Checking port 3000 status..."
if nc -z localhost 3000 2>/dev/null; then
  echo "  ⚠️ Port 3000 is in use, forcing it to close..."
  fuser -k 3000/tcp || true
  sleep 2
else
  echo "  ✓ Port 3000 is available"
fi

# Set environment variables
export NODE_ENV=production
export PORT=3000

echo "→ Starting production server on port 3000..."
node replit-production-server.js