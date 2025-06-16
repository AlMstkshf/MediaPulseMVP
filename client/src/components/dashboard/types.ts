// Dashboard widget types

export enum WidgetType {
  SentimentAnalysis = 'sentiment_analysis',
  MediaMentions = 'media_mentions',
  KeywordTrends = 'keyword_trends',
  EntityComparison = 'entity_comparison',
  SocialMediaStats = 'social_media_stats',
  RecentReports = 'recent_reports',
  CustomContent = 'custom_content',
  KpiOverview = 'kpi_overview',
  // New widget types
  SocialEngagement = 'social_engagement',
  PressReleases = 'press_releases',
  JournalistDirectory = 'journalist_directory',
  MediaSources = 'media_sources',
  OsintMonitoring = 'osint_monitoring',
  QuickActions = 'quick_actions',
  SocialMediaTrends = 'social_media_trends',
  EntityMentions = 'entity_mentions'
}

// Interface for widget grid position
export interface GridPosition {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  isDraggable: boolean;
  isResizable: boolean;
}

// Interface for dashboard layout
export type DashboardLayout = {
  [key: string]: GridPosition;
};

// Interface for widget configuration
export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  minW?: number;
  minH?: number;
  data: any;
  settings?: any;
}

// Interface for widget props
export interface WidgetProps {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  settings?: any;
  isEditing: boolean;
  onRemove: (id: string) => void;
  onSettingsChange: (id: string, settings: any) => void;
}

// Interface for dashboard state
export interface DashboardState {
  widgets: WidgetConfig[];
  layout: DashboardLayout;
  isEditing: boolean;
}

// Interface for dashboard API response
export interface DashboardData {
  widgets: WidgetConfig[];
  layout: DashboardLayout;
}

// Interface for user preferences
export interface UserPreferences {
  dashboardLayout: DashboardLayout;
  theme: string;
  language: string;
  notifications: boolean;
  refreshInterval: number;
}