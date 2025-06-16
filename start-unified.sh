#!/bin/bash
# Start the unified server for Replit compatibility

echo "Starting unified server for Replit environment..."
echo "This avoids file watcher limits (ENOSPC errors) and serves both API and frontend"

node unified-server.js