import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import Markdown from 'react-markdown';

// Chat message interface
interface ChatMessage {
  id?: number;
  content: string;
  role: 'user' | 'bot';
  timestamp?: Date;
}

// Chat interface component
const ChatInterface: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);

  // Fetch chat history on component mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchChatHistory();
    } else {
      setIsFetchingHistory(false);
      // Add a welcome message for non-logged in users
      setChatHistory([{
        role: 'bot',
        content: i18n.language === 'ar' 
          ? 'مرحبًا! أنا مساعد Media Pulse الذكي. كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! I\'m the Media Pulse intelligent assistant. How can I help you today?'
      }]);
    }
  }, [isLoggedIn, i18n.language]);

  // Scroll to bottom of chat when history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Fetch chat history from server
  const fetchChatHistory = async () => {
    try {
      setIsFetchingHistory(true);
      const response = await apiRequest<{ history: ChatMessage[] }>('/api/chat/history');
      
      if (response && response.history) {
        setChatHistory(response.history);
      } else {
        // Add a welcome message if no history exists
        setChatHistory([{
          role: 'bot',
          content: i18n.language === 'ar' 
            ? 'مرحبًا! أنا مساعد Media Pulse الذكي. كيف يمكنني مساعدتك اليوم؟'
            : 'Hello! I\'m the Media Pulse intelligent assistant. How can I help you today?'
        }]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: t('chat.error.history.title', 'Error'),
        description: t('chat.error.history.description', 'Failed to load chat history. Please try again.'),
        variant: 'destructive',
      });
      
      // Add a fallback welcome message
      setChatHistory([{
        role: 'bot',
        content: i18n.language === 'ar' 
          ? 'مرحبًا! أنا مساعد Media Pulse الذكي. كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! I\'m the Media Pulse intelligent assistant. How can I help you today?'
      }]);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  // Clear chat history
  const clearChatHistory = async () => {
    if (!isLoggedIn) {
      setChatHistory([{
        role: 'bot',
        content: i18n.language === 'ar' 
          ? 'تم مسح المحادثة. كيف يمكنني مساعدتك؟'
          : 'Chat cleared. How can I help you?'
      }]);
      return;
    }
    
    try {
      await apiRequest('/api/chat/clear', {
        method: 'POST',
      });
      
      // Add a fresh welcome message
      setChatHistory([{
        role: 'bot',
        content: i18n.language === 'ar' 
          ? 'تم مسح المحادثة. كيف يمكنني مساعدتك؟'
          : 'Chat cleared. How can I help you?'
      }]);
      
      toast({
        title: t('chat.success.clear.title', 'Success'),
        description: t('chat.success.clear.description', 'Chat history has been cleared.'),
      });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        title: t('chat.error.clear.title', 'Error'),
        description: t('chat.error.clear.description', 'Failed to clear chat history.'),
        variant: 'destructive',
      });
    }
  };

  // Send a message to the chat
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to chat history
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Send message to server
      const response = await apiRequest<{
        message: string;
        data?: any;
        intent?: string;
        confidence?: number;
        entities?: Array<{entity: string; value: string}>;
        language?: string;
      }>('/api/chat', {
        method: 'POST',
        data: {
          message: userMessage.content,
          language: i18n.language
        }
      });
      
      // Add bot response to chat history
      if (response && response.message) {
        const botMessage: ChatMessage = {
          role: 'bot',
          content: response.message,
          timestamp: new Date()
        };
        
        setChatHistory(prev => [...prev, botMessage]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'bot',
        content: i18n.language === 'ar'
          ? 'عذرًا، حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an error occurred while processing your message. Please try again.',
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
      
      toast({
        title: t('chat.error.send.title', 'Error'),
        description: t('chat.error.send.description', 'Failed to send message. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-4 py-2 bg-muted">
        <h2 className="text-xl font-semibold">{t('chat.title', 'Media Pulse Assistant')}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={clearChatHistory}
          disabled={isLoading || isFetchingHistory}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('chat.clearButton', 'Clear Chat')}
        </Button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {isFetchingHistory ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">{t('chat.loading', 'Loading chat history...')}</span>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card 
                className={`max-w-[80%] p-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}
              >
                <div className="prose prose-sm dark:prose-invert">
                  <Markdown>{msg.content}</Markdown>
                </div>
                {msg.timestamp && (
                  <div className={`text-xs mt-1 ${
                    msg.role === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={t('chat.inputPlaceholder', 'Type a message...')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading || isFetchingHistory}
            className="flex-1"
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
          />
          <Button type="submit" disabled={isLoading || isFetchingHistory || !message.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">{t('chat.sendButton', 'Send')}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;