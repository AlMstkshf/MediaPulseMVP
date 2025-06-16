import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { 
  WidgetConfig, 
  WidgetType, 
  DashboardLayout, 
  DashboardState,
  DashboardData
} from './types';
import WidgetGrid from './WidgetGrid';
import WidgetSelector from './WidgetSelector';
import './Dashboard.css';

// Helper functions to get default widget settings based on type
const getDefaultWidgetSettings = (type: WidgetType) => {
  switch(type) {
    // Original widgets
    case WidgetType.SentimentAnalysis:
      return { 
        title: 'Sentiment Analysis',
        chartType: 'pie',
        entityId: 'all',
        timeRange: 'week'
      };
    case WidgetType.MediaMentions:
      return { 
        title: 'Media Mentions',
        displayType: 'list',
        source: 'all',
        timeRange: 'week'
      };
    case WidgetType.KeywordTrends:
      return { 
        title: 'Keyword Trends',
        trendType: 'volume',
        keywords: 'innovation, digital, sustainability',
        timeRange: 'week'
      };
    case WidgetType.EntityComparison:
      return { 
        title: 'Entity Comparison',
        metric: 'sentiment',
        entities: ['1', '2', '3'],
        timeRange: 'week'
      };
    case WidgetType.SocialMediaStats:
      return { 
        title: 'Social Media Statistics',
        dataSource: 'all',
        timeRange: 'week'
      };
    case WidgetType.RecentReports:
      return { 
        title: 'Recent Reports',
        dataSource: 'all',
        timeRange: 'month'
      };
    case WidgetType.CustomContent:
      return { 
        title: 'Custom Content',
        customContent: '<h3>Welcome to your dashboard!</h3><p>You can customize this widget to display any HTML content.</p>'
      };
    case WidgetType.KpiOverview:
      return { 
        title: 'KPI Overview',
        maxItems: 2,
        compact: true,
        showViewAllLink: true
      };
      
    // New widgets
    case WidgetType.SocialEngagement:
      return {
        title: 'Social Engagement',
        timeRange: '30',
        platforms: ['twitter', 'facebook', 'instagram']
      };
    case WidgetType.PressReleases:
      return {
        title: 'Latest Press Releases',
        limit: 5,
        showStatus: true
      };
    case WidgetType.JournalistDirectory:
      return {
        title: 'Journalist Directory',
        limit: 5,
        showSearch: true
      };
    case WidgetType.MediaSources:
      return {
        title: 'Media Sources',
        limit: 5,
        showType: true
      };
    case WidgetType.OsintMonitoring:
      return {
        title: 'OSINT Monitoring',
        defaultTab: 'keywords',
        showSearch: true
      };
    case WidgetType.QuickActions:
      return {
        title: 'Quick Actions',
        columns: 2,
        actions: ['monitor-keyword', 'keyword-alert', 'flagged-account', 'create-report', 'schedule-post', 'add-press-release']
      };
    case WidgetType.SocialMediaTrends:
      return {
        title: 'Social Media Trends',
        timeRange: '30',
        defaultView: 'distribution'
      };
    case WidgetType.EntityMentions:
      return {
        title: 'Entity Mentions',
        timeRange: '30',
        limit: 5,
        view: 'list'
      };
    default:
      return { title: 'New Widget' };
  }
};

// Helper to get default widget dimensions
const getDefaultWidgetDimensions = (type: WidgetType) => {
  switch(type) {
    // Original widgets
    case WidgetType.SentimentAnalysis:
      return { minW: 4, minH: 4 };
    case WidgetType.MediaMentions:
      return { minW: 4, minH: 4 };
    case WidgetType.KeywordTrends:
      return { minW: 6, minH: 3 };
    case WidgetType.EntityComparison:
      return { minW: 4, minH: 3 };
    case WidgetType.SocialMediaStats:
      return { minW: 4, minH: 4 };
    case WidgetType.RecentReports:
      return { minW: 4, minH: 4 };
    case WidgetType.CustomContent:
      return { minW: 3, minH: 2 };
    case WidgetType.KpiOverview:
      return { minW: 6, minH: 4 };
      
    // New widgets
    case WidgetType.SocialEngagement:
      return { minW: 6, minH: 4 };
    case WidgetType.PressReleases:
      return { minW: 4, minH: 4 };
    case WidgetType.JournalistDirectory:
      return { minW: 4, minH: 4 };
    case WidgetType.MediaSources:
      return { minW: 4, minH: 3 };
    case WidgetType.OsintMonitoring:
      return { minW: 6, minH: 4 };
    case WidgetType.QuickActions:
      return { minW: 4, minH: 3 };
    case WidgetType.SocialMediaTrends:
      return { minW: 6, minH: 4 };
    case WidgetType.EntityMentions:
      return { minW: 6, minH: 4 };
    default:
      return { minW: 3, minH: 2 };
  }
};

