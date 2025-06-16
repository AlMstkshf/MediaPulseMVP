import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Define types for the data we'll be sharing across components
interface SocialData {
  platform: string;
  count: number;
  sentiment: number;
  engagement?: number;
}

interface AlertData {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  seen: boolean;
}

interface MentionData {
  id: number;
  content: string;
  platform: string;
  sentiment: number | null;
  authorName: string | null;
  authorUsername: string | null;
  postedAt: Date | null;
}

interface ReportGenerationOptions {
  timeRange: string;
  platforms: string[];
  format: 'csv' | 'pdf' | 'excel';
}

interface GlobalDataContextType {
  // Dashboard filters
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  
  // Social media data
  socialData: SocialData[];
  refreshSocialData: () => void;
  isRefreshingSocial: boolean;
  
  // Alerts 
  alerts: AlertData[];
  markAlertSeen: (id: string) => void;
  clearAllAlerts: () => void;
  
  // Mentions
  recentMentions: MentionData[];
  refreshMentions: () => void;
  isRefreshingMentions: boolean;
  
  // Report generation
  generateReport: (options: ReportGenerationOptions) => Promise<string>;
  isGeneratingReport: boolean;
  
  // Section navigation with context
  navigateToSection: (section: string, params?: Record<string, any>) => void;
  currentSection: string;
  sectionParams: Record<string, any> | null;
}

export const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export function GlobalDataProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [timeFilter, setTimeFilter] = useState(t('dashboard.last30Days'));
  const [socialData, setSocialData] = useState<SocialData[]>([]);
  const [isRefreshingSocial, setIsRefreshingSocial] = useState(false);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [recentMentions, setRecentMentions] = useState<MentionData[]>([]);
  const [isRefreshingMentions, setIsRefreshingMentions] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sectionParams, setSectionParams] = useState<Record<string, any> | null>(null);

  // Initial data fetch
  useEffect(() => {
    refreshSocialData();
    
    // Fetch some sample alerts
    setAlerts([
      {
        id: '1',
        message: t('dashboard.alertMessages.negativeSentimentSpike'),
        type: 'warning',
        timestamp: new Date(),
        seen: false
      },
      {
        id: '2',
        message: t('dashboard.alertMessages.vipMention'),
        type: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        seen: false
      },
      {
        id: '3',
        message: t('dashboard.alertMessages.trendingKeyword'),
        type: 'success',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        seen: true
      }
    ]);
    
    // Initialize recent mentions
    refreshMentions();
  }, [t]);

  // Refresh social data function
  const refreshSocialData = () => {
    setIsRefreshingSocial(true);
    // Simulate API call to fetch social data
    setTimeout(() => {
      setSocialData([
        { platform: 'twitter', count: 256, sentiment: 0.72 },
        { platform: 'facebook', count: 142, sentiment: 0.65 },
        { platform: 'instagram', count: 98, sentiment: 0.81 },
        { platform: 'linkedin', count: 64, sentiment: 0.79 }
      ]);
      setIsRefreshingSocial(false);
    }, 1000);
  };

  // Refresh mentions function
  const refreshMentions = () => {
    setIsRefreshingMentions(true);
    // Simulate API call to fetch mentions
    setTimeout(() => {
      setRecentMentions([
        {
          id: 1,
          content: 'Excellent service from the new digital transformation initiative!',
          platform: 'twitter',
          sentiment: 0.92,
          authorName: 'Sarah M.',
          authorUsername: '@digitalsarah',
          postedAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
        },
        {
          id: 2,
          content: 'The new online service portal has some usability issues.',
          platform: 'facebook',
          sentiment: 0.35,
          authorName: 'Ahmed K.',
          authorUsername: 'ahmed.khalid',
          postedAt: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
        },
        {
          id: 3,
          content: 'Just attended the smart city initiative launch. Impressive vision!',
          platform: 'instagram',
          sentiment: 0.88,
          authorName: 'Leila J.',
          authorUsername: '@cityplanner',
          postedAt: new Date(Date.now() - 1000 * 60 * 180) // 3 hours ago
        }
      ]);
      setIsRefreshingMentions(false);
    }, 1200);
  };

  // Mark alert as seen
  const markAlertSeen = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, seen: true } : alert
    ));
  };

  // Clear all alerts
  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Generate report function
  const generateReport = async (options: ReportGenerationOptions): Promise<string> => {
    setIsGeneratingReport(true);
    return new Promise((resolve) => {
      // Simulate report generation delay
      setTimeout(() => {
        setIsGeneratingReport(false);
        resolve(`media-monitoring-report-${new Date().toISOString().slice(0, 10)}.${options.format}`);
      }, 2000);
    });
  };

  // Navigate to section with context
  const navigateToSection = (section: string, params?: Record<string, any>) => {
    setCurrentSection(section);
    setSectionParams(params || null);
    // Note: Actual navigation should be handled by components using this context
  };

  const value = {
    timeFilter,
    setTimeFilter,
    socialData,
    refreshSocialData,
    isRefreshingSocial,
    alerts,
    markAlertSeen,
    clearAllAlerts,
    recentMentions,
    refreshMentions,
    isRefreshingMentions,
    generateReport,
    isGeneratingReport,
    navigateToSection,
    currentSection,
    sectionParams
  };

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
}