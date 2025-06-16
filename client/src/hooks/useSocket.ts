import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type MessageHandler<T = any> = (message: T) => void;

export interface SocketOptions {
  url?: string;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  pingInterval?: number;
  timeout?: number;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  autoConnect?: boolean;
  enableLogging?: boolean;
}

export interface UseSocketReturn {
  connected: boolean;
  connecting: boolean;
  sendMessage: (type: string, data?: any) => boolean;
  subscribe: (topic: string, options?: Record<string, any>) => boolean;
  addMessageHandler: <T = any>(type: string, handler: MessageHandler<T>) => void;
  removeMessageHandler: (type: string) => void;
  lastMessage: any | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Mock WebSocket hook using polling approach
 * This maintains the same API as the WebSocket version but uses polling instead
 */
export function useSocket(options: SocketOptions = {}): UseSocketReturn {
  const {
    enableLogging = false,
    autoConnect = true,
    onOpen,
  } = options;

  const [connected, setConnected] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const messageHandlersRef = useRef<Map<string, MessageHandler>>(new Map());
  const { toast } = useToast();
  
  // Log messages if logging is enabled
  const log = useCallback((message: string, ...args: any[]) => {
    if (enableLogging) {
      console.log(`[useSocket] ${message}`, ...args);
    }
  }, [enableLogging]);
  
  // Use polling instead of WebSocket
  useEffect(() => {
    if (!autoConnect) return;
    
    let interval: NodeJS.Timeout;
    let isActive = true;
    
    const fetchUpdates = async () => {
      if (!isActive) return;
      
      try {
        log('Polling for social platform activity');
        const response = await fetch('/api/social/platform-activity');
        
        if (!isActive) return; // Check if component unmounted during fetch
        
        if (response.ok) {
          const data = await response.json();
          setConnected(true);
          
          // Only process if we have data
          if (data && Array.isArray(data) && data.length > 0) {
            log('Received new platform activity data', data[0]);
            
            // Create a mock message similar to what would come from WebSocket
            const mockMessage = {
              type: 'social_update',
              data: data[0],
              timestamp: new Date()
            };
            
            setLastMessage(mockMessage);
            
            // Call registered handlers
            if (messageHandlersRef.current.has('social_update')) {
              messageHandlersRef.current.get('social_update')!(mockMessage);
            }
          }
        } else {
          setConnected(false);
        }
      } catch (error) {
        if (!isActive) return;
        log('Polling error:', error);
        setConnected(false);
      }
    };
    
    // Initial call
    fetchUpdates();
    
    // Call onOpen event handler
    if (onOpen) {
      onOpen(new Event('pollstart'));
    }
    
    // Set up polling interval (15 seconds)
    interval = setInterval(fetchUpdates, 15000);
    
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [autoConnect, onOpen, log]);
  
  /**
   * Connect implementation for polling approach
   * Sets connected state to true immediately
   */
  const connect = useCallback(() => {
    log('Starting polling connection');
    setConnected(true);
    setConnecting(false);
    
    if (onOpen) {
      onOpen(new Event('pollstart'));
    }
  }, [log, onOpen]);
  
  /**
   * Disconnect implementation for polling approach
   */
  const disconnect = useCallback(() => {
    log('Stopping polling connection');
    setConnected(false);
  }, [log]);
  
  /**
   * Mock implementation of sendMessage
   * In polling model, we don't actually send WebSocket messages
   * Instead, we trigger client-side UI updates and rely on API calls for server updates
   */
  const sendMessage = useCallback((type: string, data: any = {}) => {
    log('Sending message in polling mode', { type, data });
    
    // Store the last message
    const mockMessage = {
      type,
      data,
      timestamp: new Date()
    };
    setLastMessage(mockMessage);
    
    return true; // Always return success
  }, [log]);
  
  /**
   * Mock implementation of subscribe
   */
  const subscribe = useCallback((topic: string, options: Record<string, any> = {}) => {
    log('Subscribing to topic in polling mode', { topic, options });
    return true; // Always return success
  }, [log]);
  
  /**
   * Add a message handler for a specific message type
   */
  const addMessageHandler = useCallback((type: string, handler: MessageHandler) => {
    messageHandlersRef.current.set(type, handler);
  }, []);
  
  /**
   * Remove a message handler for a specific message type
   */
  const removeMessageHandler = useCallback((type: string) => {
    messageHandlersRef.current.delete(type);
  }, []);

  // Auto-connect when hook is initialized
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
  }, [autoConnect, connect]);
  
  return {
    connected,
    connecting,
    sendMessage,
    subscribe,
    addMessageHandler,
    removeMessageHandler,
    lastMessage,
    connect,
    disconnect
  };
}