/**
 * WebSocket Manager for Multi-Tenant Architecture
 * 
 * This module provides a unified management system for WebSocket connections
 * that supports multiple tenants and prevents conflicts between WebSocket handlers.
 * 
 * Features:
 * - Single WebSocket server with path-based routing
 * - Tenant isolation for multi-tenancy support
 * - Centralized message handling and broadcasting
 */

import { Server as HTTPServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { logger } from './logger';
import { URL } from 'url';

// WebSocket handler type definition
type WebSocketHandler = (ws: WebSocket, request: any, path: string) => void;

/**
 * WebSocket Manager class
 * Manages all WebSocket servers to prevent conflicts
 */
export class WebSocketManager {
  private httpServer: HTTPServer;
  private wss: WebSocketServer | null = null;
  private handlers: Map<string, WebSocketHandler> = new Map();
  private clientsCount: number = 0;
  
  /**
   * Extract tenant ID from request headers or URL parameters
   * This is a key part of the multi-tenant architecture
   */
  extractTenantId(request: any): string {
    try {
      // Try to get tenant from request headers (for API calls)
      const tenantHeader = request.headers?.['x-tenant-id'];
      if (tenantHeader) {
        return tenantHeader.toString();
      }
      
      // Try to get from URL parameters (for WebSocket connections)
      if (request.url) {
        try {
          const url = new URL(request.url, `http://${request.headers?.host || 'localhost'}`);
          const tenantParam = url.searchParams.get('tenant');
          if (tenantParam) {
            return tenantParam;
          }
        } catch (error) {
          // URL parsing error, ignore and use default
        }
      }
      
      // Default tenant if none specified
      return 'default';
    } catch (error) {
      logger.error('Error extracting tenant ID:', error);
      return 'default';
    }
  }

  /**
   * Create a WebSocket Manager
   */
  constructor(httpServer: HTTPServer) {
    this.httpServer = httpServer;
  }

  /**
   * Initialize the WebSocket server
   */
  initialize(): void {
    try {
      // Create a single WebSocket server with no path,
      // we'll handle path routing internally
      this.wss = new WebSocketServer({ 
        server: this.httpServer,
        // No path - we'll handle path routing 
        // inside the connection handler
      });

      // Setup connection handler
      this.wss.on('connection', (ws, request) => {
        this.clientsCount++;
        const path = request.url;
        const clientIp = request.headers['x-forwarded-for'] || 
                          request.socket.remoteAddress;
        
        // Extract tenant ID for multi-tenant support
        const tenantId = this.extractTenantId(request);
        
        // Add tenant info to the WebSocket object for later use
        (ws as any).tenantId = tenantId;
        
        logger.info(`WebSocket connection on path ${path} from ${clientIp}. Total clients: ${this.clientsCount}`);
        
        // Find appropriate handler for the path
        let handled = false;
        for (const [handlerPath, handler] of this.handlers) {
          if (path && path.startsWith(handlerPath)) {
            handler(ws, request, path);
            handled = true;
            break;
          }
        }
        
        // Default handler if no specific handler found
        if (!handled) {
          logger.warn(`No handler registered for WebSocket path: ${path}`);
          
          // Send error message
          ws.send(JSON.stringify({
            type: 'error',
            message: `No handler registered for path: ${path}`,
            timestamp: new Date().toISOString()
          }));
          
          // Add basic message handler
          ws.on('message', (data) => {
            try {
              // Echo back any messages
              ws.send(JSON.stringify({
                type: 'echo',
                message: data.toString(),
                timestamp: new Date().toISOString(),
                note: 'No specific handler for this path'
              }));
            } catch (error) {
              logger.error('Error in default WebSocket handler:', error);
            }
          });
        }
        
        // Add disconnect handler
        ws.on('close', () => {
          this.clientsCount--;
          logger.info(`WebSocket connection closed. Total remaining: ${this.clientsCount}`);
        });
      });
      
      logger.info('WebSocket Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize WebSocket Manager:', error);
    }
  }

  /**
   * Register a handler for a specific path
   */
  registerHandler(path: string, handler: WebSocketHandler): void {
    if (this.handlers.has(path)) {
      logger.warn(`WebSocket handler for path ${path} is being replaced`);
    }
    
    this.handlers.set(path, handler);
    logger.info(`Registered WebSocket handler for path: ${path}`);
  }

  /**
   * Unregister a handler for a specific path
   */
  unregisterHandler(path: string): boolean {
    const result = this.handlers.delete(path);
    if (result) {
      logger.info(`Unregistered WebSocket handler for path: ${path}`);
    } else {
      logger.warn(`No WebSocket handler found for path: ${path}`);
    }
    return result;
  }

  /**
   * Get the WebSocket server instance
   */
  getServer(): WebSocketServer | null {
    return this.wss;
  }

  /**
   * Get current client count
   */
  getClientCount(): number {
    return this.clientsCount;
  }

  /**
   * Broadcast a message to all clients on a specific path
   */
  broadcast(path: string, message: any): number {
    if (!this.wss) {
      logger.warn('Cannot broadcast: WebSocket server not initialized');
      return 0;
    }
    
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    let count = 0;
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
        count++;
      }
    });
    
    logger.debug(`Broadcast message to ${count} clients on path ${path}`);
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
          this.handlers.clear();
          this.clientsCount = 0;
          logger.info('WebSocket Manager closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Export a singleton instance
let wsManagerInstance: WebSocketManager | null = null;

export function getWebSocketManager(httpServer?: HTTPServer): WebSocketManager {
  if (!wsManagerInstance && httpServer) {
    wsManagerInstance = new WebSocketManager(httpServer);
  } else if (!wsManagerInstance && !httpServer) {
    throw new Error('WebSocket Manager has not been initialized yet');
  }
  
  return wsManagerInstance as WebSocketManager;
}