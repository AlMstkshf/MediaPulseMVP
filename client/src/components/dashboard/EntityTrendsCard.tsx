import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, ArrowRight, Building, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from 'react-i18next';
import { withRtl } from "@/lib/withRtl";
import { Progress } from "@/components/ui/progress";

interface EntityTrend {
  entityId: number;
  entityName: string;
  totalMentions: number;
  sentimentScore: number;
  recentMentions: number;
  changePercent: number;
  relatedKeywords: string[];
}

interface EntityTrendsCardProps {
  rtl?: boolean;
}

function EntityTrendsCard({ rtl = false }: EntityTrendsCardProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRtl = rtl || i18n.language === 'ar';
  
  const textAlignClass = isRtl ? "text-right" : "text-left";
  const marginClass = isRtl ? "ml-2 mr-0" : "mr-2 ml-0";
  const flexDirectionClass = isRtl ? "flex-row-reverse" : "flex-row";
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>("7days");
  const [entityTrends, setEntityTrends] = useState<EntityTrend[]>([]);
  
  // Function to fetch entity trends from the API
  const fetchEntityTrends = async () => {
    setIsLoading(true);
    
    try {
      // Convert time range to days number
      let days = 7;
      if (timeRange === '14days') days = 14;
      else if (timeRange === '30days') days = 30;
      
      // Get entity trends from the API
      const response = await apiRequest(
        'GET',
        `/api/trends/entities?days=${days}&limit=5`
      );
      
      const jsonResponse = await response.json();
      
      if (!jsonResponse || !jsonResponse.entities) {
        throw new Error('Invalid response format');
      }
      
      setEntityTrends(jsonResponse.entities);
      
    } catch (error) {
      console.error('Error fetching entity trends:', error);
      toast({
        title: t("dashboard.errorFetchingEntityTrends"),
        description: t("dashboard.couldNotRetrieveEntityData"),
        variant: "destructive"
      });
      
      // Set to empty array to avoid undefined errors
      setEntityTrends([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch initial data
  useEffect(() => {
    fetchEntityTrends();
  }, [timeRange]);
  
  // Helper function to get color based on sentiment score
  const getSentimentColor = (score: number): string => {
    if (score >= 0.5) return 'bg-green-500';
    if (score >= 0.2) return 'bg-green-300';
    if (score >= 0) return 'bg-yellow-400';
    if (score >= -0.3) return 'bg-orange-400';
    return 'bg-red-500';
  };
  
  // Helper function to convert sentiment score to percentage
  const scoreToPercent = (score: number): number => {
    // Convert -1 to 1 range to 0-100%
    return Math.round((score + 1) * 50);
  };
  
  // Render change percentage with appropriate icon
  const renderChangePercent = (changePercent: number) => {
    return (
      <div className="flex items-center">
        {changePercent > 15 ? (
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        ) : changePercent < -15 ? (
          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
        ) : (
          <ArrowRight className="h-4 w-4 text-gray-400 mr-1" />
        )}
        <span className={`text-xs ${changePercent > 0 ? 'text-green-500' : changePercent < 0 ? 'text-red-500' : 'text-gray-500'}`}>
          {changePercent > 0 ? '+' : ''}{changePercent}%
        </span>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className={`flex justify-between items-start ${flexDirectionClass}`}>
          <div className={textAlignClass}>
            <CardTitle>{t("dashboard.entityMentions")}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange} name="timeRange-select">
              <SelectTrigger 
                className="w-[120px]" 
                id="timeRange-entity-select"
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
              onClick={fetchEntityTrends}
              disabled={isLoading}
              aria-label={t("dashboard.refreshEntityData")}
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
        ) : entityTrends.length > 0 ? (
          <div className="space-y-4">
            {entityTrends.map((entity) => (
              <div 
                key={entity.entityId} 
                className="p-4 border rounded-md hover:bg-accent/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium text-lg">{entity.entityName}</h3>
                  </div>
                  {renderChangePercent(entity.changePercent)}
                </div>
                
                <div className="flex flex-wrap justify-between items-center mb-3">
                  <div className="flex items-center mb-2 mr-6">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-sm">
                      {t("dashboard.totalMentions")}: <strong>{entity.totalMentions.toLocaleString()}</strong>
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm">
                      {t("dashboard.recentMentions")}: <strong>{entity.recentMentions.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between mb-1 text-xs">
                    <span>{t("dashboard.sentiment")}</span>
                    <span className={entity.sentimentScore >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {entity.sentimentScore.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    value={scoreToPercent(entity.sentimentScore)}
                    className="h-2"
                    indicatorClassName={getSentimentColor(entity.sentimentScore)}
                  />
                </div>
                
                {entity.relatedKeywords.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">{t("dashboard.relatedKeywords")}</div>
                    <div className="flex flex-wrap gap-1">
                      {entity.relatedKeywords.map(keyword => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("dashboard.noEntityData")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default withRtl(EntityTrendsCard);