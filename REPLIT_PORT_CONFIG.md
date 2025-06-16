# Port Configuration for Replit Deployment

## Important Port Information

The Media Pulse platform has been configured to run on port 3000 for Replit deployment.

> **Note:** Port 3000 is currently used by Vite's development server. For deployment, you need to stop the development server first.

### Port Configuration Details

1. **Port 3000**: This is the official port that Replit expects web applications to use.
   - All server configurations have been updated to use this port
   - The clean-start.sh script sets PORT=3000
   - unified-server.js uses PORT=3000 by default

2. **Port 5000**: This port is used by other Replit services and should be avoided.

3. **Port 4000**: We previously used this port but have switched to port 3000 for better Replit compatibility.

## Deployment Steps

1. Make sure all configuration is set to port 3000:
   - server-config.js: PORT = 3000
   - unified-server.js: PORT = process.env.PORT || 3000
   - server/index.ts: serverPort = 3000
   - clean-start.sh: export PORT=3000

2. Stop the current development server:
   ```bash
   pkill -f node
   sleep 2
   ```

3. Run the clean-start script to ensure proper initialization:
   ```bash
   ./clean-start.sh
   ```

3. When deployed, the application should be accessible at:
   ```
   https://<replit-id>.replit.app/
   ```

## Troubleshooting

If deployment fails:
1. Verify all port configurations are set to 3000
2. Check if another process is using port 3000
3. Review Replit logs for any errors
4. Ensure WebSocket connections are using the right protocol (wss:// for secure connections)