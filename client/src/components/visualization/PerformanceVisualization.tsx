import { useState, useEffect, useMemo, memo, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VISUALIZATION_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, LineChart, PieChart, RefreshCw, ChevronDown, ArrowUpRight, Download, Filter } from "lucide-react";
import {
  LoadingSpinner,
  PulseChartLoader,
  AnimatedBarChartLoader,
  AnimatedLineChartLoader,
  AnimatedDonutChartLoader,
  CircularProgressLoader,
} from "@/components/ui/loading-animations";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

// Performance optimization: Lazy load tab components to reduce initial bundle size
const SentimentTab = lazy(() => import("./tabs/SentimentTab"));
const EngagementTab = lazy(() => import("./tabs/EngagementTab"));
const PerformanceTab = lazy(() => import("./tabs/PerformanceTab"));

// Import chart libraries
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";

// Define types for our API responses
interface MediaVisibilityData {
  month: string;
  visibility: number;
}

interface SentimentDistributionData {
  name: string;
  value: number;
  color: string;
}

interface EngagementByPlatformData {
  platform: string;
  engagement: number;
}

interface PerformanceScoreData {
  category: string;
  score: number;
}

interface SentimentTrendData {
  month: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface EngagementMetric {
  title: string;
  value: string;
  change: string;
}

interface EngagementDetailsData {
  data: Array<{
    name: string;
    facebook: number;
    twitter: number;
    instagram: number;
    linkedin: number;
  }>;
  metrics: EngagementMetric[];
}

interface KpiData {
  category: string;
  current: number;
  target: number;
  metrics: Array<{
    name: string;
    value: number | string;
    unit: string;
  }>;
}

export function PerformanceVisualization() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("6m");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Media Visibility Data
  const { 
    data: mediaVisibilityData,
    isLoading: isMediaVisibilityLoading,
    refetch: refetchMediaVisibility
  } = useQuery<MediaVisibilityData[]>({
    queryKey: ['/api/performance/media-visibility', { timeRange }],
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey;
      const timeRangeParam = params as { timeRange: string };
      const response = await fetch(`${url}?timeRange=${timeRangeParam.timeRange}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch media visibility data');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Sentiment Distribution Data
  const {
    data: sentimentDistributionData,
    isLoading: isSentimentDistributionLoading,
    refetch: refetchSentimentDistribution
  } = useQuery<SentimentDistributionData[]>({
    queryKey: ['/api/performance/sentiment-distribution'],
    queryFn: async ({ queryKey }) => {
      const [url] = queryKey;
      const response = await fetch(url as string, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sentiment distribution data');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Engagement by Platform Data
  const {
    data: engagementByPlatformData,
    isLoading: isEngagementByPlatformLoading,
    refetch: refetchEngagementByPlatform
  } = useQuery<EngagementByPlatformData[]>({
    queryKey: ['/api/performance/engagement-by-platform', { timeRange }],
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey;
      const timeRangeParam = params as { timeRange: string };
      const response = await fetch(`${url}?timeRange=${timeRangeParam.timeRange}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch engagement by platform data');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Performance Scores Data
  const {
    data: performanceScoresData,
    isLoading: isPerformanceScoresLoading,
    refetch: refetchPerformanceScores
  } = useQuery<PerformanceScoreData[]>({
    queryKey: ['/api/performance/performance-scores'],
    queryFn: async ({ queryKey }) => {
      const [url] = queryKey;
      const response = await fetch(url as string, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch performance scores data');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Sentiment Trends Data
  const {
    data: sentimentTrendsData,
    isLoading: isSentimentTrendsLoading,
    refetch: refetchSentimentTrends
  } = useQuery<SentimentTrendData[]>({
    queryKey: ['/api/performance/sentiment-trends', { timeRange }],
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey;
      const timeRangeParam = params as { timeRange: string };
      const response = await fetch(`${url}?timeRange=${timeRangeParam.timeRange}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sentiment trends data');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Engagement Details Data
  const {
    data: engagementDetailsData,
    isLoading: isEngagementDetailsLoading,
    refetch: refetchEngagementDetails
  } = useQuery<EngagementDetailsData>({
    queryKey: ['/api/performance/engagement-details', { timeRange }],
    queryFn: async ({ queryKey }) => {
      const [url, params] = queryKey;
      const timeRangeParam = params as { timeRange: string };
      const response = await fetch(`${url}?timeRange=${timeRangeParam.timeRange}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch engagement details data');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // KPI Breakdown Data
  const {
    data: kpiBreakdownData,
    isLoading: isKpiBreakdownLoading,
    refetch: refetchKpiBreakdown
  } = useQuery<KpiData[]>({
    queryKey: ['/api/performance/kpi-breakdown'],
    queryFn: async ({ queryKey }) => {
      const [url] = queryKey;
      const response = await fetch(url as string, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch KPI breakdown data');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Determine if any data is loading
  const isLoading = 
    isMediaVisibilityLoading || 
    isSentimentDistributionLoading || 
    isEngagementByPlatformLoading || 
    isPerformanceScoresLoading ||
    isSentimentTrendsLoading ||
    isEngagementDetailsLoading ||
    isKpiBreakdownLoading;
  
  // Refresh all data
  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        refetchMediaVisibility(),
        refetchSentimentDistribution(),
        refetchEngagementByPlatform(),
        refetchPerformanceScores(),
        refetchSentimentTrends(),
        refetchEngagementDetails(),
        refetchKpiBreakdown()
      ]);
      
      toast({
        title: t("performance.dataUpdated"),
        description: t("performance.allPerformanceDataUpdatedSuccessfully"),
        variant: "default",
      });
    } catch (error) {
      toast({
        title: t("performance.errorUpdatingData"),
        description: t("performance.errorUpdatingPerformanceDataTryAgain"),
        variant: "destructive",
      });
      console.error("Error refreshing performance data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Update data when time range changes
  useEffect(() => {
    refetchMediaVisibility();
    refetchEngagementByPlatform();
    refetchSentimentTrends();
    refetchEngagementDetails();
  }, [timeRange]);
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isArabic ? 'ar-AE' : 'en-US').format(num);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select 
            defaultValue={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("performance.timeRange")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">{t("performance.oneMonth")}</SelectItem>
              <SelectItem value="3m">{t("performance.threeMonths")}</SelectItem>
              <SelectItem value="6m">{t("performance.sixMonths")}</SelectItem>
              <SelectItem value="1y">{t("performance.oneYear")}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {t("performance.export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                {t("export.formatPNG")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t("export.formatPDF")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t("export.formatExcel")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="overview">
            {t("performance.overviewTab")}
          </TabsTrigger>
          <TabsTrigger value="sentiment">
            {t("performance.sentimentTab")}
          </TabsTrigger>
          <TabsTrigger value="engagement">
            {t("performance.engagementTab")}
          </TabsTrigger>
          <TabsTrigger value="performance">
            {t("performance.performanceTab")}
          </TabsTrigger>
        </TabsList>
        
        {/* Performance optimization: Only render the active tab's content */}
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isPerformanceScoresLoading ? (
              // Show skeleton loaders when loading
              Array(4).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="flex justify-center py-4">
                      <CircularProgressLoader progress={0} />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex items-center justify-between w-full">
                      <div className="h-3 bg-muted rounded animate-pulse w-1/4"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-1/4"></div>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              // Show actual data when loaded
              performanceScoresData?.map((item, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="flex justify-center py-4">
                      <CircularProgressLoader 
                        progress={item.score} 
                        animate={false}
                        color={item.score > 80 ? "green" : item.score > 70 ? "amber" : "red"}
                        className="dark:text-gray-200"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex items-center justify-between w-full text-sm">
                      <span className="text-muted-foreground">{t("performance.change")}</span>
                      <span className="flex items-center text-green-500">
                        +{Math.floor(Math.random() * 10)}%
                        <ArrowUpRight className="ml-1 h-3 w-3" />
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("performance.mediaVisibility")}</CardTitle>
                <CardDescription>
                  {t("performance.mediaVisibilityTrend")} {timeRange === "1m" ? t("performance.oneMonth") : timeRange === "3m" ? t("performance.threeMonths") : timeRange === "6m" ? t("performance.sixMonths") : t("performance.oneYear")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isMediaVisibilityLoading ? (
                  <AnimatedLineChartLoader className="h-80" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <RechartsLineChart
                      data={mediaVisibilityData || []}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="visibility"
                        name={t("performance.visibilityIndicator")}
                        stroke={VISUALIZATION_COLORS.PRIMARY}
                        strokeWidth={3}
                        dot={{ strokeWidth: 2, r: 4, fill: VISUALIZATION_COLORS.ACCENT7 }}
                        activeDot={{ r: 8, fill: VISUALIZATION_COLORS.ACCENT2 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex justify-end w-full">
                  <Badge variant="outline" className="text-xs">
                    {t("performance.updatedEvery")} 24 {t("performance.hours")}
                  </Badge>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("performance.engagementByPlatform")}</CardTitle>
                <CardDescription>
                  {t("performance.engagementCount")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEngagementByPlatformLoading ? (
                  <AnimatedBarChartLoader className="h-80" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <RechartsBarChart
                      data={engagementByPlatformData || []}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="platform" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatNumber(value as number), t("performance.engagement")]} />
                      <Legend />
                      <defs>
                        <linearGradient id="engagementColorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={VISUALIZATION_COLORS.ACCENT1} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={VISUALIZATION_COLORS.ACCENT5} stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <Bar
                        dataKey="engagement"
                        name={t("performance.engagement")}
                        fill="url(#engagementColorGradient)"
                        radius={[4, 4, 0, 0]}
                        stroke={VISUALIZATION_COLORS.ACCENT1}
                        strokeWidth={1}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex justify-between items-center w-full">
                  <div className="text-sm text-muted-foreground">
                    {t("performance.totalEngagement")}: {formatNumber(engagementByPlatformData?.reduce((sum, item) => sum + item.engagement, 0) || 0)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {t("performance.updatedEvery")} 6 {t("performance.hours")}
                  </Badge>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Sentiment Tab - Lazy Loaded */}
        <TabsContent value="sentiment">
          <Suspense fallback={
            <div className="w-full h-96 flex items-center justify-center">
              <LoadingSpinner size="lg" text={t("performance.loadingSentimentData")} />
            </div>
          }>
            <SentimentTab 
              sentimentDistributionData={sentimentDistributionData}
              sentimentTrendsData={sentimentTrendsData}
              isSentimentDistributionLoading={isSentimentDistributionLoading}
              isSentimentTrendsLoading={isSentimentTrendsLoading}
              timeRange={timeRange}
            />
          </Suspense>
        </TabsContent>
        
        {/* Engagement Tab - Lazy Loaded */}
        <TabsContent value="engagement">
          <Suspense fallback={
            <div className="w-full h-96 flex items-center justify-center">
              <LoadingSpinner size="lg" text={t("performance.loadingEngagementData")} />
            </div>
          }>
            <EngagementTab 
              engagementByPlatformData={engagementByPlatformData}
              engagementDetailsData={engagementDetailsData}
              isEngagementByPlatformLoading={isEngagementByPlatformLoading}
              isEngagementDetailsLoading={isEngagementDetailsLoading}
              timeRange={timeRange}
            />
          </Suspense>
        </TabsContent>
        
        {/* Performance Tab - Lazy Loaded */}
        <TabsContent value="performance">
          <Suspense fallback={
            <div className="w-full h-96 flex items-center justify-center">
              <LoadingSpinner size="lg" text={t("performance.loadingPerformanceData")} />
            </div>
          }>
            <PerformanceTab 
              kpiBreakdownData={kpiBreakdownData}
              isLoading={isKpiBreakdownLoading}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}