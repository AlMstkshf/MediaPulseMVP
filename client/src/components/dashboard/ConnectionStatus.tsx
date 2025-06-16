import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ConnectionStatusIndicator from '@/components/shared/ConnectionStatusIndicator';

interface ConnectionStatusProps {
  className?: string;
}

/**
 * Dashboard connection status indicator with tooltip
 * Uses the polling-based ConnectionStatusIndicator
 */
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { t } = useTranslation();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={className}>
            <ConnectionStatusIndicator 
              showLabel={true}
              size="sm"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col">
            <p className="font-medium mb-1">{t('dashboard.connection_status.tooltip.title')}</p>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.connection_status.tooltip.description')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.connection_status.tooltip.polling', { seconds: 15 })}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatus;