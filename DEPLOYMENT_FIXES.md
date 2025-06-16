# Deployment Fixes for Media Pulse

This document outlines the changes made to fix deployment issues in the Media Pulse application, ensuring it works correctly in both Replit and Cloud Run environments.

## Changes Summary

### 1. Port Configuration
- Fixed port configuration to dynamically adapt to different environments:
  - Uses port 8080 for Cloud Run (required by Google Cloud Run)
  - Uses port 5000 for Replit
  - Supports custom ports via the PORT environment variable
  - Automatically attempts incremental ports if the primary port is in use

### 2. Static Asset Path Resolution
- Enhanced static file serving with robust path detection:
  - Primary path: `build/client`
  - Additional fallback paths:
    - `build/server/public` (symlinked location)
    - `dist/public` (Vite default output)
    - `public` and `client` (development fallbacks)
  - Creates symlinks during build to ensure proper file access

### 3. WebSocket Connectivity
- Improved WebSocket connection handling:
  - Detects the correct server URL based on environment
  - Provides detailed connection error messages
  - Includes extended debugging information
  - Supports both development and production environments

### 4. Multi-Environment Support
- Implemented environment detection for configuration:
  - Detects Cloud Run via K_SERVICE environment variable
  - Detects Replit via REPL_ID environment variable
  - Applies environment-specific settings automatically

### 5. Build Process
- Enhanced the build process to properly structure files for deployment:
  - Creates proper directory structure for static files
  - Generates fallback pages if build fails
  - Includes improved error handling
  - Maintains compatibility between environments

## Files Modified

### Server-Side Changes

1. **server/config.ts**
   - Centralized configuration to handle environment differences
   - Added support for dynamic port selection
   - Implemented static path resolution
   - Added CORS configuration for all environments

2. **server/index.ts**
   - Updated server initialization to use environment-aware configuration
   - Fixed port configuration for multi-environment support
   - Improved error handling
   - Enhanced logging with environment details

3. **scripts/fix-build.js**
   - Updated to handle multiple static file locations
   - Added better error handling
   - Enhanced with environment detection
   - Includes fallback generation for failed builds

4. **deploy.sh**
   - Added environment detection
   - Updated deployment process for different environments
   - Improved error handling and logging
   - Added environment-specific configuration generation

### Client-Side Changes

1. **client/src/components/websocket/WebSocketProvider.tsx**
   - Enhanced WebSocket connection to work across environments
   - Added better error handling and debugging
   - Improved reconnection logic
   - Added environment-specific URL detection

## How It Works

### Port Selection
```javascript
// Automatic port selection based on environment
const isCloudRun = process.env.K_SERVICE !== undefined;
const serverPort = process.env.PORT 
  ? parseInt(process.env.PORT) 
  : isCloudRun 
    ? 8080 
    : 5000;
```

### Static Path Resolution
```javascript
// Find the first available static file path
const possiblePaths = [
  path.join(__dirname, '../client'),
  path.join(process.cwd(), 'build/client'),
  path.join(process.cwd(), 'dist/public'),
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'client')
];

let staticPath = possiblePaths[0]; // Default to first option
for (const candidatePath of possiblePaths) {
  if (fs.existsSync(candidatePath)) {
    staticPath = candidatePath;
    console.log(`Using static path: ${staticPath}`);
    break;
  }
}
```

### WebSocket Dynamic Connection
```javascript
// Determine appropriate WebSocket endpoint
let socketURL = window.location.origin;

if (process.env.NODE_ENV === 'production') {
  socketURL = window.location.origin;
} else if (process.env.NODE_ENV === 'development') {
  const currentPort = window.location.port;
  if (currentPort === '3000') {
    socketURL = `${window.location.protocol}//${window.location.hostname}:5000`;
  }
}
```

## Testing & Verification

The changes have been tested to ensure:

1. The server starts correctly in both Replit and Cloud Run environments
2. Static files are served properly
3. WebSocket connections work across environments
4. The application handles port conflicts gracefully
5. Proper error messages are displayed when issues occur

## Deployment Instructions

The updated deployment process is documented in detail in DEPLOYMENT.md. For deployment:

1. Run `./deploy.sh` to prepare files
2. Deploy according to your platform (Replit Deploy button or Cloud Run deployment)

---

These changes ensure that the Media Pulse application can be successfully deployed and run in both Replit and Cloud Run environments without modification, providing a consistent experience regardless of the deployment platform.