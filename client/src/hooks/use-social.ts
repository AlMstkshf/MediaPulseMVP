import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Social post types
export interface SocialPost {
  id: number;
  content: string;
  platform: string;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  postUrl: string | null;
  sentiment: number | null;
  engagement: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
    clicks?: number;
    total?: number;
  } | null;
  createdAt: Date | null;
  postedAt: Date | null;
  keywords: string[] | null;
  entityId?: number | null;
  entityName?: string | null;
  mediaUrls?: string[] | null;
  isReply?: boolean | null;
  parentPostId?: number | null;
  location?: string | null;
  language?: string | null;
  metrics?: Record<string, number> | null;
}

export interface CreateSocialPostData {
  content: string;
  platform: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  postUrl?: string;
  sentiment?: number;
  engagement?: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
    clicks?: number;
    total?: number;
  };
  postedAt?: Date;
  keywords?: string[];
  entityId?: number;
  entityName?: string;
  mediaUrls?: string[];
  isReply?: boolean;
  parentPostId?: number;
  location?: string;
  language?: string;
  metrics?: Record<string, number>;
}

export interface UpdateSocialPostData extends Partial<CreateSocialPostData> {
  id: number;
}

export interface SocialQueryParams {
  platform?: string | string[];
  entityId?: number;
  search?: string;
  keywords?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  engagement?: number;
  minEngagement?: number;
  maxEngagement?: number;
  limit?: number;
  page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Hook to fetch all social posts with optional filtering
export function useSocialPosts(params: SocialQueryParams = {}) {
  // Convert params object to URL search params
  const queryParams = new URLSearchParams();
  
  if (params.platform) {
    if (Array.isArray(params.platform)) {
      params.platform.forEach(p => queryParams.append('platform', p));
    } else {
      queryParams.append('platform', params.platform);
    }
  }
  
  if (params.entityId) queryParams.append('entityId', params.entityId.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.keywords?.length) queryParams.append('keywords', params.keywords.join(','));
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom.toISOString());
  if (params.dateTo) queryParams.append('dateTo', params.dateTo.toISOString());
  if (params.sentiment) queryParams.append('sentiment', params.sentiment);
  if (params.engagement) queryParams.append('engagement', params.engagement.toString());
  if (params.minEngagement) queryParams.append('minEngagement', params.minEngagement.toString());
  if (params.maxEngagement) queryParams.append('maxEngagement', params.maxEngagement.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.order) queryParams.append('order', params.order);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/social-posts?${queryString}` : '/api/social-posts';
  
  return useQuery({
    queryKey: ['/api/social-posts', params],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', endpoint);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error fetching social posts: ${response.status}`
          );
        }
        
        return await response.json() as SocialPost[];
      } catch (error) {
        console.error('Error fetching social posts:', error);
        throw error;
      }
    },
  });
}

// Hook to fetch a single social post by ID
export function useSocialPost(id?: number) {
  return useQuery({
    queryKey: id ? ['/api/social-posts', id] : null,
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const response = await apiRequest('GET', `/api/social-posts/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error fetching social post: ${response.status}`
          );
        }
        
        return await response.json() as SocialPost;
      } catch (error) {
        console.error('Error fetching social post:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
}

// Hook to create a social post
export function useCreateSocialPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateSocialPostData) => {
      try {
        const response = await apiRequest('POST', '/api/social-posts', data);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error creating social post: ${response.status}`
          );
        }
        
        return await response.json() as SocialPost;
      } catch (error) {
        console.error('Error creating social post:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-posts'] });
      
      toast({
        title: 'Success',
        description: 'Social post created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create social post',
        variant: 'destructive',
      });
    },
  });
}

// Hook to update a social post
export function useUpdateSocialPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: UpdateSocialPostData) => {
      try {
        const { id, ...updateData } = data;
        const response = await apiRequest('PUT', `/api/social-posts/${id}`, updateData);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error updating social post: ${response.status}`
          );
        }
        
        return await response.json() as SocialPost;
      } catch (error) {
        console.error('Error updating social post:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate both the specific item and the list
      queryClient.invalidateQueries({ queryKey: ['/api/social-posts', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-posts'] });
      
      toast({
        title: 'Success',
        description: 'Social post updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update social post',
        variant: 'destructive',
      });
    },
  });
}

// Hook to delete a social post
export function useDeleteSocialPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await apiRequest('DELETE', `/api/social-posts/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error deleting social post: ${response.status}`
          );
        }
        
        return id;
      } catch (error) {
        console.error('Error deleting social post:', error);
        throw error;
      }
    },
    onSuccess: (id) => {
      // Invalidate the list and remove the item from cache
      queryClient.invalidateQueries({ queryKey: ['/api/social-posts'] });
      queryClient.removeQueries({ queryKey: ['/api/social-posts', id] });
      
      toast({
        title: 'Success',
        description: 'Social post deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete social post',
        variant: 'destructive',
      });
    },
  });
}

// Hook to fetch social post metrics by time period
export function useSocialMetrics(params: SocialQueryParams = {}) {
  // Convert params object to URL search params
  const queryParams = new URLSearchParams();
  
  if (params.platform) {
    if (Array.isArray(params.platform)) {
      params.platform.forEach(p => queryParams.append('platform', p));
    } else {
      queryParams.append('platform', params.platform);
    }
  }
  
  if (params.entityId) queryParams.append('entityId', params.entityId.toString());
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom.toISOString());
  if (params.dateTo) queryParams.append('dateTo', params.dateTo.toISOString());
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/social/metrics?${queryString}` : '/api/social/metrics';
  
  return useQuery({
    queryKey: ['/api/social/metrics', params],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', endpoint);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error fetching social metrics: ${response.status}`
          );
        }
        
        return await response.json() as {
          totalPosts: number;
          platformBreakdown: Record<string, number>;
          engagementTotal: number;
          engagementAvg: number;
          sentimentAvg: number;
          sentimentBreakdown: {
            positive: number;
            neutral: number;
            negative: number;
          };
          topKeywords: Array<{ keyword: string; count: number }>;
          timeline: Array<{
            date: string;
            posts: number;
            engagement: number;
            sentiment: number;
          }>;
        };
      } catch (error) {
        console.error('Error fetching social metrics:', error);
        throw error;
      }
    },
  });
}

// Hook to fetch platform activity for a time period
export function usePlatformActivity(params: SocialQueryParams = {}) {
  // Convert params object to URL search params
  const queryParams = new URLSearchParams();
  
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom.toISOString());
  if (params.dateTo) queryParams.append('dateTo', params.dateTo.toISOString());
  if (params.entityId) queryParams.append('entityId', params.entityId.toString());
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/social/platform-activity?${queryString}` : '/api/social/platform-activity';
  
  return useQuery({
    queryKey: ['/api/social/platform-activity', params],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', endpoint);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error fetching platform activity: ${response.status}`
          );
        }
        
        return await response.json() as Record<string, {
          posts: number;
          engagement: number;
          sentiment: number;
          change: number;
        }>;
      } catch (error) {
        console.error('Error fetching platform activity:', error);
        throw error;
      }
    },
  });
}

// Simulate platform activity (for demo/testing purposes)
export function useSimulatePlatformActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (platform: string) => {
      try {
        const response = await apiRequest('POST', '/api/social/simulate-activity', { platform });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error simulating activity: ${response.status}`
          );
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error simulating ${platform} activity:`, error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/social-posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/platform-activity'] });
      
      toast({
        title: 'Activity Simulated',
        description: `${variables} activity generated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Simulation Failed',
        description: error.message || 'Failed to simulate activity',
        variant: 'destructive',
      });
    },
  });
}