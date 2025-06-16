/**
 * Simple Express server to serve WebSocket test pages
 * This script avoids the file watcher limits in Replit
 */

import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import { WebSocketServer } from 'ws';

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({
  server,
  path: '/ws'
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Send a welcome message
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Welcome to Media Pulse WebSocket Server',
    timestamp: new Date().toISOString()
  }));
  
  // Handle messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);
      
      // Echo the message back
      const response = {
        type: 'echo',
        originalMessage: data,
        timestamp: new Date().toISOString()
      };
      
      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Create another WebSocket server for Replit testing
const replitWss = new WebSocketServer({
  server,
  path: '/ws-replit-test'
});

// Handle Replit WebSocket connections
replitWss.on('connection', (ws) => {
  console.log('Replit WebSocket client connected');
  
  // Send a welcome message
  ws.send(JSON.stringify({
    type: 'connection_info',
    message: 'Connected to Replit WebSocket Server',
    timestamp: new Date().toISOString(),
    environment: {
      isReplit: true,
      serverTime: Date.now()
    }
  }));
  
  // Handle messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Replit WS Received:', data);
      
      // Echo the message back
      const response = {
        type: 'echo',
        originalMessage: data,
        timestamp: new Date().toISOString()
      };
      
      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error processing Replit WS message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('Replit WebSocket client disconnected');
  });
});

// Serve static files
app.use(express.static('server/public'));

// Serve WebSocket test page
app.get('/websocket-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/websocket-test.html'));
});

// Serve Replit WebSocket test page
app.get('/replit-ws-test', (req, res) => {
  const protocol = req.secure ? 'wss:' : 'ws:';
  const host = req.headers.host || 'localhost:5000';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Replit WebSocket Test</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
      .container { max-width: 800px; margin: 0 auto; }
      .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
      .connected { background-color: #d4edda; color: #155724; }
      .disconnected { background-color: #f8d7da; color: #721c24; }
      #messages { height: 300px; border: 1px solid #ddd; padding: 10px; overflow-y: auto; margin: 10px 0; }
      .button { padding: 8px 15px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
      .primary { background-color: #007bff; color: white; }
      .secondary { background-color: #6c757d; color: white; }
      input[type="text"] { padding: 8px; width: 100%; margin: 5px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Replit WebSocket Test</h1>
      
      <div class="info-box">
        <p><strong>WebSocket URL:</strong> <code id="wsUrl">${protocol}//${host}/ws-replit-test</code></p>
        <p><strong>Connection status:</strong> <span id="connectionStatus">Disconnected</span></p>
      </div>
      
      <div id="status" class="status disconnected">Status: Disconnected</div>
      
      <div>
        <button id="connectBtn" class="button primary">Connect</button>
        <button id="disconnectBtn" class="button secondary" disabled>Disconnect</button>
        <button id="pingBtn" class="button secondary" disabled>Send Ping</button>
      </div>
      
      <h3>Messages:</h3>
      <div id="messages"></div>
    </div>
    
    <script>
      // DOM Elements
      const statusEl = document.getElementById('status');
      const connectBtn = document.getElementById('connectBtn');
      const disconnectBtn = document.getElementById('disconnectBtn');
      const pingBtn = document.getElementById('pingBtn');
      const messagesEl = document.getElementById('messages');
      const connectionStatusEl = document.getElementById('connectionStatus');
      
      // WebSocket reference
      let socket = null;
      
      // Get WebSocket URL from display
      const wsUrl = document.getElementById('wsUrl').textContent;
      
      // Helper Functions
      function updateStatus(connected) {
        if (connected) {
          statusEl.textContent = 'Status: Connected';
          statusEl.className = 'status connected';
          connectionStatusEl.textContent = 'Connected';
          connectionStatusEl.style.color = '#28a745';
          connectBtn.disabled = true;
          disconnectBtn.disabled = false;
          pingBtn.disabled = false;
        } else {
          statusEl.textContent = 'Status: Disconnected';
          statusEl.className = 'status disconnected';
          connectionStatusEl.textContent = 'Disconnected';
          connectionStatusEl.style.color = '#dc3545';
          connectBtn.disabled = false;
          disconnectBtn.disabled = true;
          pingBtn.disabled = true;
        }
      }
      
      function addMessage(message, fromServer = true) {
        const msgEl = document.createElement('div');
        msgEl.style.padding = '5px';
        msgEl.style.borderBottom = '1px solid #eee';
        
        let content;
        if (typeof message === 'object') {
          content = JSON.stringify(message, null, 2);
        } else {
          content = message;
        }
        
        const timestamp = new Date().toLocaleTimeString();
        msgEl.textContent = \`[\${timestamp}] \${fromServer ? '← ' : '→ '}\${content}\`;
        msgEl.style.color = fromServer ? '#006400' : '#00008B';
        
        messagesEl.appendChild(msgEl);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
      
      // Event Handlers
      connectBtn.addEventListener('click', () => {
        try {
          addMessage('Connecting to ' + wsUrl, false);
          
          // Create WebSocket connection
          socket = new WebSocket(wsUrl);
          
          socket.onopen = () => {
            updateStatus(true);
            addMessage('Connection established');
          };
          
          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              addMessage(data);
            } catch (e) {
              addMessage(event.data);
            }
          };
          
          socket.onclose = () => {
            updateStatus(false);
            addMessage('Connection closed');
            socket = null;
          };
          
          socket.onerror = (error) => {
            updateStatus(false);
            addMessage('WebSocket error: ' + JSON.stringify(error));
          };
        } catch (error) {
          updateStatus(false);
          addMessage('Failed to create WebSocket: ' + error.message);
        }
      });
      
      disconnectBtn.addEventListener('click', () => {
        if (socket) {
          socket.close();
        }
      });
      
      pingBtn.addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          const pingMessage = {
            type: 'ping',
            timestamp: new Date().toISOString(),
            client: navigator.userAgent
          };
          
          socket.send(JSON.stringify(pingMessage));
          addMessage(pingMessage, false);
        } else {
          addMessage('Cannot send ping: WebSocket is not connected', false);
        }
      });
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`Simple WebSocket server listening at http://0.0.0.0:${port}`);
  console.log(`WebSocket endpoints: ws://0.0.0.0:${port}/ws and ws://0.0.0.0:${port}/ws-replit-test`);
  console.log(`Test pages: http://0.0.0.0:${port}/websocket-test and http://0.0.0.0:${port}/replit-ws-test`);
});