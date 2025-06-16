import { useEffect, useState } from 'react';
import { useWebSocket } from './WebSocketProvider';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const WebSocketConnectionStatus = () => {
  const { t } = useTranslation();
  const { isConnected, connectionStatus, reconnect } = useWebSocket();
  const [showReconnected, setShowReconnected] = useState(false);

  // Show reconnected message briefly when connection is restored
  useEffect(() => {
    if (isConnected) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="destructive" 
              className="px-2 py-1 cursor-pointer"
              onClick={reconnect}
            >
              <WifiOff className="h-4 w-4 mr-1" />
              <span>{t('websocket.disconnected')}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('websocket.clickToReconnect')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (showReconnected) {
    return (
      <Badge variant="outline" className="px-2 py-1 bg-green-500 text-white">
        <Wifi className="h-4 w-4 mr-1" />
        <span>{t('websocket.reconnected')}</span>
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="px-2 py-1">
            <Wifi className="h-4 w-4 mr-1" />
            <span>{t('websocket.connected')}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{connectionStatus}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};