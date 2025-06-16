import React from 'react';
import { WidgetType } from './types';
import { 
  PieChart, 
  Newspaper, 
  TrendingUp, 
  BarChart2, 
  Share2, 
  ClipboardList, 
  Edit, 
  BarChart4,
  LineChart,
  FileText,
  User2,
  BookOpen,
  Search,
  AlertTriangle,
  Building2,
  LayoutDashboard
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WidgetSelectorProps {
  onAddWidget: (type: WidgetType) => void;
}

const WidgetSelector: React.FC<WidgetSelectorProps> = ({ onAddWidget }) => {
  const { t } = useTranslation();

  const widgetOptions = [
    // Original widgets
    { type: WidgetType.SentimentAnalysis, name: t('dashboard.widgets.sentimentAnalysis'), icon: <PieChart className="w-6 h-6" /> },
    { type: WidgetType.MediaMentions, name: t('dashboard.widgets.mediaMentions'), icon: <Newspaper className="w-6 h-6" /> },
    { type: WidgetType.KeywordTrends, name: t('dashboard.widgets.keywordTrends'), icon: <TrendingUp className="w-6 h-6" /> },
    { type: WidgetType.EntityComparison, name: t('dashboard.widgets.entityComparison'), icon: <BarChart2 className="w-6 h-6" /> },
    { type: WidgetType.SocialMediaStats, name: t('dashboard.widgets.socialMediaStats'), icon: <Share2 className="w-6 h-6" /> },
    { type: WidgetType.RecentReports, name: t('dashboard.widgets.recentReports'), icon: <ClipboardList className="w-6 h-6" /> },
    { type: WidgetType.KpiOverview, name: t('dashboard.widgets.kpiOverview'), icon: <BarChart4 className="w-6 h-6" /> },
    { type: WidgetType.CustomContent, name: t('dashboard.widgets.customContent'), icon: <Edit className="w-6 h-6" /> },
    
    // New widgets
    { type: WidgetType.SocialEngagement, name: t('dashboard.widgets.socialEngagement'), icon: <LineChart className="w-6 h-6" /> },
    { type: WidgetType.PressReleases, name: t('dashboard.widgets.pressReleases'), icon: <FileText className="w-6 h-6" /> },
    { type: WidgetType.JournalistDirectory, name: t('dashboard.widgets.journalistDirectory'), icon: <User2 className="w-6 h-6" /> },
    { type: WidgetType.MediaSources, name: t('dashboard.widgets.mediaSources'), icon: <BookOpen className="w-6 h-6" /> },
    { type: WidgetType.OsintMonitoring, name: t('dashboard.widgets.osintMonitoring'), icon: <Search className="w-6 h-6" /> },
    { type: WidgetType.QuickActions, name: t('dashboard.widgets.quickActions'), icon: <LayoutDashboard className="w-6 h-6" /> },
    { type: WidgetType.SocialMediaTrends, name: t('dashboard.widgets.socialMediaTrends'), icon: <TrendingUp className="w-6 h-6" /> },
    { type: WidgetType.EntityMentions, name: t('dashboard.widgets.entityMentions'), icon: <Building2 className="w-6 h-6" /> },
  ];

  return (
    <div className="widget-selector">
      <h3>{t('dashboard.widgets.addWidgets')}</h3>
      <div className="widget-options">
        {widgetOptions.map(widget => (
          <button
            key={widget.type}
            className="widget-option"
            onClick={() => onAddWidget(widget.type)}
          >
            <span className="widget-icon">{widget.icon}</span>
            <span className="widget-name">{widget.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WidgetSelector;