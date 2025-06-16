import { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketUrl, isRunningInReplit } from '@/utils/replit-config';

type WebSocketMessage = {
  type: string;
  data: any;
};

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

type UseWebSocketOptions = {
  reconnectInterval?: number;
  reconnectAttempts?: number;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (data: any) => void;
  autoConnect?: boolean;
  debug?: boolean;
};

type UseWebSocketReturn = {
  status: WebSocketStatus;
  sendMessage: (type: string, data: any) => void;
  lastMessage: WebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
};

const useWebSocket = (
  path: string = '/ws',
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    reconnectInterval = 3000,
    reconnectAttempts = 5,
    onOpen,
    onClose,
    onError,
    onMessage,
    autoConnect = true,
    debug = false
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const log = useCallback(
    (message: string, data?: any) => {
      if (debug) {
        console.log(`[WebSocket] ${message}`, data || '');
      }
    },
    [debug]
  );

  // Create WebSocket connection
  const connect = useCallback(() => {
    // Close any existing connection
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }

    try {
      setStatus('connecting');
      log('Connecting to WebSocket server...');

      // Get WebSocket URL based on environment
      let wsUrl;
      const inReplit = isRunningInReplit();
      
      if (inReplit) {
        // In Replit, use the current host with proper protocol
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.host}${path}`;
        log('Using Replit WebSocket URL');
      } else {
        // In development, use the config
        const baseWsUrl = getWebSocketUrl();
        wsUrl = `${baseWsUrl}${path}`;
        log('Using development WebSocket URL');
      }
      
      log('WebSocket URL:', wsUrl);
      const ws = new WebSocket(wsUrl);
      webSocketRef.current = ws;

      ws.onopen = (event) => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
        log('Connected to WebSocket server');
        
        if (onOpen) {
          onOpen(event);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          log('Received message', data);
          setLastMessage(data);
          
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          log('Error parsing WebSocket message', error);
        }
      };

      ws.onclose = (event) => {
        log('WebSocket connection closed', { code: event.code, reason: event.reason });
        setStatus('disconnected');
        
        if (onClose) {
          onClose(event);
        }

        // If connection was closed abnormally and max retries not exceeded, try to reconnect
        if (
          (event.code !== 1000 && event.code !== 1001) ||
          event.reason === 'reconnect'
        ) {
          attemptReconnect();
        }
      };

      ws.onerror = (event) => {
        // Enhanced error logging with environment info
        const inReplit = isRunningInReplit();
        log('WebSocket error occurred', { 
          event, 
          environment: inReplit ? 'Replit' : 'Development',
          url: wsUrl,
          readyState: ws.readyState,
          browser: navigator.userAgent
        });
        setStatus('error');
        
        if (onError) {
          onError(event);
        }
      };
    } catch (error) {
      log('Error creating WebSocket connection', error);
      setStatus('error');
      attemptReconnect();
    }
  }, [path, onOpen, onClose, onError, onMessage, log]);

  // Attempt to reconnect
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= reconnectAttempts) {
      log(`Maximum reconnection attempts (${reconnectAttempts}) reached`);
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setStatus('reconnecting');
    reconnectAttemptsRef.current += 1;
    
    const delay = reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1);
    log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${reconnectAttempts})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      log(`Reconnecting... (attempt ${reconnectAttemptsRef.current}/${reconnectAttempts})`);
      connect();
    }, delay);
  }, [connect, reconnectAttempts, reconnectInterval, log]);

  // Send message to WebSocket server
  const sendMessage = useCallback(
    (type: string, data: any) => {
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ type, data });
        webSocketRef.current.send(message);
        log('Sent message', { type, data });
        return true;
      } else {
        log('Cannot send message, WebSocket is not connected');
        return false;
      }
    },
    [log]
  );

  // Manually disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (webSocketRef.current) {
      webSocketRef.current.close(1000, 'User disconnected');
      webSocketRef.current = null;
      setStatus('disconnected');
      log('Disconnected from WebSocket server');
    }
  }, [log]);

  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (webSocketRef.current) {
        webSocketRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [autoConnect, connect]);

  // Ping to keep connection alive
  useEffect(() => {
    if (status !== 'connected') return;

    const pingInterval = setInterval(() => {
      if (webSocketRef.current?.readyState === WebSocket.OPEN) {
        sendMessage('ping', { timestamp: new Date().toISOString() });
      }
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [status, sendMessage]);

  return {
    status,
    sendMessage,
    lastMessage,
    connect,
    disconnect
  };
};

export default useWebSocket;