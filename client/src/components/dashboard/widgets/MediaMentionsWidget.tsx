import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MediaMentionsWidgetProps, Mention } from '@/types/mentions';
import { getDateForRange, getSourceLabel, getTimeRangeLabel } from '@/utils/mentionsHelpers';

// Import view components
import ListMentions from './mentions/ListMentions';
import GridMentions from './mentions/GridMentions';
import TimelineMentions from './mentions/TimelineMentions';
import MentionsLoadingPlaceholder from './mentions/MentionsLoadingPlaceholder';
import MentionsErrorState from './mentions/MentionsErrorState';

const MediaMentionsWidget: React.FC<MediaMentionsWidgetProps> = ({ 
  data, 
  settings = {},
  onMentionClick 
}) => {
  const { t } = useTranslation();
  
  // Extract settings with defaults
  const { 
    displayType = 'list', 
    source = 'all', 
    timeRange = 'week' 
  } = settings;
  
  // Apply filters using useMemo to optimize performance
  const filteredMentions = useMemo(() => {
    // Guard against undefined mentions
    if (!data.mentions || !Array.isArray(data.mentions)) {
      return [];
    }
    
    // Filter by source if not 'all'
    const sourceMentions = source === 'all' 
      ? data.mentions 
      : data.mentions.filter((mention: Mention) => mention.platform === source);
    
    // Get date for timeRange comparison
    const dateLimit = getDateForRange(timeRange);
    
    // Further filter by time range
    return sourceMentions.filter((mention: Mention) => {
      const mentionDate = new Date(mention.date);
      return mentionDate >= dateLimit;
    });
  }, [data.mentions, source, timeRange]);

  // Handle loading state
  if (data.isLoading) {
    return (
      <div className="media-mentions-widget">
        <div className="widget-info text-sm text-gray-500 mb-3">
          <p>{getSourceLabel(source)} | {getTimeRangeLabel(timeRange)}</p>
        </div>
        <MentionsLoadingPlaceholder />
      </div>
    );
  }
  
  // Handle error state
  if (data.isError) {
    return (
      <div className="media-mentions-widget">
        <div className="widget-info text-sm text-gray-500 mb-3">
          <p>{getSourceLabel(source)} | {getTimeRangeLabel(timeRange)}</p>
        </div>
        <MentionsErrorState 
          error={data.error} 
          onRetry={data.refetch}
        />
      </div>
    );
  }
  
  // Render content based on display type
  const renderMentions = () => {
    // If no mentions data available
    if (!data.mentions || !Array.isArray(data.mentions) || data.mentions.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          {t('dashboard.media_mentions.noMentionsData')}
        </div>
      );
    }

    switch(displayType) {
      case 'grid':
        return <GridMentions mentions={filteredMentions} onMentionClick={onMentionClick} />;
      case 'timeline':
        return <TimelineMentions mentions={filteredMentions} onMentionClick={onMentionClick} />;
      case 'list':
      default:
        return <ListMentions mentions={filteredMentions} onMentionClick={onMentionClick} />;
    }
  };
  
  // Get total mentions count (safely)
  const totalMentionsCount = Array.isArray(data.mentions) ? data.mentions.length : 0;
  
  return (
    <div className="media-mentions-widget">
      <div className="widget-info text-sm text-gray-500 mb-3">
        <p>{getSourceLabel(source)} | {getTimeRangeLabel(timeRange)}</p>
      </div>
      
      {renderMentions()}
      
      {filteredMentions.length > 0 && totalMentionsCount > 0 && (
        <div className="mentions-footer text-center my-3 text-xs text-gray-500">
          {t('dashboard.media_mentions.showingMentions', { 
            shown: filteredMentions.length, 
            total: totalMentionsCount 
          })}
        </div>
      )}
    </div>
  );
};

export default MediaMentionsWidget;