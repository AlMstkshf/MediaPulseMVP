import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useKeywordAlerts } from "@/hooks/use-keyword-alerts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { BellRing, Check, ExternalLink, InfoIcon } from "lucide-react";
import { KeywordAlert, Keyword, SocialPost } from "@shared/schema";
import { useWebSocket } from "@/lib/websocket-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function KeywordAlerts() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { 
    data: alerts,
    isLoading,
    markAsRead,
    error,
    refreshAlerts
  } = useKeywordAlerts({ limit: 5 });
  const [showReadAlerts, setShowReadAlerts] = useState(false);

  // Use the centralized WebSocket context
  const { connected, sendMessage, lastMessage } = useWebSocket();
  
  // Subscribe to keyword alerts via WebSocket
  useEffect(() => {
    if (connected) {
      sendMessage('subscribe', {
        topic: 'keyword_alerts'
      });
      console.log('[KeywordAlerts] Subscribed to keyword alerts');
    }
  }, [connected, sendMessage]);
  
  // Handle WebSocket messages for keyword alerts
  useEffect(() => {
    if (!lastMessage) return;
    
    try {
      // Process message
      if (lastMessage.type === "keyword_alert") {
        // New keyword alert received
        toast({
          title: t('alerts.newKeywordAlert'),
          description: `${t('alerts.keywordDetected')}: ${lastMessage.keyword}`,
          variant: "default",
        });
        
        // Refresh the alerts list
        refreshAlerts();
      }
    } catch (error) {
      console.error("[KeywordAlerts] Error processing WebSocket message:", error);
    }
  }, [lastMessage, refreshAlerts, t, toast]);

  const handleMarkAsRead = (alertId: number) => {
    markAsRead.mutate(alertId, {
      onSuccess: () => {
        toast({
          title: t('alerts.markedAsRead'),
          description: t('alerts.alertMarkedAsRead'),
          variant: "default",
        });
      },
      onError: () => {
        toast({
          title: t('common.error'),
          description: t('alerts.errorMarkingAsRead'),
          variant: "destructive",
        });
      }
    });
  };

  // Format date according to locale
  const formatDate = (date: Date) => {
    return format(
      new Date(date),
      "PPp",
      { locale: i18n.language === "ar" ? ar : undefined }
    );
  };

  const filteredAlerts = alerts?.filter(alert => showReadAlerts ? true : !alert.read) || [];

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p className="font-medium">{t('common.error')}</p>
        <p>{t('alerts.loadError')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-10 h-10 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-read-alerts"
                checked={showReadAlerts}
                onCheckedChange={(checked) => setShowReadAlerts(!!checked)}
              />
              <label
                htmlFor="show-read-alerts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('alerts.showReadAlerts')}
              </label>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => refreshAlerts()}
                  >
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('alerts.refreshTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BellRing className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-1">{t('alerts.noAlerts')}</h3>
              <p className="text-sm">{t('alerts.allClear')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className={alert.read ? "opacity-70" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">
                          {alert.keyword?.word || t('alerts.unknownKeyword')}
                        </CardTitle>
                        <CardDescription>
                          {formatDate(alert.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge className="bg-red-500">{t('alerts.alert')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm">
                      {t('alerts.keywordDetectedPost', {
                        keyword: alert.keyword?.word || t('alerts.unknownKeyword'),
                        platform: alert.post?.platform || t('alerts.unknownPlatform')
                      })}
                    </p>
                    <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs">
                      {alert.post?.content || t('alerts.contentUnavailable')}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => window.open(`/posts/${alert.post?.id}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {t('alerts.viewPost')}
                    </Button>
                    {!alert.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {t('alerts.markAsRead')}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}