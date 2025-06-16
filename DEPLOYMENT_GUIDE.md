# Media Pulse Deployment Guide

This guide explains how to deploy the Media Pulse application to Replit and connect it to your custom domain (media-pulse.almstkshf.com).

## Latest Update (May 14, 2025)

The deployment process has been tested and optimized for the Replit environment. Key improvements include:

- Unified server approach to solve file watcher limits (ENOSPC errors)
- Proper handling of domain-specific configurations (cookies, CORS)
- Automatic integration with Replit's PostgreSQL database
- Streamlined deployment workflow with verification steps

## Prerequisites

- A Replit account with this repository imported
- Access to DNS configuration for the almstkshf.com domain
- PostgreSQL database (provided by Replit)

## Step 1: Prepare for Deployment

1. Run the deployment preparation script:
   ```bash
   ./deploy-to-replit.sh
   ```

   This script will:
   - Update the package.json with deployment-friendly scripts (adding "replit" script)
   - Generate a deployment configuration file
   - Build the application for production
   - Test that the server can start properly

2. Verify that the domain has been updated in all relevant files:
   - server/config.ts (CORS settings)
   - server/index.ts (cookie handling)
   - server-unified.js (deployment server)

## Step 2: Deploy on Replit

1. In the Replit interface, navigate to the "Deployment" tab

2. In the deployment settings, make these important changes:
   - Change the run command to: `npm run replit`
   - Make sure port 8080 is selected for the web service

3. Click the "Deploy" button in the Replit interface

4. Replit will:
   - Build your application
   - Serve it at a .replit.app domain
   - Set up HTTPS automatically

5. Once deployed, your application will be available at:
   - Replit domain: https://[your-repl-name].replit.app
   - This URL can be used for testing before connecting your custom domain

## Step 3: Connect Custom Domain

1. In Replit, go to your project settings:
   - Click on "Settings" tab
   - Scroll down to "Custom Domains"
   - Click "Add Custom Domain"
   - Enter: media-pulse.almstkshf.com

2. Follow Replit's instructions to verify domain ownership:
   - You'll need to add DNS records to your domain provider
   - Usually this involves adding a TXT record for verification
   - Then adding a CNAME record pointing to your Replit app

3. Typical DNS Configuration:
   ```
   Type    | Name                   | Value
   ---------------------------------------------------------------
   CNAME   | media-pulse            | [your-repl-name].replit.app
   ```

4. Wait for DNS propagation (can take 24-48 hours)

## Step 4: Verify Deployment

After DNS has propagated, verify that:

1. Your application is accessible at https://media-pulse.almstkshf.com

2. The application functions correctly:
   - Try logging in
   - Test main features
   - Check that all API endpoints work
   - Verify cookie domain settings work across subdomains if needed

## Troubleshooting

If you encounter issues during deployment:

1. **Server Crashes**:
   - Check server logs in Replit
   - Verify the "npm run replit" command is used in deployment settings
   - Try starting the server manually with NODE_ENV=production tsx server-unified.js

2. **File Watcher Errors (ENOSPC)**:
   - This is why we're using the unified server approach
   - Make sure you're running with "npm run replit" which uses the unified server
   - Do not use concurrently in production on Replit

3. **Domain Connection Issues**:
   - Verify DNS records are correct
   - Use https://dnschecker.org to check DNS propagation
   - Make sure SSL/TLS is enabled

4. **Cookie/Authentication Issues**:
   - Check that the domain in cookie settings matches exactly
   - Verify CORS configuration includes your domain

5. **Database Connection**:
   - Make sure Replit's database is properly connected
   - Check if migrations have been applied

## Understanding the Deployment Architecture

The deployment uses a unified server approach, which:

1. Runs a single server process instead of concurrently running separate frontend/backend servers
2. Avoids file watcher limits that cause ENOSPC errors on Replit
3. Properly handles static file serving in production mode
4. Exposes only port 8080 for external traffic

## Maintenance

For future updates:

1. Make your code changes
2. Run the deployment script again: `./deploy-to-replit.sh`
3. Click "Deploy" in Replit again

This will update your application while keeping the same domain configuration.

## Verifying Production Configuration

After deployment, check these important details:

1. **Environment**: Should be set to production
2. **Domain**: Cookies should be set for media-pulse.almstkshf.com
3. **Server**: Should be using unified approach via "npm run replit"
4. **Database**: Should connect to the Replit PostgreSQL database
5. **Session Management**: Uses PostgreSQL session store for persistence

## Security Considerations

When deploying to production, ensure:

1. **Environment Variables**: Set NODE_ENV=production
2. **Session Secret**: Use a strong, unique SESSION_SECRET
3. **Cookies**: Properly configured with secure, httpOnly flags
4. **CORS**: Properly limited to allowed domains only
5. **Authentication**: Protected routes use isAuthenticated middleware