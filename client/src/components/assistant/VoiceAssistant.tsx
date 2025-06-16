import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Volume2, VolumeX, Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VoiceAssistantProps {
  onNavigate?: (section: string) => void;
  className?: string;
}

type AssistantMessage = {
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

// Commands that the voice assistant can recognize
const VOICE_COMMANDS = {
  OPEN_SECTION: /open|show|navigate|go to|display/i,
  SECTIONS: {
    COMMUNICATION: /communication|media|press|news/i,
    INNOVATION: /innovation|creative|create|ideas/i,
    TRANSFORMATION: /transformation|digital|smart/i,
    DATA: /data|knowledge|information/i,
    OVERVIEW: /overview|summary|dashboard|main/i,
  },
  HELP: /help|assist|guide|what can you do/i,
  CLOSE: /close|exit|bye|goodbye/i,
};

// Assistant responses based on command type
const ASSISTANT_RESPONSES = {
  GREETING: [
    "Hello! I'm your KPI assistant. How can I help you today?",
    "Hi there! Ready to explore your KPIs? Just ask!",
    "Greetings! Your voice-activated assistant is ready. What would you like to see?"
  ],
  NAVIGATION_SUCCESS: [
    "Sure thing! Navigating to {section} section now.",
    "Alright! Here's the {section} data you asked for.",
    "On it! Showing you the {section} metrics right away."
  ],
  HELP: [
    "You can ask me to navigate to different KPI sections like 'Show me communication KPIs' or 'Open the innovation section'. Try it out!",
    "I can help you navigate through the dashboard. Try saying 'Show me data management KPIs' or 'Go to overview'."
  ],
  NOT_UNDERSTOOD: [
    "Sorry, I didn't catch that. Could you try again?",
    "I'm not sure what you're asking for. Try asking for a specific section like 'Show me innovation KPIs'.",
    "I didn't understand. You can say things like 'Open communication section' or 'Show data KPIs'."
  ],
  FAREWELL: [
    "Goodbye! I'll be here if you need me again.",
    "See you later! Just click the mic icon when you need assistance.",
    "Until next time! Voice navigation is just a click away when you need it."
  ]
};

// Map section identifiers to display names
const SECTION_DISPLAY_NAMES: Record<string, string> = {
  'communication': 'Government Communication',
  'innovation': 'Innovation',
  'transformation': 'Smart Transformation',
  'data': 'Data & Knowledge Management',
  'overview': 'Overview Charts'
};

export function VoiceAssistant({ onNavigate, className }: VoiceAssistantProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { text: ASSISTANT_RESPONSES.GREETING[Math.floor(Math.random() * ASSISTANT_RESPONSES.GREETING.length)], sender: 'assistant', timestamp: new Date() }
  ]);
  
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const userMessage = event.results[0][0].transcript;
        setTranscript(userMessage);
        handleUserMessage(userMessage);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: t('assistant.error'),
          description: t('assistant.microphoneError'),
          variant: 'destructive',
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      toast({
        title: t('assistant.unsupported'),
        description: t('assistant.browserUnsupported'),
        variant: 'destructive',
      });
    }

    // Initialize speech synthesis
    speechSynthesisRef.current = new SpeechSynthesisUtterance();
    
    // Configure voice based on language
    updateSpeechSynthesisVoice();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, [i18n.language, toast, t]);

  // Update speech synthesis voice when language changes
  useEffect(() => {
    updateSpeechSynthesisVoice();
  }, [i18n.language]);

  const updateSpeechSynthesisVoice = () => {
    if (!speechSynthesisRef.current) return;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      // If voices aren't loaded yet, wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        updateSpeechSynthesisVoice();
      };
      return;
    }
    
    // Find voice for current language
    const langPrefix = i18n.language === 'ar' ? 'ar' : 'en';
    const voice = voices.find(v => v.lang.startsWith(langPrefix));
    
    if (voice) {
      speechSynthesisRef.current.voice = voice;
    } else {
      // Fallback to default voice
      speechSynthesisRef.current.voice = voices[0];
    }
    
    speechSynthesisRef.current.lang = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    speechSynthesisRef.current.rate = 1.0;
    speechSynthesisRef.current.pitch = 1.0;
  };

  // Start/stop listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: t('assistant.unsupported'),
        description: t('assistant.browserUnsupported'),
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error', error);
        toast({
          title: t('assistant.error'),
          description: t('assistant.startError'),
          variant: 'destructive',
        });
      }
    }
  };

  // Toggle assistant visibility
  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Process user message and determine response
  const handleUserMessage = (userMessage: string) => {
    // Add user message to conversation
    addMessage(userMessage, 'user');
    
    // Process the command
    let responseText = '';
    let handled = false;
    
    // Check for exit/close command
    if (VOICE_COMMANDS.CLOSE.test(userMessage)) {
      responseText = getRandomResponse(ASSISTANT_RESPONSES.FAREWELL);
      setIsOpen(false);
      handled = true;
    }
    // Check for help command
    else if (VOICE_COMMANDS.HELP.test(userMessage)) {
      responseText = getRandomResponse(ASSISTANT_RESPONSES.HELP);
      handled = true;
    }
    // Check for navigation commands
    else if (VOICE_COMMANDS.OPEN_SECTION.test(userMessage)) {
      let targetSection = '';
      
      // Determine which section to navigate to
      if (VOICE_COMMANDS.SECTIONS.COMMUNICATION.test(userMessage)) {
        targetSection = 'communication';
      } else if (VOICE_COMMANDS.SECTIONS.INNOVATION.test(userMessage)) {
        targetSection = 'innovation';
      } else if (VOICE_COMMANDS.SECTIONS.TRANSFORMATION.test(userMessage)) {
        targetSection = 'transformation';
      } else if (VOICE_COMMANDS.SECTIONS.DATA.test(userMessage)) {
        targetSection = 'data';
      } else if (VOICE_COMMANDS.SECTIONS.OVERVIEW.test(userMessage)) {
        targetSection = 'overview';
      }
      
      if (targetSection && onNavigate) {
        // Navigate to section
        onNavigate(targetSection);
        
        // Generate success response
        const displayName = SECTION_DISPLAY_NAMES[targetSection] || targetSection;
        responseText = getRandomResponse(ASSISTANT_RESPONSES.NAVIGATION_SUCCESS).replace('{section}', displayName);
        handled = true;
      }
    }
    
    // If no command matched, send generic response
    if (!handled) {
      responseText = getRandomResponse(ASSISTANT_RESPONSES.NOT_UNDERSTOOD);
    }
    
    // Add assistant response to conversation
    addMessage(responseText, 'assistant');
    
    // Speak response if not muted
    if (!isMuted && speechSynthesisRef.current) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      speechSynthesisRef.current.text = responseText;
      window.speechSynthesis.speak(speechSynthesisRef.current);
    }
  };

  // Helper to get random response from array
  const getRandomResponse = (responses: string[]) => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Add message to conversation
  const addMessage = (text: string, sender: 'user' | 'assistant') => {
    setMessages(prev => [...prev, { text, sender, timestamp: new Date() }]);
  };

  return (
    <div className={cn("fixed z-50", className)}>
      {/* Floating action button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="default" 
              size="icon" 
              className="rounded-full bg-[#cba344] text-white hover:bg-[#b8943e] shadow-md fixed bottom-6 right-6"
              onClick={toggleAssistant}
            >
              <Bot className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isOpen ? t('assistant.hideAssistant') : t('assistant.showAssistant')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Assistant dialog */}
      {isOpen && (
        <Card className="fixed bottom-20 right-6 w-80 shadow-lg border-2 border-[#cba344]/20 overflow-hidden max-h-[500px]">
          <div className="bg-[#cba344] text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">{t('assistant.title')}</h3>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:text-white/80 hover:bg-[#b8943e]"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:text-white/80 hover:bg-[#b8943e]"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="chat">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="chat">{t('assistant.chat')}</TabsTrigger>
              <TabsTrigger value="help">{t('assistant.help')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="p-0">
              <CardContent className="p-3 h-72 flex flex-col">
                {/* Chat messages */}
                <ScrollArea className="flex-1 mb-3 pr-4">
                  <div className="space-y-3">
                    {messages.map((message, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "p-2 rounded-lg max-w-[85%]",
                          message.sender === 'assistant' 
                            ? "bg-[#f9f4e9] mr-auto" 
                            : "bg-[#cba344]/10 ml-auto"
                        )}
                      >
                        <p className="text-sm">{message.text}</p>
                        <span className="text-xs text-gray-500 block mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Voice input section */}
                <div className="flex items-center">
                  <div className="flex-1 text-sm mr-2 italic text-gray-500">
                    {isListening 
                      ? t('assistant.listening') 
                      : t('assistant.clickToSpeak')}
                  </div>
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="icon"
                    className={cn(
                      "rounded-full",
                      isListening ? "animate-pulse" : "bg-[#cba344] hover:bg-[#b8943e]"
                    )}
                    onClick={toggleListening}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="help">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">{t('assistant.voiceCommands')}</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-medium">{t('assistant.navigation')}:</span>
                    <p>"{t('assistant.navExample1')}"</p>
                    <p>"{t('assistant.navExample2')}"</p>
                  </li>
                  <li>
                    <span className="font-medium">{t('assistant.getHelp')}:</span>
                    <p>"{t('assistant.helpExample')}"</p>
                  </li>
                  <li>
                    <span className="font-medium">{t('assistant.closeAssistant')}:</span>
                    <p>"{t('assistant.closeExample')}"</p>
                  </li>
                </ul>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}

// Remove default export to use named export only