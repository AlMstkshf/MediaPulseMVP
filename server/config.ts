/**
 * Server Configuration Module
 * 
 * This module centralizes server configuration settings to ensure consistency
 * across development and various production environments (Replit, Cloud Run, etc.)
 */

import path from 'path';
import fs from 'fs';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isReplit = process.env.REPL_ID !== undefined; // Replit sets REPL_ID
// We're focusing exclusively on Replit deployment

/**
 * Determine the correct port based on environment
 * - Replit expects PORT environment variable to be 5000
 * - Use PORT environment variable if set
 * - Otherwise use 5000 for all environments to maintain compatibility with Replit
 */
export const PORT = process.env.PORT 
  ? parseInt(process.env.PORT) 
  : 5000;

/**
 * Static content directory configuration
 * Handle different deployment environments
 */
export function getStaticPath(): string {
  // In production, look for multiple possible locations
  if (isProduction) {
    // Possible static content locations in order of preference
    const possiblePaths = [
      // Standard build/client directory (Replit default)
      path.resolve(process.cwd(), 'build', 'client'),
      // For Replit specific deployments
      path.resolve(process.cwd(), 'client'),
      // Symlinked public directory (created by our fix-build script)
      path.resolve(process.cwd(), 'build', 'server', 'public'),
      // Legacy dist/public directory
      path.resolve(process.cwd(), 'dist', 'public'),
      // Current directory's public folder
      path.resolve(process.cwd(), 'public')
    ];

    // Find the first directory that exists
    for (const staticPath of possiblePaths) {
      if (fs.existsSync(staticPath)) {
        console.log(`Using static path: ${staticPath}`);
        return staticPath;
      }
    }

    // Last resort - use the first option and let the app show an error
    console.warn(`None of the static paths exist, defaulting to ${possiblePaths[0]}`);
    return possiblePaths[0];
  }

  // In development
  return path.resolve(process.cwd(), 'client');
}

/**
 * Get CORS allowed origins based on environment
 */
export function getCorsAllowedOrigins(): Array<string | RegExp> {
  const origins: Array<string | RegExp> = [
    // Local development URLs for both ports (5000 and 8080)
    'http://localhost:5000',
    'https://localhost:5000', 
    'http://localhost:8080',
    'https://localhost:8080',
    'http://0.0.0.0:5000',
    'https://0.0.0.0:5000',
    // Production URLs
    'https://rhalftn.replit.app',
    'https://media-pulse.almstkshf.com',
    // Allow all Replit domains for development
    '*',
  ];

  // Add Replit's proxy URLs (which change with each web session)
  origins.push(/^https:\/\/.*\.replit\.dev$/);
  origins.push(/^https:\/\/.*\.sisko\.replit\.dev$/);

  // Add Replit specific domains if needed
  if (isReplit && process.env.REPL_ID) {
    // Allow connections from the specific Replit domain
    origins.push(new RegExp(`^https?://.*${process.env.REPL_ID}.*\\.sisko\\.replit\\.dev$`));
  }

  // Log the allowed origins for debugging
  console.log('CORS allowed origins:', origins);

  return origins;
}

/**
 * Get host configuration
 */
export const HOST = '0.0.0.0'; // Listen on all network interfaces

/**
 * Get application name and version
 * Used for logging and identifying the application
 */
export const APP_NAME = 'media-pulse';
export const APP_VERSION = '1.0.0';

/**
 * Get client index.html path for development
 */
export function getClientIndexPath(): string {
  if (isProduction) {
    const staticPath = getStaticPath();
    return path.resolve(staticPath, 'index.html');
  }
  
  return path.resolve(process.cwd(), 'client', 'index.html');
}