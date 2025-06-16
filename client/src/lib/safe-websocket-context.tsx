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
import ReconnectingWebSocket from 'reconnecting-websocket';

type WebSocketContextType = {
  connected: boolean;
  sendMessage: (type: string, data?: any) => boolean; // Now returns success status
  lastMessage: any | null;
  reconnect: () => void; // Added reconnect function
};

const SafeWebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  sendMessage: () => false, // No-op function that returns false
  lastMessage: null,
  reconnect: () => {} // No-op function
});

/**
 * Calculate exponential backoff delay for reconnection attempts
 * Specifically optimized for Replit's environment with longer delays and more jitter
 * @param attemptNumber Current attempt number (starting at 1)
 * @returns Delay in milliseconds
 */
function getExponentialBackoffDelay(attemptNumber: number): number {
  const baseDelay = 5000; // Start with 5 seconds for Replit environment
  const maxDelay = 60000; // Cap at 60 seconds (1 minute)
  const factor = 2; // More aggressive exponential factor
  
  // Calculate delay with exponential backoff
  // Cap the exponent at 7 to avoid extremely long delays
  const delay = baseDelay * Math.pow(factor, Math.min(attemptNumber - 1, 7));
  
  // Add significant random jitter (±20%) to prevent connection storms
  const jitter = (Math.random() * 0.4 - 0.2) * delay;
  
  // Return the final delay, capped at maxDelay
  return Math.min(maxDelay, delay + jitter);
}

/**
 * A timer class that handles both setTimeout and setInterval
 * with proper cleanup and pausing capability.
 */
class ManagedTimer {
  private timerId: number | null = null;
  private startTime: number = 0;
  private remaining: number = 0;
  private isInterval: boolean = false;
  private callback: () => void;
  private delay: number;
  private paused: boolean = false;

  constructor(callback: () => void, delay: number, isInterval: boolean = false) {
    this.callback = callback;
    this.delay = delay;
    this.isInterval = isInterval;
    this.start();
  }

  start() {
    this.paused = false;
    this.startTime = Date.now();
    this.remaining = this.delay;
    this.clearTimer();
    
    if (this.isInterval) {
      this.timerId = window.setInterval(this.callback, this.delay);
    } else {
      this.timerId = window.setTimeout(this.callback, this.remaining);
    }
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.clearTimer();
    
    if (!this.isInterval) {
      this.remaining -= (Date.now() - this.startTime);
    }
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.startTime = Date.now();
    
    if (this.isInterval) {
      this.timerId = window.setInterval(this.callback, this.delay);
    } else {
      this.timerId = window.setTimeout(this.callback, this.remaining);
    }
  }

  reset(newDelay?: number) {
    if (typeof newDelay === 'number') {
      this.delay = newDelay;
    }
    this.clearTimer();
    this.start();
  }

  clear() {
    this.clearTimer();
    this.timerId = null;
  }

  private clearTimer() {
    if (this.timerId !== null) {
      if (this.isInterval) {
        window.clearInterval(this.timerId);
      } else {
        window.clearTimeout(this.timerId);
      }
      this.timerId = null;
    }
  }

  isActive() {
    return this.timerId !== null && !this.paused;
  }
}

