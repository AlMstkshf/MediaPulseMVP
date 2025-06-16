#!/bin/bash

# Kill any existing node processes on port 5000
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Start the simplified WebSocket server
node simple-no-ts-server.js