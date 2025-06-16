import { useEffect } from 'react';
import { useWebSocket } from './WebSocketProvider';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';

export const RealtimeNotifications = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, lastMessage, subscribe, unsubscribe } = useWebSocket();

  // Subscribe to notification channels
  useEffect(() => {
    if (isConnected) {
      // Subscribe to relevant notification topics
      subscribe('system-notifications');
      subscribe('social-updates');
      subscribe('media-mentions');

      return () => {
        // Unsubscribe when component unmounts
        unsubscribe('system-notifications');
        unsubscribe('social-updates');
        unsubscribe('media-mentions');
      };
    }
  }, [isConnected, subscribe, unsubscribe]);

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage && isConnected) {
      // Parse and display notifications based on message type
      try {
        if (lastMessage.type === 'notification') {
          // Display toast notification
          toast({
            title: lastMessage.title || t('notifications.newNotification'),
            description: lastMessage.message,
            variant: lastMessage.variant || 'default',
            duration: 5000,
          });
        }
        
        // Handle specific notification types
        switch (lastMessage.notificationType) {
          case 'social-mention':
            // Handle new social mention
            toast({
              title: t('notifications.newMention'),
              description: t('notifications.newMentionDesc', { platform: lastMessage.platform }),
            });
            break;
          
          case 'sentiment-alert':
            // Handle sentiment alerts
            toast({
              title: t('notifications.sentimentAlert'),
              description: t('notifications.sentimentAlertDesc', { 
                sentiment: lastMessage.sentimentScore > 0 ? t('common.positive') : t('common.negative')
              }),
              variant: lastMessage.sentimentScore > 0 ? 'default' : 'destructive'
            });
            break;
          
          default:
            // No special handling for other notification types
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket notification:', error);
      }
    }
  }, [lastMessage, isConnected, toast, t]);

  // This component doesn't render anything visible
  return null;
};