import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, XCircle, Wifi, WifiOff } from 'lucide-react';

interface BadgeGroupProps {
  connected: boolean;
  realTimeEnabled: boolean;
  onToggleRealTime: () => void;
}

/**
 * Component for displaying connection and real-time update status badges
 */
const BadgeGroup: React.FC<BadgeGroupProps> = ({ 
  connected,
  realTimeEnabled,
  onToggleRealTime 
}) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Connection status badge */}
      <Badge 
        variant={connected ? "outline" : "destructive"}
        className={`flex items-center gap-1 ${connected ? 'border-green-500 text-green-500' : ''}`}
      >
        {connected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Disconnected</span>
          </>
        )}
      </Badge>

      {/* Real-time toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="real-time-mode"
          checked={realTimeEnabled}
          onCheckedChange={onToggleRealTime}
          disabled={!connected}
        />
        <Label 
          htmlFor="real-time-mode" 
          className={`text-xs ${!connected ? 'text-gray-400' : ''}`}
        >
          <div className="flex items-center">
            {realTimeEnabled ? (
              <Check className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="mr-1 h-3 w-3 text-amber-500" />
            )}
            Real-time
          </div>
        </Label>
      </div>
    </div>
  );
};

export default BadgeGroup;