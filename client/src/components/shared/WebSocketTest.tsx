import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
} from 'react';
import { useWebSocket } from '@/lib/websocket-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

/**
 * Test component to verify WebSocket context functionality.
 * Safely falls back if provider is missing.
 */
const WebSocketTest: React.FC = memo(() => {
  const { connected, connectionStatus, sendMessage, lastMessage, reconnect } = useWebSocket();
  const [testMessages, setTestMessages] = useState<string[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const timeoutRef = useRef<number>();

  // Append messages when receiving
  useEffect(() => {
    if (lastMessage) {
      try {
        const msgText = JSON.stringify(lastMessage);
        setTestMessages((prev) => [...prev, `Message received: ${msgText}`]);
      } catch {
        setTestMessages((prev) => [...prev, 'Message received (unserializable)']);
      }
    }
  }, [lastMessage]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Send a test ping message
  const handleSendTestMessage = useCallback(() => {
    if (isTestRunning) return;

    setIsTestRunning(true);
    setTestMessages((prev) => [...prev, 'Sending test message...']);

    try {
      sendMessage('ping', { timestamp: Date.now() });
    } catch {
      setTestMessages((prev) => [...prev, 'Failed to send test message']);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsTestRunning(false);
      setTestMessages((prev) => [...prev, 'Test completed']);
    }, 5000);
  }, [isTestRunning, sendMessage]);

  // Clear the log
  const handleClearLog = useCallback(() => {
    setTestMessages([]);
  }, []);

  // Attempt manual reconnect
  const handleReconnect = useCallback(() => {
    setTestMessages((prev) => [...prev, 'Attempting reconnection...']);
    reconnect();
  }, [reconnect]);

  return (
    <Card className="w-full max-w-md mx-auto" role="region" aria-label="WebSocket Test">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          WebSocket Test
          <Badge
            variant={connected ? 'outline' : 'destructive'}
            className={connected ? 'bg-green-100 text-green-800' : ''}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {connected ? (
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3" aria-hidden /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" aria-hidden /> Disconnected
              </span>
            )}
          </Badge>
        </CardTitle>
        <CardDescription>
          <span>Status: {connectionStatus}</span>
          {isTestRunning && (
            <RefreshCw
              className="inline-block ml-2 h-3 w-3 animate-spin"
              aria-label="Test running"
            />
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div
          className="bg-muted rounded-md p-2 h-32 overflow-y-auto text-xs"
          role="log"
          aria-live="polite"
        >
          {testMessages.length === 0 ? (
            <p className="text-muted-foreground text-center mt-10">
              No messages yet
            </p>
          ) : (
            testMessages.map((msg, i) => (
              <div key={i} className="mb-1">
                {msg}
              </div>
            ))
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between" role="group" aria-label="WebSocket test controls">
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendTestMessage}
            disabled={isTestRunning}
            aria-disabled={isTestRunning}
          >
            Send Test
          </Button>
          <Button size="sm" variant="outline" onClick={handleReconnect}>
            Reconnect
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={handleClearLog}>
          Clear Log
        </Button>
      </CardFooter>
    </Card>
  );
});

WebSocketTest.displayName = 'WebSocketTest';
export default WebSocketTest;
