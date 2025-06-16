#!/bin/bash
# Production startup script

# Load environment variables from deployment.env
export $(grep -v '^#' deployment.env | xargs)

# Set memory limits
export NODE_OPTIONS="--max-old-space-size=2048"

# Set default port for production (if not set in environment)
# Replit will automatically provide the correct PORT via environment variable
if [ -z "$PORT" ]; then
  export PORT=3000
fi

# Disable Rasa for production
export DISABLE_RASA=true

# Start the server in production mode
NODE_ENV=production node build/server/index.js

# If the server crashes, log the error and exit gracefully
if [ $? -ne 0 ]; then
  echo "Server crashed with exit code $?"
  echo "Check logs for details"
  exit 1
fi