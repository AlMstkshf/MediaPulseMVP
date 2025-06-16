import React, { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { WidgetProps, WidgetType } from './types';
import WidgetSettings from './WidgetSettings';
import { Settings, X, Loader2 } from 'lucide-react';

// Import all widget components dynamically to reduce the chance of import errors
const SentimentAnalysisWidget = React.lazy(() => import('./widgets/SentimentAnalysisWidget'));
const MediaMentionsWidget = React.lazy(() => import('./widgets/MediaMentionsWidget'));
const KeywordTrendsWidget = React.lazy(() => import('./widgets/KeywordTrendsWidget'));
const EntityComparisonWidget = React.lazy(() => import('./widgets/EntityComparisonWidget'));
const SocialMediaStatsWidget = React.lazy(() => import('./widgets/SocialMediaStatsWidget'));
const RecentReportsWidget = React.lazy(() => import('./widgets/RecentReportsWidget'));
const CustomContentWidget = React.lazy(() => import('./widgets/CustomContentWidget'));
const KpiOverviewWidget = React.lazy(() => import('./widgets/KpiOverviewWidget'));

// New widget components
const SocialEngagementWidget = React.lazy(() => import('./widgets/SocialEngagementWidget'));
const PressReleasesWidget = React.lazy(() => import('./widgets/PressReleasesWidget'));
const JournalistDirectoryWidget = React.lazy(() => import('./widgets/JournalistDirectoryWidget'));
const MediaSourcesWidget = React.lazy(() => import('./widgets/MediaSourcesWidget'));
const OsintMonitoringWidget = React.lazy(() => import('./widgets/OsintMonitoringWidget'));
const QuickActionsWidget = React.lazy(() => import('./widgets/QuickActionsWidget'));
const SocialMediaTrendsWidget = React.lazy(() => import('./widgets/SocialMediaTrendsWidget'));
const EntityMentionsWidget = React.lazy(() => import('./widgets/EntityMentionsWidget'));

const DashboardWidget: React.FC<WidgetProps> = ({
  id,
  type,
  title,
  data,
  settings,
  isEditing,
  onRemove,
  onSettingsChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  
  const renderWidgetContent = () => {
    try {
      switch (type) {
        case WidgetType.SentimentAnalysis:
          return <SentimentAnalysisWidget data={data} settings={settings} />;
        case WidgetType.MediaMentions:
          return <MediaMentionsWidget data={data} settings={settings} />;
        case WidgetType.KeywordTrends:
          return <KeywordTrendsWidget data={data} settings={settings} />;
        case WidgetType.EntityComparison:
          return <EntityComparisonWidget data={data} settings={settings} />;
        case WidgetType.SocialMediaStats:
          return <SocialMediaStatsWidget data={data} settings={settings} />;
        case WidgetType.RecentReports:
          return <RecentReportsWidget data={data} settings={settings} />;
        case WidgetType.CustomContent:
          return <CustomContentWidget data={data} settings={settings} />;
        case WidgetType.KpiOverview:
          return <KpiOverviewWidget 
            id={id}
            type={type}
            title={title}
            data={data}
            settings={settings}
            isEditing={isEditing}
            onRemove={onRemove}
            onSettingsChange={onSettingsChange}
          />;
        // New widget types
        case WidgetType.SocialEngagement:
          return <SocialEngagementWidget data={data} settings={settings} />;
        case WidgetType.PressReleases:
          return <PressReleasesWidget data={data} settings={settings} />;
        case WidgetType.JournalistDirectory:
          return <JournalistDirectoryWidget data={data} settings={settings} />;
        case WidgetType.MediaSources:
          return <MediaSourcesWidget data={data} settings={settings} />;
        case WidgetType.OsintMonitoring:
          return <OsintMonitoringWidget data={data} settings={settings} />;
        case WidgetType.QuickActions:
          return <QuickActionsWidget data={data} settings={settings} />;
        case WidgetType.SocialMediaTrends:
          return <SocialMediaTrendsWidget data={data} settings={settings} />;
        case WidgetType.EntityMentions:
          return <EntityMentionsWidget data={data} settings={settings} />;
        default:
          return <div>{t('dashboard.widgets.unknownType')}</div>;
      }
    } catch (err) {
      console.error(`Error rendering widget ${id} of type ${type}:`, err);
      setError(`${t('dashboard.widgets.errorRendering')}: ${err instanceof Error ? err.message : t('common.unknownError')}`);
      return <div className="p-4 text-red-500">{t('dashboard.widgets.displayError')}</div>;
    }
  };
  
  // Check if using RTL language
  const isRTL = i18n.language === 'ar';
  
  return (
    <div className={`dashboard-widget ${isRTL ? 'rtl-widget' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="widget-header">
        <h3>{title}</h3>
        
        {isEditing && (
          <div className={`widget-controls ${isRTL ? 'rtl-controls' : ''}`}>
            <button 
              className="settings-button"
              onClick={() => setShowSettings(!showSettings)}
              title={t('dashboard.widgets.settings')}
            >
              <Settings size={16} className={isRTL ? '' : 'preserve-direction'} />
            </button>
            <button 
              className="remove-button"
              onClick={() => onRemove(id)}
              title={t('dashboard.widgets.remove')}
            >
              <X size={16} className={isRTL ? '' : 'preserve-direction'} />
            </button>
          </div>
        )}
      </div>
      
      {showSettings && isEditing ? (
        <WidgetSettings 
          type={type}
          settings={settings || {}}
          onSave={(newSettings) => {
            onSettingsChange(id, newSettings);
            setShowSettings(false);
          }}
          onCancel={() => setShowSettings(false)}
        />
      ) : (
        <div className="widget-content">
          {error ? (
            <div className="error-message">
              <p>{t('dashboard.widgets.errorMessage')}</p>
              {isEditing && <p className="text-sm">{error}</p>}
            </div>
          ) : (
            <Suspense fallback={
              <div className="flex items-center justify-center h-full p-4">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>{t('common.loading')}</span>
              </div>
            }>
              {renderWidgetContent()}
            </Suspense>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardWidget;