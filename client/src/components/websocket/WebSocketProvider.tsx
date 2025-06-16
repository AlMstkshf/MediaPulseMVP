import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: string;
  lastMessage: any;
  sendMessage: (message: any) => void;
  subscribe: (topic: string) => void;
  unsubscribe: (topic: string) => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  socket: null,
  isConnected: false,
  connectionStatus: 'Disconnected',
  lastMessage: null,
  sendMessage: () => {},
  subscribe: () => {},
  unsubscribe: () => {},
  reconnect: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [lastMessage, setLastMessage] = useState<any>(null);

  const initializeWebSocket = useCallback(() => {
    // Determine the appropriate WebSocket endpoint
    // This handles both Replit and Cloud Run deployment scenarios
    let socketURL = window.location.origin;
    
    // Handle special cases where origin might not match WebSocket endpoint
    // For example, when the app is served from a different domain than the WebSocket server
    if (process.env.NODE_ENV === 'production') {
      // In production, use the current location since we don't need a different endpoint
      // The URL is properly handled by the deployment environment
      socketURL = window.location.origin;
    } else if (process.env.NODE_ENV === 'development') {
      // In development, check if we need to use a different port than the Vite server
      // (Only necessary if backend is running on a different port than frontend)
      const currentPort = window.location.port;
      if (currentPort === '3000') {
        // Frontend is on 3000 (Vite default), backend likely on 5000
        socketURL = `${window.location.protocol}//${window.location.hostname}:5000`;
      }
    }
    
    console.log(`Connecting WebSocket to: ${socketURL}`);
    
    // Create Socket.IO connection with automatic reconnection
    const socketIO = io(socketURL, {
      path: '/socket.io', // Match the server-side path setting
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 5000,
      transports: ['websocket', 'polling'], // Match server-side transport options
      forceNew: true // Create a new connection even if one exists already
    });

    socketIO.on('connect', () => {
      console.log('Socket.IO connection established');
      setIsConnected(true);
      setConnectionStatus('Connected');
    });

    socketIO.on('message', (data: any) => {
      try {
        if (typeof data === 'string') {
          setLastMessage(JSON.parse(data));
        } else {
          setLastMessage(data);
        }
      } catch (error: any) {
        console.error('Error processing Socket.IO message:', error);
        setLastMessage(data);
      }
    });

    socketIO.on('disconnect', () => {
      console.log('Socket.IO connection closed');
      setIsConnected(false);
      setConnectionStatus('Disconnected');
    });

    socketIO.on('connect_error', (error: Error) => {
      console.error('Socket.IO connection error:', error);
      console.error('Connection attempt details:', {
        targetURL: socketURL,
        path: '/socket.io',
        origin: window.location.origin,
        protocol: window.location.protocol,
        host: window.location.host,
        environment: process.env.NODE_ENV || 'unknown',
        errorMessage: error.message,
        errorName: error.name,
        transportOptions: ['websocket', 'polling']
      });
      
      setIsConnected(false);
      
      // More descriptive error message to help with troubleshooting
      if (error.message.includes('xhr poll error')) {
        setConnectionStatus(`Network error: Server unreachable at ${socketURL}`);
      } else if (error.message.includes('timeout')) {
        setConnectionStatus(`Connection timeout: Server not responding at ${socketURL}`);
      } else {
        setConnectionStatus(`Error: ${error.message}`);
      }
    });
    
    // Add debug listener for all events
    socketIO.onAny((eventName, ...args) => {
      console.log(`[Socket.IO Event] ${eventName}:`, args);
    });

    setSocket(socketIO);

    // Clean up on unmount
    return () => {
      socketIO.disconnect();
    };
  }, []);

  useEffect(() => {
    const cleanup = initializeWebSocket();
    return cleanup;
  }, [initializeWebSocket]);

  const sendMessage = useCallback(
    (message: any) => {
      if (socket && socket.connected) {
        socket.emit('message', message);
      } else {
        console.warn('Cannot send message, Socket.IO is not connected');
      }
    },
    [socket]
  );

  const subscribe = useCallback(
    (topic: string) => {
      if (socket && socket.connected) {
        socket.emit('subscribe', { topic });
      }
    },
    [socket]
  );

  const unsubscribe = useCallback(
    (topic: string) => {
      if (socket && socket.connected) {
        socket.emit('unsubscribe', { topic });
      }
    },
    [socket]
  );

  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect();
      setConnectionStatus('Reconnecting...');
    } else {
      initializeWebSocket();
    }
  }, [socket, initializeWebSocket]);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        connectionStatus,
        lastMessage,
        sendMessage,
        subscribe,
        unsubscribe,
        reconnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};