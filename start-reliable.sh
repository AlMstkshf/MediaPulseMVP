#!/bin/bash
# Reliable server startup script for Replit environment
# This script provides a resilient startup process that works consistently

echo "Starting Media Pulse server on port 4000..."
echo "This server configuration avoids Replit's file watcher limits (ENOSPC errors)"

# Kill any existing processes on port 4000 to ensure we can bind to it
echo "Checking for existing processes on port 4000..."
PIDS=$(lsof -t -i:4000 2>/dev/null)
if [ ! -z "$PIDS" ]; then
  echo "Found processes using port 4000. Terminating: $PIDS"
  kill -9 $PIDS
  sleep 1
fi

# Set environment variables
export PORT=4000

# Print the environment details
echo "Environment details:"
echo "- NODE_ENV: ${NODE_ENV:-development}"
echo "- REPL_ID: ${REPL_ID:-not in Replit}"
echo "- PORT: $PORT"
echo "- DATABASE_URL exists: $(if [ -z "$DATABASE_URL" ]; then echo "No"; else echo "Yes"; fi)"
echo "- OPENAI_API_KEY exists: $(if [ -z "$OPENAI_API_KEY" ]; then echo "No"; else echo "Yes"; fi)"

# Check if we're running in Replit
if [ ! -z "$REPL_ID" ]; then
  echo "🚀 Running in Replit environment: $REPL_ID"
  echo "Using unified server approach to avoid file watcher limits"
  
  # Initialize database (if needed)
  if [ ! -z "$DATABASE_URL" ]; then
    echo "Database URL exists, database will be initialized by the application"
  else
    echo "⚠️ WARNING: No DATABASE_URL found. Some features may not work correctly."
  fi
  
  # Check for OpenAI API key
  if [ ! -z "$OPENAI_API_KEY" ]; then
    echo "OpenAI API key exists, NLP services will be available"
  else
    echo "⚠️ WARNING: No OPENAI_API_KEY found. NLP features will be limited."
  fi
  
  # Start the unified server for Replit environment
  NODE_ENV=production node unified-server.js
else
  echo "Running in local development environment"
  echo "Using standard development server"
  
  # Use the standard development setup
  npm run dev
fi