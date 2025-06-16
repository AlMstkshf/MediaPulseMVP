# Media Pulse Deployment Instructions

## Complete Deployment Process from A to Z

### 1. Preparation

1. Ensure your code is committed and up-to-date
2. Verify all configuration files are set to use port 3000:
   - `server-config.js`: PORT = 3000
   - `unified-server.js`: PORT = process.env.PORT || 3000
   - `server/index.ts`: serverPort = 3000

### 2. Deployment Options

You have two options to deploy:

#### Option 1: Full Production Deployment (Recommended)

Run the full deployment script which:
- Stops all running processes
- Verifies port 3000 is available
- Builds the frontend for production
- Starts the server in production mode
- Performs health checks
- Provides detailed logging

```bash
./deploy-replit.sh
```

#### Option 2: Quick Production Start (Without Building)

For quick testing in production mode:

```bash
./run-production.sh
```

### 3. Accessing the Deployed Application

After deployment, your application will be available at:
- Web application: `https://<repl-name>.<username>.repl.co`
- Health check: `https://<repl-name>.<username>.repl.co/health`
- WebSocket: `wss://<repl-name>.<username>.repl.co/ws`

### 4. Troubleshooting

If you encounter issues:

1. **Port Already in Use**:
   ```bash
   pkill -f node
   fuser -k 3000/tcp
   ```

2. **Check Server Logs**:
   ```bash
   tail -f server.log
   ```

3. **Database Issues**:
   - Verify DATABASE_URL is set correctly in Replit Secrets
   - Check database connection in logs

4. **WebSocket Connection Issues**:
   - Visit `/replit-ws-test` endpoint to run diagnostics
   - Verify client is using the correct WebSocket URL (wss:// for secure connections)

### 5. Restarting the Server

To restart the server:

```bash
pkill -f "node unified-server.js"
./deploy-replit.sh
```

### 6. Environment Configuration

The deployment scripts set these environment variables:
- NODE_ENV=production
- PORT=3000
- HOST=0.0.0.0

### 7. Health Check

Check if the server is running properly:

```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok","uptime":"...","env":"production"}`