import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';

// Create a simple Express server
const app = express();
const PORT = 9000; // Use a different port to avoid conflicts

// Serve the test page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'websocket-test.html'));
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server attached to HTTP server
const wss = new WebSocketServer({ 
  server, 
  path: '/ws'
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Connected to WebSocket server',
    timestamp: new Date().toISOString()
  }));
  
  // Handle messages
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    
    try {
      // Try to parse as JSON
      const data = JSON.parse(message.toString());
      
      // Echo the message back with server timestamp
      ws.send(JSON.stringify({
        type: 'echo',
        originalMessage: data,
        serverTime: new Date().toISOString()
      }));
      
      // Handle ping specifically
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
          pingReceived: data.timestamp
        }));
      }
    } catch (e) {
      // Not valid JSON, send back as text
      ws.send(JSON.stringify({
        type: 'echo',
        message: message.toString(),
        serverTime: new Date().toISOString()
      }));
    }
  });
  
  // Handle close
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Simple WebSocket test server running at http://localhost:${PORT}`);
  console.log(`WebSocket endpoint available at ws://localhost:${PORT}/ws`);
});