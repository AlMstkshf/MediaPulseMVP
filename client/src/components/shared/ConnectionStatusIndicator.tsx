import React from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import useWebSocket from '@/hooks/useWebSocket';
import { useTranslation } from 'react-i18next';

export interface ConnectionStatusIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  className,
  size = 'md',
  showLabel = false,
}) => {
  const { t } = useTranslation();
  const { status } = useWebSocket('/ws', { 
    debug: false, 
    reconnectAttempts: 10,
    reconnectInterval: 2000
  });

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500 animate-pulse';
      case 'disconnected':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return t('connection.status.connected');
      case 'connecting':
        return t('connection.status.connecting');
      case 'reconnecting':
        return t('connection.status.reconnecting');
      case 'disconnected':
        return t('connection.status.disconnected');
      case 'error':
        return t('connection.status.error');
      default:
        return t('connection.status.unknown');
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-2', className)}>
            <div
              className={cn(
                'rounded-full',
                sizeClasses[size],
                getStatusColor()
              )}
            />
            {showLabel && (
              <span className="text-xs font-medium">{getStatusText()}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {t('connection.tooltip', { status: getStatusText() })}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatusIndicator;