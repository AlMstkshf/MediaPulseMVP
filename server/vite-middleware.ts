/**
 * Vite Development Server Middleware
 * 
 * This middleware integrates the Vite development server with Express
 * for a unified server approach in Replit.
 */

import { Express, Request, Response, NextFunction } from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs';

// Import only in development mode
let createViteServer: any;
if (process.env.NODE_ENV !== 'production') {
  import('vite').then(vite => {
    createViteServer = vite.createServer;
  });
}

/**
 * Setup Vite middleware for development
 */
export async function setupViteMiddleware(app: Express, root: string = '.') {
  // Check if running in development mode
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev && createViteServer) {
    // Create Vite server in middleware mode
    const vite = await createViteServer({
      root,
      server: {
        middlewareMode: true,
        hmr: {
          // Ensure HMR works in Replit
          clientPort: Number(process.env.VITE_PORT || process.env.PORT || 3000),
          port: Number(process.env.VITE_PORT || process.env.PORT || 3000),
        },
        // Make sure Vite handles all routes
        fs: {
          strict: false,
          allow: ['.']
        }
      },
      appType: 'spa'
    });
    
    // Use Vite's connect instance as middleware
    app.use(vite.middlewares);
    
    // Handle client-side routing in development mode
    // This needs to be after all API routes
    app.use('*', async (req, res, next) => {
      // Skip API routes
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      
      try {
        // Get the index.html content from Vite
        let indexHtml = fs.readFileSync(
          path.resolve(root, 'client/index.html'),
          'utf-8'
        );
        
        // Apply Vite HTML transforms
        indexHtml = await vite.transformIndexHtml(req.originalUrl, indexHtml);
        
        // Send the transformed HTML
        res.status(200).set({ 'Content-Type': 'text/html' }).end(indexHtml);
      } catch (error) {
        // If an error occurs, let Vite fix the stack trace
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
    
    console.log('Vite middleware configured in development mode');
  } else {
    // Production: Serve static files
    const clientDistPath = path.resolve(process.cwd(), 'build/client');
    
    if (fs.existsSync(clientDistPath)) {
      app.use(express.static(clientDistPath));
      
      // Handle client-side routing - serve index.html for all routes
      app.get('*', (req: Request, res: Response, next: NextFunction) => {
        // Skip API routes
        if (req.path.startsWith('/api/')) {
          return next();
        }
        
        // Serve index.html for client routes
        res.sendFile(path.join(clientDistPath, 'index.html'));
      });
      
      console.log('Static file serving configured for production build');
    } else {
      console.warn('Production build directory not found:', clientDistPath);
    }
  }
}