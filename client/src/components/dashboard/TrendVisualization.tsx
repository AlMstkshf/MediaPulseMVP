import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Loader2, RefreshCw, TrendingUp, TrendingDown, Clock, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from 'react-i18next';
import { format, subDays } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useWebSocket } from '@/lib/websocket-context';
import { SENTIMENT_COLORS } from "@/lib/constants";
import { withRtl } from "@/lib/withRtl";

// Interfaces
interface TrendData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total?: number;
  rawDate?: Date;
}

interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

interface PlatformBreakdown {
  [platform: string]: number;
}

interface TrendVisualizationProps {
  rtl?: boolean;
}

function TrendVisualization({ rtl = false }: TrendVisualizationProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const localeObj = i18n.language === 'ar' ? ar : enUS;
  const isRtl = rtl || i18n.language === 'ar';
  
  const textAlignClass = isRtl ? "text-right" : "text-left";
  const marginClass = isRtl ? "ml-2 mr-0" : "mr-2 ml-0";
  const flexDirectionClass = isRtl ? "flex-row-reverse" : "flex-row";
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>("7days");
  const [platform, setPlatform] = useState<string>("all");
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [sentimentBreakdown, setSentimentBreakdown] = useState<SentimentBreakdown>({
    positive: 0,
    neutral: 0,
    negative: 0
  });
  const [platformBreakdown, setPlatformBreakdown] = useState<PlatformBreakdown>({});
  const { connected: websocketConnected, sendMessage, lastMessage } = useWebSocket();
  
  // Create gradients for the charts
  const positiveGradient = {
    id: 'positiveGradient',
    color: SENTIMENT_COLORS.POSITIVE
  };
  
  const neutralGradient = {
    id: 'neutralGradient', 
    color: SENTIMENT_COLORS.NEUTRAL
  };
  
  const negativeGradient = {
    id: 'negativeGradient', 
    color: SENTIMENT_COLORS.NEGATIVE
  };
  
  // Mock function to generate sample trend data
  const generateSampleTrendData = (): TrendData[] => {
    const data: TrendData[] = [];
    const today = new Date();
    let days = 30;
    
    if (timeRange === '7days') days = 7;
    else if (timeRange === '14days') days = 14;
    else if (timeRange === '30days') days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(today, i);
      
      // Simulate trends based on platforms, with some randomization
      let positive = 25 + Math.floor(Math.random() * 35);
      let negative = 10 + Math.floor(Math.random() * 25);
      
      // Modify based on platform selection for a more realistic demo
      if (platform === 'Twitter') {
        positive -= 5;
        negative += 10;
      } else if (platform === 'Facebook') {
        positive += 10;
        negative -= 5;
      } else if (platform === 'Instagram') {
        positive += 15;
        negative -= 7;
      } else if (platform === 'Telegram') {
        positive += 8;
        negative -= 3;
      } else if (platform === 'TikTok') {
        positive += 12;
        negative -= 2;
      } else if (platform === 'News') {
        positive -= 10;
        negative += 5;
      }
      
      // Ensure values are within reasonable bounds
      positive = Math.max(0, Math.min(100, positive));
      negative = Math.max(0, Math.min(100, negative));
      const neutral = 100 - positive - negative;
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        positive,
        neutral,
        negative,
        total: positive + neutral + negative,
        rawDate: date
      });
    }
    
    return data;
  };
  
  // Function to fetch trend data from the API
  const fetchTrendData = async () => {
    setIsLoading(true);
    
    try {
      // Convert time range to days number
      let days = 7;
      if (timeRange === '14days') days = 14;
      else if (timeRange === '30days') days = 30;
      
      // Convert platform identifier to match API format
      const apiPlatform = platform === 'all' ? null : platform.toLowerCase();
      
      // Get sentiment trends from the API
      const response = await apiRequest({
        url: `/api/trends/sentiment?days=${days}${apiPlatform ? `&platform=${apiPlatform}` : ''}`,
        method: 'GET'
      });
      
      if (!response || !response.overall) {
        throw new Error('Invalid response format');
      }
      
      // Convert API response to our trend data format
      const data: TrendData[] = response.overall.map((item: any) => ({
        date: item.date,
        positive: item.positive || 0,
        neutral: item.neutral || 0,
        negative: item.negative || 0,
        total: (item.positive || 0) + (item.neutral || 0) + (item.negative || 0),
        rawDate: new Date(item.date)
      }));
      
      // Sort data by date (should already be sorted, but just to be safe)
      data.sort((a, b) => {
        if (!a.rawDate || !b.rawDate) return 0;
        return a.rawDate.getTime() - b.rawDate.getTime();
      });
      
      setTrends(data);
      
      // Calculate overall sentiment breakdown
      const breakdown = data.reduce((acc, curr) => {
        acc.positive += curr.positive;
        acc.neutral += curr.neutral;
        acc.negative += curr.negative;
        return acc;
      }, { positive: 0, neutral: 0, negative: 0 });
      
      // Normalize to get averages
      const total = data.length;
      if (total > 0) {
        breakdown.positive = Math.round(breakdown.positive / total);
        breakdown.neutral = Math.round(breakdown.neutral / total);
        breakdown.negative = Math.round(breakdown.negative / total);
      }
      
      setSentimentBreakdown(breakdown);
      
      // Extract platform breakdown from API response
      const platformMap: PlatformBreakdown = {};
      
      // Convert the byPlatform data to our format
      if (response.byPlatform) {
        Object.keys(response.byPlatform).forEach(platformKey => {
          // Calculate total posts for this platform (use the last date for the most recent value)
          const platformData = response.byPlatform[platformKey];
          if (platformData.length > 0) {
            const latestData = platformData[platformData.length - 1];
            const total = (latestData.positive || 0) + (latestData.neutral || 0) + (latestData.negative || 0);
            platformMap[platformKey] = total;
          }
        });
      }
      
      // If we have empty platform data, make a secondary request to get platform stats
      if (Object.keys(platformMap).length === 0) {
        try {
          const statsResponse = await apiRequest({
            url: '/api/social-posts/count-by-platform',
            method: 'GET'
          });
          
          if (Array.isArray(statsResponse)) {
            statsResponse.forEach(item => {
              if (item.platform && item.count) {
                platformMap[item.platform] = item.count;
              }
            });
          }
        } catch (statsError) {
          console.error('Error fetching platform stats:', statsError);
        }
      }
      
      setPlatformBreakdown(platformMap);
      
    } catch (error) {
      console.error('Error fetching trend data:', error);
      toast({
        title: t("dashboard.errorFetchingTrends"),
        description: t("dashboard.couldNotRetrieveTrendData"),
        variant: "destructive"
      });
      
      // Fall back to sample data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Using sample data as fallback');
        const data = generateSampleTrendData();
        setTrends(data);
        
        // Calculate sentiment breakdown from sample data
        const breakdown = data.reduce((acc, curr) => {
          acc.positive += curr.positive;
          acc.neutral += curr.neutral;
          acc.negative += curr.negative;
          return acc;
        }, { positive: 0, neutral: 0, negative: 0 });
        
        const total = data.length;
        if (total > 0) {
          breakdown.positive = Math.round(breakdown.positive / total);
          breakdown.neutral = Math.round(breakdown.neutral / total);
          breakdown.negative = Math.round(breakdown.negative / total);
        }
        
        setSentimentBreakdown(breakdown);
        
        // Sample platform breakdown
        const platforms = {
          twitter: 25 + Math.floor(Math.random() * 15),
          facebook: 20 + Math.floor(Math.random() * 15),
          instagram: 15 + Math.floor(Math.random() * 15),
          telegram: 12 + Math.floor(Math.random() * 12),
          tiktok: 18 + Math.floor(Math.random() * 15),
          news: 10 + Math.floor(Math.random() * 10)
        };
        
        setPlatformBreakdown(platforms);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to sentiment updates when platform changes
  useEffect(() => {
    if (websocketConnected) {
      // Send a subscription message for sentiment updates
      sendMessage('subscribe', {
        topic: 'sentiment_updates',
        platform: platform === 'all' ? undefined : platform
      });
      
      console.log(`[TrendVisualization] Subscribed to sentiment updates for platform: ${platform}`);
    }
  }, [platform, websocketConnected, sendMessage]);
  
  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    
    try {
      // Handle different message types
      if (lastMessage.type === 'sentiment_update' || lastMessage.type === 'sentiment_alert') {
        console.log('[TrendVisualization] Received sentiment update:', lastMessage);
        // Update our trend data with the new information
        fetchTrendData();
      }
    } catch (error) {
      console.error('[TrendVisualization] Error handling WebSocket message:', error);
    }
  }, [lastMessage]);
  
  // Fetch initial data
  useEffect(() => {
    fetchTrendData();
  }, [timeRange, platform]);
  
  // Format dates for display
  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d', { locale: localeObj });
  };
  
  // Format percentages with % sign
  const formatPercent = (value: number) => {
    return `${value}%`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className={`flex justify-between items-start ${flexDirectionClass}`}>
          <div className={textAlignClass}>
            <CardTitle>{t("dashboard.realtimeSentimentTrends")}</CardTitle>
            <CardDescription>{t("dashboard.trackSentimentChanges")}</CardDescription>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant={websocketConnected ? "outline" : "destructive"} className="text-xs">
              {websocketConnected ? t("common.live") : t("common.offline")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-between">
            <div className="flex space-x-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="platform-select" className="text-sm sr-only">{t("dashboard.selectPlatform")}</label>
                <Select value={platform} onValueChange={setPlatform} name="platform-select">
                  <SelectTrigger 
                    className="w-[180px]" 
                    id="platform-select"
                    aria-label={t("dashboard.selectPlatform")}
                  >
                    <SelectValue placeholder={t("dashboard.allPlatforms")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("dashboard.allPlatforms")}</SelectItem>
                    <SelectItem value="Twitter">{t("social.twitter")}</SelectItem>
                    <SelectItem value="Facebook">{t("social.facebook")}</SelectItem>
                    <SelectItem value="Instagram">{t("social.instagram")}</SelectItem>
                    <SelectItem value="Telegram">{t("social.telegram")}</SelectItem>
                    <SelectItem value="TikTok">{t("social.tiktok")}</SelectItem>
                    <SelectItem value="News">{t("social.news")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1">
                <label htmlFor="timeRange-select" className="text-sm sr-only">{t("dashboard.selectTimeRange")}</label>
                <Select value={timeRange} onValueChange={setTimeRange} name="timeRange-select">
                  <SelectTrigger 
                    className="w-[160px]" 
                    id="timeRange-select"
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
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTrendData}
              disabled={isLoading}
              aria-label={t("dashboard.refreshTrendData", "Refresh trend data")}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="ml-2">{t("common.refresh")}</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("dashboard.sentimentTrend")}</CardTitle>
              </CardHeader>
              <CardContent>
                {trends.length > 0 ? (
                  <div 
                    className="h-[300px]" 
                    role="region" 
                    aria-label={t("dashboard.sentimentTrendVisualization")}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trends}
                        aria-describedby="sentiment-trend-desc"
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <desc id="sentiment-trend-desc">
                          {t("dashboard.sentimentChartDescription")}
                        </desc>
                        <defs>
                          <linearGradient id={positiveGradient.id} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={positiveGradient.color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={positiveGradient.color} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id={neutralGradient.id} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={neutralGradient.color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={neutralGradient.color} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id={negativeGradient.id} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={negativeGradient.color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={negativeGradient.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                          aria-label={t("dashboard.timePeriod")}
                        />
                        <YAxis
                          tickFormatter={formatPercent}
                          tick={{ fontSize: 12 }}
                          aria-label={t("dashboard.sentimentPercentage")}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, '']}
                          labelFormatter={(label) => formatDate(label as string)}
                          wrapperStyle={{ outline: 'none' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="positive" 
                          name={t("sentiment.positive")}
                          stroke={positiveGradient.color} 
                          fillOpacity={1}
                          fill={`url(#${positiveGradient.id})`}
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="neutral" 
                          name={t("sentiment.neutral")}
                          stroke={neutralGradient.color} 
                          fillOpacity={1}
                          fill={`url(#${neutralGradient.id})`}
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="negative" 
                          name={t("sentiment.negative")}
                          stroke={negativeGradient.color} 
                          fillOpacity={1}
                          fill={`url(#${negativeGradient.id})`}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div 
                    className="h-[300px] flex items-center justify-center"
                    role="status"
                    aria-live={isLoading ? "polite" : "off"}
                  >
                    <div className="text-center text-muted-foreground">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" aria-hidden="true" />
                          <p id="loading-message">{t("dashboard.loadingTrendData")}</p>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-8 w-8 mx-auto mb-2" aria-hidden="true" />
                          <p>{t("dashboard.noTrendDataAvailable")}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t("sentiment.overallSentiment")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: SENTIMENT_COLORS.POSITIVE }}></div>
                        <span>{t("sentiment.positive")}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{sentimentBreakdown.positive}%</span>
                        {sentimentBreakdown.positive >= 30 ? (
                          <span aria-label={t("sentiment.positiveIncreasing", "Positive sentiment is increasing")}>
                            <TrendingUp className="ml-1 h-4 w-4" style={{ color: SENTIMENT_COLORS.POSITIVE }} aria-hidden="true" />
                          </span>
                        ) : (
                          <span aria-label={t("sentiment.positiveDecreasing", "Positive sentiment is decreasing")}>
                            <TrendingDown className="ml-1 h-4 w-4" style={{ color: SENTIMENT_COLORS.NEGATIVE }} aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: SENTIMENT_COLORS.NEUTRAL }}></div>
                        <span>{t("sentiment.neutral")}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{sentimentBreakdown.neutral}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: SENTIMENT_COLORS.NEGATIVE }}></div>
                        <span>{t("sentiment.negative")}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{sentimentBreakdown.negative}%</span>
                        {sentimentBreakdown.negative <= 20 ? (
                          <span aria-label={t("sentiment.negativeDecreasing", "Negative sentiment is decreasing (good)")}>
                            <TrendingDown className="ml-1 h-4 w-4" style={{ color: SENTIMENT_COLORS.POSITIVE }} aria-hidden="true" />
                          </span>
                        ) : (
                          <span aria-label={t("sentiment.negativeIncreasing", "Negative sentiment is increasing (concerning)")}>
                            <TrendingUp className="ml-1 h-4 w-4" style={{ color: SENTIMENT_COLORS.NEGATIVE }} aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div 
                      className="h-2 bg-gray-200 rounded-full mt-2"
                      role="img" 
                      aria-label={t("sentiment.distributionLabel", "Sentiment distribution: {{positive}}% positive, {{neutral}}% neutral, {{negative}}% negative", {
                        positive: sentimentBreakdown.positive,
                        neutral: sentimentBreakdown.neutral,
                        negative: sentimentBreakdown.negative
                      })}
                    >
                      <div className="flex h-full rounded-full overflow-hidden">
                        <div 
                          className="h-full" 
                          style={{ 
                            width: `${sentimentBreakdown.positive}%`,
                            backgroundColor: SENTIMENT_COLORS.POSITIVE 
                          }}
                          role="presentation"
                          aria-hidden="true"
                        ></div>
                        <div 
                          className="h-full" 
                          style={{ 
                            width: `${sentimentBreakdown.neutral}%`,
                            backgroundColor: SENTIMENT_COLORS.NEUTRAL 
                          }}
                          role="presentation"
                          aria-hidden="true"
                        ></div>
                        <div 
                          className="h-full" 
                          style={{ 
                            width: `${sentimentBreakdown.negative}%`,
                            backgroundColor: SENTIMENT_COLORS.NEGATIVE 
                          }}
                          role="presentation"
                          aria-hidden="true"
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg" id="source-breakdown-title">{t("sentiment.sourceBreakdown")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="space-y-4"
                    role="region" 
                    aria-labelledby="source-breakdown-title"
                  >
                    {Object.entries(platformBreakdown).map(([platform, percent]) => (
                      <div key={platform} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span id={`platform-${platform}`}>{t(`social.${platform.toLowerCase()}`, platform)}</span>
                          <span className="text-sm font-medium">{percent}%</span>
                        </div>
                        <div 
                          className="h-2 bg-gray-200 rounded-full"
                          role="progressbar"
                          aria-valuenow={percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-labelledby={`platform-${platform}`}
                        >
                          <div 
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                            aria-hidden="true"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export the component wrapped with our RTL HOC
export default withRtl(TrendVisualization);