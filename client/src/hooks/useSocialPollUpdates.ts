import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SocialActivity {
  platform: string;
  action: 'create' | 'update' | 'delete';
  postId?: number;
  entityId?: number;
  count?: number;
  data?: any;
}

interface SocialPlatformCounts {
  facebook: number;
  twitter: number;
  instagram: number;
  linkedin: number;
  [key: string]: number;
}

interface UseSocialPollOptions {
  platforms?: string[];
  entityId?: number;
  onActivity?: (activity: SocialActivity) => void;
  showToasts?: boolean;
  pollInterval?: number;
  enabled?: boolean;
}

/**
 * Hook to poll for social media updates using React Query
 */
export function useSocialPollUpdates(options: UseSocialPollOptions = {}) {
  const [lastActivity, setLastActivity] = useState<SocialActivity | null>(null);
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});
  const [previousCounts, setPreviousCounts] = useState<SocialPlatformCounts | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Default polling interval: 15 seconds (can be customized via options)
  const pollInterval = options.pollInterval || 15000;
  
  // Query to fetch platform counts
  const { data: currentCounts, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['/api/social-posts/count-by-platform', options.entityId],
    queryFn: async () => {
      const url = options.entityId 
        ? `/api/social-posts/count-by-platform?entityId=${options.entityId}` 
        : '/api/social-posts/count-by-platform';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch social media counts');
      }
      return response.json() as Promise<SocialPlatformCounts>;
    },
    refetchInterval: options.enabled === false ? false : pollInterval,
    refetchOnWindowFocus: true,
    staleTime: pollInterval / 2, // Consider data stale after half the polling interval
  });
  
  // Create a filtered version of counts based on platform filter
  const filteredCounts = useCallback(() => {
    if (!options.platforms?.length) return activityCounts;
    
    return Object.entries(activityCounts)
      .filter(([platform]) => options.platforms?.includes(platform))
      .reduce((obj, [platform, count]) => {
        obj[platform] = count;
        return obj;
      }, {} as Record<string, number>);
  }, [activityCounts, options.platforms]);
  
  // Reset activity counts for all or specific platforms
  const resetCounts = useCallback((platforms?: string[]) => {
    if (!platforms?.length) {
      setActivityCounts({});
      return;
    }
    
    setActivityCounts(prev => {
      const newCounts = { ...prev };
      platforms.forEach(platform => {
        delete newCounts[platform];
      });
      return newCounts;
    });
  }, []);
  
  // Detect changes in platform counts and trigger notifications
  useEffect(() => {
    if (!currentCounts || !previousCounts) {
      // Initialize previous counts on first load
      if (currentCounts && !previousCounts) {
        setPreviousCounts(currentCounts);
      }
      return;
    }
    
    // Compare current vs previous counts to detect changes
    const platformsWithChanges = new Set<string>();
    let totalChanges = 0;
    
    Object.entries(currentCounts).forEach(([platform, count]) => {
      const prevCount = previousCounts[platform] || 0;
      const difference = count - prevCount;
      
      if (difference > 0) {
        // New activity detected for this platform
        platformsWithChanges.add(platform);
        totalChanges += difference;
        
        // Update internal activity counts
        setActivityCounts(prev => ({
          ...prev,
          [platform]: (prev[platform] || 0) + difference
        }));
        
        // Create and set activity record
        const activity: SocialActivity = {
          platform,
          action: 'create',
          count: difference
        };
        
        setLastActivity(activity);
        
        // Call custom handler if provided
        if (options.onActivity) {
          options.onActivity(activity);
        }
      }
    });
    
    // Show toast notification for detected changes
    if (options.showToasts !== false && platformsWithChanges.size > 0) {
      const platformsList = Array.from(platformsWithChanges).join(', ');
      toast({
        title: 'Social Media Updates',
        description: `${totalChanges} new updates from ${platformsList}`,
        variant: 'default',
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/social-posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/platform-activity'] });
      
      // If filtering by entity, also invalidate entity-specific queries
      if (options.entityId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/gov-entities', options.entityId, 'posts'] 
        });
      }
    }
    
    // Update previous counts for next comparison
    setPreviousCounts(currentCounts);
    
  }, [currentCounts, previousCounts, options, queryClient, toast]);
  
  // Return the hook's API
  return {
    isConnected: !isError, // Simulate connection status
    lastActivity,
    counts: filteredCounts(),
    totalCount: Object.values(filteredCounts()).reduce((sum, count) => sum + count, 0),
    resetCounts,
    isLoading,
    lastUpdated: dataUpdatedAt,
  };
}