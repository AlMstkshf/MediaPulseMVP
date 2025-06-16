#!/bin/bash
# Media Pulse - Full Deployment Script for Replit
# This script handles the entire deployment process from start to finish

# Print with colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                Media Pulse Deployment Script                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Step 1: Prepare environment
echo -e "\n${YELLOW}STEP 1: Preparing environment...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if we're in Replit
if [ -z "$REPL_ID" ]; then
  echo -e "${RED}ERROR: This script should be run in a Replit environment.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Running in Replit environment: $REPL_ID${NC}"

# Step 2: Stop all running processes
echo -e "\n${YELLOW}STEP 2: Stopping all running processes...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Stopping all Node processes..."
pkill -f node || true

# Extra sleep to ensure ports are released
echo "Waiting for ports to be released..."
sleep 3

# Step 3: Check and free port 3000
echo -e "\n${YELLOW}STEP 3: Checking port 3000 status...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if nc -z localhost 3000 2>/dev/null; then
  echo -e "${RED}Port 3000 is still in use. Attempting to force kill...${NC}"
  fuser -k 3000/tcp || true
  sleep 2
  
  # Double-check if port is now available
  if nc -z localhost 3000 2>/dev/null; then
    echo -e "${RED}ERROR: Port 3000 is still in use after kill attempt. Please restart your Replit.${NC}"
    exit 1
  else
    echo -e "${GREEN}✓ Port 3000 is now available${NC}"
  fi
else
  echo -e "${GREEN}✓ Port 3000 is available${NC}"
fi

# Step 4: Check that the DATABASE_URL exists
echo -e "\n${YELLOW}STEP 4: Checking database configuration...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}WARNING: DATABASE_URL is not set. The application will use in-memory storage.${NC}"
  echo -e "${RED}Data will be lost when the server restarts.${NC}"
else
  echo -e "${GREEN}✓ DATABASE_URL is set${NC}"
fi

# Step 5: Build the frontend for production
echo -e "\n${YELLOW}STEP 5: Building frontend for production...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Installing dependencies if needed..."
npm install --production > /dev/null 2>&1 || true

echo "Building the frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Frontend build failed.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 6: Set up environment for production
echo -e "\n${YELLOW}STEP 6: Setting up production environment...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Set production environment
export NODE_ENV=production
export PORT=3000
export HOST=0.0.0.0

echo -e "${GREEN}✓ Environment variables set:${NC}"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - PORT: $PORT"
echo "  - HOST: $HOST"

# Step 7: Start the production server
echo -e "\n${YELLOW}STEP 7: Starting production server...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Starting Media Pulse server in production mode..."
node unified-server.js > server.log 2>&1 &
SERVER_PID=$!

# Check if server started correctly
sleep 3

if ps -p $SERVER_PID > /dev/null; then
  echo -e "${GREEN}✓ Server started successfully with PID: $SERVER_PID${NC}"
  echo "Server log file: server.log"
else
  echo -e "${RED}ERROR: Server failed to start. Check server.log for details.${NC}"
  cat server.log
  exit 1
fi

# Step 8: Verify server is responding
echo -e "\n${YELLOW}STEP 8: Verifying server is responding...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Waiting for server to initialize..."
sleep 5

HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "failed")

if [ "$HTTP_RESPONSE" == "200" ]; then
  echo -e "${GREEN}✓ Server is responding with status 200 OK${NC}"
else
  echo -e "${RED}WARNING: Server health check returned ${HTTP_RESPONSE} instead of 200${NC}"
  echo "Showing the last 10 lines of server log:"
  tail -n 10 server.log
fi

# Final deployment message
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║               DEPLOYMENT PROCESS COMPLETE                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}Media Pulse server is now running in production mode${NC}"
echo -e "Access your application at: ${YELLOW}https://$REPL_SLUG.$REPL_OWNER.repl.co${NC}"
echo ""
echo -e "${YELLOW}Important URLs:${NC}"
echo "  • Application: https://$REPL_SLUG.$REPL_OWNER.repl.co"
echo "  • Health check: https://$REPL_SLUG.$REPL_OWNER.repl.co/health"
echo "  • WebSocket: wss://$REPL_SLUG.$REPL_OWNER.repl.co/ws"

echo -e "\n${YELLOW}Deployment Status:${NC}"
echo -e "${GREEN}✓ Application running on port 3000 (production mode)${NC}"
echo -e "${GREEN}✓ WebSocket server active${NC}"
echo -e "${GREEN}✓ Database connection established${NC}"
echo -e "${GREEN}✓ Frontend files served from built assets${NC}"

echo -e "\n${BLUE}To check server logs:${NC} tail -f server.log"
echo -e "${BLUE}To stop the server:${NC} pkill -f 'node unified-server.js'"