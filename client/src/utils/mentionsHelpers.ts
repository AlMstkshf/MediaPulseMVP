/**
 * Helper functions for the MediaMentionsWidget component
 */
import i18next from 'i18next';

// Get a date object for the timeRange comparison
export const getDateForRange = (timeRange: string): Date => {
  const now = new Date();
  switch(timeRange) {
    case 'day':
      return new Date(now.setDate(now.getDate() - 1));
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setDate(now.getDate() - 30));
    case 'quarter':
      return new Date(now.setDate(now.getDate() - 90));
    default:
      return new Date(now.setDate(now.getDate() - 7));
  }
};

// Get sentiment indicator style and icon
export const getSentimentInfo = (sentiment: string): { color: string; icon: string } => {
  switch(sentiment) {
    case 'positive':
      return { color: '#4CAF50', icon: '😊' };
    case 'neutral':
      return { color: '#FFC107', icon: '😐' };
    case 'negative':
      return { color: '#F44336', icon: '😞' };
    default:
      return { color: '#999999', icon: '❓' };
  }
};

// Get source badge style and text
export const getSourceInfo = (platform: string): { badge: string; color: string } => {
  const t = i18next.t;
  
  switch(platform) {
    case 'news':
      return { badge: t('dashboard.media_mentions.news'), color: '#2196F3' };
    case 'social':
      return { badge: t('dashboard.media_mentions.social'), color: '#E91E63' };
    case 'blogs':
      return { badge: t('dashboard.media_mentions.blog'), color: '#9C27B0' };
    default:
      return { badge: t('dashboard.media_mentions.other'), color: '#607D8B' };
  }
};

// Format a date string for display
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(i18next.language);
};

// Get source display name
export const getSourceLabel = (source: string): string => {
  const t = i18next.t;
  
  return source === 'all' ? t('dashboard.media_mentions.allSources') : 
         source === 'news' ? t('dashboard.media_mentions.newsSources') :
         source === 'social' ? t('dashboard.media_mentions.socialMedia') :
         source === 'blogs' ? t('dashboard.media_mentions.blogs') : 
         t('dashboard.media_mentions.otherSources');
};

// Get time range display name
export const getTimeRangeLabel = (timeRange: string): string => {
  const t = i18next.t;
  
  return timeRange === 'day' ? t('dashboard.widgets.sentimentAnalysis.timeRanges.day') : 
         timeRange === 'week' ? t('dashboard.widgets.sentimentAnalysis.timeRanges.week') : 
         timeRange === 'month' ? t('dashboard.widgets.sentimentAnalysis.timeRanges.month') : 
         t('dashboard.widgets.sentimentAnalysis.timeRanges.quarter');
};

// Truncate text to specified length with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};