export function SafeWebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<ReconnectingWebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [wsEnabled, setWsEnabled] = useState<boolean>(false);
  
  // Use refs for timers to ensure they can be cleared properly
  const pingTimerRef = useRef<ManagedTimer | null>(null);
  const reconnectTimerRef = useRef<ManagedTimer | null>(null);
  const heartbeatTimeoutRef = useRef<ManagedTimer | null>(null);
  const pageVisibilityRef = useRef<boolean>(true);
  
  const { toast } = useToast();
  
  // Enable WebSocket after a delay to allow the app to load
  useEffect(() => {
    const enableTimeout = setTimeout(() => {
      setWsEnabled(true);
    }, 2000); // 2 second delay before enabling WebSocket - reduced from 5 seconds
    
    return () => clearTimeout(enableTimeout);
  }, []);

  // Handle page visibility changes to optimize connections
  useEffect(() => {
    function handleVisibilityChange() {
      const isVisible = document.visibilityState === 'visible';
      pageVisibilityRef.current = isVisible;
      
      // If page becomes visible and we have a socket, ensure timers are running
      if (isVisible) {
        console.log("[SafeWebSocketContext] Page is visible, resuming timers");
        if (pingTimerRef.current) pingTimerRef.current.resume();
        if (heartbeatTimeoutRef.current) heartbeatTimeoutRef.current.resume();
      } else {
        console.log("[SafeWebSocketContext] Page is hidden, pausing timers");
        if (pingTimerRef.current) pingTimerRef.current.pause();
        if (heartbeatTimeoutRef.current) heartbeatTimeoutRef.current.pause();
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Setup WebSocket connection with improved reliability
  const setupWebSocket = useCallback(() => {
    // Don't attempt connection if WebSockets are disabled
    if (!wsEnabled) {
      console.log("[SafeWebSocketContext] WebSocket is disabled, skipping connection");
      return;
    }
    
    console.log(`[SafeWebSocketContext] Setting up WebSocket connection (attempt ${reconnectAttempt + 1})`);
    
    // Clean up existing timers
    if (pingTimerRef.current) {
      pingTimerRef.current.clear();
      pingTimerRef.current = null;
    }
    
    if (reconnectTimerRef.current) {
      reconnectTimerRef.current.clear();
      reconnectTimerRef.current = null;
    }
    
    if (heartbeatTimeoutRef.current) {
      heartbeatTimeoutRef.current.clear();
      heartbeatTimeoutRef.current = null;
    }
    
    // If there's an active socket, try to close it properly first
    if (socket) {
      try {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          console.log("[SafeWebSocketContext] Closing existing socket");
          socket.close(1000, "Normal closure - new connection attempt");
        }
      } catch (err) {
        console.error("[SafeWebSocketContext] Error closing existing socket:", err);
      }
    }
    
    try {
      // For Replit, we need a special URL format to work around their proxy behavior
      // We've observed better connection stability with this approach
      const isHttps = window.location.protocol === 'https:';
      const protocol = isHttps ? "wss:" : "ws:";
      
      // Get the host but handle specific Replit domain format
      const host = window.location.host;
      const isReplitDomain = host.includes('.replit.app') || host.includes('.repl.co');
      
      // Use a more direct approach with the /ws path
      // On Replit domains, we override the normal connection pattern with additional reliability parameters
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      const wsUrl = isReplitDomain 
        ? `${protocol}//${host}/ws?t=${timestamp}&id=${randomId}` // Add timestamp and random ID to avoid caching issues
        : `${protocol}//${host}/ws`;
        
      console.log(`[SafeWebSocketContext] Connecting to WebSocket at ${wsUrl} (secure: ${isHttps}, replit: ${isReplitDomain})`);
      
      // Try connecting with additional error handling for Replit environment
      let ws: ReconnectingWebSocket;
      
      try {
        // Create a new ReconnectingWebSocket connection with better reconnection handling
        ws = new ReconnectingWebSocket(wsUrl, [], {
          maxRetries: Infinity,
          reconnectionDelayGrowFactor: 1.3, // Grow delay by 30% with each attempt
          minReconnectionDelay: 3000, // Start with 3s delay
          maxReconnectionDelay: 60000 // Cap at 1 minute
        });
      } catch (connectionError) {
        console.error(`[SafeWebSocketContext] Failed to create WebSocket with URL ${wsUrl}:`, connectionError);
        
        // If on Replit domain but first attempt fails, try an alternative URL format
        if (isReplitDomain) {
          // Create a new set of parameters to prevent any caching/collision
          const fallbackTimestamp = Date.now();
          const fallbackRandomId = Math.random().toString(36).substring(2, 10);
          const fallbackUrl = `${protocol}//${host}/ws?t=${fallbackTimestamp}&id=${fallbackRandomId}&fallback=true`;
          console.log(`[SafeWebSocketContext] Trying fallback WebSocket URL: ${fallbackUrl}`);
          
          // Create socket with fallback URL
          ws = new ReconnectingWebSocket(fallbackUrl, [], {
            maxRetries: Infinity,
            reconnectionDelayGrowFactor: 1.3, // Grow delay by 30% with each attempt
            minReconnectionDelay: 3000, // Start with 3s delay
            maxReconnectionDelay: 60000 // Cap at 1 minute
          });
        } else {
          // Re-throw for non-Replit domains
          throw connectionError;
        }
      }
      
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.error("[SafeWebSocketContext] Connection timed out");
          ws.close(4000, "Connection timeout");
        }
      }, 15000); // 15 second connection timeout
      
      // Set up heartbeat check function
      const setupHeartbeatCheck = () => {
        // Clear any existing heartbeat timeout
        if (heartbeatTimeoutRef.current) {
          heartbeatTimeoutRef.current.clear();
        }
        
        // Create a new heartbeat timeout to detect server silence
        heartbeatTimeoutRef.current = new ManagedTimer(() => {
          console.error("[SafeWebSocketContext] Heartbeat timeout - no response from server");
          if (ws.readyState === WebSocket.OPEN) {
            ws.close(4000, "Heartbeat timeout");
          }
        }, 240000); // 4 minute timeout (server sends heartbeats every 2 minutes)
      };
      
      // Connection opened handler
      ws.addEventListener("open", () => {
        console.log("[SafeWebSocketContext] Connected to WebSocket server");
        setConnected(true);
        
        // Clear connection timeout
        clearTimeout(connectionTimeout);
        
        // Reset reconnect attempt counter on successful connection
        if (reconnectAttempt > 0) {
          setReconnectAttempt(0);
        }
        
        // Notify user of successful connection
        toast({
          title: "Connected to Live Feed",
          description: "Real-time updates are now active",
          variant: "default",
        });
        
        // Send an initial ping to test the connection
        ws.send(JSON.stringify({ type: "ping", timestamp: new Date() }));
        
        // Setup initial heartbeat check
        setupHeartbeatCheck();
        
        // Setup ping interval to keep connection alive
        // Using a much longer interval (5 minutes) to reduce message frequency
        pingTimerRef.current = new ManagedTimer(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: "ping", timestamp: new Date() }));
            } catch (err) {
              console.error("[SafeWebSocketContext] Error sending ping:", err);
            }
          }
        }, 300000, true); // ping every 5 minutes (300,000 ms) to reduce connection load
        
        // If page is hidden, pause the ping timer
        if (!pageVisibilityRef.current && pingTimerRef.current) {
          pingTimerRef.current.pause();
        }
      });
      
      // Message handler
      ws.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Reset heartbeat timeout on any message - indicates server is alive
          setupHeartbeatCheck();
          
          // Only log non-heartbeat/non-ping messages to avoid console spam
          if (message.type !== 'heartbeat' && message.type !== 'pong' && !message.silent) {
            console.log("[SafeWebSocketContext] Message from server:", message);
          }
          
          // Handle specific message types
          switch (message.type) {
            case 'connect':
              console.log("[SafeWebSocketContext] Connection welcome message:", message.message);
              toast({
                title: "Connected to Live Feed",
                description: message.message,
                variant: "default",
              });
              break;
              
            case 'pong':
              // Just log the pong response without showing notification
              console.log("[SafeWebSocketContext] Received pong from server");
              break;
              
            case 'heartbeat':
              // Silently process the heartbeat without disrupting user experience
              if (!message.silent) {
                console.log("[SafeWebSocketContext] Received heartbeat from server");
              }
              break;
              
            case 'subscribed':
              console.log(`[SafeWebSocketContext] Subscribed to topic: ${message.topic}`);
              toast({
                title: "Subscribed to Updates",
                description: message.message || `Subscribed to ${message.topic}`,
                variant: "default",
              });
              break;
              
            case 'echo':
              console.log("[SafeWebSocketContext] Echo from server:", message);
              break;
              
            // Original single-item update handlers
            case 'social_update':
              console.log("[SafeWebSocketContext] Received social media update:", message);
              toast({
                title: "New Social Media Content",
                description: "New content has been added",
                variant: "default",
              });
              break;
              
            case 'sentiment_update':
              console.log("[SafeWebSocketContext] Received sentiment update:", message);
              toast({
                title: "Sentiment Analysis Update",
                description: "New sentiment data is available",
                variant: "default",
              });
              break;
              
            case 'keyword_alert':
              console.log("[SafeWebSocketContext] Received keyword alert:", message);
              toast({
                title: "Keyword Alert",
                description: `Keyword "${message.keyword}" detected in content`,
                variant: "destructive",
              });
              break;
              
            case 'platform_activity':
              console.log("[SafeWebSocketContext] Received platform activity update");
              break;
              
            // New batch update handlers (15-minute delayed updates)
            case 'social_update_batch':
              const socialCount = message.count || (message.data ? message.data.length : 0);
              console.log(`[SafeWebSocketContext] Received batch of ${socialCount} social media updates`);
              
              if (socialCount > 0) {
                toast({
                  title: "Social Media Updates",
                  description: `${socialCount} new social media posts available`,
                  variant: "default",
                });
              }
              break;
              
            case 'sentiment_update_batch':
              const sentimentCount = message.count || (message.data ? message.data.length : 0);
              console.log(`[SafeWebSocketContext] Received batch of ${sentimentCount} sentiment updates`);
              
              if (sentimentCount > 0) {
                toast({
                  title: "Sentiment Analysis Updates",
                  description: `${sentimentCount} new sentiment reports available`,
                  variant: "default",
                });
              }
              break;
              
            case 'keyword_alert_batch':
              const alertCount = message.count || (message.alerts ? message.alerts.length : 0);
              console.log(`[SafeWebSocketContext] Received batch of ${alertCount} keyword alerts`);
              
              if (alertCount > 0) {
                toast({
                  title: "Keyword Alerts",
                  description: `${alertCount} new keyword alerts detected`,
                  variant: "destructive",
                });
              }
              break;
              
            case 'platform_activity_batch':
              const activityCount = message.count || (message.data ? message.data.length : 0);
              console.log(`[SafeWebSocketContext] Received batch of ${activityCount} platform activity updates`);
              
              if (activityCount > 0) {
                toast({
                  title: "Platform Activity Updates",
                  description: `${activityCount} platform activity updates received`,
                  variant: "default",
                });
              }
              break;
              
            default:
              // For all other message types, just log them
              console.log("[SafeWebSocketContext] Unhandled message type:", message.type);
          }
          
          // Update last message for components to consume
          setLastMessage(message);
        } catch (error) {
          console.error("[SafeWebSocketContext] Failed to parse WebSocket message:", error);
        }
      });
      
      // Error handler
      ws.addEventListener("error", (error) => {
        console.error("[SafeWebSocketContext] WebSocket error:", error);
        clearTimeout(connectionTimeout);
      });
      
      // Connection closed handler with improved reconnection logic
      ws.addEventListener("close", (event) => {
        console.log(`[SafeWebSocketContext] WebSocket connection closed: Code ${event.code}, Reason: "${event.reason || 'No reason provided'}"`);
        setConnected(false);
        clearTimeout(connectionTimeout);
        
        // Clean up timers
        if (pingTimerRef.current) {
          pingTimerRef.current.clear();
          pingTimerRef.current = null;
        }
        
        if (heartbeatTimeoutRef.current) {
          heartbeatTimeoutRef.current.clear();
          heartbeatTimeoutRef.current = null;
        }
        
        // Modified reconnection logic for Replit:
        // Don't try to reconnect immediately if:
        // 1000 (Normal Closure) or 1001 (Going Away) - intentional closures
        // 1008 (Policy Violation) - server rejected connection
        // But for any other closure code, we will attempt reconnection with a longer delay
        const intentionalClosure = event.code === 1000 || event.code === 1001 || event.code === 1008;
        
        // Special handling for Replit environment
        // For normal closures, wait longer before attempting reconnect
        const isNormalClosure = event.code === 1000 || event.code === 1001;
        
        if (!intentionalClosure) {
          // Increment reconnect attempt counter for exponential backoff
          const nextAttempt = reconnectAttempt + 1;
          setReconnectAttempt(nextAttempt);
          
          // Calculate delay using exponential backoff with extra delay for Replit proxy stability
          // Use a higher base delay to reduce connection cycling
          let reconnectDelay = getExponentialBackoffDelay(nextAttempt);
          reconnectDelay = reconnectDelay + 5000; // Add an extra 5 seconds base delay
          
          // Log reconnection attempt
          console.log(`[SafeWebSocketContext] Will reconnect in ${Math.round(reconnectDelay/1000)} seconds (attempt ${nextAttempt})`);
          
          // Only show toast for repeated failures to avoid spamming the user
          if (nextAttempt > 2) {
            toast({
              title: "Connection Issues",
              description: "Experiencing connection issues. Retrying...",
              variant: "destructive",
            });
          }
          
          // Schedule reconnection with extended exponential backoff
          reconnectTimerRef.current = new ManagedTimer(() => {
            console.log(`[SafeWebSocketContext] Attempting reconnect (attempt ${nextAttempt})`);
            setupWebSocket();
          }, reconnectDelay);
        } else if (isNormalClosure) {
          // For normal closures in Replit, we'll still reconnect but with a much longer delay
          // to prevent rapid connection cycling that can occur with the Replit proxy
          console.log("[SafeWebSocketContext] Normal closure detected, will attempt reconnect with longer delay");
          
          // Schedule a reconnection after 30 seconds for normal closures
          reconnectTimerRef.current = new ManagedTimer(() => {
            console.log("[SafeWebSocketContext] Attempting reconnect after normal closure");
            setupWebSocket();
          }, 30000); // 30 second delay for normal closures
        } else {
          console.log("[SafeWebSocketContext] Not reconnecting due to intentional policy violation closure");
        }
      });
      
      // Store the socket in state
      setSocket(ws);
    } catch (error) {
      console.error("[SafeWebSocketContext] Error creating WebSocket connection:", error);
      
      // Increment reconnect attempt counter
      const nextAttempt = reconnectAttempt + 1;
      setReconnectAttempt(nextAttempt);
      
      // Calculate delay with exponential backoff
      const reconnectDelay = getExponentialBackoffDelay(nextAttempt);
      
      // Schedule reconnection
      reconnectTimerRef.current = new ManagedTimer(() => {
        console.log(`[SafeWebSocketContext] Attempting reconnect after error (attempt ${nextAttempt})`);
        setupWebSocket();
      }, reconnectDelay);
    }
  }, [toast, wsEnabled, reconnectAttempt, socket]);
  
  // Initialize WebSocket on component mount - only if enabled
  useEffect(() => {
    if (wsEnabled) {
      setupWebSocket();
    }
    
    // Cleanup on unmount
    return () => {
      console.log("[SafeWebSocketContext] Cleaning up WebSocket connection");
      
      // Clean up all timers
      if (pingTimerRef.current) {
        pingTimerRef.current.clear();
      }
      
      if (reconnectTimerRef.current) {
        reconnectTimerRef.current.clear();
      }
      
      if (heartbeatTimeoutRef.current) {
        heartbeatTimeoutRef.current.clear();
      }
      
      // Close socket if it exists
      if (socket) {
        try {
          if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            socket.close(1000, "Component unmounting");
          }
        } catch (err) {
          console.error("[SafeWebSocketContext] Error closing socket on unmount:", err);
        }
      }
    };
  }, [setupWebSocket, wsEnabled]);
  
  // Send message through WebSocket with intelligent error handling
  const sendMessage = useCallback((type: string, data: any = {}) => {
    // Always check if socket exists and is open before attempting to send
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        // Prepare message with timestamp
        const message = JSON.stringify({
          type,
          data,
          timestamp: new Date()
        });
        
        // Send message
        socket.send(message);
        return true;
      } catch (error) {
        console.error("[SafeWebSocketContext] Error sending message:", error);
        
        // Only show toast for user-initiated actions, not system messages
        if (type !== "ping") {
          toast({
            title: "Message Delivery Failed",
            description: "Failed to send real-time message",
            variant: "destructive",
            duration: 3000
          });
        }
        return false;
      }
    } else {
      // Socket isn't open - queue for retry only for important messages
      if (type !== "ping") {
        console.log("[SafeWebSocketContext] Socket not ready, cannot send message:", type);
        toast({
          title: "Not Connected",
          description: "Waiting for connection to be established",
          variant: "destructive",
          duration: 3000
        });
      }
      return false;
    }
  }, [socket, toast]);
  
  // Manual reconnect function for user-initiated reconnection
  const reconnect = useCallback(() => {
    console.log("[SafeWebSocketContext] Manual reconnection initiated by user");
    toast({
      title: "Reconnecting...",
      description: "Establishing a new connection",
    });
    
    // Reset reconnect attempt counter for manual reconnection
    setReconnectAttempt(0);
    
    // Clean up existing connection if needed
    if (socket) {
      try {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close(1000, "User-initiated reconnect");
        }
      } catch (e) {
        console.error("[SafeWebSocketContext] Error closing socket:", e);
      }
    }
    
    // Clean up existing timers
    if (pingTimerRef.current) {
      pingTimerRef.current.clear();
      pingTimerRef.current = null;
    }
    
    if (reconnectTimerRef.current) {
      reconnectTimerRef.current.clear();
      reconnectTimerRef.current = null;
    }
    
    if (heartbeatTimeoutRef.current) {
      heartbeatTimeoutRef.current.clear();
      heartbeatTimeoutRef.current = null;
    }
    
    // Immediate reconnection attempt
    setTimeout(() => {
      setupWebSocket();
    }, 500);
  }, [socket, toast, setupWebSocket]);
  
  return (
    <SafeWebSocketContext.Provider value={{ connected, sendMessage, lastMessage, reconnect }}>
      {children}
    </SafeWebSocketContext.Provider>
  );
}

export function useSafeWebSocket() {
  return useContext(SafeWebSocketContext);
}