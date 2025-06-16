/**
 * Unified Server for Replit Environment
 * 
 * This script implements a simplified Express server that:
 * 1. Avoids the ENOSPC errors by not using nodemon/file watchers
 * 2. Serves both the API and the frontend on a single port
 * 3. Works with Replit's proxy system
 * 4. Connects to the database and provides WebSocket support
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
const isDev = process.env.NODE_ENV !== 'production';
const isReplit = process.env.REPL_ID !== undefined;

// Create Express app
const app = express();

// Use port 3000 which is Replit's official port for web applications
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for Replit
app.use((req, res, next) => {
  // Allow requests from any origin in development
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Serve static files
app.use(express.static('server/public'));
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    isReplit: process.env.REPL_ID !== undefined,
    replitId: process.env.REPL_ID || 'n/a'
  });
});

// Port info endpoint
app.get('/port-info', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    serverTime: new Date().toISOString(),
    port: PORT,
    host: req.hostname,
    url: req.protocol + '://' + req.get('host') + req.originalUrl,
    environment: process.env.NODE_ENV || 'development',
    replitId: process.env.REPL_ID || 'n/a'
  });
});

// WebSocket test page
app.get('/websocket-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/websocket-test.html'));
});

// Welcome page
app.get('/_welcome', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Media Pulse - Welcome</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .card { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #007bff; 
                 color: white; text-decoration: none; border-radius: 4px; }
        .info { color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Media Pulse</h1>
        <div class="card">
          <h2>Media Intelligence Platform</h2>
          <p>Comprehensive monitoring and digital content management system with advanced sentiment analysis.</p>
          <p class="info">Server running on port ${PORT}</p>
          <p>
            <a href="/websocket-test" class="button">WebSocket Test</a>
            <a href="/health" class="button">Health Check</a>
            <a href="/port-info" class="button">Port Info</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Setup Vite development middleware
async function setupDevelopmentServer() {
  try {
    if (isDev) {
      console.log('Setting up Vite development middleware...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        configFile: path.resolve(__dirname, 'vite.config.ts'),
      });
      
      app.use(vite.middlewares);
      console.log('Vite middleware configured successfully');
    } else {
      console.log('Running in production mode, serving static files');
      const distPath = path.resolve(__dirname, 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('/*', (req, res) => {
          res.sendFile(path.resolve(distPath, 'index.html'));
        });
      } else {
        console.warn(`Warning: Production build directory not found at ${distPath}`);
      }
    }
  } catch (error) {
    console.error('Error setting up development server:', error);
  }
}

// Root redirect to welcome page
app.get('/', (req, res) => {
  res.redirect('/_welcome');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start server asynchronously
async function startServer() {
  try {
    // Set up Vite integration for frontend
    await setupDevelopmentServer();
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Create WebSocket server
    const wss = new WebSocketServer({ server, path: '/ws' });
    
    // WebSocket connection handling
    wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      
      ws.on('message', (message) => {
        console.log('Received:', message.toString());
        
        // Echo the message back
        ws.send(JSON.stringify({
          type: 'echo',
          message: message.toString(),
          timestamp: new Date().toISOString()
        }));
      });
      
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Media Pulse WebSocket Server',
        timestamp: new Date().toISOString()
      }));
    });
    
    // Start the server
    server.listen(PORT, HOST, () => {
      console.log(`⚡ Unified server running on http://${HOST}:${PORT}`);
      console.log(`🔌 WebSocket server available at ws://${HOST}:${PORT}/ws`);
      console.log(`🖥️ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🆔 Replit ID: ${process.env.REPL_ID || 'not detected'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start everything
startServer();