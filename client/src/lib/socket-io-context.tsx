import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode,
  useCallback,
  useRef
} from "react";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";

type SocketIOContextType = {
  connected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  sendMessage: (type: string, data?: any) => void;
  lastMessage: any | null;
  reconnect: () => void; // Manual reconnection method
};

const SocketIOContext = createContext<SocketIOContextType | null>(null);

export function SocketIOProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const { toast } = useToast();

  // Setup Socket.IO connection function
  const setupSocketIO = useCallback(() => {
    // Update connection status to connecting
    setConnectionStatus('connecting');
    
    try {
      // Create Socket.IO client with the socket.io path
      // Socket.IO automatically handles the protocol (ws/wss) based on the page protocol
      console.log(`[SocketIOContext] Connecting to Socket.IO server at ${window.location.origin}`);
      
      // Initialize Socket.IO with optimized settings
      const socketInstance = io({
        path: '/socket.io', // Default Socket.IO path 
        reconnectionDelayMax: 10000, // Maximum reconnection delay of 10 seconds
        reconnectionAttempts: Infinity, // Never stop trying to reconnect
        timeout: 20000, // Connection timeout of 20 seconds
        transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      });
      
      // Connection opened handler
      socketInstance.on("connect", () => {
        console.log("[SocketIOContext] Connected to Socket.IO server");
        setConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        
        toast({
          title: "Connected",
          description: "Real-time updates are now active",
        });
      });
      
      // Listen for events (messages)
      socketInstance.on("message", (message) => {
        try {
          console.log("[SocketIOContext] Message from server:", message);
          setLastMessage(message);
          
          // Handle different message types
          if (typeof message === 'object' && message !== null) {
            switch (message.type) {
              case "connect":
                toast({
                  title: "Connected",
                  description: message.message || "Connected to Socket.IO server",
                });
                break;
                
              case "keyword_alert":
                toast({
                  title: "Keyword Alert",
                  description: `New mention of "${message.keyword}" detected`,
                  variant: "destructive",
                });
                break;
                
              case "social_update":
                // Handle social updates
                break;
                
              case "sentiment_update":
                // Handle sentiment updates
                break;
            }
          }
        } catch (error) {
          console.error("[SocketIOContext] Failed to handle Socket.IO message:", error);
        }
      });
      
      // Handle specific typed events (for streaming updates)
      socketInstance.on("social_update_batch", (data) => {
        console.log("[SocketIOContext] Received social update batch:", data);
        setLastMessage(data);
        const count = data.count || (data.data ? data.data.length : 0);
        if (count > 0) {
          toast({
            title: "Social Media Updates",
            description: `${count} new social media posts available`,
          });
        }
      });
      
      socketInstance.on("sentiment_update_batch", (data) => {
        console.log("[SocketIOContext] Received sentiment update batch:", data);
        setLastMessage(data);
        const count = data.count || (data.data ? data.data.length : 0);
        if (count > 0) {
          toast({
            title: "Sentiment Analysis Updates",
            description: `${count} new sentiment reports available`,
          });
        }
      });
      
      socketInstance.on("keyword_alert_batch", (data) => {
        console.log("[SocketIOContext] Received keyword alert batch:", data);
        setLastMessage(data);
        const count = data.count || (data.alerts ? data.alerts.length : 0);
        if (count > 0) {
          toast({
            title: "Keyword Alerts",
            description: `${count} new keyword alerts detected`,
            variant: "destructive",
          });
        }
      });
      
      socketInstance.on("platform_activity_batch", (data) => {
        console.log("[SocketIOContext] Received platform activity batch:", data);
        setLastMessage(data);
      });
      
      // Handle heartbeat events
      socketInstance.on("heartbeat", (data) => {
        if (!data.silent) {
          console.log("[SocketIOContext] Received heartbeat from server");
        }
      });
      
      // Handle errors
      socketInstance.on("connect_error", (error) => {
        console.error("[SocketIOContext] Socket.IO connection error:", error);
        setConnectionStatus('error');
        setConnected(false);
        
        toast({
          title: "Connection Error",
          description: "Could not connect to real-time updates server",
          variant: "destructive",
        });
        
        // Increment reconnect attempts
        reconnectAttemptsRef.current += 1;
      });
      
      // Handle disconnection
      socketInstance.on("disconnect", (reason) => {
        console.log("[SocketIOContext] Socket.IO disconnected:", reason);
        setConnected(false);
        setConnectionStatus('disconnected');
        
        if (reason !== "io client disconnect") {
          // Only show toast if this wasn't a manual disconnect
          toast({
            title: "Connection Lost",
            description: "Real-time updates connection was closed. Click 'Reconnect' in the status bar to try again.",
            variant: "destructive",
          });
        }
      });
      
      // Store the socket instance
      setSocket(socketInstance);
      
    } catch (error) {
      console.error("[SocketIOContext] Error creating Socket.IO connection:", error);
      setConnectionStatus('error');
      
      toast({
        title: "Connection Failed",
        description: "Failed to establish real-time connection. Check your network and try to reconnect.",
        variant: "destructive",
      });
    }
  }, [toast, setConnectionStatus]);
  
  // Manual reconnect function that can be called from UI
  const reconnect = useCallback(() => {
    console.log("[SocketIOContext] Manual reconnection requested");
    
    // Reset connection attempts counter
    reconnectAttemptsRef.current = 0;
    
    // Close existing socket if present
    if (socket) {
      socket.disconnect();
    }
    
    // Update status and try to connect
    setConnectionStatus('connecting');
    
    // Setup a new connection
    setupSocketIO();
  }, [socket, setupSocketIO]);
  
  // Initialize Socket.IO on component mount
  useEffect(() => {
    setupSocketIO();
    
    // Cleanup on unmount
    return () => {
      console.log("[SocketIOContext] Cleaning up Socket.IO connection");
      
      if (socket) {
        socket.disconnect();
      }
    };
  }, [setupSocketIO]);
  
  // Send message through Socket.IO
  const sendMessage = useCallback((type: string, data: any = {}) => {
    if (socket && socket.connected) {
      const messageData = {
        type,
        data,
        timestamp: new Date()
      };
      
      socket.emit(type, messageData);
      return true;
    } else {
      console.error("[SocketIOContext] Cannot send message, socket is not connected");
      return false;
    }
  }, [socket]);
  
  return (
    <SocketIOContext.Provider value={{ 
      connected, 
      connectionStatus, 
      sendMessage, 
      lastMessage,
      reconnect 
    }}>
      {children}
    </SocketIOContext.Provider>
  );
}

export function useSocketIO() {
  const context = useContext(SocketIOContext);
  if (!context) {
    throw new Error("useSocketIO must be used within a SocketIOProvider");
  }
  return context;
}