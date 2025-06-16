import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMentions, Mention } from '@/hooks/useMentions';
import MentionsLoadingPlaceholder from './MentionsLoadingPlaceholder';
import ErrorPlaceholder from './ErrorPlaceholder';
import { TIME_RANGES, TimeRange, getTimeRangeById } from '@/config/timeRanges';
import { formatDate, formatRelative } from '@/utils/date';
import { SectionErrorBoundary } from '@/components/shared/ErrorBoundary';
import { getPlatformColor, getPlatformIcon } from '@/config/platforms.config';
import { ArrowUpRight, MessageSquare } from 'lucide-react';

interface MentionsWidgetProps {
  title?: string;
  entityFilter?: string;
  limit?: number;
  className?: string;
}

/**
 * A widget for displaying entity mentions with filtering
 * 
 * @param props Component props
 * @returns Mentions widget component
 */
const MentionsWidget: React.FC<MentionsWidgetProps> = ({
  title = 'Recent Mentions',
  entityFilter,
  limit = 5,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [timeRange, setTimeRange] = useState<TimeRange>(TIME_RANGES[1]); // Default to 'week'
  
  // Get date range from time range
  const endDate = new Date().toISOString();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange.days);
  
  // Call our custom hook
  const {
    data: mentions,
    isLoading,
    isError,
    error,
    refetch,
  } = useMentions({
    entity: entityFilter,
    sentiment: activeTab !== 'all' ? activeTab as any : undefined,
    limit,
    startDate: startDate.toISOString(),
    endDate,
  });

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(getTimeRangeById(value));
  };

  return (
    <SectionErrorBoundary title="Error in Mentions Widget">
      <Card className={className}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{title}</CardTitle>
            <Select
              value={timeRange.id}
              onValueChange={handleTimeRangeChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.id} value={range.id}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="positive" className="flex-1">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Positive
              </TabsTrigger>
              <TabsTrigger value="neutral" className="flex-1">
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                Neutral
              </TabsTrigger>
              <TabsTrigger value="negative" className="flex-1">
                <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                Negative
              </TabsTrigger>
            </TabsList>
            
            <TabsContent 
              value={activeTab}
              aria-live="polite"
              className="focus:outline-none"
            >
              {isLoading ? (
                <MentionsLoadingPlaceholder count={limit} />
              ) : isError ? (
                <ErrorPlaceholder
                  message={error?.message || 'Failed to load mentions data'}
                  onRetry={refetch}
                />
              ) : mentions && mentions.length > 0 ? (
                <div className="space-y-4">
                  {mentions.map((mention) => (
                    <MentionCard key={mention.id} mention={mention} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>No mentions found for the selected filters</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </SectionErrorBoundary>
  );
};

/**
 * Card component for a single mention
 */
const MentionCard: React.FC<{ mention: Mention }> = ({ mention }) => {
  const PlatformIcon = getPlatformIcon(mention.source) || MessageSquare;
  const platformColor = getPlatformColor(mention.source) || 'text-gray-500';

  // Get sentiment badge color
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${platformColor} bg-opacity-10`}>
            <PlatformIcon className="h-5 w-5" />
          </div>
          
          <div className="space-y-1 flex-grow">
            <div className="flex justify-between items-center">
              <div className="font-medium text-sm">
                {mention.authorName}
                {mention.authorUsername && (
                  <span className="text-muted-foreground ml-1">
                    @{mention.authorUsername}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatRelative(mention.mentionedAt)}
              </span>
            </div>
            
            <p className="text-sm line-clamp-2">{mention.content}</p>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getSentimentColor(
                    mention.sentiment
                  )}`}
                >
                  {mention.sentiment || 'neutral'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {mention.entityName}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                asChild
              >
                <a
                  href={mention.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="sr-only">Open source</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentionsWidget;