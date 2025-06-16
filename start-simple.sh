#!/bin/bash
# Start the simplified server for Replit environment
# This avoids the ENOSPC errors that occur with file watchers

echo "Starting Media Pulse simplified server..."
echo "This version avoids file watcher limits in Replit"

# Make script executable
chmod +x server-simple.cjs

# Start the server using CommonJS format
node server-simple.cjs