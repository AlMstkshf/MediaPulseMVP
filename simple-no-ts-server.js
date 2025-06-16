/**
 * Simplified WebSocket server for Replit environment without TypeScript dependencies
 * This script avoids both TypeScript and file watcher limits
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure server ports
const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server: server,
  path: '/ws'
});

// Create Replit-specific WebSocket server
const replitWss = new WebSocketServer({ 
  server: server,
  path: '/ws-replit-test'
});

// In-memory clients for both servers
const clients = new Map();
const replitClients = new Map();

// Serve static test pages
app.get('/websocket-test', (req, res) => {
  const testPagePath = path.join(__dirname, 'server/public/websocket-test.html');
  
  if (fs.existsSync(testPagePath)) {
    res.sendFile(testPagePath);
  } else {
    // Embed the HTML directly if file doesn't exist
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Media Pulse WebSocket Test</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .connected { background-color: #d4edda; color: #155724; }
        .disconnected { background-color: #f8d7da; color: #721c24; }
        .connecting { background-color: #fff3cd; color: #856404; }
        #messages { height: 300px; border: 1px solid #ddd; padding: 10px; overflow-y: auto; margin: 10px 0; font-family: monospace; }
        .button { padding: 8px 15px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
        .primary { background-color: #007bff; color: white; }
        .secondary { background-color: #6c757d; color: white; }
        .warning { background-color: #ffc107; color: #000; }
        .danger { background-color: #dc3545; color: white; }
        input[type="text"] { padding: 8px; width: 100%; margin: 5px 0; }
        .info-box { background-color: #e9ecef; border-radius: 4px; padding: 10px; margin: 10px 0; }
        .control-panel { display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0; }
        .message { padding: 5px; border-bottom: 1px solid #eee; }
        .sent { color: #0066cc; }
        .received { color: #006600; }
        .system { color: #666; font-style: italic; }
        .error { color: #dc3545; }
        .debug-section { 
          background-color: #f8f9fa; 
          border: 1px solid #dee2e6; 
          border-radius: 4px; 
          padding: 10px; 
          margin: 10px 0; 
        }
        .sample-message {
          display: inline-block;
          background: #eee;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px;
          margin: 5px;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Media Pulse WebSocket Test</h1>
        
        <div class="info-box">
          <p><strong>Connection Information:</strong></p>
          <p>WebSocket URL: <code id="wsUrl">Detecting...</code></p>
          <p>Environment: <span id="environment">Checking...</span></p>
          <p>Browser WebSocket Support: <span id="wsSupport">Checking...</span></p>
        </div>
        
        <div id="status" class="status disconnected">Status: Disconnected</div>
        
        <div class="control-panel">
          <button id="connectBtn" class="button primary">Connect</button>
          <button id="disconnectBtn" class="button secondary" disabled>Disconnect</button>
          <button id="pingBtn" class="button warning" disabled>Send Ping</button>
          <button id="clearBtn" class="button danger">Clear Messages</button>
        </div>
        
        <div>
          <input type="text" id="messageInput" placeholder="Type a message to send (or click a sample message below)" disabled>
          <button id="sendBtn" class="button primary" disabled>Send</button>
        </div>
        
        <div class="debug-section">
          <h4>Sample Messages:</h4>
          <div>
            <span class="sample-message" data-message='{"type":"ping","timestamp":"2023-01-01T00:00:00Z"}'>Ping</span>
            <span class="sample-message" data-message='{"type":"subscribe","topic":"social_updates"}'>Subscribe to Social</span>
            <span class="sample-message" data-message='{"type":"subscribe","topic":"keyword_alerts"}'>Subscribe to Alerts</span>
            <span class="sample-message" data-message='{"type":"message","text":"Hello from WebSocket client!"}'>Simple Message</span>
          </div>
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
        const clearBtn = document.getElementById('clearBtn');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const messagesEl = document.getElementById('messages');
        const wsUrlEl = document.getElementById('wsUrl');
        const environmentEl = document.getElementById('environment');
        const wsSupportEl = document.getElementById('wsSupport');
        const sampleMessages = document.querySelectorAll('.sample-message');
        
        // Detect Replit environment and adjust WebSocket URL
        const isReplit = window.location.hostname.endsWith('.replit.dev') || 
                          window.location.hostname.endsWith('.replit.app') || 
                          window.location.hostname.endsWith('.repl.co');
        const isHttps = window.location.protocol === 'https:';
        const protocol = isHttps ? 'wss://' : 'ws://';
        let wsUrl = protocol + window.location.host + '/ws';
        
        // Update environment information
        environmentEl.textContent = isReplit ? 'Replit' : 'Development';
        wsUrlEl.textContent = wsUrl;
        wsSupportEl.textContent = 'WebSocket' in window ? 'Supported' : 'Not Supported';
        
        if (!('WebSocket' in window)) {
          addMessage('ERROR: WebSocket is not supported in this browser!', 'error');
          connectBtn.disabled = true;
        }
        
        // WebSocket Connection
        let socket;
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 3;
        
        // Connect to WebSocket
        connectBtn.addEventListener('click', () => {
          connect();
        });
        
        // Disconnect from WebSocket
        disconnectBtn.addEventListener('click', () => {
          if (socket) {
            socket.close();
            updateStatus('disconnected');
            addMessage('Disconnected from server', 'system');
            
            // Update button states
            connectBtn.disabled = false;
            disconnectBtn.disabled = true;
            pingBtn.disabled = true;
            messageInput.disabled = true;
            sendBtn.disabled = true;
          }
        });
        
        // Send ping message
        pingBtn.addEventListener('click', () => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            const pingMessage = {
              type: 'ping',
              timestamp: new Date().toISOString()
            };
            socket.send(JSON.stringify(pingMessage));
            addMessage(pingMessage, 'sent');
          }
        });
        
        // Clear messages
        clearBtn.addEventListener('click', () => {
          messagesEl.innerHTML = '';
          addMessage('Messages cleared', 'system');
        });
        
        // Connect to WebSocket with retry logic
        function connect() {
          updateStatus('connecting');
          addMessage('Connecting to ' + wsUrl + '...', 'system');
          
          try {
            socket = new WebSocket(wsUrl);
            
            socket.onopen = function(e) {
              updateStatus('connected');
              addMessage('Connected to server', 'system');
              
              // Reset reconnect counter on successful connection
              reconnectAttempts = 0;
              
              // Update button states
              connectBtn.disabled = true;
              disconnectBtn.disabled = false;
              pingBtn.disabled = false;
              messageInput.disabled = false;
              sendBtn.disabled = false;
              
              // Send initial handshake message
              const handshake = {
                type: 'handshake',
                client: 'browser-test-page',
                timestamp: new Date().toISOString()
              };
              socket.send(JSON.stringify(handshake));
            };
            
            socket.onmessage = function(event) {
              let data = event.data;
              try {
                // Try to parse as JSON
                const jsonData = JSON.parse(data);
                addMessage(jsonData, 'received');
              } catch (e) {
                // Handle as plain text if not JSON
                addMessage({ type: 'message', text: data }, 'received');
              }
            };
            
            socket.onclose = function(event) {
              if (event.wasClean) {
                addMessage('Connection closed cleanly, code=' + event.code + ' reason=' + event.reason, 'system');
              } else {
                // Connection died
                addMessage('Connection died, code=' + event.code, 'error');
                
                // Try to reconnect if not manually disconnected
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                  reconnectAttempts++;
                  
                  // If we're in Replit and using secure WebSocket, try fallback to ws:// 
                  if (isReplit && isHttps && reconnectAttempts === 1) {
                    wsUrl = 'ws://' + window.location.host + '/ws';
                    addMessage('Trying fallback connection to ' + wsUrl, 'system');
                  }
                  
                  addMessage('Attempting to reconnect (' + reconnectAttempts + '/' + MAX_RECONNECT_ATTEMPTS + ')...', 'system');
                  setTimeout(connect, 2000);
                } else {
                  addMessage('Failed to connect after ' + MAX_RECONNECT_ATTEMPTS + ' attempts', 'error');
                  updateStatus('disconnected');
                  connectBtn.disabled = false;
                }
              }
              
              // Update button states
              disconnectBtn.disabled = true;
              pingBtn.disabled = true;
              messageInput.disabled = true;
              sendBtn.disabled = true;
            };
            
            socket.onerror = function(error) {
              updateStatus('disconnected');
              addMessage('WebSocket Error: ' + JSON.stringify(error), 'error');
            };
          } catch (e) {
            updateStatus('disconnected');
            addMessage('Failed to create WebSocket connection: ' + e.message, 'error');
            connectBtn.disabled = false;
          }
        }
        
        // Update connection status
        function updateStatus(status) {
          statusEl.className = 'status ' + status;
          switch(status) {
            case 'connected':
              statusEl.textContent = 'Status: Connected';
              break;
            case 'connecting':
              statusEl.textContent = 'Status: Connecting...';
              break;
            case 'disconnected':
              statusEl.textContent = 'Status: Disconnected';
              break;
          }
        }
        
        // Add message to the messages element
        function addMessage(message, type) {
          const msgEl = document.createElement('div');
          msgEl.className = 'message ' + (type || 'system');
          
          let content;
          if (typeof message === 'string') {
            content = message;
          } else {
            // Format JSON nicely
            content = JSON.stringify(message, null, 2);
          }
          
          const timestamp = new Date().toLocaleTimeString();
          msgEl.innerHTML = '<strong>' + timestamp + '</strong> (' + type + '): ' + 
                           '<pre style="margin: 5px 0;">' + content + '</pre>';
          
          messagesEl.appendChild(msgEl);
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }
        
        // Send message
        sendBtn.addEventListener('click', () => {
          const message = messageInput.value.trim();
          if (message && socket && socket.readyState === WebSocket.OPEN) {
            try {
              // Try to parse as JSON first
              const jsonMsg = JSON.parse(message);
              socket.send(message);
              addMessage(jsonMsg, 'sent');
            } catch (e) {
              // Not valid JSON, send as simple text message object
              const messageObj = {
                type: 'message',
                text: message,
                timestamp: new Date().toISOString()
              };
              socket.send(JSON.stringify(messageObj));
              addMessage(messageObj, 'sent');
            }
            
            messageInput.value = '';
          }
        });
        
        messageInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            sendBtn.click();
          }
        });
        
        // Sample messages
        sampleMessages.forEach(sample => {
          sample.addEventListener('click', () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              const message = sample.getAttribute('data-message');
              messageInput.value = message;
              // Add timestamp to the message if it's a ping
              if (message.includes('"type":"ping"')) {
                messageInput.value = message.replace(/"timestamp":"[^"]+"/, '"timestamp":"' + new Date().toISOString() + '"');
              }
            } else {
              addMessage('Cannot load sample message: WebSocket is not connected', 'error');
            }
          });
        });
        
        // Initialize with connection information
        addMessage('Media Pulse WebSocket Test Page loaded');
        addMessage('WebSocket URL: ' + wsUrl);
        addMessage('Environment: ' + (isReplit ? 'Replit' : 'Development'));
        addMessage('Secure Connection: ' + (isHttps ? 'Yes (HTTPS)' : 'No (HTTP)'));
        addMessage('Instructions:');
        addMessage('1. Click "Connect" to establish WebSocket connection');
        addMessage('2. Use "Send Ping" to test server connectivity');
        addMessage('3. Enter custom JSON messages or select from samples below');
      </script>
    </body>
    </html>
    `;
    res.send(html);
  }
});

app.get('/replit-ws-test', (req, res) => {
  const testPagePath = path.join(__dirname, 'server/public/replit-ws-test.html');
  
  if (fs.existsSync(testPagePath)) {
    res.sendFile(testPagePath);
  } else {
    // Similar HTML as above but with Replit-specific adjustments
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Media Pulse Replit WebSocket Test</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
        .container { max-width: 800px; margin: 0 auto; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .connected { background-color: #d4edda; color: #155724; }
        .disconnected { background-color: #f8d7da; color: #721c24; }
        .connecting { background-color: #fff3cd; color: #856404; }
        #messages { height: 300px; border: 1px solid #ddd; padding: 10px; overflow-y: auto; margin: 10px 0; font-family: monospace; }
        .button { padding: 8px 15px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
        .primary { background-color: #007bff; color: white; }
        .secondary { background-color: #6c757d; color: white; }
        .warning { background-color: #ffc107; color: #000; }
        .danger { background-color: #dc3545; color: white; }
        input[type="text"] { padding: 8px; width: 100%; margin: 5px 0; }
        .info-box { background-color: #e9ecef; border-radius: 4px; padding: 10px; margin: 10px 0; }
        .diagnostic-panel { background-color: #f8f9fa; border-radius: 4px; padding: 10px; margin: 10px 0; }
        .control-panel { display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0; }
        .message { padding: 5px; border-bottom: 1px solid #eee; }
        .sent { color: #0066cc; }
        .received { color: #006600; }
        .system { color: #666; font-style: italic; }
        .error { color: #dc3545; }
        .warning { color: #856404; }
        .debug-section { 
          background-color: #f8f9fa; 
          border: 1px solid #dee2e6; 
          border-radius: 4px; 
          padding: 10px; 
          margin: 10px 0; 
        }
        .sample-message {
          display: inline-block;
          background: #eee;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px;
          margin: 5px;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Media Pulse Replit WebSocket Test</h1>
        
        <div class="info-box">
          <p><strong>Replit-Specific Connection Information:</strong></p>
          <p>WebSocket URL: <code id="wsUrl">Detecting...</code></p>
          <p>Environment: <span id="environment">Checking...</span></p>
          <p>Replit ID: <span id="replitId">Checking...</span></p>
          <p>Protocol: <span id="protocol">Checking...</span></p>
        </div>
        
        <div id="status" class="status disconnected">Status: Disconnected</div>
        
        <div class="diagnostic-panel">
          <h4>Replit Connection Diagnostics:</h4>
          <div id="diagnostics">
            <p>Hostname: <span id="hostname">Checking...</span></p>
            <p>Secure Context: <span id="secureContext">Checking...</span></p>
            <p>WebSocket Support: <span id="wsSupport">Checking...</span></p>
            <p>Connection Strategy: <span id="strategy">Standard</span></p>
          </div>
        </div>
        
        <div class="control-panel">
          <button id="connectBtn" class="button primary">Connect</button>
          <button id="disconnectBtn" class="button secondary" disabled>Disconnect</button>
          <button id="pingBtn" class="button warning" disabled>Send Ping</button>
          <button id="clearBtn" class="button danger">Clear Messages</button>
        </div>
        
        <div>
          <input type="text" id="messageInput" placeholder="Type a message to send" disabled>
          <button id="sendBtn" class="button primary" disabled>Send</button>
        </div>
        
        <div class="debug-section">
          <h4>Sample Messages:</h4>
          <div>
            <span class="sample-message" data-message='{"type":"ping","timestamp":"2023-01-01T00:00:00Z"}'>Ping</span>
            <span class="sample-message" data-message='{"type":"replit_diagnostic","action":"check_connection"}'>Check Connection</span>
            <span class="sample-message" data-message='{"type":"subscribe","topic":"replit_updates"}'>Subscribe to Updates</span>
            <span class="sample-message" data-message='{"type":"message","text":"Hello from Replit WebSocket test!"}'>Simple Message</span>
          </div>
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
        const clearBtn = document.getElementById('clearBtn');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const messagesEl = document.getElementById('messages');
        const wsUrlEl = document.getElementById('wsUrl');
        const environmentEl = document.getElementById('environment');
        const replitIdEl = document.getElementById('replitId');
        const protocolEl = document.getElementById('protocol');
        const hostnameEl = document.getElementById('hostname');
        const secureContextEl = document.getElementById('secureContext');
        const wsSupportEl = document.getElementById('wsSupport');
        const strategyEl = document.getElementById('strategy');
        const sampleMessages = document.querySelectorAll('.sample-message');
        
        // Detect Replit environment and adjust WebSocket URL
        const hostname = window.location.hostname;
        const isReplit = hostname.endsWith('.replit.dev') || 
                         hostname.endsWith('.replit.app') || 
                         hostname.endsWith('.repl.co');
        const isHttps = window.location.protocol === 'https:';
        const isSecureContext = window.isSecureContext;
        const protocol = isHttps ? 'wss://' : 'ws://';
        
        // Extract Replit ID from hostname
        let replitId = "Unknown";
        if (isReplit) {
          // Format: {id}-{slot}.{username}.{type}.replit.{tld}
          const hostnameParts = hostname.split('.');
          if (hostnameParts.length >= 4) {
            const firstPart = hostnameParts[0];
            const idParts = firstPart.split('-');
            if (idParts.length >= 1) {
              replitId = idParts[0];
            }
          }
        }
        
        // Set default WebSocket URL
        let wsUrl = protocol + window.location.host + '/ws-replit-test';
        let wsUrlWithoutPort = protocol + hostname + '/ws-replit-test';
        
        // Update environment information
        environmentEl.textContent = isReplit ? 'Replit' : 'Development';
        wsUrlEl.textContent = wsUrl;
        replitIdEl.textContent = replitId;
        protocolEl.textContent = isHttps ? 'HTTPS/WSS' : 'HTTP/WS';
        hostnameEl.textContent = hostname;
        secureContextEl.textContent = isSecureContext ? 'Yes' : 'No';
        wsSupportEl.textContent = 'WebSocket' in window ? 'Supported' : 'Not Supported';
        
        if (!('WebSocket' in window)) {
          addMessage('ERROR: WebSocket is not supported in this browser!', 'error');
          connectBtn.disabled = true;
        }
        
        // WebSocket Connection
        let socket;
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 5;
        let connectionStrategies = [
          { name: 'Default URL', url: wsUrl },
          { name: 'Hostname without port', url: wsUrlWithoutPort },
          { name: 'Secure WebSocket', url: 'wss://' + hostname + '/ws-replit-test' },
          { name: 'Insecure WebSocket', url: 'ws://' + hostname + '/ws-replit-test' },
          { name: 'Replit domain proxy', url: 'wss://' + hostname + '/__replit_ws_proxy/ws-replit-test' }
        ];
        let currentStrategyIndex = 0;
        
        // Connect to WebSocket
        connectBtn.addEventListener('click', () => {
          connect();
        });
        
        // Disconnect from WebSocket
        disconnectBtn.addEventListener('click', () => {
          if (socket) {
            socket.close();
            updateStatus('disconnected');
            addMessage('Disconnected from server', 'system');
            
            // Update button states
            connectBtn.disabled = false;
            disconnectBtn.disabled = true;
            pingBtn.disabled = true;
            messageInput.disabled = true;
            sendBtn.disabled = true;
          }
        });
        
        // Send ping message
        pingBtn.addEventListener('click', () => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            const pingMessage = {
              type: 'ping',
              timestamp: new Date().toISOString()
            };
            socket.send(JSON.stringify(pingMessage));
            addMessage(pingMessage, 'sent');
          }
        });
        
        // Clear messages
        clearBtn.addEventListener('click', () => {
          messagesEl.innerHTML = '';
          addMessage('Messages cleared', 'system');
        });
        
        // Connect to WebSocket with retry logic and multiple strategies
        function connect() {
          updateStatus('connecting');
          
          const strategy = connectionStrategies[currentStrategyIndex];
          strategyEl.textContent = strategy.name;
          wsUrlEl.textContent = strategy.url;
          addMessage('Connecting to ' + strategy.url + ' (Strategy: ' + strategy.name + ')', 'system');
          
          try {
            socket = new WebSocket(strategy.url);
            
            socket.onopen = function(e) {
              updateStatus('connected');
              addMessage('Connected to server using strategy: ' + strategy.name, 'system');
              
              // Reset reconnect counter on successful connection
              reconnectAttempts = 0;
              
              // Update button states
              connectBtn.disabled = true;
              disconnectBtn.disabled = false;
              pingBtn.disabled = false;
              messageInput.disabled = false;
              sendBtn.disabled = false;
              
              // Send initial handshake message with diagnostic info
              const handshake = {
                type: 'handshake',
                client: 'replit-ws-test-page',
                replit: {
                  isReplit: isReplit,
                  hostname: hostname,
                  protocol: window.location.protocol,
                  isSecureContext: isSecureContext,
                  replitId: replitId,
                  strategy: strategy.name
                },
                timestamp: new Date().toISOString()
              };
              socket.send(JSON.stringify(handshake));
            };
            
            socket.onmessage = function(event) {
              let data = event.data;
              try {
                // Try to parse as JSON
                const jsonData = JSON.parse(data);
                addMessage(jsonData, 'received');
              } catch (e) {
                // Handle as plain text if not JSON
                addMessage({ type: 'message', text: data }, 'received');
              }
            };
            
            socket.onclose = function(event) {
              if (event.wasClean) {
                addMessage('Connection closed cleanly, code=' + event.code + ' reason=' + event.reason, 'system');
              } else {
                // Connection died
                addMessage('Connection died using strategy: ' + strategy.name + ', code=' + event.code, 'error');
                
                // Try next strategy or reconnect
                if (currentStrategyIndex < connectionStrategies.length - 1) {
                  currentStrategyIndex++;
                  addMessage('Trying next connection strategy: ' + connectionStrategies[currentStrategyIndex].name, 'system');
                  setTimeout(connect, 1000);
                } else {
                  // Reset to first strategy and increment reconnect attempts
                  currentStrategyIndex = 0;
                  reconnectAttempts++;
                  
                  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    addMessage('Retrying from first strategy. Attempt ' + reconnectAttempts + '/' + MAX_RECONNECT_ATTEMPTS, 'system');
                    setTimeout(connect, 2000);
                  } else {
                    addMessage('Failed to connect after trying all strategies ' + MAX_RECONNECT_ATTEMPTS + ' times', 'error');
                    updateStatus('disconnected');
                    connectBtn.disabled = false;
                  }
                }
              }
              
              // Update button states
              disconnectBtn.disabled = true;
              pingBtn.disabled = true;
              messageInput.disabled = true;
              sendBtn.disabled = true;
            };
            
            socket.onerror = function(error) {
              addMessage('WebSocket Error using strategy: ' + strategy.name, 'error');
            };
          } catch (e) {
            updateStatus('disconnected');
            addMessage('Failed to create WebSocket connection: ' + e.message, 'error');
            
            // Try next strategy
            if (currentStrategyIndex < connectionStrategies.length - 1) {
              currentStrategyIndex++;
              addMessage('Trying next connection strategy: ' + connectionStrategies[currentStrategyIndex].name, 'system');
              setTimeout(connect, 1000);
            } else {
              currentStrategyIndex = 0;
              reconnectAttempts++;
              
              if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                addMessage('Retrying from first strategy. Attempt ' + reconnectAttempts + '/' + MAX_RECONNECT_ATTEMPTS, 'system');
                setTimeout(connect, 2000);
              } else {
                addMessage('Failed to connect after trying all strategies ' + MAX_RECONNECT_ATTEMPTS + ' times', 'error');
                connectBtn.disabled = false;
              }
            }
          }
        }
        
        // Update connection status
        function updateStatus(status) {
          statusEl.className = 'status ' + status;
          switch(status) {
            case 'connected':
              statusEl.textContent = 'Status: Connected';
              break;
            case 'connecting':
              statusEl.textContent = 'Status: Connecting...';
              break;
            case 'disconnected':
              statusEl.textContent = 'Status: Disconnected';
              break;
          }
        }
        
        // Add message to the messages element
        function addMessage(message, type) {
          const msgEl = document.createElement('div');
          msgEl.className = 'message ' + (type || 'system');
          
          let content;
          if (typeof message === 'string') {
            content = message;
          } else {
            // Format JSON nicely
            content = JSON.stringify(message, null, 2);
          }
          
          const timestamp = new Date().toLocaleTimeString();
          msgEl.innerHTML = '<strong>' + timestamp + '</strong> (' + type + '): ' + 
                           '<pre style="margin: 5px 0;">' + content + '</pre>';
          
          messagesEl.appendChild(msgEl);
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }
        
        // Send message
        sendBtn.addEventListener('click', () => {
          const message = messageInput.value.trim();
          if (message && socket && socket.readyState === WebSocket.OPEN) {
            try {
              // Try to parse as JSON first
              const jsonMsg = JSON.parse(message);
              socket.send(message);
              addMessage(jsonMsg, 'sent');
            } catch (e) {
              // Not valid JSON, send as simple text message object
              const messageObj = {
                type: 'message',
                text: message,
                timestamp: new Date().toISOString()
              };
              socket.send(JSON.stringify(messageObj));
              addMessage(messageObj, 'sent');
            }
            
            messageInput.value = '';
          }
        });
        
        messageInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            sendBtn.click();
          }
        });
        
        // Sample messages
        sampleMessages.forEach(sample => {
          sample.addEventListener('click', () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              const message = sample.getAttribute('data-message');
              messageInput.value = message;
              // Add timestamp to the message if it's a ping
              if (message.includes('"type":"ping"')) {
                messageInput.value = message.replace(/"timestamp":"[^"]+"/, '"timestamp":"' + new Date().toISOString() + '"');
              }
            } else {
              addMessage('Cannot load sample message: WebSocket is not connected', 'error');
            }
          });
        });
        
        // Initialize with connection information
        addMessage('Media Pulse Replit WebSocket Test Page loaded');
        addMessage('Environment: ' + (isReplit ? 'Replit' : 'Development'));
        addMessage('Hostname: ' + hostname);
        addMessage('Protocol: ' + window.location.protocol);
        addMessage('Secure Context: ' + (isSecureContext ? 'Yes' : 'No'));
        addMessage('WebSocket URL: ' + wsUrl);
        addMessage('Replit ID: ' + replitId);
        
        if (isReplit) {
          addMessage('Running in Replit environment with specialized connection strategies', 'system');
          addMessage('Will try multiple connection approaches if needed', 'system');
        } else {
          addMessage('WARNING: Not running in Replit environment', 'warning');
          addMessage('This test page is optimized for Replit environments', 'warning');
        }
        
        addMessage('Instructions:');
        addMessage('1. Click "Connect" to establish WebSocket connection');
        addMessage('2. If connection fails, the page will automatically try alternative methods');
        addMessage('3. Use "Send Ping" to test server connectivity');
      </script>
    </body>
    </html>
    `;
    res.send(html);
  }
});

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    port: PORT.toString()
  });
});

// WebSocket server event handlers
wss.on('connection', (ws) => {
  const id = Date.now().toString();
  clients.set(id, ws);
  
  console.log(`New WebSocket connection: ${id}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to WebSocket server',
    id: id,
    timestamp: new Date().toISOString()
  }));
  
  // Handle messages
  ws.on('message', (message) => {
    console.log(`Received from ${id}: ${message}`);
    
    try {
      // Try to parse as JSON
      const data = JSON.parse(message);
      
      // Handle ping with pong
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
          received: data
        }));
      }
      
      // Echo all other messages back
      else {
        ws.send(JSON.stringify({
          type: 'echo',
          timestamp: new Date().toISOString(),
          received: data
        }));
      }
    } catch (e) {
      // Not valid JSON, echo back as text
      ws.send(JSON.stringify({
        type: 'echo',
        timestamp: new Date().toISOString(),
        text: message.toString()
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log(`WebSocket connection closed: ${id}`);
    clients.delete(id);
  });
});

// Replit WebSocket server event handlers
replitWss.on('connection', (ws) => {
  const id = `replit-${Date.now().toString()}`;
  replitClients.set(id, ws);
  
  console.log(`New Replit WebSocket connection: ${id}`);
  
  // Send welcome message with Replit info
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Replit WebSocket server',
    id: id,
    environment: 'replit',
    replitId: process.env.REPL_ID || 'unknown',
    timestamp: new Date().toISOString()
  }));
  
  // Handle messages
  ws.on('message', (message) => {
    console.log(`Received from ${id}: ${message}`);
    
    try {
      // Try to parse as JSON
      const data = JSON.parse(message);
      
      // Handle ping with pong
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
          received: data,
          environment: 'replit'
        }));
      }
      
      // Handle Replit-specific diagnostic checks
      else if (data.type === 'replit_diagnostic' && data.action === 'check_connection') {
        ws.send(JSON.stringify({
          type: 'diagnostic_result',
          timestamp: new Date().toISOString(),
          status: 'ok',
          environment: {
            replitId: process.env.REPL_ID || 'unknown',
            hostname: require('os').hostname(),
            port: PORT,
            uptime: process.uptime()
          }
        }));
      }
      
      // Echo all other messages back
      else {
        ws.send(JSON.stringify({
          type: 'echo',
          timestamp: new Date().toISOString(),
          received: data,
          environment: 'replit'
        }));
      }
    } catch (e) {
      // Not valid JSON, echo back as text
      ws.send(JSON.stringify({
        type: 'echo',
        timestamp: new Date().toISOString(),
        text: message.toString(),
        environment: 'replit'
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log(`Replit WebSocket connection closed: ${id}`);
    replitClients.delete(id);
  });
});

// Broadcast to all connected clients
function broadcast(wss, message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(typeof message === 'string' ? message : JSON.stringify(message));
    }
  });
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple WebSocket server listening at http://0.0.0.0:${PORT}`);
  console.log(`WebSocket endpoints: ws://0.0.0.0:${PORT}/ws and ws://0.0.0.0:${PORT}/ws-replit-test`);
  console.log(`Test pages: http://0.0.0.0:${PORT}/websocket-test and http://0.0.0.0:${PORT}/replit-ws-test`);
});