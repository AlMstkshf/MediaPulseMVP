import { useState, useEffect, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Download, Calendar, BarChart2, Sparkles, TrendingUp, Newspaper, 
  BarChart4, ChevronRight, LineChart, PieChart, LayoutDashboard,
  RefreshCcw, Bell, Settings, Eye, Users, Hash, Search, Filter,
  FileText, User2, BookOpen, Globe, Building2, MessageSquare, Activity, UsersRound,
  BarChart
} from "lucide-react";
import ContentSearch from "@/components/dashboard/ContentSearch";
// Import widget components
import { default as SentimentAnalysisWidget } from "@/components/dashboard/widgets/SentimentAnalysisWidget";
import { default as KeywordTrendsWidget } from "@/components/dashboard/widgets/KeywordTrendsWidget";
import { default as EntityComparisonWidget } from "@/components/dashboard/widgets/EntityComparisonWidget";
import { default as MediaMentionsWidget } from "@/components/dashboard/widgets/MediaMentionsWidget";
import { default as SocialMediaTrendsWidget } from "@/components/dashboard/widgets/SocialMediaTrendsWidget";
import { default as SocialEngagementWidget } from "@/components/dashboard/widgets/SocialEngagementWidget";
import { default as SocialMediaStatsWidget } from "@/components/dashboard/widgets/SocialMediaStatsWidget";
import { default as OsintMonitoringWidget } from "@/components/dashboard/widgets/OsintMonitoringWidget";
import { default as QuickActionsWidget } from "@/components/dashboard/widgets/QuickActionsWidget";
import { default as PressReleasesWidget } from "@/components/dashboard/widgets/PressReleasesWidget";
import { default as MediaSourcesWidget } from "@/components/dashboard/widgets/MediaSourcesWidget";
import { default as JournalistDirectoryWidget } from "@/components/dashboard/widgets/JournalistDirectoryWidget";
import { default as EntityMentionsWidget } from "@/components/dashboard/widgets/EntityMentionsWidget";
import { RealtimeNotifications } from "@/components/websocket/RealtimeNotifications";
import { Link } from "wouter";
import { GlobalDataContext, GlobalDataProvider, useGlobalData } from "@/lib/context/GlobalDataContext";
import { useSectionNavigation } from "@/components/navigation/SectionNavigation";
import PageLayout from "@/components/layout/PageLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRtlDirection } from "@/lib/rtl-helper";
import { SENTIMENT_COLORS } from "@/lib/constants";

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const { isRtl } = useRtlDirection();
  
  // Use the global data context directly
  const globalData = useContext(GlobalDataContext);
  
  // Sample data for widgets
  const sentimentData = useMemo(() => ({
    overall: 72,
    trend: 5,
    sources: [
      { name: 'Twitter', score: 68, count: 1254 },
      { name: 'News', score: 75, count: 524 },
      { name: 'Blogs', score: 82, count: 328 },
      { name: 'Facebook', score: 70, count: 982 }
    ],
    history: [65, 68, 67, 70, 72, 71, 72]
  }), []);
  
  const keywordData = useMemo(() => ({
    keywords: [
      { name: 'Digital Transformation', volume: 1240, trend: 12 },
      { name: 'Smart Cities', volume: 980, trend: 8 },
      { name: 'Artificial Intelligence', volume: 1640, trend: 18 },
      { name: 'Government Services', volume: 760, trend: -3 },
      { name: 'Sustainable Development', volume: 890, trend: 5 }
    ]
  }), []);
  
  const entityData = useMemo(() => ({
    entities: [
      { name: 'Ministry of Economy', mentions: 345, sentiment: 78 },
      { name: 'Department of Economic Development', mentions: 287, sentiment: 72 },
      { name: 'Ministry of Finance', mentions: 412, sentiment: 65 },
      { name: 'Dubai Chamber', mentions: 254, sentiment: 82 }
    ]
  }), []);
  
  const mentionsData = useMemo(() => ({
    total: 14382,
    trend: 12,
    bySource: {
      news: 2140,
      twitter: 5840,
      facebook: 3260,
      blogs: 1670,
      other: 1472
    },
    mentions: [
      { 
        id: 1, 
        source: 'Twitter', 
        author: '@techreporter', 
        content: 'The new digital services platform from @DubaiGov is revolutionizing how citizens interact with government services. #DigitalTransformation',
        sentiment: 0.85,
        date: '2h ago'
      },
      { 
        id: 2, 
        source: 'Al Khaleej News', 
        author: 'Economic Editor', 
        content: 'Experts analyze the impact of the recent economic initiatives and their potential to boost growth in key sectors.',
        sentiment: 0.70,
        date: '5h ago'
      }
    ],
    recentMentions: [
      { 
        id: 1, 
        source: 'Twitter', 
        author: '@techreporter', 
        content: 'The new digital services platform from @DubaiGov is revolutionizing how citizens interact with government services. #DigitalTransformation',
        sentiment: 0.85,
        date: '2h ago'
      },
      { 
        id: 2, 
        source: 'Al Khaleej News', 
        author: 'Economic Editor', 
        content: 'Experts analyze the impact of the recent economic initiatives and their potential to boost growth in key sectors.',
        sentiment: 0.70,
        date: '5h ago'
      }
    ]
  }), []);
  
  const socialStatsData = useMemo(() => ({
    engagement: {
      total: 38420,
      trend: 15,
      byPlatform: {
        twitter: 12450,
        facebook: 9840,
        instagram: 11230,
        linkedin: 4900
      }
    },
    reach: {
      total: 1245000,
      trend: 8,
      byPlatform: {
        twitter: 380000,
        facebook: 425000,
        instagram: 290000,
        linkedin: 150000
      }
    },
    topHashtags: [
      { tag: '#DigitalTransformation', count: 1240 },
      { tag: '#InnovationInGov', count: 980 },
      { tag: '#SmartCities', count: 840 },
      { tag: '#SustainableFuture', count: 720 }
    ]
  }), []);
  
  // Default values or context values if available
  const timeFilter = globalData?.timeFilter || 'last30Days';
  const setTimeFilter = globalData?.setTimeFilter || (() => {});
  const refreshSocialData = globalData?.refreshSocialData || (() => {});
  const refreshMentions = globalData?.refreshMentions || (() => {});
  const isRefreshingSocial = globalData?.isRefreshingSocial || false;
  const isRefreshingMentions = globalData?.isRefreshingMentions || false;
  const generateReport = globalData?.generateReport || (() => {});
  const isGeneratingReport = globalData?.isGeneratingReport || false;
  
  // Get navigation functions with context preservation
  const { 
    goToMonitoring,
    goToSocialMedia,
    goToReports,
    goToSentimentAnalysis,
    goToMediaCenter,
    goToEntityMonitoring,
    goToSocialPublishing,
    goToExcellenceIndicators
  } = useSectionNavigation();
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Section header component with icon and title
  const SectionHeader = ({ icon: Icon, title, description }: { icon: any, title: string, description?: string }) => (
    <div className={`flex ${isRtl ? 'flex-row-reverse' : ''} ${description ? 'items-start' : 'items-center'}`}>
      <div className={`rounded-lg bg-primary/10 p-2 ${isRtl ? 'ml-3' : 'mr-3'}`}>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className={`text-xl font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{title}</h2>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
    </div>
  );

  // Stat card component
  const StatCard = ({ title, value, change, icon: Icon, color = "blue", helperText }: { 
    title: string, 
    value: string, 
    change?: number, 
    icon: any, 
    color?: "blue" | "green" | "amber" | "red" | "purple" | "indigo" | "yellow" | "primary" | "orange",
    helperText?: string
  }) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      amber: "bg-amber-100 text-amber-700",
      red: "bg-red-100 text-red-700",
      purple: "bg-purple-100 text-purple-700",
      indigo: "bg-indigo-100 text-indigo-700",
      yellow: "bg-yellow-100 text-yellow-700",
      primary: "bg-primary/10 text-primary",
      orange: "bg-orange-100 text-orange-700"
    };
    
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className={`flex items-center ${isRtl ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
            <div className={`${isRtl ? 'text-right' : ''}`}>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
              {change !== undefined && (
                <div className="flex items-center mt-1">
                  <Badge className={change >= 0 ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                    {change >= 0 ? `+${change}%` : `${change}%`}
                  </Badge>
                  {helperText && <span className="text-xs text-muted-foreground ml-2">{helperText}</span>}
                </div>
              )}
              {!change && helperText && (
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">{helperText}</span>
                </div>
              )}
            </div>
            <div className={`${colorClasses[color]} p-3 rounded-full`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Sentiment distribution section
  const SentimentDistribution = () => {
    const sentimentData = [
      { sentiment: t('analysis.positive'), value: 62, color: SENTIMENT_COLORS.POSITIVE },
      { sentiment: t('analysis.neutral'), value: 28, color: SENTIMENT_COLORS.NEUTRAL },
      { sentiment: t('analysis.negative'), value: 10, color: SENTIMENT_COLORS.NEGATIVE }
    ];
    
    return (
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            {t('dashboard.sentimentDistribution')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.sentimentDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentimentData.map((item) => (
              <div key={item.sentiment} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium">{item.sentiment}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2" indicatorColor={item.color} />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => goToSentimentAnalysis({ 
              source: 'dashboard', 
              timeFilter: timeFilter 
            })}
          >
            {t('dashboard.viewDetailedAnalysis')}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Recent mentions section
  const RecentMentions = () => {
    const mentions = [
      { 
        platform: 'Twitter', 
        content: t('dashboard.sampleContent1'),
        sentiment: 'positive',
        date: '2h ago'
      },
      { 
        platform: 'Facebook', 
        content: t('dashboard.sampleContent2'),
        sentiment: 'neutral',
        date: '5h ago'
      },
      { 
        platform: 'News', 
        content: t('dashboard.sampleContent3'),
        sentiment: 'negative',
        date: '8h ago'
      }
    ];
    
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {t('dashboard.recentMentions')}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => {
                // Refresh mentions data from context
                refreshMentions();
              }}
              disabled={isRefreshingMentions}
              aria-label={t('common.refresh')}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshingMentions ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentions.map((mention, index) => (
              <div 
                key={index} 
                className={`border-l-4 pl-4 ${
                  mention.sentiment === 'positive' ? 'border-green-500'
                  : mention.sentiment === 'negative' ? 'border-red-500'
                  : 'border-amber-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {mention.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{mention.date}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => {
                      // Display an alert with the content
                      window.alert(mention.content);
                    }}
                    aria-label={t('dashboard.viewMentionDetails')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
                <p className="mt-2 text-sm">{mention.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => goToMonitoring({ 
              source: 'dashboard', 
              view: 'mentions',
              timeFilter: timeFilter 
            })}
          >
            {t('dashboard.viewAllMentions')}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Platform activity section
  const PlatformActivity = () => {
    const platforms = [
      { name: t('platforms.twitter'), value: 45, change: 12 },
      { name: t('platforms.facebook'), value: 28, change: -5 },
      { name: t('platforms.instagram'), value: 18, change: 8 },
      { name: t('platforms.news'), value: 9, change: 2 }
    ];
    
    return (
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {t('dashboard.platformActivity')}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRtl ? "start" : "end"}>
                <DropdownMenuItem onSelect={() => {
                  setIsLoading(true);
                  setTimeFilter(t('dashboard.last24Hours'));
                  setTimeout(() => {
                    setIsLoading(false);
                  }, 500);
                }}>
                  {t('dashboard.last24Hours')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  setIsLoading(true);
                  setTimeFilter(t('dashboard.last7Days'));
                  setTimeout(() => {
                    setIsLoading(false);
                  }, 500);
                }}>
                  {t('dashboard.last7Days')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  setIsLoading(true);
                  setTimeFilter(t('dashboard.last30Days'));
                  setTimeout(() => {
                    setIsLoading(false);
                  }, 500);
                }}>
                  {t('dashboard.last30Days')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{platform.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{platform.value}%</span>
                  <Badge className={platform.change >= 0 ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                    {platform.change >= 0 ? `+${platform.change}%` : `${platform.change}%`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => goToSocialMedia({ 
              source: 'dashboard', 
              timeFilter: timeFilter 
            })}
          >
            {t('dashboard.viewPlatformDetails')}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Top keywords section
  const TopKeywords = () => {
    const keywords = [
      { word: t('keywords.innovation'), count: 245, change: 18 },
      { word: t('keywords.digital'), count: 187, change: 5 },
      { word: t('keywords.security'), count: 154, change: -3 },
      { word: t('keywords.community'), count: 132, change: 12 },
      { word: t('keywords.sustainability'), count: 98, change: 25 }
    ];
    
    return (
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            {t('dashboard.topKeywords')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keywords.map((keyword) => (
              <div key={keyword.word} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{keyword.word}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{keyword.count}</span>
                  <Badge className={keyword.change >= 0 ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                    {keyword.change >= 0 ? `+${keyword.change}%` : `${keyword.change}%`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => goToSentimentAnalysis({ 
              source: 'dashboard', 
              view: 'keywords',
              timeFilter: timeFilter 
            })}
          >
            {t('dashboard.exploreAllKeywords')}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Create loading overlay component
  const LoadingOverlay = () => {
    if (!isLoading) return null;
    
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      {/* Loading Overlay */}
      <LoadingOverlay />
      
      {/* Page Header */}
      <div className={`flex justify-between items-center mb-6 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <h1 className={`text-3xl font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
          {t('dashboard.mainTitle')}
        </h1>
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Calendar className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                <span>{timeFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? "start" : "end"}>
              <DropdownMenuItem onClick={() => {
                setTimeFilter(t('dashboard.today'));
                // Refresh data with new time filter
                refreshSocialData();
                refreshMentions();
              }}>
                {t('dashboard.today')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setTimeFilter(t('dashboard.last7Days'));
                // Refresh data with new time filter
                refreshSocialData();
                refreshMentions();
              }}>
                {t('dashboard.last7Days')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setTimeFilter(t('dashboard.last30Days'));
                // Refresh data with new time filter
                refreshSocialData();
                refreshMentions();
              }}>
                {t('dashboard.last30Days')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setTimeFilter(t('dashboard.last90Days'));
                // Refresh data with new time filter
                refreshSocialData();
                refreshMentions();
              }}>
                {t('dashboard.last90Days')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setTimeFilter(t('dashboard.custom'));
                // Could trigger a custom date range picker here
                // For now, just refresh with the new label
                refreshSocialData();
                refreshMentions();
              }}>
                {t('dashboard.custom')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            onClick={() => goToSentimentAnalysis({ 
              source: 'dashboard', 
              view: 'test',
              timeFilter: timeFilter 
            })}
          >
            <BarChart2 className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            <span>{t('dashboard.testSentimentAnalysis')}</span>
          </Button>

          <Button 
            className="bg-primary hover:bg-primary/90 text-white flex items-center"
            onClick={async () => {
              // Set loading state
              setIsLoading(true);
              
              try {
                // Use the generate report function from context
                const reportName = await generateReport({
                  timeRange: timeFilter,
                  platforms: ['twitter', 'facebook', 'instagram', 'linkedin'],
                  format: 'csv'
                });
                
                // Show success message or perform additional actions if needed
                console.log(`Report generated: ${reportName}`);
              } catch (error) {
                console.error('Error generating report:', error);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <Download className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            <span>{t('dashboard.downloadReport')}</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full mb-6"
      >
        <TabsList className={`mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <TabsTrigger value="overview" className="flex items-center">
            <LayoutDashboard className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {t('dashboard.overview')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart2 className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {t('dashboard.analytics')}
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center">
            <TrendingUp className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {t('dashboard.socialInsights')}
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center">
            <Newspaper className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {t('dashboard.mediaCenter')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Content Search */}
          <Card className="shadow-md border-t-2 border-t-primary/20">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-primary" />
                <span>{t('search.title', 'Search Content')}</span>
              </CardTitle>
              <CardDescription>{t('search.description', 'Search for content across all platforms and sources')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ContentSearch />
            </CardContent>
          </Card>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title={t('dashboard.totalMentions')} 
              value="14,382" 
              change={12} 
              icon={Bell} 
              color="blue"
            />
            <StatCard 
              title={t('dashboard.avgSentiment')} 
              value="4.2/5" 
              change={3} 
              icon={BarChart4} 
              color="green"
            />
            <StatCard 
              title={t('dashboard.engagementRate')} 
              value="23.8%" 
              change={-2} 
              icon={TrendingUp} 
              color="amber"
            />
            <StatCard 
              title={t('dashboard.reachEstimate')} 
              value="1.2M" 
              change={8} 
              icon={Users} 
              color="indigo"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <SentimentDistribution />
            <RecentMentions />
            <div className="flex flex-col gap-6">
              <PlatformActivity />
              <RealtimeNotifications />
            </div>
          </div>

          {/* More Insights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t('dashboard.sentimentOverTime')}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                  <p>{t('dashboard.sentimentTrendDescription')}</p>
                </div>
              </CardContent>
            </Card>
            <TopKeywords />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title={t('dashboard.sentimentScore')} 
              value="78" 
              change={5} 
              icon={Sparkles} 
              color="green"
              helperText={t('dashboard.inPreviousPeriod')}
            />
            <StatCard 
              title={t('dashboard.engagementRate')} 
              value="24.6%" 
              change={-3} 
              icon={Users} 
              color="blue"
              helperText={t('dashboard.inPreviousPeriod')}
            />
            <StatCard 
              title={t('dashboard.totalMentions')} 
              value="8,743" 
              change={12} 
              icon={Bell} 
              color="yellow"
              helperText={t('dashboard.inPreviousPeriod')}
            />
            <StatCard 
              title={t('dashboard.innovationIndex')} 
              value="92" 
              change={8} 
              icon={TrendingUp} 
              color="primary"
              helperText={t('dashboard.inPreviousPeriod')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Analysis Widget */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  {t('dashboard.sentiment_analysis.title', 'Sentiment Analysis')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.sentiment_analysis.description', 'Overall sentiment across all channels')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <SentimentAnalysisWidget data={sentimentData} />
                </div>
              </CardContent>
            </Card>

            {/* Keyword Trends */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  {t('dashboard.keyword_trends.title', 'Keyword Trends')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.keyword_trends.description', 'Top mentioned keywords and hashtags')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <KeywordTrendsWidget data={keywordData} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Entity Comparison Widget */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  {t('dashboard.entityComparison', 'Entity Comparison')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.entityComparisonDescription', 'Compare entities across metrics')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <EntityComparisonWidget data={entityData} />
                </div>
              </CardContent>
            </Card>

            {/* Media Mentions */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Newspaper className="h-5 w-5 mr-2 text-primary" />
                  {t('dashboard.mediaMentions', 'Media Mentions')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.mediaMentionsDescription', 'Distribution of mentions across media channels')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <MediaMentionsWidget data={mentionsData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title={t('dashboard.posts')} 
              value="576" 
              change={23} 
              icon={MessageSquare} 
              color="indigo"
              helperText={t('dashboard.inPreviousPeriod')}
            />
            <StatCard 
              title={t('dashboard.averageEngagement')} 
              value="16.8%" 
              change={-2} 
              icon={Activity} 
              color="orange"
              helperText={t('dashboard.inPreviousPeriod')}
            />
            <StatCard 
              title={t('dashboard.hashtagReach')} 
              value="145K" 
              change={32} 
              icon={Hash} 
              color="blue"
              helperText={t('dashboard.inPreviousPeriod')}
            />
            <StatCard 
              title={t('dashboard.followerGrowth')} 
              value="8.2%" 
              change={3} 
              icon={UsersRound} 
              color="green"
              helperText={t('dashboard.inPreviousPeriod')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Social Media Trends */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  {t('socialMedia.socialMediaTrends', 'Social Media Trends')}
                </CardTitle>
                <CardDescription>
                  {t('socialMedia.trendDescription', 'Performance across platforms and content types')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <SocialMediaTrendsWidget />
                </div>
              </CardContent>
            </Card>

            {/* Social Engagement */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-primary" />
                  {t('dashboard.socialMediaEngagement', 'Social Media Engagement')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.engagementDescription', 'Track engagement metrics across platforms')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <SocialEngagementWidget />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Social Media Stats */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-primary" />
                  {t('dashboard.socialMediaStats', 'Platform Overview')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.platformOverviewDescription', 'Performance statistics by platform')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <SocialMediaStatsWidget data={socialStatsData} />
                </div>
              </CardContent>
            </Card>

            {/* OSINT Monitoring */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Search className="h-5 w-5 mr-2 text-primary" />
                  {t('socialMedia.osintMonitoring', 'OSINT Monitoring')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.osintDescription', 'Monitor keywords and flagged accounts')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <OsintMonitoringWidget />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <LayoutDashboard className="h-5 w-5 mr-2 text-primary" />
                  {t('dashboard.quickActions', 'Quick Actions')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.quickActionsDescription', 'Common social media tasks')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <QuickActionsWidget />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title={t('dashboard.pressReleases')} 
              value="38" 
              change={4} 
              icon={FileText} 
              color="purple"
            />
            <StatCard 
              title={t('dashboard.journalists')} 
              value="124" 
              change={7} 
              icon={User2} 
              color="indigo"
            />
            <StatCard 
              title={t('dashboard.mediaSources')} 
              value="85" 
              change={2} 
              icon={BookOpen} 
              color="amber"
            />
            <StatCard 
              title={t('dashboard.campaignReach')} 
              value="2.6M" 
              change={15} 
              icon={Globe} 
              color="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Press Releases */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  {t('mediaCenter.latestPressReleases', 'Latest Press Releases')}
                </CardTitle>
                <CardDescription>
                  {t('mediaCenter.pressReleasesDescription', 'Recent press releases and media announcements')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] overflow-auto">
                  <PressReleasesWidget />
                </div>
              </CardContent>
            </Card>

            {/* Media Sources */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  {t('mediaCenter.mediaSources', 'Media Sources')}
                </CardTitle>
                <CardDescription>
                  {t('mediaCenter.mediaSourcesDescription', 'Key media outlets and sources')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] overflow-auto">
                  <MediaSourcesWidget />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Journalists Directory */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <User2 className="h-5 w-5 mr-2 text-primary" />
                  {t('mediaCenter.journalistDirectory', 'Journalist Directory')}
                </CardTitle>
                <CardDescription>
                  {t('mediaCenter.journalistDirectoryDescription', 'Contact information for key journalists and outlets')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] overflow-auto">
                  <JournalistDirectoryWidget />
                </div>
              </CardContent>
            </Card>

            {/* Entity Mentions */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-primary" />
                  {t('entity.monitoring', 'Entity Mentions')}
                </CardTitle>
                <CardDescription>
                  {t('entity.monitoringDescription', 'Monitor mentions of your organization across media')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <EntityMentionsWidget />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Dashboard;