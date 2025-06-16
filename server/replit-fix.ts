/**
 * Replit-specific fixes for the Media Intelligence Platform
 * 
 * This module handles special configurations and fixes required to run the application
 * properly in the Replit environment.
 */

import { Express } from 'express';
import { setupViteMiddleware } from './vite-middleware';
import { logger } from './logger';

/**
 * Check if the app is running in Replit environment
 * We use the REPL_ID environment variable to determine this
 */
export function isRunningInReplit(): boolean {
  return !!process.env.REPL_ID;
}

/**
 * Get the Replit hostname if running in Replit
 */
export function getReplitHostname(): string | undefined {
  if (process.env.REPLIT_DOMAINS) {
    return process.env.REPLIT_DOMAINS.split(',')[0];
  }
  return undefined;
}

/**
 * Apply Replit-specific fixes to the Express app
 */
export async function applyReplitFixes(app: Express) {
  if (!isRunningInReplit()) {
    logger.info('Not running in Replit, skipping Replit-specific fixes');
    return;
  }

  // Log Replit environment details
  logger.info(`Running in Replit: ${process.env.REPL_ID}`);
  
  // 1. Set up Vite middleware to serve frontend from the Express server
  try {
    await setupViteMiddleware(app);
    logger.info('Vite middleware configured for Replit environment');
  } catch (error) {
    logger.error('Failed to set up Vite middleware:', error);
  }

  // 2. Set up environment variables for client
  createClientEnvFile();
  
  // Log success
  logger.info('Applied Replit-specific fixes');
}

/**
 * Create a .env.client file with configuration for the client
 * This ensures the frontend can connect to the backend properly
 */
function createClientEnvFile() {
  import('fs').then(fs => {
    import('path').then(path => {
      const envPath = path.resolve(process.cwd(), '.env.client');
      const hostname = getReplitHostname();
      
      if (!hostname) {
        logger.warn('Unable to determine Replit hostname for client configuration');
        return;
      }
      
      const content = `# Auto-generated client environment file for Replit
VITE_API_BASE_URL=https://${hostname}
VITE_WS_URL=wss://${hostname}
`;
      
      try {
        fs.writeFileSync(envPath, content);
        logger.info('Created client environment file for Replit');
      } catch (error) {
        logger.error('Failed to create client environment file:', error);
      }
    });
  });
}