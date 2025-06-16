import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import useWebSocket from '@/hooks/useWebSocket';
import { isRunningInReplit } from '@/utils/replit-config';

type MessageType = {
  id: string;
  direction: 'sent' | 'received';
  content: string;
  timestamp: string;
  type?: string;
}

const WebSocketTester: React.FC = () => {
  const { t } = useTranslation();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [topic, setTopic] = useState('general');
  const [connectionInfo, setConnectionInfo] = useState('');
  
  // Display connection information to help with debugging
  useEffect(() => {
    const isReplit = isRunningInReplit();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsInfo = `${protocol}//${host}/ws (Running in ${isReplit ? 'Replit' : 'Development'})`;
    setConnectionInfo(wsInfo);
    
    // Add system message with connection information
    addSystemMessage(`Attempting to connect to: ${wsInfo}`);
  }, []);

  const { status, sendMessage, lastMessage } = useWebSocket('/ws', {
    debug: true,
    onMessage: (data) => {
      const newMessage: MessageType = {
        id: crypto.randomUUID(),
        direction: 'received',
        content: JSON.stringify(data, null, 2),
        timestamp: new Date().toISOString(),
        type: data.type
      };
      setMessages(prev => [...prev, newMessage]);
    },
    onOpen: () => {
      addSystemMessage('Connection established');
    },
    onClose: () => {
      addSystemMessage('Connection closed');
    },
    onError: (event) => {
      addSystemMessage(`Connection error: ${JSON.stringify(event)}`);
    }
  });

  const addSystemMessage = (content: string) => {
    const systemMessage: MessageType = {
      id: crypto.randomUUID(),
      direction: 'received',
      content,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    try {
      // Try to parse as JSON
      const jsonMessage = JSON.parse(messageInput);
      const messageType = jsonMessage.type || 'message';
      
      sendMessage(messageType, jsonMessage.data || jsonMessage);
      
      // Record message in UI
      const newMessage: MessageType = {
        id: crypto.randomUUID(),
        direction: 'sent',
        content: messageInput,
        timestamp: new Date().toISOString(),
        type: messageType
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
    } catch (e) {
      // Not valid JSON, send as regular message
      sendMessage('message', { text: messageInput, topic });
      
      // Record message in UI
      const newMessage: MessageType = {
        id: crypto.randomUUID(),
        direction: 'sent',
        content: messageInput,
        timestamp: new Date().toISOString(),
        type: 'message'
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
    }
  };

  const handleSubscribe = () => {
    if (!topic.trim()) return;
    
    sendMessage('subscribe', { topic });
    addSystemMessage(`Subscribed to topic: ${topic}`);
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleSendPing = () => {
    if (status === 'connected') {
      sendMessage('ping', { timestamp: new Date().toISOString() });
      addSystemMessage('Ping sent');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'reconnecting': return 'bg-yellow-500 animate-pulse';
      case 'disconnected': return 'bg-red-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('websocket.tester.title', 'WebSocket Tester')}</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="text-sm font-medium capitalize">{status}</span>
          </div>
        </div>
        <CardDescription>
          {t('websocket.tester.description', 'Test WebSocket connections with real-time messages')}
        </CardDescription>
        {connectionInfo && (
          <div className="mt-2 text-xs bg-muted p-2 rounded-md font-mono">
            Connection URL: {connectionInfo}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Input 
            placeholder={t('websocket.tester.topicPlaceholder', 'Enter topic name')}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSubscribe} disabled={status !== 'connected'}>
            {t('websocket.tester.subscribe', 'Subscribe')}
          </Button>
        </div>
        
        <ScrollArea className="h-[300px] border rounded-md p-4 mb-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {t('websocket.tester.noMessages', 'No messages yet')}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex flex-col ${message.direction === 'sent' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.type && (
                      <Badge variant={message.type === 'system' ? 'outline' : 'default'}>
                        {message.type}
                      </Badge>
                    )}
                  </div>
                  <div 
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.direction === 'sent' 
                        ? 'bg-primary text-primary-foreground' 
                        : message.type === 'system'
                          ? 'bg-muted text-muted-foreground border'
                          : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                      {message.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder={t('websocket.tester.messagePlaceholder', 'Type your message (plain text or JSON)')}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="min-h-[100px] font-mono"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            {t('websocket.tester.clear', 'Clear')}
          </Button>
          <Button variant="secondary" onClick={handleSendPing} disabled={status !== 'connected'}>
            {t('websocket.tester.ping', 'Ping')}
          </Button>
        </div>
        <Button onClick={handleSendMessage} disabled={status !== 'connected' || !messageInput.trim()}>
          {t('websocket.tester.send', 'Send')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebSocketTester;