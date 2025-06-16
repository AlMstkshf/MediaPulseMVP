/**
 * Media Pulse - Simplified Production Server for Replit
 * 
 * This server handles both API and frontend serving without
 * port conflicts or file watcher issues.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Use port 3000 for Replit compatibility
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Detect Replit environment
const isReplit = process.env.REPL_ID !== undefined;
const replitId = process.env.REPL_ID || 'unknown';

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure static files
const staticDir = path.join(__dirname, 'client', 'dist');
const staticDirExists = fs.existsSync(staticDir);

// In production, serve static files from the build directory
if (process.env.NODE_ENV === 'production' && staticDirExists) {
  console.log('Running in production mode, serving static files');
  app.use(express.static(staticDir));
} else {
  console.log('Running in development mode or static files not built');
}

// Add server monitoring routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
    replit: isReplit,
    replitId: replitId,
    timestamp: new Date().toISOString()
  });
});

app.get('/port-info', (req, res) => {
  res.json({
    port: PORT,
    host: HOST,
    url: `http://${HOST}:${PORT}`,
    env: process.env.NODE_ENV || 'development'
  });
});

// Add welcome page
app.get('/_welcome', (req, res) => {
  const welcomeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Media Pulse Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .container { background: #f8f9fa; border-radius: 10px; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { background: #e9ecef; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .button { display: inline-block; background: #007bff; color: white; padding: 8px 16px; 
                   border-radius: 5px; text-decoration: none; margin: 5px; }
          .button:hover { background: #0069d9; }
          .buttons { margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Media Pulse Server</h1>
            <p>The server is running in ${process.env.NODE_ENV || 'development'} mode</p>
          </div>
          <p class="info">Server running on port ${PORT}</p>
          <p class="info">Replit environment: ${isReplit ? 'Yes' : 'No'}</p>
          <p class="info">Replit ID: ${replitId}</p>
          <div class="buttons">
            <a href="/health" class="button">Health Check</a>
            <a href="/port-info" class="button">Port Info</a>
            <a href="/api/hello" class="button">API Test</a>
            <a href="/websocket-test" class="button">WebSocket Test</a>
          </div>
        </div>
      </body>
    </html>
  `;
  res.send(welcomeHtml);
});

// Add a test API endpoint
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// WebSocket diagnostic test page
app.get('/websocket-test', (req, res) => {
  const wsTestHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>WebSocket Test</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          #status { margin: 20px 0; padding: 10px; border-radius: 5px; }
          .connected { background: #d4edda; color: #155724; }
          .disconnected { background: #f8d7da; color: #721c24; }
          .message { background: #e9ecef; padding: 10px; margin: 10px 0; border-radius: 5px; }
          button { background: #007bff; color: white; border: none; padding: 8px 16px; 
                  border-radius: 5px; cursor: pointer; margin-right: 10px; }
          button:hover { background: #0069d9; }
          #log { height: 200px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>WebSocket Test</h1>
        <div id="status" class="disconnected">Disconnected</div>
        <div>
          <button id="connectBtn">Connect</button>
          <button id="disconnectBtn" disabled>Disconnect</button>
          <button id="sendBtn" disabled>Send Test Message</button>
        </div>
        <div>
          <h3>Connection Log:</h3>
          <div id="log"></div>
        </div>
        
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const statusDiv = document.getElementById('status');
            const connectBtn = document.getElementById('connectBtn');
            const disconnectBtn = document.getElementById('disconnectBtn');
            const sendBtn = document.getElementById('sendBtn');
            const logDiv = document.getElementById('log');
            
            let socket = null;
            
            function log(message) {
              const entry = document.createElement('div');
              entry.className = 'message';
              entry.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
              logDiv.appendChild(entry);
              logDiv.scrollTop = logDiv.scrollHeight;
            }
            
            function connect() {
              const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
              const wsUrl = \`\${protocol}//\${window.location.host}/ws\`;
              
              log(\`Connecting to \${wsUrl}...\`);
              
              try {
                socket = new WebSocket(wsUrl);
                
                socket.onopen = () => {
                  statusDiv.textContent = 'Connected';
                  statusDiv.className = 'connected';
                  connectBtn.disabled = true;
                  disconnectBtn.disabled = false;
                  sendBtn.disabled = false;
                  
                  log('Connection established');
                };
                
                socket.onmessage = (event) => {
                  log(\`Received: \${event.data}\`);
                };
                
                socket.onclose = (event) => {
                  statusDiv.textContent = 'Disconnected';
                  statusDiv.className = 'disconnected';
                  connectBtn.disabled = false;
                  disconnectBtn.disabled = true;
                  sendBtn.disabled = true;
                  
                  log(\`Connection closed: Code \${event.code}\`);
                };
                
                socket.onerror = (error) => {
                  log(\`Error: \${error}\`);
                };
              } catch (error) {
                log(\`Failed to connect: \${error.message}\`);
              }
            }
            
            function disconnect() {
              if (socket) {
                socket.close();
                socket = null;
              }
            }
            
            function sendMessage() {
              if (socket && socket.readyState === WebSocket.OPEN) {
                const message = {
                  type: 'test',
                  content: 'Hello from WebSocket Test',
                  timestamp: new Date().toISOString()
                };
                
                socket.send(JSON.stringify(message));
                log(\`Sent: \${JSON.stringify(message)}\`);
              } else {
                log('Cannot send message: Not connected');
              }
            }
            
            connectBtn.addEventListener('click', connect);
            disconnectBtn.addEventListener('click', disconnect);
            sendBtn.addEventListener('click', sendMessage);
          });
        </script>
      </body>
    </html>
  `;
  res.send(wsTestHtml);
});

// In production, serve index.html for client-side routing
app.get('*', (req, res, next) => {
  // Skip API routes and existing static files
  if (req.path.startsWith('/api/') || req.path.startsWith('/_') || req.path === '/health' || req.path === '/port-info') {
    return next();
  }
  
  if (process.env.NODE_ENV === 'production' && staticDirExists) {
    res.sendFile(path.join(staticDir, 'index.html'));
  } else {
    res.redirect('/_welcome');
  }
});

// Create HTTP server
const server = http.createServer(app);

// Basic WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    
    try {
      // Echo the message back
      ws.send(JSON.stringify({
        type: 'echo',
        originalMessage: JSON.parse(message.toString()),
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to parse message',
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`⚡ Unified server running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server available at ws://${HOST}:${PORT}/ws`);
  console.log(`🖥️ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🆔 Replit ID: ${replitId}`);
});