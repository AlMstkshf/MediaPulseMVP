/**
 * WebSocket Context
 * 
 * This context provides a shared WebSocket connection for the application.
 * It handles automatic reconnection and message distribution.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { getWebSocketUrl } from '../utils/replit-config';

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload: any;
}

// WebSocket context value
interface WebSocketContextValue {
  socket: ReconnectingWebSocket | null;
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
}

// Create context with default values
const WebSocketContext = createContext<WebSocketContextValue>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
  lastMessage: null,
});

// WebSocket provider props
interface WebSocketProviderProps {
  children: React.ReactNode;
}

// WebSocket provider component
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<ReconnectingWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  // Keep track of event listeners for cleanup
  const eventListenersRef = useRef<{[key: string]: (event: any) => void}>({});
  
  // Initialize WebSocket connection
  useEffect(() => {
    const wsUrl = getWebSocketUrl();
    console.log('Connecting to WebSocket at:', wsUrl);
    
    const ws = new ReconnectingWebSocket(wsUrl, [], {
      reconnectInterval: 1000,
      maxReconnectInterval: 5000,
    });
    
    // Define event handlers
    const onOpen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    
    const onClose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    const onMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log('WebSocket message received:', message);
        setLastMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    const onError = (error: Event) => {
      console.error('WebSocket error:', error);
    };
    
    // Store event listeners for cleanup
    eventListenersRef.current = {
      open: onOpen,
      close: onClose,
      message: onMessage,
      error: onError,
    };
    
    // Attach event listeners
    ws.addEventListener('open', onOpen);
    ws.addEventListener('close', onClose);
    ws.addEventListener('message', onMessage);
    ws.addEventListener('error', onError);
    
    // Set socket
    setSocket(ws);
    
    // Cleanup function
    return () => {
      // Remove event listeners
      Object.entries(eventListenersRef.current).forEach(([event, listener]) => {
        ws.removeEventListener(event, listener);
      });
      
      // Close WebSocket connection
      ws.close();
    };
  }, []);
  
  // Send message function
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }, [socket, isConnected]);
  
  // Context value
  const value = {
    socket,
    isConnected,
    sendMessage,
    lastMessage,
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);