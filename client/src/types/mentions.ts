/**
 * Types for the Media Mentions feature
 */

export interface Mention {
  id: number;
  title: string;
  source: string;
  url: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative' | string;
  platform: 'news' | 'social' | 'blogs' | string;
}

export interface MentionsData {
  mentions: Mention[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  refetch?: () => void;
}

export interface MentionsSettings {
  displayType?: 'list' | 'grid' | 'timeline';
  source?: 'all' | 'news' | 'social' | 'blogs' | string;
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | string;
}

export interface MediaMentionsWidgetProps {
  data: MentionsData;
  settings?: MentionsSettings;
  onMentionClick?: (mention: Mention) => void;
}