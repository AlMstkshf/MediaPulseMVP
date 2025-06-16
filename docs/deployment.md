# Deployment Guide

This document provides instructions for deploying the Media Pulse platform to production environments.

## Table of Contents

1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Building for Production](#building-for-production)
3. [Directory Structure](#directory-structure)
4. [Environment Variables](#environment-variables)
5. [Running in Production](#running-in-production)
6. [Health Checks](#health-checks)
7. [Troubleshooting](#troubleshooting)

## Pre-deployment Checklist

Before deploying, ensure:

1. All tests pass: `npm test`
2. TypeScript checks pass: `npm run type-check`
3. Linting passes: `npm run lint`
4. Security audit passes: `npm run security:audit`
5. Database migrations are ready: `npm run db:push`
6. Environment variables are configured (see [Environment Variables](#environment-variables))

## Building for Production

To build the application for production, use our custom deploy script which ensures the correct directory structure:

```bash
./deploy.sh
```

This script:
1. Runs the standard build process
2. Ensures the client and server files are in the expected directories
3. Creates any necessary symbolic links or placeholder files
4. Verifies the build structure

Alternatively, you can run our JavaScript-based build fix:

```bash
node scripts/fix-build.js
```

## Directory Structure

The deployment requires the following directory structure:

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

Our deployment scripts ensure this structure exists even if the build process outputs to different directories.

## Environment Variables

The following environment variables must be set for production:

```
# Server Configuration
NODE_ENV=production
PORT=5000                # Default port (can be changed)

# Database Configuration
DATABASE_URL=            # PostgreSQL connection string

# Session Management
SESSION_SECRET=          # Random string for session encryption
COOKIE_SECRET=           # Random string for cookie signing

# Security
CORS_ALLOWED_ORIGINS=    # Comma-separated list of allowed origins

# API Keys (if applicable)
OPENAI_API_KEY=          # OpenAI API key for NLP functionality
GOOGLE_API_KEY=          # Google Cloud API key for NLP
AWS_ACCESS_KEY_ID=       # AWS access key for Comprehend
AWS_SECRET_ACCESS_KEY=   # AWS secret key for Comprehend
AWS_REGION=              # AWS region for Comprehend

# Monitoring
SENTRY_DSN=              # Sentry error tracking URL
```

## Running in Production

To run the application in production mode:

```bash
NODE_ENV=production node build/server/index.js
```

For better reliability, use a process manager like PM2:

```bash
npm install -g pm2
pm2 start build/server/index.js --name media-pulse
```

## Health Checks

The application exposes health check endpoints:

- `/api/health` - Basic health check
- `/api/health/detailed` - Detailed system status

Include these in your monitoring and load balancer configuration.

## Troubleshooting

### Common Issues

1. **Directory structure mismatch**
   - Symptom: Server can't find client files
   - Solution: Run `./deploy.sh` to fix the directory structure

2. **Database connection issues**
   - Symptom: Server fails to start with database errors
   - Solution: Verify DATABASE_URL environment variable and network access to the database

3. **Static files not loading**
   - Symptom: Website loads but CSS/JS/images are missing
   - Solution: Check that the client files are properly built and in the `build/client` directory

4. **API errors**
   - Symptom: API calls fail with 500 errors
   - Solution: Check server logs and verify API keys and service connectivity

### Getting Help

If you encounter issues not covered here, contact the development team at:
- GitHub Issues: [report a bug](https://github.com/your-organization/media-pulse/issues)
- Email: support@mediapulse.com

## Deployment Verification

After deployment, verify:

1. The application loads and shows the login page
2. Users can authenticate
3. Dashboard loads with data
4. Real-time updates work (WebSocket connections)
5. Search functionality works
6. Social media monitoring displays data
7. Reports can be generated
8. All charts and visualizations render properly