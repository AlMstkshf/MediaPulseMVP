/**
 * Replit WebSocket Diagnostics
 * 
 * This module provides WebSocket diagnostic utilities specifically for the Replit environment.
 * It helps in debugging WebSocket connection issues.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { Express } from 'express';
import path from 'path';
import fs from 'fs';

export class ReplitWSDiagnostics {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private httpServer: HTTPServer;
  private wsPath: string = '/ws-replit-test';
  private isReplit: boolean = process.env.REPL_ID !== undefined;
  private replitId: string = process.env.REPL_ID || 'not-in-replit';

  constructor(httpServer: HTTPServer, options?: { path?: string }) {
    this.httpServer = httpServer;
    if (options?.path) {
      this.wsPath = options.path;
    }
  }

  /**
   * Start the WebSocket diagnostics server
   */
  start(): void {
    try {
      this.wss = new WebSocketServer({ 
        server: this.httpServer, 
        path: this.wsPath,
        // This ensures clients can distinguish between connection paths
        clientTracking: true
      });
      
      this.wss.on('connection', (ws, request) => {
        const clientId = uuidv4();
        this.clients.set(clientId, ws);
        
        console.info(`Replit WS diagnostics server started on path ${this.wsPath}`);
        console.info(`Replit env: ${this.isReplit}, ID: ${this.replitId}`);
        
        // Send initial connection info
        ws.send(JSON.stringify({
          type: 'connection_info',
          clientId,
          timestamp: new Date().toISOString(),
          isReplit: this.isReplit,
          replitId: this.replitId,
          path: this.wsPath,
          remoteAddress: request.socket.remoteAddress
        }));
        
        // Handle messages
        ws.on('message', (message) => {
          try {
            const parsedMessage = JSON.parse(message.toString());
            
            // Echo back with diagnostic info
            ws.send(JSON.stringify({
              type: 'message_reply',
              clientId,
              originalMessage: parsedMessage,
              timestamp: new Date().toISOString(),
              timestamp_iso: new Date().toISOString(),
              diagnostics: {
                wsState: this.getReadyStateString(ws.readyState),
                clientCount: this.clients.size,
                isReplit: this.isReplit,
                replitId: this.replitId
              }
            }));
            
            // Handle ping
            if (parsedMessage.type === 'ping') {
              ws.send(JSON.stringify({
                type: 'pong',
                clientId,
                timestamp: new Date().toISOString(),
                originalTimestamp: parsedMessage.timestamp
              }));
            }
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to parse message',
              received: message.toString(),
              error: (error as Error).message
            }));
          }
        });
        
        // Handle close
        ws.on('close', () => {
          this.clients.delete(clientId);
          console.info(`Replit WebSocket diagnostic client disconnected: ${clientId}`);
        });
        
        // Handle errors
        ws.on('error', (error) => {
          console.error(`WebSocket error for client ${clientId}:`, error);
        });
      });
      
      console.info('Replit WebSocket diagnostics server started successfully');
    } catch (error) {
      console.error('Failed to start Replit WebSocket diagnostics server:', error);
    }
  }
  
  /**
   * Register diagnostic routes with Express
   * These routes serve HTML pages for testing WebSocket connections
   */
  registerRoutes(app: Express): void {
    // Serve the diagnostic page
    app.get('/replit-ws-test', (req, res) => {
      const html = this.generateTestHtml();
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    });
    
    // Serve WebSocket connection info
    app.get('/api/replit-ws-info', (req, res) => {
      res.json({
        isReplit: this.isReplit,
        replitId: this.replitId,
        wsPath: this.wsPath,
        wsUrl: `${req.protocol === 'https' ? 'wss' : 'ws'}://${req.get('host')}${this.wsPath}`,
        clientCount: this.clients.size,
        serverTime: new Date().toISOString()
      });
    });
  }
  
  /**
   * Generate test HTML
   */
  private generateTestHtml(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Replit WebSocket Diagnostics</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    .card {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    #connectionStatus.connected {
      color: green;
      font-weight: bold;
    }
    #connectionStatus.disconnected {
      color: red;
      font-weight: bold;
    }
    button {
      background: #4285f4;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 10px;
    }
    button:hover {
      background: #3275e4;
    }
    #logContainer {
      height: 300px;
      overflow-y: auto;
      background: #f1f1f1;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #ddd;
      font-family: monospace;
      margin-top: 20px;
    }
    .log-entry {
      margin-bottom: 5px;
      border-bottom: 1px solid #e1e1e1;
      padding-bottom: 5px;
    }
    .timestamp {
      color: #666;
      font-size: 0.8em;
    }
    .ping-stats {
      margin-top: 15px;
      font-size: 14px;
    }
    .ping-value {
      font-weight: bold;
    }
    pre {
      background: #efefef;
      padding: 10px;
      overflow-x: auto;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Replit WebSocket Diagnostics</h1>
  
  <div class="card">
    <h2>Connection Status</h2>
    <p>Status: <span id="connectionStatus" class="disconnected">Disconnected</span></p>
    <p>Connection Info: <span id="connectionInfo">Not connected</span></p>
    
    <button id="connectBtn">Connect</button>
    <button id="disconnectBtn" disabled>Disconnect</button>
  </div>
  
  <div class="card">
    <h2>Test Actions</h2>
    <button id="pingBtn" disabled>Send Ping</button>
    <button id="echoBtn" disabled>Send Echo Message</button>
    <button id="clearLogsBtn">Clear Logs</button>
    
    <div class="ping-stats">
      <p>Last Ping: <span id="lastPing" class="ping-value">-</span></p>
      <p>Min Ping: <span id="minPing" class="ping-value">-</span></p>
      <p>Max Ping: <span id="maxPing" class="ping-value">-</span></p>
      <p>Avg Ping: <span id="avgPing" class="ping-value">-</span></p>
    </div>
  </div>
  
  <div class="card">
    <h2>Connection Logs</h2>
    <div id="logContainer"></div>
  </div>
  
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // Elements
      const connectBtn = document.getElementById('connectBtn');
      const disconnectBtn = document.getElementById('disconnectBtn');
      const pingBtn = document.getElementById('pingBtn');
      const echoBtn = document.getElementById('echoBtn');
      const clearLogsBtn = document.getElementById('clearLogsBtn');
      const connectionStatus = document.getElementById('connectionStatus');
      const connectionInfo = document.getElementById('connectionInfo');
      const logContainer = document.getElementById('logContainer');
      const lastPingEl = document.getElementById('lastPing');
      const minPingEl = document.getElementById('minPing');
      const maxPingEl = document.getElementById('maxPing');
      const avgPingEl = document.getElementById('avgPing');
      
      // Variables
      let socket = null;
      let pings = [];
      let clientId = null;
      
      // Get WebSocket URL
      function getWebSocketUrl() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return \`\${protocol}//\${window.location.host}/ws-replit-test\`;
      }
      
      // Connect to WebSocket
      function connect() {
        try {
          const wsUrl = getWebSocketUrl();
          log('info', \`Connecting to WebSocket at \${wsUrl}...\`);
          
          socket = new WebSocket(wsUrl);
          
          socket.onopen = () => {
            connectionStatus.textContent = 'Connected';
            connectionStatus.className = 'connected';
            connectionInfo.textContent = \`Connected to \${wsUrl}\`;
            
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;
            pingBtn.disabled = false;
            echoBtn.disabled = false;
            
            log('success', 'WebSocket connection established');
          };
          
          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              
              if (data.type === 'connection_info') {
                clientId = data.clientId;
                connectionInfo.textContent = \`Connected as client \${clientId}\`;
                log('info', \`Connection info received: Client ID \${clientId}\`);
                log('detail', \`Full connection info: \${JSON.stringify(data, null, 2)}\`);
              } else if (data.type === 'pong') {
                const sentTime = new Date(data.originalTimestamp).getTime();
                const receivedTime = new Date().getTime();
                const pingTime = receivedTime - sentTime;
                
                pings.push(pingTime);
                updatePingStats();
                
                log('success', \`Pong received: \${pingTime}ms\`);
              } else if (data.type === 'message_reply') {
                log('info', \`Message reply: \${JSON.stringify(data.originalMessage)}\`);
                log('detail', \`Full reply: \${JSON.stringify(data, null, 2)}\`);
              } else if (data.type === 'error') {
                log('error', \`Server error: \${data.message}\`);
              } else {
                log('info', \`Received message: \${event.data}\`);
              }
            } catch (error) {
              log('error', \`Failed to parse message: \${error.message}\`);
            }
          };
          
          socket.onclose = (event) => {
            connectionStatus.textContent = 'Disconnected';
            connectionStatus.className = 'disconnected';
            connectionInfo.textContent = \`Connection closed with code \${event.code}\`;
            
            connectBtn.disabled = false;
            disconnectBtn.disabled = true;
            pingBtn.disabled = true;
            echoBtn.disabled = true;
            
            log('warning', \`WebSocket connection closed with code \${event.code}\`);
          };
          
          socket.onerror = (error) => {
            log('error', \`WebSocket error: \${error}\`);
          };
        } catch (error) {
          log('error', \`Connection error: \${error.message}\`);
        }
      }
      
      // Disconnect WebSocket
      function disconnect() {
        if (socket) {
          socket.close();
          socket = null;
        }
      }
      
      // Send ping message
      function sendPing() {
        if (socket && socket.readyState === WebSocket.OPEN) {
          const pingData = {
            type: 'ping',
            timestamp: new Date().toISOString(),
            clientId: clientId
          };
          
          socket.send(JSON.stringify(pingData));
          log('info', 'Ping sent');
        } else {
          log('error', 'Cannot send ping: WebSocket not connected');
        }
      }
      
      // Send echo message
      function sendEcho() {
        if (socket && socket.readyState === WebSocket.OPEN) {
          const message = {
            type: 'echo',
            text: 'Hello from Replit diagnostic client!',
            timestamp: new Date().toISOString(),
            clientId: clientId
          };
          
          socket.send(JSON.stringify(message));
          log('info', \`Echo message sent: \${JSON.stringify(message)}\`);
        } else {
          log('error', 'Cannot send message: WebSocket not connected');
        }
      }
      
      // Update ping statistics
      function updatePingStats() {
        if (pings.length === 0) return;
        
        const lastPing = pings[pings.length - 1];
        const minPing = Math.min(...pings);
        const maxPing = Math.max(...pings);
        const avgPing = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
        
        lastPingEl.textContent = \`\${lastPing} ms\`;
        minPingEl.textContent = \`\${minPing} ms\`;
        maxPingEl.textContent = \`\${maxPing} ms\`;
        avgPingEl.textContent = \`\${avgPing} ms\`;
      }
      
      // Log a message
      function log(level, message) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        const content = document.createElement('div');
        
        if (level === 'detail') {
          // For detailed logs, use a pre element
          const pre = document.createElement('pre');
          pre.textContent = message;
          content.appendChild(pre);
        } else {
          content.textContent = \`[\${level.toUpperCase()}] \${message}\`;
        }
        
        entry.appendChild(timestamp);
        entry.appendChild(content);
        
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
      }
      
      // Event listeners
      connectBtn.addEventListener('click', connect);
      disconnectBtn.addEventListener('click', disconnect);
      pingBtn.addEventListener('click', sendPing);
      echoBtn.addEventListener('click', sendEcho);
      clearLogsBtn.addEventListener('click', () => {
        logContainer.innerHTML = '';
      });
      
      // Fetch connection info on load
      fetch('/api/replit-ws-info')
        .then(response => response.json())
        .then(info => {
          log('info', \`Server info: \${JSON.stringify(info, null, 2)}\`);
        })
        .catch(error => {
          log('error', \`Failed to fetch server info: \${error.message}\`);
        });
    });
  </script>
</body>
</html>
    `;
  }
  
  /**
   * Convert WebSocket ready state to string
   */
  private getReadyStateString(readyState: number): string {
    switch (readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return `UNKNOWN (${readyState})`;
    }
  }
  
  /**
   * Broadcast a message to all connected clients
   */
  broadcast(message: any): number {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    let count = 0;
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
        count++;
      }
    });
    
    return count;
  }
  
  /**
   * Close the WebSocket server
   */
  close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          this.wss = null;
          this.clients.clear();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

export default ReplitWSDiagnostics;