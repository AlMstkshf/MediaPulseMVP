#!/bin/bash
# Script to start the Replit-friendly server
# This avoids the ENOSPC errors that occur with file watchers

echo "Starting Media Pulse Replit-friendly server..."
echo "This version uses port 5000 as required by Replit"

node replit-server.js