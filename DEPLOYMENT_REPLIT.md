# Media Pulse Deployment Guide for Replit

This guide explains how to deploy the Media Pulse platform on Replit, addressing specific environmental challenges.

## Replit-Specific Challenges and Solutions

### 1. File Watcher Limits (ENOSPC)

Replit has limits on the number of file watchers, which causes nodemon and Vite to crash with `ENOSPC` errors.

**Solution**: We use a unified server approach with:
- No file watchers in production mode
- Static file serving from the build directory
- Running on a single port to avoid conflicts

### 2. WebSocket Conflicts

Multiple WebSocket servers trying to use the same HTTP server creates conflicts.

**Solution**: Our WebSocketManager provides:
- A unified WebSocket connection point
- Path-based routing for different WebSocket services
- Better client tracking and error handling

### 3. Port Configuration

Replit exposes only one port to the outside world, but our stack normally runs on multiple ports.

**Solution**:
- All services run on port 4000
- Vite middleware serves frontend directly from Express in development
- Production build uses static file serving

## Deployment Instructions

### 1. Clean Start

Always use `clean-start.sh` to ensure a clean environment:

```bash
./clean-start.sh
```

This script:
- Stops all existing Node processes
- Verifies port availability
- Sets proper environment variables
- Starts the server in production mode

### 2. Production Deployment

For production deployment:

```bash
# Set environment to production
export NODE_ENV=production

# Build the frontend
npm run build

# Run the unified server
node unified-server.js
```

### 3. Troubleshooting

If you encounter WebSocket connection issues:
1. Visit `/replit-ws-test` to run diagnostics
2. Check server logs for connection errors
3. Verify client WebSocket URLs are using the right protocol (ws/wss)

For database connection issues:
1. Confirm DATABASE_URL is set correctly
2. Check database logs for connection errors
3. The application will fall back to memory storage if database connection fails

## Environment Variables

Required environment variables:

- `PORT`: Set to 4000 (automatically configured)
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to 'production' for deployment
- `REPL_ID`: Automatically provided by Replit

## Monitoring

The deployed application provides:
- Health check endpoint at `/health`
- WebSocket diagnostics at `/replit-ws-test`
- Port information at `/port-info`

## Performance Considerations

- The unified server approach is optimized for Replit's environment
- Memory usage is minimized by avoiding duplicate servers
- Browser caching is enabled for static assets

## Security Notes

- CORS is configured to allow only specific origins
- WebSocket connections validate origin headers
- Session cookies use secure, httpOnly flags when possible