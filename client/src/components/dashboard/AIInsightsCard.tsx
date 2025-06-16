import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Lightbulb, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from 'react-i18next';
import { withRtl } from "@/lib/withRtl";
import { Badge } from '@/components/ui/badge';

interface AIInsights {
  trendingTopics: string[];
  sentimentShift: number;
  recommendations: string[];
}

interface AIInsightsCardProps {
  rtl?: boolean;
}

function AIInsightsCard({ rtl = false }: AIInsightsCardProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRtl = rtl || i18n.language === 'ar';
  
  const textAlignClass = isRtl ? "text-right" : "text-left";
  const marginClass = isRtl ? "ml-2 mr-0" : "mr-2 ml-0";
  const flexDirectionClass = isRtl ? "flex-row-reverse" : "flex-row";
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>("7days");
  const [platform, setPlatform] = useState<string>("all");
  const [insights, setInsights] = useState<AIInsights | null>(null);
  
  // Function to fetch AI insights from the API
  const fetchAIInsights = async () => {
    setIsLoading(true);
    
    try {
      // Convert time range to days number
      let days = 7;
      if (timeRange === '14days') days = 14;
      else if (timeRange === '30days') days = 30;
      
      // Convert platform identifier to match API format
      const apiPlatform = platform === 'all' ? null : platform.toLowerCase();
      
      // Get AI insights from the API
      const response = await apiRequest(
        'GET',
        `/api/trends/ai-insights?days=${days}${apiPlatform ? `&platform=${apiPlatform}` : ''}`
      );
      
      const jsonResponse = await response.json();
      
      if (!jsonResponse || !jsonResponse.trendingTopics) {
        throw new Error('Invalid response format');
      }
      
      setInsights(jsonResponse);
      
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      toast({
        title: t("dashboard.errorFetchingAIInsights"),
        description: t("dashboard.couldNotRetrieveAIData"),
        variant: "destructive"
      });
      
      // Set to null to show the error state
      setInsights(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch initial data
  useEffect(() => {
    fetchAIInsights();
  }, [timeRange, platform]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className={`flex justify-between items-start ${flexDirectionClass}`}>
          <div className={textAlignClass}>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              {t("dashboard.aiInsights")}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={platform} onValueChange={setPlatform} name="platform-select">
              <SelectTrigger 
                className="w-[120px]" 
                id="platform-ai-select"
                aria-label={t("dashboard.selectPlatform")}
              >
                <SelectValue placeholder={t("dashboard.allPlatforms")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.allPlatforms")}</SelectItem>
                <SelectItem value="twitter">{t("social.twitter")}</SelectItem>
                <SelectItem value="facebook">{t("social.facebook")}</SelectItem>
                <SelectItem value="instagram">{t("social.instagram")}</SelectItem>
                <SelectItem value="news">{t("social.news")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange} name="timeRange-select">
              <SelectTrigger 
                className="w-[120px]" 
                id="timeRange-ai-select"
                aria-label={t("dashboard.selectTimeRange")}
              >
                <SelectValue placeholder={t("dashboard.last7Days")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">{t("dashboard.last7Days")}</SelectItem>
                <SelectItem value="14days">{t("dashboard.last14Days")}</SelectItem>
                <SelectItem value="30days">{t("dashboard.last30Days")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAIInsights}
              disabled={isLoading}
              aria-label={t("dashboard.refreshAIInsights")}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : insights ? (
          <div className="space-y-6">
            {/* Trending Topics Section */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                {t("dashboard.emergingTopics")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {insights.trendingTopics.map(topic => (
                  <Badge key={topic} className="bg-primary/10 text-primary hover:bg-primary/20">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Sentiment Shift Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">
                {t("dashboard.sentimentShift")}
              </h3>
              <div className="flex items-center">
                {insights.sentimentShift > 0 ? (
                  <ArrowUp className="h-5 w-5 text-green-500 mr-2" />
                ) : insights.sentimentShift < 0 ? (
                  <ArrowDown className="h-5 w-5 text-red-500 mr-2" />
                ) : (
                  <div className="w-5 h-5 mr-2" /> // Empty placeholder for alignment
                )}
                <span className={insights.sentimentShift > 0 ? 'text-green-500' : insights.sentimentShift < 0 ? 'text-red-500' : 'text-gray-500'}>
                  {insights.sentimentShift > 0 ? '+' : ''}{(insights.sentimentShift * 100).toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  {insights.sentimentShift > 0
                    ? t("dashboard.sentimentImproving")
                    : insights.sentimentShift < 0
                    ? t("dashboard.sentimentDeclining")
                    : t("dashboard.sentimentStable")}
                </span>
              </div>
            </div>
            
            {/* Recommendations Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">
                {t("dashboard.recommendations")}
              </h3>
              <ul className="space-y-2 text-sm">
                {insights.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("dashboard.noAIInsightsAvailable")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default withRtl(AIInsightsCard);