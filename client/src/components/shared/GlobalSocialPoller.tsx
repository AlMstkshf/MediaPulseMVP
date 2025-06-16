import { useEffect, useRef } from 'react';
import { useSocialPollUpdates } from '@/hooks/useSocialPollUpdates';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';

/**
 * Polls global social media updates and displays toast notifications for new content.
 * Include this component once at the app root level to enable global notifications.
 */
const GlobalSocialPoller: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const prevCountRef = useRef(0);

  const { lastActivity, totalCount, resetCounts } = useSocialPollUpdates({
    enabled: true,
    pollInterval: 60000, // Poll every 1 minute
    showToasts: false,   // Disable built-in toasts
  });

  useEffect(() => {
    // Only act when there's activity and a count increase
    if (!lastActivity) return;

    if (totalCount > prevCountRef.current) {
      const newItems = totalCount - prevCountRef.current;
      prevCountRef.current = totalCount;

      toast({
        title: t('social_media.new_updates'),
        description: (
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" aria-hidden />
            <span>
              {t('social_media.new_updates_description', { count: newItems })}
            </span>
          </div>
        ),
        variant: 'default',
      });
    }
  }, [lastActivity, totalCount, t, toast]);

  useEffect(() => {
    return () => {
      // Reset counts and internal ref on unmount
      resetCounts();
      prevCountRef.current = 0;
    };
  }, [resetCounts]);

  return null;
};

export default GlobalSocialPoller;
