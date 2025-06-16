/**
 * Simplified Express server for Replit environment without TypeScript dependencies
 * This script avoids the file watcher limits in Replit that cause ENOSPC errors
 * 
 * This version specifically runs on port 5000 to ensure it works in Replit.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Try to use port 5000 (Replit), with fallbacks
const PREFERRED_PORT = 5000;
const PORT = process.env.PORT || PREFERRED_PORT || 3000;

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    serverTime: new Date().toISOString(),
    port: PORT,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    replitId: process.env.REPL_ID || null
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
    nodeEnv: process.env.NODE_ENV || 'development',
    replitId: process.env.REPL_ID || null
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

// Root redirect to welcome page
app.get('/', (req, res) => {
  res.redirect('/_welcome');
});

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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ Replit-friendly server running on http://0.0.0.0:${PORT}`);
  console.log(`🔌 WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
  console.log(`🖥️ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🆔 Replit ID: ${process.env.REPL_ID || 'not detected'}`);
});