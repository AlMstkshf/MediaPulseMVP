import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SocialActivity {
  platform: string;
  action: 'create' | 'update' | 'delete';
  postId?: number;
  entityId?: number;
  count?: number;
  data?: any;
}

interface UseSocialActivityOptions {
  platforms?: string[];
  entityId?: number;
  onActivity?: (activity: SocialActivity) => void;
  showToasts?: boolean;
}

/**
 * Hook to listen for social media activity updates via polling
 */
export function useSocialActivityUpdates(options: UseSocialActivityOptions = {}) {
  const [lastActivity, setLastActivity] = useState<SocialActivity | null>(null);
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const lastUpdatesRef = useRef<Record<string, number>>({});
  const [connected, setConnected] = useState(true);

  // Build query params based on options
  const params = new URLSearchParams();
  if (options.platforms?.length) {
    params.append('platforms', options.platforms.join(','));
  }
  if (options.entityId !== undefined) {
    params.append('entityId', options.entityId.toString());
  }
  
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

  // Fetch updates from the server
  const { data: updates, error } = useQuery({
    queryKey: ['/api/social/platform-activity', params.toString()],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/social/platform-activity?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch social activity updates');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('[useSocialActivityUpdates] Error fetching updates:', error);
        setConnected(false);
        throw error;
      }
    },
    refetchInterval: 15000, // Poll every 15 seconds
  });

  // Process updates when they arrive
  useEffect(() => {
    if (!updates || !Array.isArray(updates)) return;
    
    let hasNewUpdates = false;
    const platformsWithUpdates = new Set<string>();
    let totalNewUpdates = 0;
    
    updates.forEach(update => {
      // Check if we've seen this update before
      const updateId = `${update.platform}-${update.id || update.postId}`;
      const timestamp = update.timestamp || Date.now();
      
      if (!lastUpdatesRef.current[updateId] || lastUpdatesRef.current[updateId] < timestamp) {
        hasNewUpdates = true;
        lastUpdatesRef.current[updateId] = timestamp;
        
        const platform = update.platform || 'unknown';
        
        // If entity filtering is enabled, skip updates for other entities
        if (options.entityId && update.entityId && update.entityId !== options.entityId) {
          return;
        }
        
        // Count by platform
        platformsWithUpdates.add(platform);
        totalNewUpdates++;
        
        // Update activity counts for the platform
        setActivityCounts(prev => ({
          ...prev,
          [platform]: (prev[platform] || 0) + 1
        }));
        
        // Set the most recent one as the lastActivity
        setLastActivity({
          platform,
          action: update.action || 'create',
          postId: update.postId,
          entityId: update.entityId,
          data: update
        });
        
        // Call custom handler for each update if provided
        if (options.onActivity) {
          options.onActivity({
            platform,
            action: update.action || 'create',
            postId: update.postId,
            entityId: update.entityId,
            data: update
          });
        }
      }
    });
    
    // Show a summary toast notification if enabled and we have new updates
    if (options.showToasts !== false && hasNewUpdates && totalNewUpdates > 0) {
      const platformsList = Array.from(platformsWithUpdates).join(', ');
      toast({
        title: `Social Media Updates`,
        description: `${totalNewUpdates} new updates from ${platformsList}`,
        variant: 'default',
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/social-posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/metrics'] });
      
      // If filtering by entity, also invalidate entity-specific queries
      if (options.entityId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/gov-entities', options.entityId, 'posts'] 
        });
      }
    }
    
    // Update connection status based on successful fetch
    setConnected(true);
  }, [updates, options.entityId, options.onActivity, options.showToasts, queryClient, toast]);

  // Update connection status on error
  useEffect(() => {
    if (error) {
      setConnected(false);
    }
  }, [error]);
  
  return {
    connected,
    connectionStatus: connected ? 'connected' : 'disconnected',
    lastActivity,
    counts: filteredCounts(),
    totalCount: Object.values(filteredCounts()).reduce((sum, count) => sum + count, 0),
    resetCounts,
  };
}