# Deployment Guide for Media Pulse

This document provides instructions for deploying the Media Pulse application on various platforms including Replit and Cloud Run.

## Prerequisites

- All project dependencies installed
- PostgreSQL database configured
  - Automatically provided by Replit
  - Must be provisioned separately for Cloud Run

## Deployment Structure

The application requires the following directory structure for deployment:

```
build/
├── client/           # Client-side static files
│   ├── index.html    # Entry point for client application
│   ├── assets/       # Static assets (CSS, JS, images)
│   └── ...
└── server/           # Server-side code
    ├── index.js      # Server entry point
    └── ...
```

## Multi-Environment Support

The deployment script and server code have been designed to work seamlessly across different environments:

### Replit
- Uses port 5000 by default
- Static files served from build/client
- Automatically detects the Replit environment via REPL_ID environment variable

### Cloud Run
- Uses port 8080 as required by Cloud Run
- Automatically detects Cloud Run via K_SERVICE environment variable
- Configures environment-specific settings

### Local/Custom Environments
- Adapts based on PORT environment variable
- Falls back to appropriate defaults when environment variables are not set

## Deployment Process

### Using the Deployment Script (Recommended)

1. Run the deployment script:

```bash
./deploy.sh
```

This script automatically:
- Detects the deployment environment (Replit, Cloud Run, or other)
- Builds the application with production settings
- Fixes the directory structure for proper static file serving
- Creates environment-specific configurations
- Verifies the build is ready for deployment

2. Deploy according to your platform:
   - **Replit**: Click the "Deploy" button in the Replit interface
   - **Cloud Run**: Use `gcloud run deploy` or the Google Cloud Console
   - **Other platforms**: Follow your platform's deployment procedures

### Manual Deployment

If you need to perform a manual deployment:

1. Build the application:
```bash
NODE_ENV=production npm run build
```

2. Fix the build structure:
```bash
node scripts/fix-build.js
```

3. Deploy according to your platform.

## Environment Variables

The following environment variables are important for production:

```
# Server Configuration
NODE_ENV=production    # Set to "production" in all production environments
PORT=5000              # Default for Replit, use 8080 for Cloud Run

# Database Configuration
DATABASE_URL=          # PostgreSQL connection string

# API Keys
OPENAI_API_KEY=        # OpenAI API key for NLP functionality
GOOGLE_API_KEY=        # Google Cloud API key for NLP
AWS_ACCESS_KEY_ID=     # AWS access key for Comprehend
AWS_SECRET_ACCESS_KEY= # AWS secret key for Comprehend
```

## Asset Path Resolution

The application has been enhanced to intelligently locate static assets by checking multiple possible locations:

1. `build/client` (primary location)
2. `build/server/public` (symlinked location)
3. `dist/public` (Vite default output)
4. `public` (fallback)
5. `client` (development fallback)

This ensures the app can find static assets regardless of the deployment environment or build process variations.

## Port Configuration

The server automatically determines the correct port to use:
- Checks the PORT environment variable first
- Uses 8080 if running in Cloud Run
- Falls back to 5000 in all other environments

## Troubleshooting

### Common Issues

1. **Missing Database Connection**: 
   Make sure the DATABASE_URL environment variable is correctly set for your environment.

2. **Incorrect Directory Structure**:
   Run `node scripts/fix-build.js` to fix the directory structure.

3. **Missing API Keys**:
   Ensure all necessary API keys are set in the environment variables.

4. **Static Files Not Found**:
   The application now attempts to find static files in multiple locations. If you're still having issues:
   - Check that the build directory contains the expected files
   - Verify that `build/client/index.html` exists
   - Run the deployment script again

5. **Port Conflicts**:
   The server now attempts to automatically increment the port if the preferred port is already in use.

## Maintenance

After deploying, you can monitor the application logs through your platform's logging interface:
- Replit: Dashboard logs
- Cloud Run: Cloud Logging

## Continuous Deployment

For continuous deployment:
- **Replit**: Set up GitHub integration
- **Cloud Run**: Configure Cloud Build triggers
- **Custom CI/CD**: Ensure the pipeline runs `deploy.sh` before deployment