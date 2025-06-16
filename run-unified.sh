#!/bin/bash

# Script to run the unified server in development mode
echo "Starting unified server for Replit environment..."

# Set environment variables
export REPLIT_ENVIRONMENT=true
export PORT=8080
export NODE_ENV=development

# Run the unified server
echo "Running server with node server-unified.js"
node server-unified.js