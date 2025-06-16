#!/bin/bash

# Kill any existing node processes
pkill -f node 2>/dev/null || true
sleep 1

# Start the unified server
node server-unified.js