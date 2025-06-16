import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Send, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Chat message interface
interface ChatMessage {
  content: string;
  role: 'user' | 'bot';
  timestamp?: Date;
}

// Chat widget component
const ChatWidget: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isLoggedIn } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add initial welcome message
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        role: 'bot',
        content: i18n.language === 'ar' 
          ? 'مرحبًا! أنا مساعد Media Pulse الذكي. كيف يمكنني مساعدتك اليوم؟'
          : 'Hello! I\'m the Media Pulse assistant. How can I help you today?'
      }]);
    }
  }, [i18n.language, chatHistory.length]);

  // Scroll to bottom of chat when history changes
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatHistory, isOpen]);

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
    
    // Simulate a delay for response
    setTimeout(() => {
      // Add a simulated response
      const botMessage: ChatMessage = {
        role: 'bot',
        content: getSimulatedResponse(userMessage.content, i18n.language === 'ar'),
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1200);
  };

  // Generate a simulated response based on the user's message
  const getSimulatedResponse = (userMessage: string, isArabic: boolean): string => {
    // Simple keyword matching for demonstration
    const message = userMessage.toLowerCase();
    
    if (isArabic) {
      return 'سيتم الاتصال بالخدمة الفعلية عندما تكون جاهزة. كيف يمكنني مساعدتك أكثر؟';
    }
    
    if (message.includes('hello') || message.includes('hi')) {
      return 'Hello! How can I help you with Media Pulse today?';
    }
    
    if (message.includes('report') || message.includes('analytics')) {
      return 'I can help you generate various reports like sentiment analysis, engagement statistics, and media coverage. What specific information are you looking for?';
    }
    
    if (message.includes('sentiment')) {
      return 'Our sentiment analysis tools can track public opinion across different platforms. Would you like to know more about how it works?';
    }
    
    if (message.includes('help')) {
      return 'I can help with reports, sentiment analysis, setting alerts, managing journalist contacts, and publishing posts. Just let me know what you need.';
    }
    
    // Default response
    return 'I understand you\'re asking about "' + userMessage + '". The live chat service will be connected when ready. How else can I assist you?';
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-96 flex flex-col shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-2 border-b bg-muted">
            <h3 className="font-medium">{t('chat.title', 'Media Pulse Assistant')}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Chat Messages */}
          <div 
            className="flex-1 overflow-y-auto p-3 space-y-3"
            style={{ backgroundColor: '#f9f4e9' }} // As per your specified bubble background
          >
            {chatHistory.map((msg, index) => (
              <div 
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card 
                  className={cn(
                    "max-w-[85%] p-2 shadow-sm",
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-white'
                  )}
                  style={{ color: '#333' }} // As per your specified message text color
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {msg.timestamp && (
                    <div className={`text-xs mt-1 ${
                      msg.role === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString(undefined, { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </Card>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Card className="px-3 py-2 bg-white" style={{ color: '#333' }}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <form onSubmit={sendMessage} className="p-2 border-t bg-white">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={t('chat.inputPlaceholder', 'Type a message...')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 text-sm"
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !message.trim()}
                size="sm"
                style={{ backgroundColor: '#cba344' }} // As per your specified send button color
                className="shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;