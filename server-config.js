/**
 * Server Configuration for Replit Environment
 * 
 * This file contains configuration settings for the simplified server
 * specifically designed to work in the Replit environment.
 */

// Force port to 3000 for Replit compatibility
export const PORT = 3000;

// Host configuration - listen on all interfaces
export const HOST = '0.0.0.0';

// Environment detection
export const isProduction = process.env.NODE_ENV === 'production';
export const isReplit = process.env.REPL_ID !== undefined;

// CORS allowed origins
export const CORS_ORIGINS = [
  'http://localhost:5000',
  'https://localhost:5000',
  'http://0.0.0.0:5000',
  'https://0.0.0.0:5000',
  'https://rhalftn.replit.app',
  'https://media-pulse.almstkshf.com',
  '*', // Allow all origins for testing
  // Add Replit specific domains
  /^https:\/\/.*\.replit\.dev$/,
  /^https:\/\/.*\.sisko\.replit\.dev$/
];

// Static paths
export const STATIC_PATHS = [
  'server/public',
  'public',
  'uploads'
];

// Websocket configuration
export const WS_PATH = '/ws';

// App details
export const APP_NAME = 'media-pulse';
export const APP_VERSION = '1.0.0';