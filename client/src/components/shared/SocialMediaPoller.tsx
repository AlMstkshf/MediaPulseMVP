import React, { useEffect, useRef } from 'react';
import { useSocialPollUpdates } from '@/hooks/useSocialPollUpdates';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export interface SocialMediaPollerProps {
  /** Optional entity ID to scope polling */
  entityId?: number;
  /** Platforms to include in polling */
  platforms?: string[];
  /** Whether to show the connection/status badge */
  showStatus?: boolean;
  /** Callback invoked with the number of new activities */
  onNewActivity?: (newCount: number) => void;
  /** Enable or disable polling */
  enabled?: boolean;
  /** Polling interval in milliseconds */
  pollInterval?: number;
  /** Optional wrapper CSS classes */
  className?: string;
  /** Children to render alongside polling logic */
  children?: React.ReactNode;
}

/**
 * Component for polling social media updates and optionally displaying a status badge.
 * Fires toast notifications and callback on new activity.
 */
const SocialMediaPoller: React.FC<SocialMediaPollerProps> = ({
  entityId,
  platforms,
  showStatus = false,
  onNewActivity,
  enabled = true,
  pollInterval = 15000,
  className = '',
  children,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const prevTotalRef = useRef(0);

  const {
    isConnected,
    lastActivity,
    totalCount,
    resetCounts,
    isLoading,
    lastUpdated,
  } = useSocialPollUpdates({
    entityId,
    platforms,
    enabled,
    pollInterval,
    showToasts: false,
  });

  // Notify parent of only the delta new activity count
  useEffect(() => {
    if (!enabled || totalCount <= prevTotalRef.current) return;

    const delta = totalCount - prevTotalRef.current;
    prevTotalRef.current = totalCount;
    onNewActivity?.(delta);
  }, [totalCount, enabled, onNewActivity]);

  // Show toast when a new activity arrives
  useEffect(() => {
    if (!enabled || !lastActivity) return;

    const { platform, count = 1 } = lastActivity;
    toast({
      title: t('social_media.new_activity', { platform }),
      description: t('social_media.new_posts', { count }),
      variant: 'default',
    });
  }, [lastActivity, enabled, toast, t]);

  // Reset counts and ref on unmount or when polling disabled
  useEffect(() => {
    return () => {
      resetCounts();
      prevTotalRef.current = 0;
    };
  }, [resetCounts]);

  if (showStatus) {
    return (
      <Badge
        variant="outline"
        className={className}
        role="status"
        aria-live={isConnected ? 'polite' : 'assertive'}
        aria-atomic="true"
      >
        <span className="flex items-center gap-1">
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" aria-label={t('common.loading')} />
          ) : (
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-success' : 'bg-destructive'
              }`}
              aria-label={isConnected ? t('common.connected') : t('common.disconnected')}
            />
          )}
          <span className="text-xs">
            {lastUpdated
              ? t('common.last_updated', {
                  time: format(new Date(lastUpdated), 'HH:mm:ss'),
                })
              : t('common.auto_refresh')}
          </span>
        </span>
      </Badge>
    );
  }

  // Render children when not showing status
  return <div className={className}>{children}</div>;
};

SocialMediaPoller.displayName = 'SocialMediaPoller';
export default SocialMediaPoller;
