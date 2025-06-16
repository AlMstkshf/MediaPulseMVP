import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

// Simple HTML test page
const testPageHtml = `<!DOCTYPE html>
<html>
<head>
  <title>API Connection Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    button { background-color: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin-right: 10px; }
    button:hover { background-color: #45a049; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
    .success { color: green; font-weight: bold; }
    .error { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Media Intelligence Platform API Test</h1>
  <p>Configured server port: <span id="server-port">checking...</span></p>
  <p>Current origin: <span id="current-origin">checking...</span></p>
  
  <div class="card">
    <h2>API Tests</h2>
    <button id="test-health">Test Health</button>
    <button id="test-social">Test Social Data</button>
    <button id="test-nlp">Test NLP</button>
    <pre id="result">Click a button to test...</pre>
  </div>
  
  <div class="card">
    <h2>WebSocket Test</h2>
    <button id="connect-ws">Connect WebSocket</button>
    <button id="disconnect-ws">Disconnect</button>
    <button id="send-ping">Send Ping</button>
    <pre id="ws-result">Not connected</pre>
  </div>

  <script>
    document.getElementById('current-origin').textContent = window.location.origin;
    
    // Helper function for API calls
    async function callApi(endpoint) {
      const resultElement = document.getElementById('result');
      resultElement.innerHTML = 'Loading...';
      
      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        resultElement.innerHTML = \`<span class="success">Success (\${response.status}):</span>\n\${JSON.stringify(data, null, 2)}\`;
        return data;
      } catch (error) {
        resultElement.innerHTML = \`<span class="error">Error:</span> \${error.message}\`;
        return null;
      }
    }
    
    // Test health endpoint
    document.getElementById('test-health').addEventListener('click', async () => {
      const data = await callApi('/api/health');
      if (data && data.server && data.server.port) {
        document.getElementById('server-port').textContent = data.server.port;
      }
    });
    
    // Test social data endpoint
    document.getElementById('test-social').addEventListener('click', () => {
      callApi('/api/social-posts/count-by-platform');
    });
    
    // Test NLP endpoint
    document.getElementById('test-nlp').addEventListener('click', () => {
      callApi('/api/nlp/health');
    });
    
    // WebSocket functionality
    let socket = null;
    
    document.getElementById('connect-ws').addEventListener('click', () => {
      const wsResultElement = document.getElementById('ws-result');
      
      // Close existing connection if any
      if (socket) {
        socket.close();
        socket = null;
      }
      
      // Try to determine the WebSocket URL based on the current page origin
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host;
      const wsUrl = \`\${wsProtocol}//\${wsHost}\`;
      
      wsResultElement.innerHTML = \`Connecting to \${wsUrl}...\`;
      
      try {
        socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          wsResultElement.innerHTML = '<span class="success">Connected!</span>';
        };
        
        socket.onmessage = (event) => {
          wsResultElement.innerHTML += \`\\nReceived: \${event.data}\`;
        };
        
        socket.onerror = (error) => {
          wsResultElement.innerHTML = \`<span class="error">WebSocket Error</span>\\n\${error}\`;
        };
        
        socket.onclose = () => {
          wsResultElement.innerHTML += '\\nDisconnected';
          socket = null;
        };
      } catch (error) {
        wsResultElement.innerHTML = \`<span class="error">Error creating WebSocket:</span> \${error.message}\`;
      }
    });
    
    document.getElementById('disconnect-ws').addEventListener('click', () => {
      if (socket) {
        socket.close();
        document.getElementById('ws-result').innerHTML += '\\nManually disconnected';
        socket = null;
      } else {
        document.getElementById('ws-result').innerHTML = 'Not connected';
      }
    });
    
    document.getElementById('send-ping').addEventListener('click', () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send('ping');
        document.getElementById('ws-result').innerHTML += '\\nSent: ping';
      } else {
        document.getElementById('ws-result').innerHTML = '<span class="error">Not connected</span>';
      }
    });
    
    // Check health on page load to get server port
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        if (data && data.server && data.server.port) {
          document.getElementById('server-port').textContent = data.server.port;
        }
      })
      .catch(error => {
        document.getElementById('server-port').textContent = 'Error: ' + error.message;
      });
  </script>
</body>
</html>`;

// Test route that serves HTML directly from Express
router.get('/api-test', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/html');
  res.send(testPageHtml);
});

// Socket debugging route
router.get('/socket-info', (req: Request, res: Response) => {
  const socketServerInfo = {
    port: process.env.CURRENT_SERVER_PORT || process.env.PORT || '5000',
    host: req.headers.host,
    headers: req.headers,
    protocol: req.protocol,
    secure: req.secure,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    url: req.url,
    path: req.path,
    xForwardedHost: req.headers['x-forwarded-host'],
    xForwardedProto: req.headers['x-forwarded-proto'],
    origin: req.headers.origin,
  };
  
  res.json(socketServerInfo);
});

export default router;