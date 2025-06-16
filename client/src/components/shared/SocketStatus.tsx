import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RefreshCw, Wifi, WifiOff, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatTime } from '@/utils/date';

interface WebSocketMessage {
  type: string;
  timestamp: string;
  data?: any;
}

/**
 * Component for monitoring WebSocket connection status
 * and displaying ping metrics and messages.
 */
const SocketStatus: React.FC = memo(() => {
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [activeTab, setActiveTab] = useState<string>('status');

  /** Establish a WebSocket connection with automatic reconnect */
  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    socketRef.current = ws;

    ws.addEventListener('open', () => {
      setIsConnected(true);
      toast({
        title: 'WebSocket Connected',
        description: 'Real-time connection established.',
        variant: 'default'
      });
    });

    ws.addEventListener('close', () => {
      setIsConnected(false);
      toast({
        title: 'WebSocket Disconnected',
        description: 'Connection lost. Attempting to reconnect...',
        variant: 'destructive'
      });
      // Attempt reconnection after delay
      reconnectTimeout.current = window.setTimeout(connect, 5000);
    });

    ws.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      toast({
        title: 'WebSocket Error',
        description: 'An error occurred with the connection.',
        variant: 'destructive'
      });
    });

    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong' && data.originalTimestamp) {
          const sent = new Date(data.originalTimestamp).getTime();
          const now = Date.now();
          setLastPing(new Date(data.timestamp));
          setPingTime(now - sent);
        }
        // Prepend new message, trim to last 10
        setMessages(prev => [
          { type: data.type, timestamp: data.timestamp, data: data.data },
          ...prev
        ].slice(0, 10));
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    });
  }, [toast]);

  // Initialize WS on mount
  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connect]);

  /** Send a ping to measure latency */
  const sendPing = useCallback(() => {
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const timestamp = new Date().toISOString();
      ws.send(JSON.stringify({ type: 'ping', originalTimestamp: timestamp }));
      toast({
        title: 'Ping Sent',
        description: 'Awaiting server response...',
      });
    } else {
      toast({
        title: 'Cannot Send Ping',
        description: 'WebSocket not connected.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  /** Memoized status badge */
  const statusBadge = useCallback(() => (
    <Badge
      variant="outline"
      className={isConnected ? 'border-green-200 bg-green-100 text-green-800' : 'border-red-200 bg-red-100 text-red-800'}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {isConnected ? <Wifi aria-hidden className="h-4 w-4 mr-1" /> : <WifiOff aria-hidden className="h-4 w-4 mr-1" />}
      {isConnected ? 'Connected' : 'Disconnected'}
    </Badge>
  ), [isConnected]);

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Connection Status</CardTitle>
          {statusBadge()}
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardContent className="pt-0 pb-1">
          <TabsList className="w-full">
            <TabsTrigger value="status" className="text-xs">Status</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
          </TabsList>
        </CardContent>

        <TabsContent value="status" className="p-3 pt-0" role="region" aria-label="WebSocket status">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Connection:</span>
              <span>{isConnected ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Ping:</span>
              <span>
                {lastPing
                  ? <span className="flex items-center"><Clock aria-hidden className="h-3 w-3 mr-1" />{formatTime(lastPing)}</span>
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Latency:</span>
              <span>{pingTime != null ? `${pingTime} ms` : 'N/A'}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="p-3 pt-0" role="region" aria-label="WebSocket messages">
          <div className="space-y-1 max-h-[130px] overflow-y-auto text-xs">
            {messages.length > 0 ? messages.map((msg, i) => (
              <div key={i} className="border-b pb-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{msg.type}</span>
                  <span className="text-muted-foreground">{formatTime(new Date(msg.timestamp))}</span>
                </div>
                <pre className="text-[10px] mt-1 whitespace-pre-wrap overflow-hidden">{JSON.stringify(msg.data, null, 2)}</pre>
              </div>
            )) : (
              <div className="text-center py-4 text-muted-foreground text-xs">No messages yet</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-between border-t pt-2 pb-2">
        <Button variant="outline" size="sm" onClick={sendPing} disabled={!isConnected} aria-disabled={!isConnected} className="text-xs h-7">
          <Send aria-hidden className="h-3 w-3 mr-1" />Ping
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { socketRef.current?.close(); connect(); }} className="text-xs h-7">
          <RefreshCw aria-hidden className="h-3 w-3 mr-1" />Reconnect
        </Button>
      </CardFooter>
    </Card>
  );
});

SocketStatus.displayName = 'SocketStatus';

export default SocketStatus;
