#!/bin/bash
# Smart startup script for Media Pulse that detects environment and chooses
# the appropriate server implementation

echo "Starting Media Pulse on Replit..."

# Check if we're in a Replit environment
if [ -n "$REPL_ID" ] || [ -n "$REPL_SLUG" ]; then
  echo "Replit environment detected: $REPL_ID"
  echo "Using simplified server implementation to avoid ENOSPC errors"
  
  # Use the simplified server (CommonJS implementation)
  node server-simple.cjs
else
  echo "Standard environment detected"
  echo "Using full TypeScript implementation"

  # Use the standard startup with concurrently
  npm run dev
fi