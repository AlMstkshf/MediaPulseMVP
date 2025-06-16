/**
 * Enhanced CORS Configuration for Replit Environments
 * 
 * This module ensures that CORS is properly configured for Replit, addressing
 * common issues with Replit's proxying and domain handling.
 */

import { type Request, type Response, type NextFunction } from 'express';
import { log } from './vite';

/**
 * Configure proper CORS settings for the Replit environment
 * This function handles the complex CORS requirements for Replit deployments
 */
export function setupCORSForReplit(req: Request, res: Response, next: NextFunction) {
  // Get the request origin
  const origin = req.headers.origin;
  
  // Get the host from the request
  const host = req.headers.host || '';
  
  // Check if we're running in Replit
  const isReplit = process.env.REPL_ID !== undefined;
  
  // Log the host for debugging
  if (host) {
    log(`Using host ${host}, session cookie domain: not set (using current domain)`);
  }
  
  // Allow all origins in development mode
  if (origin) {
    // Handle Replit domains
    if (isReplit && (
      origin.includes('.replit.dev') || 
      origin.includes('.sisko.replit.dev') || 
      origin.includes('.repl.co')
    )) {
      log(`CORS dev mode: Allowing origin ${origin} in Replit development environment`);
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      // For non-Replit or other environments, use a more restrictive approach
      // But still allow localhost for development
      const allowedOrigins = [
        'http://localhost:5000',
        'https://localhost:5000',
        'http://0.0.0.0:5000',
        'https://0.0.0.0:5000',
      ];
      
      if (allowedOrigins.includes(origin) || 
          origin.includes('.replit.dev') || 
          origin.includes('.sisko.replit.dev') ||
          origin.includes('.repl.co')) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
      }
    }
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return next();
}