// Sample data for demonstration - in a real app, this would come from the API
const defaultDashboard: DashboardState = {
  widgets: [
    {
      id: '1',
      type: WidgetType.SentimentAnalysis,
      title: 'Sentiment Analysis',
      minW: 4,
      minH: 4,
      data: {
        sentiment: {
          positive: 65,
          neutral: 25,
          negative: 10
        }
      },
      settings: {
        chartType: 'pie',
        entityId: 'all',
        timeRange: 'week',
        title: 'Sentiment Analysis'
      }
    },
    {
      id: '2',
      type: WidgetType.MediaMentions,
      title: 'Recent Media Mentions',
      minW: 4,
      minH: 4,
      data: { mentions: [] }, // Will use default data in the widget
      settings: {
        displayType: 'list',
        source: 'all',
        timeRange: 'week',
        title: 'Recent Media Mentions'
      }
    },
    {
      id: '3',
      type: WidgetType.KeywordTrends,
      title: 'Keyword Trends',
      minW: 6,
      minH: 3,
      data: { trends: {} }, // Will use default data in the widget
      settings: {
        trendType: 'volume',
        keywords: 'innovation, digital, sustainability',
        timeRange: 'week',
        title: 'Keyword Trends'
      }
    },
    {
      id: '4',
      type: WidgetType.KpiOverview,
      title: 'KPI Overview',
      minW: 6,
      minH: 4,
      data: {},
      settings: {
        maxItems: 2,
        compact: true,
        showViewAllLink: true,
        title: 'KPI Overview'
      }
    }
  ],
  layout: {
    '1': { i: '1', x: 0, y: 0, w: 4, h: 4, minW: 4, minH: 4, isDraggable: true, isResizable: true },
    '2': { i: '2', x: 4, y: 0, w: 4, h: 4, minW: 4, minH: 4, isDraggable: true, isResizable: true },
    '3': { i: '3', x: 0, y: 4, w: 8, h: 3, minW: 6, minH: 3, isDraggable: true, isResizable: true },
    '4': { i: '4', x: 0, y: 7, w: 8, h: 4, minW: 6, minH: 4, isDraggable: true, isResizable: true }
  },
  isEditing: false
};

const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<DashboardState>(defaultDashboard);
  
  // Fetch dashboard configuration from API
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/dashboard');
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        return null;
      }
    },
    enabled: false // Disabled for now as API endpoint doesn't exist yet
  });
  
  // Mutation to save dashboard configuration
  const saveDashboardMutation = useMutation({
    mutationFn: async (dashboardState: DashboardState) => {
      const response = await apiRequest('POST', '/api/dashboard', dashboardState);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('dashboard.saveSuccess'),
        description: t('dashboard.saveSuccessDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('dashboard.saveFailed'),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Initialize dashboard from API data if available
  useEffect(() => {
    if (dashboardData) {
      setDashboard({
        widgets: dashboardData.widgets,
        layout: dashboardData.layout,
        isEditing: false
      });
    }
  }, [dashboardData]);
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setDashboard(prev => ({
      ...prev,
      isEditing: !prev.isEditing
    }));
  };
  
  // Save dashboard changes
  const saveDashboard = () => {
    // For now, just toggle out of edit mode
    // In a real implementation, this would call the saveDashboardMutation
    setDashboard(prev => ({
      ...prev,
      isEditing: false
    }));
    
    // Uncomment to use the actual API
    // saveDashboardMutation.mutate(dashboard);
    
    toast({
      title: t('dashboard.saveSuccess'),
      description: t('dashboard.saveSuccessDescription'),
    });
  };
  
  // Handle adding a new widget
  const handleAddWidget = (type: WidgetType) => {
    const id = uuidv4();
    const dimensions = getDefaultWidgetDimensions(type);
    const settings = getDefaultWidgetSettings(type);
    
    const newWidget: WidgetConfig = {
      id,
      type,
      title: settings.title || 'New Widget',
      ...dimensions,
      data: {},
      settings
    };
    
    setDashboard(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
  };
  
  // Handle removing a widget
  const handleRemoveWidget = (id: string) => {
    setDashboard(prev => {
      const newLayout = { ...prev.layout };
      delete newLayout[id];
      
      return {
        ...prev,
        widgets: prev.widgets.filter(widget => widget.id !== id),
        layout: newLayout
      };
    });
  };
  
  // Handle layout changes
  const handleLayoutChange = (newLayout: DashboardLayout) => {
    setDashboard(prev => ({
      ...prev,
      layout: newLayout
    }));
  };
  
  // Handle widget settings changes
  const handleWidgetSettingsChange = (id: string, settings: any) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === id 
          ? { ...widget, settings, title: settings.title || widget.title }
          : widget
      )
    }));
  };
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>{t('dashboard.title')}</h1>
        <div className="dashboard-controls">
          {dashboard.isEditing ? (
            <>
              <button 
                className="save-button"
                onClick={saveDashboard}
                style={{ padding: "0.5rem 1rem", fontWeight: "bold" }}
              >
                {t('dashboard.saveChanges')}
              </button>
              <button 
                className="cancel-button"
                onClick={toggleEditMode}
                style={{ padding: "0.5rem 1rem", fontWeight: "bold" }}
              >
                {t('dashboard.cancel')}
              </button>
            </>
          ) : (
            <button 
              className="edit-button"
              onClick={toggleEditMode}
              style={{ padding: "0.5rem 1rem", fontWeight: "bold" }}
            >
              {t('dashboard.customizeDashboard')}
            </button>
          )}
        </div>
      </div>
      
      {dashboard.isEditing && (
        <div className="widget-selector-container">
          <WidgetSelector onAddWidget={handleAddWidget} />
        </div>
      )}
      
      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>{t('dashboard.loading')}</span>
          </div>
        ) : (
          <WidgetGrid
            widgets={dashboard.widgets}
            layout={dashboard.layout}
            isEditing={dashboard.isEditing}
            onLayoutChange={handleLayoutChange}
            onRemoveWidget={handleRemoveWidget}
            onWidgetSettingsChange={handleWidgetSettingsChange}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;