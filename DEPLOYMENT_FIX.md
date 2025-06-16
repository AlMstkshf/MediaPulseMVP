# Deployment Fixes for Media Pulse Dashboard

This document outlines fixes for the deployment issues identified in the application.

## Fixed Issues

### 1. Rasa NLU Service Connection Failure

**Problem**: Application was failing when connecting to Rasa NLU service at 127.0.0.1:5005.

**Solution**: 
- Implemented a resilient Rasa service adapter with built-in fallbacks
- Added configuration options through environment variables:
  - `DISABLE_RASA=true` to completely disable Rasa dependency
  - `RASA_HOST` and `RASA_PORT` to configure connection
  - `RASA_TIMEOUT` to prevent hanging on connection attempts
- Service now gracefully degrades with basic NLP capabilities when Rasa is unavailable

### 2. Port Configuration

**Problem**: Server was listening on port 5000, but production environments might require different ports.

**Solution**:
- Updated port configuration in `server/config.ts` to be configurable via environment variables
- Added logic to detect production environments for proper port selection
- Server now correctly binds to the appropriate port when deployed

### 3. Application Crashes

**Problem**: Application crashed due to missing Rasa NLU service.

**Solution**:
- Implemented proper error handling throughout the application
- Added fallback mechanisms for NLP functions that previously relied on Rasa
- Improved startup sequence to be resilient to missing services

### 4. Memory Management

**Problem**: Application occasionally crashes with "JavaScript heap out of memory" errors.

**Solution**:
- Added memory management configuration through environment variables
- Created a production startup script `start-production.sh` that sets appropriate memory limits
- Set `NODE_OPTIONS="--max-old-space-size=2048"` to cap memory usage and prevent OOM crashes
- Added graceful error handling for memory-related issues

## Deployment Instructions for Replit

1. Copy the `deployment.env` file to `.env` in your production environment
2. Make sure to set `DISABLE_RASA=true` unless you have a Rasa server available
3. Use the `start-production.sh` script to start the application in production
   ```bash
   # Make sure the script is executable
   chmod +x start-production.sh
   
   # Run the production startup script
   ./start-production.sh
   ```
4. Set up the Replit deployment:
   - Set the Run command to `./start-production.sh`
   - Add all environment variables from the `deployment.env` file
   - Add `NODE_OPTIONS="--max-old-space-size=2048"` environment variable
   - Set the `DATABASE_URL` environment variable to your PostgreSQL connection string
   - Enable "Always On" to keep the application running

## Memory Management

To prevent "JavaScript heap out of memory" errors:

1. Use the `NODE_OPTIONS="--max-old-space-size=2048"` environment variable to limit heap size
2. Monitor memory usage in Replit system metrics
3. Implement garbage collection best practices:
   - Avoid memory leaks by releasing references to large objects
   - Be careful with cache sizes and limit stored objects
   - Periodically check memory usage and implement automatic cleanup

## Verifying Deployment

After deployment, check the logs for:
- Confirmation that the server is listening on the correct port
- Messages indicating NLP services initialized with fallback enabled
- No connection errors related to Rasa
- No memory-related warnings or errors

The application should now run successfully on Replit without any dependency on Rasa NLU service and with proper memory management.