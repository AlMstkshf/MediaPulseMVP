import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, ArrowRight, Hash, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from 'react-i18next';
import { withRtl } from "@/lib/withRtl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Trend {
  keyword: string;
  mentionCount: number;
  sentimentScore: number;
  sources: Record<string, number>;
  changePercent: number;
  momentum: 'rising' | 'falling' | 'stable';
  peakTimes: string[];
}

interface TrendingKeywordsCardProps {
  rtl?: boolean;
}

function TrendingKeywordsCard({ rtl = false }: TrendingKeywordsCardProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRtl = rtl || i18n.language === 'ar';
  
  const textAlignClass = isRtl ? "text-right" : "text-left";
  const marginClass = isRtl ? "ml-2 mr-0" : "mr-2 ml-0";
  const flexDirectionClass = isRtl ? "flex-row-reverse" : "flex-row";
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>("7days");
  const [platform, setPlatform] = useState<string>("all");
  const [trendingKeywords, setTrendingKeywords] = useState<Trend[]>([]);
  
  // Function to fetch trending keywords from the API
  const fetchTrendingKeywords = async () => {
    setIsLoading(true);
    
    try {
      // Convert time range to days number
      let days = 7;
      if (timeRange === '14days') days = 14;
      else if (timeRange === '30days') days = 30;
      
      // Convert platform identifier to match API format
      const apiPlatform = platform === 'all' ? null : platform.toLowerCase();
      
      // Get trending keywords from the API
      const response = await apiRequest(
        'GET',
        `/api/trends/keywords?days=${days}${apiPlatform ? `&platform=${apiPlatform}` : ''}&limit=10`
      );
      
      const jsonResponse = await response.json();
      
      if (!jsonResponse || !jsonResponse.trends) {
        throw new Error('Invalid response format');
      }
      
      setTrendingKeywords(jsonResponse.trends);
      
    } catch (error) {
      console.error('Error fetching trending keywords:', error);
      toast({
        title: t("dashboard.errorFetchingTrends"),
        description: t("dashboard.couldNotRetrieveTrendData"),
        variant: "destructive"
      });
      
      // Set to empty array to avoid undefined errors
      setTrendingKeywords([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch initial data
  useEffect(() => {
    fetchTrendingKeywords();
  }, [timeRange, platform]);
  
  // Render momentum icon based on trend
  const renderMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'falling':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowRight className="h-4 w-4 text-gray-400" />;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className={`flex justify-between items-start ${flexDirectionClass}`}>
          <div className={textAlignClass}>
            <CardTitle>{t("dashboard.trendingKeywords")}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange} name="timeRange-select">
              <SelectTrigger 
                className="w-[120px]" 
                id="timeRange-keywords-select"
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
              onClick={fetchTrendingKeywords}
              disabled={isLoading}
              aria-label={t("dashboard.refreshTrendData")}
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
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="trending">{t("dashboard.trending")}</TabsTrigger>
            <TabsTrigger value="all">{t("dashboard.allKeywords")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : trendingKeywords.length > 0 ? (
              <div className="space-y-2">
                {trendingKeywords
                  .filter(trend => trend.momentum === 'rising')
                  .slice(0, 5)
                  .map((trend, index) => (
                    <div 
                      key={trend.keyword} 
                      className="flex items-center justify-between p-2 hover:bg-accent/20 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="w-6 text-sm text-muted-foreground">{index + 1}</span>
                        <Hash className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="font-medium">{trend.keyword}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <BarChart3 className="h-3.5 w-3.5 mr-1" />
                          <span>{trend.mentionCount.toLocaleString()}</span>
                        </Badge>
                        <div className="flex items-center">
                          {renderMomentumIcon(trend.momentum)}
                          <span className={`text-xs ${trend.changePercent > 0 ? 'text-green-500' : trend.changePercent < 0 ? 'text-red-500' : 'text-gray-500'} ml-1`}>
                            {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("dashboard.noTrendingKeywords")}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : trendingKeywords.length > 0 ? (
              <div className="space-y-2">
                {trendingKeywords.map((trend, index) => (
                  <div 
                    key={trend.keyword} 
                    className="flex items-center justify-between p-2 hover:bg-accent/20 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="w-6 text-sm text-muted-foreground">{index + 1}</span>
                      <Hash className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="font-medium">{trend.keyword}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <BarChart3 className="h-3.5 w-3.5 mr-1" />
                        <span>{trend.mentionCount.toLocaleString()}</span>
                      </Badge>
                      <div className="flex items-center">
                        {renderMomentumIcon(trend.momentum)}
                        <span className={`text-xs ${trend.changePercent > 0 ? 'text-green-500' : trend.changePercent < 0 ? 'text-red-500' : 'text-gray-500'} ml-1`}>
                          {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("dashboard.noKeywordsFound")}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default withRtl(TrendingKeywordsCard);