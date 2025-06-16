/**
 * Unified server startup script for Replit environment
 * 
 * This script starts the Express server with Vite middleware
 * instead of running both servers separately via concurrently.
 * 
 * This unified approach solves the Replit-specific issues:
 * 1. File watcher limits (ENOSPC error) that cause server crashes
 * 2. Single port exposure for external traffic
 * 3. Production deployment requirements
 * 
 * Domain: media-pulse.almstkshf.com
 */

import express from 'express';
import { createServer } from 'http';
// Use tsx to run the server in production
// This line will be replaced in the production build
// Don't use direct .ts imports in this file
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 8080;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  try {
    // Create Express app
    const app = express();
    
    // Basic middleware
    app.use(express.json());
    
    // Configure CORS for our domain
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://media-pulse.almstkshf.com',
      'https://www.media-pulse.almstkshf.com'
    ];
    
    // Add the Replit domain dynamically if we're in that environment
    const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
    if (replitDomain) {
      allowedOrigins.push(`https://${replitDomain}`);
    }
    
    app.use(cors({
      origin: allowedOrigins,
      credentials: true
    }));
    
    // Use cookie parser
    app.use(cookieParser());
    
    // Configure secure cookies for production
    app.use((req, res, next) => {
      // For cookies set in this middleware
      res.cookie = (name, value, options = {}) => {
        const isProd = process.env.NODE_ENV === 'production';
        const secure = isProd;
        
        // Set the domain based on the environment
        let domain;
        if (isProd) {
          // In production, use the actual domain
          if (req.hostname.includes('media-pulse.almstkshf.com')) {
            domain = 'media-pulse.almstkshf.com';
          } else if (req.hostname.includes('.replit.app')) {
            domain = req.hostname;
          }
        }
        
        return res.cookie(name, value, {
          httpOnly: true,
          secure,
          sameSite: 'lax',
          domain,
          ...options
        });
      };
      
      next();
    });

    // Register health check endpoint before any other middleware
    app.get('/api/health', (req, res) => {
      return res.status(200).json({
        status: "ok",
        serverTime: new Date().toISOString(),
        port: process.env.PORT || "8080",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
      });
    });
    
    // In the production-ready version of this file, we'd:
    // 1. Import the compiled JS files that are built from the TypeScript files
    // 2. However, for development with 'npm run replit', we need to use tsx
    
    // Set up middleware based on environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode - using Vite middleware');
      // In development, we use the tsx command, which handles the TypeScript imports
      try {
        // Dynamically import the setupViteMiddleware function
        const { setupViteMiddleware } = await import('./server/vite-middleware.ts');
        await setupViteMiddleware(app);
      } catch (error) {
        console.error('Failed to load Vite middleware:', error);
      }
    } else {
      console.log('Production mode - serving static files');
      // Serve static files from the build directory
      app.use(express.static(path.join(__dirname, 'dist/public')));
    }
    
    // Register API routes
    try {
      // Dynamically import the routes
      const { registerRoutes } = await import('./server/routes.ts');
      await registerRoutes(app);
    } catch (error) {
      console.error('Failed to register routes:', error);
      
      // Fallback health route if routes fail to load
      app.get('/api/status', (req, res) => {
        res.json({ status: 'minimal', error: 'Routes failed to load' });
      });
    }
    
    // Error handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });
    
    // For any other route, let Vite or static files handle it
    app.get('*', (req, res, next) => {
      if (process.env.NODE_ENV !== 'production') {
        // In development, let Vite handle it
        next();
      } else {
        // In production, serve the index.html
        res.sendFile(path.join(__dirname, 'dist/public/index.html'));
      }
    });
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Start the server
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Log the health endpoint for easy testing
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      
      // If in Replit environment, log the domain
      if (process.env.REPLIT_DOMAINS) {
        const domain = process.env.REPLIT_DOMAINS.split(',')[0];
        console.log(`🔗 Replit domain: https://${domain}`);
      }
    });
    
    // Handle server errors
    httpServer.on('error', (error) => {
      console.error('Server error:', error);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit with error code
  }
}

// Start the server
main().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});