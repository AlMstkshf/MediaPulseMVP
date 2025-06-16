/**
 * WebSocket Diagnostics Module
 * 
 * This module provides diagnostics for WebSocket connections to help troubleshoot
 * connectivity issues in the Replit environment.
 */

import { Server as HTTPServer } from 'http';
import { Express, Request, Response } from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { logger } from './logger';
import { isRunningInReplit } from './replit-fix';

/**
 * WebSocket diagnostics server
 */
export class WebSocketDiagnostics {
  private wss: WebSocketServer | null = null;
  private connectionsCount = 0;
  private diagnosticsEnabled = false;
  private httpServer: HTTPServer;

  /**
   * Initialize WebSocket diagnostics
   */
  constructor(httpServer: HTTPServer) {
    this.httpServer = httpServer;
  }

  /**
   * Start the WebSocket diagnostics server
   */
  start(port?: number): void {
    try {
      this.diagnosticsEnabled = true;
      
      // Create WebSocket server
      if (port) {
        // If port is specified, create a standalone server
        this.wss = new WebSocketServer({ port });
        logger.info(`WebSocket diagnostics server started on port ${port}`);
      } else {
        // Otherwise, attach to existing HTTP server with a specific path to avoid conflicts
        this.wss = new WebSocketServer({ 
          server: this.httpServer,
          path: '/ws'  // Set specific path for WebSocket connections
        });
        logger.info('WebSocket diagnostics server attached to HTTP server with path: /ws');
      }

      // Set up connection handlers
      this.wss.on('connection', this.handleConnection.bind(this));
      this.wss.on('error', this.handleError.bind(this));

      // Log success
      logger.info('WebSocket diagnostics server started successfully');
    } catch (error) {
      logger.error('Failed to start WebSocket diagnostics server:', error);
    }
  }

  /**
   * Stop the WebSocket diagnostics server
   */
  stop(): void {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
      this.connectionsCount = 0;
      this.diagnosticsEnabled = false;
      logger.info('WebSocket diagnostics server stopped');
    }
  }

  /**
   * Handle new WebSocket connections
   */
  private handleConnection(ws: WebSocket, req: Request): void {
    this.connectionsCount++;
    
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    logger.info(`New WebSocket connection from ${clientIp}. Total connections: ${this.connectionsCount}`);
    
    // Send initial diagnostics message
    const serverInfo = {
      type: 'diagnostics',
      timestamp: new Date().toISOString(),
      status: 'connected',
      message: 'WebSocket connection established successfully',
      environment: {
        isReplit: isRunningInReplit(),
        nodeEnv: process.env.NODE_ENV,
      }
    };
    
    ws.send(JSON.stringify(serverInfo));
    
    // Set up message handler
    ws.on('message', (message: Buffer | ArrayBuffer | Buffer[]) => {
      try {
        const data = JSON.parse(message.toString());
        logger.debug('Received WebSocket message:', data);
        
        // Echo the message back with a timestamp
        const response = {
          type: 'echo',
          timestamp: new Date().toISOString(),
          originalMessage: data,
        };
        
        ws.send(JSON.stringify(response));
      } catch (error) {
        logger.error('Error processing WebSocket message:', error);
      }
    });
    
    // Set up close handler
    ws.on('close', () => {
      this.connectionsCount--;
      logger.info(`WebSocket connection closed. Total connections: ${this.connectionsCount}`);
    });
  }

  /**
   * Handle WebSocket server errors
   */
  private handleError(error: Error): void {
    logger.error('WebSocket server error:', error);
  }

  /**
   * Register diagnostics HTTP routes
   */
  registerRoutes(app: Express): void {
    // Health check endpoint
    app.get('/api/ws-diagnostics/health', (req: Request, res: Response) => {
      res.json({
        status: 'ok',
        diagnosticsEnabled: this.diagnosticsEnabled,
        connectionsCount: this.connectionsCount,
        isReplit: isRunningInReplit(),
        serverTime: new Date().toISOString(),
      });
    });
    
    // WebSocket test page
    app.get('/ws-test', (req: Request, res: Response) => {
      const protocol = req.secure ? 'wss' : 'ws';
      const baseUrl = `${protocol}://${req.headers.host}`;
      
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>WebSocket Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          #messages { height: 300px; border: 1px solid #ccc; padding: 10px; overflow-y: auto; margin-top: 10px; }
          .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
          .connected { background-color: #d4edda; color: #155724; }
          .disconnected { background-color: #f8d7da; color: #721c24; }
          .message { margin: 5px 0; padding: 5px; border-bottom: 1px solid #eee; }
          .server { background-color: #f8f9fa; }
          .client { background-color: #e2f0ff; }
          button, input { padding: 8px; margin: 5px 0; }
        </style>
      </head>
      <body>
        <h1>WebSocket Diagnostics</h1>
        <div id="status" class="status disconnected">Disconnected</div>
        
        <div>
          <button id="connect">Connect</button>
          <button id="disconnect" disabled>Disconnect</button>
        </div>
        
        <div style="margin-top: 20px;">
          <input id="message" type="text" placeholder="Enter message" style="width: 300px;" />
          <button id="send" disabled>Send</button>
        </div>
        
        <h3>Messages</h3>
        <div id="messages"></div>
        
        <script>
          let socket;
          const statusEl = document.getElementById('status');
          const messagesEl = document.getElementById('messages');
          const connectBtn = document.getElementById('connect');
          const disconnectBtn = document.getElementById('disconnect');
          const messageInput = document.getElementById('message');
          const sendBtn = document.getElementById('send');
          
          function updateStatus(connected) {
            if (connected) {
              statusEl.textContent = 'Connected';
              statusEl.className = 'status connected';
              connectBtn.disabled = true;
              disconnectBtn.disabled = false;
              sendBtn.disabled = false;
            } else {
              statusEl.textContent = 'Disconnected';
              statusEl.className = 'status disconnected';
              connectBtn.disabled = false;
              disconnectBtn.disabled = true;
              sendBtn.disabled = true;
            }
          }
          
          function addMessage(message, fromServer = true) {
            const msgEl = document.createElement('div');
            msgEl.className = fromServer ? 'message server' : 'message client';
            
            let content;
            if (typeof message === 'object') {
              content = JSON.stringify(message, null, 2);
            } else {
              content = message;
            }
            
            msgEl.textContent = fromServer ? '← ' + content : '→ ' + content;
            messagesEl.appendChild(msgEl);
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
          
          connectBtn.addEventListener('click', () => {
            // Create WebSocket connection
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            const wsUrl = protocol + '//' + host + '/ws';
            
            addMessage('Connecting to ' + wsUrl, false);
            
            try {
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
              };
              
              socket.onerror = (error) => {
                updateStatus(false);
                addMessage('WebSocket error: ' + JSON.stringify(error));
              };
            } catch (error) {
              addMessage('Failed to create WebSocket: ' + error.message);
            }
          });
          
          disconnectBtn.addEventListener('click', () => {
            if (socket) {
              socket.close();
              socket = null;
            }
          });
          
          sendBtn.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message && socket) {
              try {
                // Try to send as JSON if possible
                const jsonMsg = { type: 'message', text: message, timestamp: new Date().toISOString() };
                socket.send(JSON.stringify(jsonMsg));
                addMessage(jsonMsg, false);
              } catch (e) {
                socket.send(message);
                addMessage(message, false);
              }
              messageInput.value = '';
            }
          });
          
          messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              sendBtn.click();
            }
          });
        </script>
      </body>
      </html>
      `;
      
      res.send(html);
    });
  }
}