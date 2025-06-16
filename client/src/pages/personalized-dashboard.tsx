import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './personalized-dashboard.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Check, Plus, Save, Settings, X, Undo } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// Import Dashboard Widgets
import SentimentAnalysisWidget from '@/components/dashboard/widgets/SentimentAnalysisWidget';
import MediaMentionsWidget from '@/components/dashboard/widgets/MediaMentionsWidget';
import KeywordTrendsWidget from '@/components/dashboard/widgets/KeywordTrendsWidget';
import SocialMediaStatsWidget from '@/components/dashboard/widgets/SocialMediaStatsWidget';
import EntityComparisonWidget from '@/components/dashboard/widgets/EntityComparisonWidget';
import OsintMonitoringWidget from '@/components/dashboard/widgets/OsintMonitoringWidget';
import PressReleasesWidget from '@/components/dashboard/widgets/PressReleasesWidget';
import JournalistDirectoryWidget from '@/components/dashboard/widgets/JournalistDirectoryWidget';
import MediaSourcesWidget from '@/components/dashboard/widgets/MediaSourcesWidget';
import { toast } from '@/hooks/use-toast';
import useWebSocket from '@/hooks/useWebSocket';
// Remove import for StatCard since it's not being used
// import StatCard from '@/components/dashboard/StatCard';
import { Bell, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// Create responsive grid layout
const ResponsiveGridLayout = WidthProvider(Responsive);

// Sample data structures for widgets
const sampleData = {
  sentimentData: {
    positive: 65,
    neutral: 20,
    negative: 15,
    trend: 5,
    sentimentByPlatform: {
      twitter: { positive: 60, neutral: 25, negative: 15 },
      facebook: { positive: 70, neutral: 20, negative: 10 },
      news: { positive: 55, neutral: 25, negative: 20 },
      blogs: { positive: 65, neutral: 20, negative: 15 }
    },
    recentSentiment: [
      { date: '2025-05-01', positive: 58, neutral: 22, negative: 20 },
      { date: '2025-05-02', positive: 60, neutral: 20, negative: 20 },
      { date: '2025-05-03', positive: 65, neutral: 20, negative: 15 },
      { date: '2025-05-04', positive: 70, neutral: 18, negative: 12 },
      { date: '2025-05-05', positive: 65, neutral: 20, negative: 15 }
    ]
  },
  trendingKeywordsData: {
    trends: [
      { keyword: 'Digital Transformation', count: 1245, trend: 23 },
      { keyword: 'Economic Growth', count: 876, trend: 12 },
      { keyword: 'Sustainable Development', count: 765, trend: 18 },
      { keyword: 'Tourism', count: 654, trend: -5 },
      { keyword: 'Smart City', count: 543, trend: 8 }
    ]
  },
  entityData: {
    entities: [
      { name: 'Dubai Municipality', mentions: 432, sentiment: 75 },
      { name: 'Roads and Transport Authority', mentions: 387, sentiment: 68 },
      { name: 'Dubai Police', mentions: 342, sentiment: 79 },
      { name: 'Dubai Electricity and Water Authority', mentions: 289, sentiment: 71 },
      { name: 'Dubai Chamber', mentions: 254, sentiment: 82 }
    ]
  },
  mentionsData: {
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
  },
  socialStatsData: {
    engagement: {
      total: 38420,
      change: 12.5,
      byPlatform: {
        twitter: 12450,
        facebook: 15320,
        instagram: 8650,
        linkedin: 2000
      }
    },
    followers: {
      total: 127500,
      change: 5.2,
      byPlatform: {
        twitter: 42300,
        facebook: 38700,
        instagram: 31500,
        linkedin: 15000
      }
    },
    topPosts: [
      {
        id: 1,
        platform: 'Instagram',
        content: "Experience the beauty of Dubai's natural reserves this weekend! #VisitDubai",
        engagement: 2345,
        sentiment: 0.92
      },
      {
        id: 2,
        platform: 'Twitter',
        content: 'Announcement: New digital services launched to streamline business registration. #DubaiEconomy',
        engagement: 1876,
        sentiment: 0.85
      }
    ]
  },
  pressReleasesData: {
    total: 28,
    recent: [
      {
        id: 1,
        title: 'Dubai Launches New Initiative to Support Entrepreneurs',
        date: '2025-05-10',
        status: 'published',
        coverage: 76
      },
      {
        id: 2,
        title: 'Strategic Economic Plan 2030 Announced',
        date: '2025-05-08',
        status: 'published',
        coverage: 92
      },
      {
        id: 3,
        title: 'Environmental Sustainability Program Expansion',
        date: '2025-05-05',
        status: 'published',
        coverage: 68
      }
    ]
  },
  journalistsData: {
    total: 152,
    topJournalists: [
      {
        id: 1,
        name: 'Mohammed Al Falasi',
        organization: 'Al Bayan',
        articles: 42,
        sentiment: 0.78
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        organization: 'Gulf Business',
        articles: 38,
        sentiment: 0.82
      },
      {
        id: 3,
        name: 'Ahmed Al Mansouri',
        organization: 'Emirates Today',
        articles: 35,
        sentiment: 0.75
      }
    ]
  },
  mediaSourcesData: {
    total: 87,
    topSources: [
      {
        id: 1,
        name: 'Gulf News',
        coverage: 124,
        reach: 'High',
        sentiment: 0.76
      },
      {
        id: 2,
        name: 'Khaleej Times',
        coverage: 112,
        reach: 'High',
        sentiment: 0.72
      },
      {
        id: 3,
        name: 'Arabian Business',
        coverage: 95,
        reach: 'Medium',
        sentiment: 0.81
      }
    ]
  },
  osintData: {
    alerts: 12,
    monitored: {
      keywords: 78,
      accounts: 45
    },
    recentAlerts: [
      {
        id: 1,
        keyword: 'Dubai investment',
        platform: 'Twitter',
        source: '@financereporter',
        content: "Questions raised about the new investment regulations in Dubai's free zones. #Investment #Regulations",
        severity: 'medium',
        time: '3h ago'
      },
      {
        id: 2,
        keyword: 'Dubai tourism',
        platform: 'News',
        source: 'International Travel Daily',
        content: "Analysis of competitive tourism strategies might impact Dubai's visitor numbers this season.",
        severity: 'low',
        time: '6h ago'
      }
    ]
  }
};

// Define widget options with IDs, titles, and components
const widgetDefinitions = [
  { 
    id: 'sentiment', 
    title: 'Sentiment Analysis', 
    description: 'Monitor sentiment trends across channels',
    component: (data: any) => <SentimentAnalysisWidget data={data} />,
    defaultSize: { w: 2, h: 2 },
    category: 'analytics',
    icon: <BarChart3 className="h-5 w-5" />
  },
  { 
    id: 'mentions', 
    title: 'Media Mentions', 
    description: 'Distribution of mentions across media channels',
    component: (data: any) => <MediaMentionsWidget data={data} />,
    defaultSize: { w: 2, h: 2 },
    category: 'media',
    icon: <MessageSquare className="h-5 w-5" />
  },
  { 
    id: 'keywords', 
    title: 'Keyword Trends', 
    description: 'Monitor trending keywords and topics',
    component: (data: any) => <KeywordTrendsWidget data={data} />,
    defaultSize: { w: 2, h: 1 },
    category: 'analytics',
    icon: <TrendingUp className="h-5 w-5" />
  },
  { 
    id: 'social', 
    title: 'Social Media Stats', 
    description: 'Performance statistics by platform',
    component: (data: any) => <SocialMediaStatsWidget data={data} />,
    defaultSize: { w: 2, h: 2 },
    category: 'social',
    icon: <BarChart3 className="h-5 w-5" />
  },
  { 
    id: 'entities', 
    title: 'Entity Comparison', 
    description: 'Compare entities across metrics',
    component: (data: any) => <EntityComparisonWidget data={data} />,
    defaultSize: { w: 2, h: 2 },
    category: 'analytics',
    icon: <BarChart3 className="h-5 w-5" />
  },
  { 
    id: 'osint', 
    title: 'OSINT Monitoring', 
    description: 'Monitor keywords and flagged accounts',
    component: (data: any) => <OsintMonitoringWidget data={data} />,
    defaultSize: { w: 2, h: 2 },
    category: 'security',
    icon: <Bell className="h-5 w-5" />
  },
  { 
    id: 'releases', 
    title: 'Press Releases', 
    description: 'Track press release performance',
    component: (data: any) => <PressReleasesWidget data={data} />,
    defaultSize: { w: 2, h: 1 },
    category: 'media',
    icon: <MessageSquare className="h-5 w-5" />
  },
  { 
    id: 'journalists', 
    title: 'Journalist Directory', 
    description: 'Key journalists and their activity',
    component: (data: any) => <JournalistDirectoryWidget data={data} />,
    defaultSize: { w: 2, h: 1 },
    category: 'media',
    icon: <MessageSquare className="h-5 w-5" />
  },
  { 
    id: 'sources', 
    title: 'Media Sources', 
    description: 'Top media sources and their reach',
    component: (data: any) => <MediaSourcesWidget data={data} />,
    defaultSize: { w: 2, h: 1 },
    category: 'media',
    icon: <MessageSquare className="h-5 w-5" />
  }
];

// Widget data mapping
const widgetDataMapping: any = {
  sentiment: 'sentimentData',
  mentions: 'mentionsData',
  keywords: 'trendingKeywordsData',
  social: 'socialStatsData',
  entities: 'entityData',
  osint: 'osintData',
  releases: 'pressReleasesData',
  journalists: 'journalistsData',
  sources: 'mediaSourcesData'
};

const PersonalizedDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [layouts, setLayouts] = useState<any[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<any[]>([]);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { status: connectionStatus } = useWebSocket();

  // Initialize dashboard with default widgets
  useEffect(() => {
    // Load saved dashboard configuration from localStorage if available
    const savedDashboard = localStorage.getItem('personalizedDashboard');
    if (savedDashboard) {
      try {
        const parsedDashboard = JSON.parse(savedDashboard);
        setLayouts(parsedDashboard.layouts || []);
        setSelectedWidgets(parsedDashboard.selectedWidgets || []);
        
        // Update available widgets to exclude selected ones
        updateAvailableWidgets(parsedDashboard.selectedWidgets || []);
      } catch (error) {
        console.error('Error loading saved dashboard:', error);
        initializeDefaultDashboard();
      }
    } else {
      initializeDefaultDashboard();
    }
  }, []);

  // Generate starter dashboard with 4 default widgets
  const initializeDefaultDashboard = () => {
    const defaultWidgetIds = ['sentiment', 'mentions', 'keywords', 'social'];
    setSelectedWidgets(defaultWidgetIds);
    
    // Create initial layouts
    const initialLayouts = defaultWidgetIds.map((id, index) => {
      const widget = widgetDefinitions.find(w => w.id === id);
      const row = Math.floor(index / 2);
      const col = index % 2;
      
      // Extract width and height with proper default values
      const widgetWidth = widget?.defaultSize?.w ?? 2;
      const widgetHeight = widget?.defaultSize?.h ?? 2;
      
      return {
        i: id,
        x: col * widgetWidth,
        y: row * 2,
        w: widgetWidth,
        h: widgetHeight,
        minW: 1,
        minH: 1
      };
    });
    
    setLayouts(initialLayouts);
    
    // Set available widgets excluding selected ones
    updateAvailableWidgets(defaultWidgetIds);
  };

  const updateAvailableWidgets = (selected: string[]) => {
    const available = widgetDefinitions.filter(widget => !selected.includes(widget.id));
    setAvailableWidgets(available);
  };

  // Handle adding widget to dashboard
  const handleAddWidget = (widgetId: string) => {
    const newSelectedWidgets = [...selectedWidgets, widgetId];
    setSelectedWidgets(newSelectedWidgets);
    
    // Find the widget definition
    const widget = widgetDefinitions.find(w => w.id === widgetId);
    
    // Find a suitable position (at the end of current layout)
    let maxY = 0;
    layouts.forEach(item => {
      const itemBottom = item.y + item.h;
      if (itemBottom > maxY) {
        maxY = itemBottom;
      }
    });
    
    // Add the new widget to layouts
    const newLayout = {
      i: widgetId,
      x: 0,
      y: maxY,
      w: widget?.defaultSize.w || 2,
      h: widget?.defaultSize.h || 2,
      minW: 1,
      minH: 1
    };
    
    setLayouts([...layouts, newLayout]);
    
    // Update available widgets
    updateAvailableWidgets(newSelectedWidgets);
    
    // Close the widget selector dialog
    setShowWidgetSelector(false);
  };

  // Handle removing widget from dashboard
  const handleRemoveWidget = (widgetId: string) => {
    // Remove from selected widgets
    const newSelectedWidgets = selectedWidgets.filter(id => id !== widgetId);
    setSelectedWidgets(newSelectedWidgets);
    
    // Remove from layout
    const newLayouts = layouts.filter(item => item.i !== widgetId);
    setLayouts(newLayouts);
    
    // Update available widgets
    updateAvailableWidgets(newSelectedWidgets);
  };

  // Handle layout changes from react-grid-layout
  const handleLayoutChange = (newLayout: any) => {
    setLayouts(newLayout);
  };

  // Save dashboard configuration
  const saveDashboard = () => {
    setIsSaving(true);
    
    // Create dashboard configuration object
    const dashboardConfig = {
      layouts,
      selectedWidgets
    };
    
    // Save to localStorage
    localStorage.setItem('personalizedDashboard', JSON.stringify(dashboardConfig));
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setEditMode(false);
      toast({
        title: t('dashboard.saved', 'Dashboard saved'),
        description: t('dashboard.savedDescription', 'Your personalized dashboard has been saved'),
        variant: 'default',
      });
    }, 1000);
  };

  // Reset to default dashboard
  const resetDashboard = () => {
    // Ask for confirmation
    if (window.confirm(t('dashboard.resetConfirm', 'Are you sure you want to reset your dashboard to default settings?'))) {
      // Remove from localStorage
      localStorage.removeItem('personalizedDashboard');
      
      // Initialize default dashboard
      initializeDefaultDashboard();
      
      // Exit edit mode
      setEditMode(false);
      
      toast({
        title: t('dashboard.reset', 'Dashboard reset'),
        description: t('dashboard.resetDescription', 'Your dashboard has been reset to default settings'),
        variant: 'default',
      });
    }
  };

  // Render widget based on its ID
  const renderWidget = (widgetId: string) => {
    const widget = widgetDefinitions.find(w => w.id === widgetId);
    if (!widget) return null;
    
    // Get the appropriate data for this widget
    const dataKey = widgetDataMapping[widgetId];
    const widgetData = sampleData[dataKey as keyof typeof sampleData];
    
    // Get a unique ID for this widget for accessibility
    const widgetHeadingId = `widget-${widgetId}-heading`;
    
    return (
      <div className="h-full">
        {editMode && (
          <div className="absolute right-2 top-2 z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-background"
              onClick={() => handleRemoveWidget(widgetId)}
              aria-label={t('dashboard.removeWidget', 'Remove Widget')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t('dashboard.removeWidget', 'Remove Widget')}</span>
            </Button>
          </div>
        )}
        <Card className="h-full shadow-md widget-container">
          <CardHeader className="pb-2 widget-header">
            <CardTitle 
              className="text-lg font-medium flex items-center" 
              id={widgetHeadingId}
            >
              <span className="widget-header-title-icon">{widget.icon}</span>
              <span className="ml-2">{t(`dashboard.${widgetId}Title`, widget.title)}</span>
            </CardTitle>
            <CardDescription>
              {t(`dashboard.${widgetId}Description`, widget.description)}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-70px)] overflow-auto widget-content" aria-labelledby={widgetHeadingId}>
            <div className="widget-chart-container">
              {widget.component(widgetData)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Filter widgets by category
  const getWidgetsByCategory = (category: string) => {
    return availableWidgets.filter(widget => widget.category === category);
  };

  return (
    <div className="personalized-dashboard-container">
      <Helmet>
        <title>{t('dashboard.personalized', 'Personalized Dashboard')} | Media Pulse</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6 dashboard-header">
        <h1 className="text-3xl font-bold" id="dashboard-title">
          {t('dashboard.personalized', 'Personalized Dashboard')}
        </h1>
        
        <div className="flex items-center gap-4">
          {editMode ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setEditMode(false)}
              >
                <X className="h-4 w-4 mr-2" />
                {t('common.cancel', 'Cancel')}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={resetDashboard}
              >
                <Undo className="h-4 w-4 mr-2" />
                {t('dashboard.reset', 'Reset')}
              </Button>
              
              <Button 
                variant="default" 
                onClick={saveDashboard}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t('common.save', 'Save')}
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setEditMode(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {t('dashboard.customize', 'Customize')}
            </Button>
          )}
        </div>
      </div>
      
      {/* Connection status alert */}
      {connectionStatus !== 'connected' && (
        <Alert className="mb-4">
          <AlertDescription className="flex items-center">
            {connectionStatus === 'connecting' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('websocket.connecting', 'Connecting to real-time updates...')}
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                {t('websocket.disconnected', 'Disconnected from real-time updates. Some data may not be current.')}
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Dashboard grid */}
      <div className={`relative transition-all duration-300 dashboard-grid ${editMode ? 'edit-mode' : ''}`}>
        {/* Add widget button in edit mode */}
        {editMode && (
          <div className="absolute right-4 bottom-4 z-20">
            <Button 
              size="lg"
              className="rounded-full shadow-lg add-widget-button"
              onClick={() => setShowWidgetSelector(true)}
              aria-label={t('dashboard.addWidget', 'Add Widget')}
            >
              <Plus className="h-5 w-5 mr-2" />
              <span>{t('dashboard.addWidget', 'Add Widget')}</span>
            </Button>
          </div>
        )}
        
        {/* Main grid layout */}
        <div className="min-h-[600px]" aria-labelledby="dashboard-title">
          <ResponsiveGridLayout
            className="layout react-grid-layout"
            layouts={{ lg: layouts }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 }}
            rowHeight={150}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            isDraggable={editMode}
            isResizable={editMode}
            onLayoutChange={(layout) => handleLayoutChange(layout)}
          >
            {selectedWidgets.map(widgetId => (
              <div key={widgetId}>
                {renderWidget(widgetId)}
              </div>
            ))}
          </ResponsiveGridLayout>
          
          {/* Empty state */}
          {selectedWidgets.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6" role="region" aria-labelledby="empty-dashboard-title">
              <Settings className="h-16 w-16 text-gray-400 mb-4" aria-hidden="true" />
              <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2" id="empty-dashboard-title">
                {t('dashboard.emptyDashboard', 'Your dashboard is empty')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                {t('dashboard.emptyDashboardDescription', 'Add widgets to customize your dashboard with the information most relevant to you.')}
              </p>
              <Button 
                onClick={() => {
                  setEditMode(true);
                  setShowWidgetSelector(true);
                }}
                className="interactive-element"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>{t('dashboard.addWidgets', 'Add Widgets')}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Widget selector dialog */}
      <Dialog open={showWidgetSelector} onOpenChange={setShowWidgetSelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle id="widget-selector-title">{t('dashboard.addWidgets', 'Add Widgets')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.addWidgetsDescription', 'Select widgets to add to your personalized dashboard')}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="analytics" className="mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="analytics" aria-controls="analytics-tab">{t('dashboard.categoryAnalytics', 'Analytics')}</TabsTrigger>
              <TabsTrigger value="social" aria-controls="social-tab">{t('dashboard.categorySocial', 'Social Media')}</TabsTrigger>
              <TabsTrigger value="media" aria-controls="media-tab">{t('dashboard.categoryMedia', 'Media')}</TabsTrigger>
              <TabsTrigger value="security" aria-controls="security-tab">{t('dashboard.categorySecurity', 'Security')}</TabsTrigger>
            </TabsList>
            
            {['analytics', 'social', 'media', 'security'].map((category) => (
              <TabsContent key={category} value={category} id={`${category}-tab`}>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="widget-selector-grid">
                    {getWidgetsByCategory(category).map((widget) => (
                      <div 
                        key={widget.id}
                        className="flex items-start p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer widget-option"
                        onClick={() => handleAddWidget(widget.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleAddWidget(widget.id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`${t('dashboard.add', 'Add')} ${widget.title} ${t('dashboard.widget', 'widget')}`}
                      >
                        <div className="mr-4 mt-1" aria-hidden="true">
                          {widget.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            <>{t(`dashboard.${widget.id}Title`, { defaultValue: widget.title })}</>
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <>{t(`dashboard.${widget.id}Description`, { defaultValue: widget.description })}</>
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-2 interactive-element"
                          aria-hidden="true"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                    
                    {getWidgetsByCategory(category).length === 0 && (
                      <div className="flex items-center justify-center h-[100px] bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('dashboard.noWidgetsAvailable', 'No widgets available in this category')}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowWidgetSelector(false)}
              className="interactive-element"
            >
              <span>{t('common.done', 'Done')}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalizedDashboard;