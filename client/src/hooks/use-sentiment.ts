import { useQuery } from "@tanstack/react-query";
import { queryClient, getQueryFn } from "@/lib/queryClient";

export interface SocialPost {
  id: string;
  platform: string;
  content: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  postedAt: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  sentiment?: 'positive' | 'neutral' | 'negative';
  hashtags?: string[];
}

export interface SentimentReport {
  id: string;
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  platform?: string;
  totalPosts: number;
}

export interface SocialMediaPlatformStats {
  platform: string;
  count: number;
  active: boolean;
  lastActive: string;
  engagement: number;
  reach: number;
}

export interface SocialTrendingTopic {
  topic: string;
  count: number;
  change: number;
}

interface SocialPostsQueryParams {
  platform?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export const useSocialPosts = (params?: SocialPostsQueryParams) => {
  return useQuery({
    queryKey: ['/api/social-posts', params],
    queryFn: getQueryFn(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data: any): SocialPost[] => {
      if (!data) return [];
      if (Array.isArray(data)) return data as SocialPost[];
      console.warn('Expected social posts to be an array, got:', typeof data);
      return [];
    }
  });
};

export const useSentimentReports = (platform?: string) => {
  return useQuery({
    queryKey: ['/api/sentiment-reports', { platform }],
    queryFn: getQueryFn(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    select: (data: any): SentimentReport[] => {
      if (!data) return [];
      if (Array.isArray(data)) return data as SentimentReport[];
      console.warn('Expected sentiment reports to be an array, got:', typeof data);
      return [];
    }
  });
};

export const useSocialPlatformStats = () => {
  return useQuery({
    queryKey: ['/api/social-posts/count-by-platform'],
    queryFn: getQueryFn(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    select: (data: any): SocialMediaPlatformStats[] => {
      if (!data) return [];
      if (Array.isArray(data)) return data as SocialMediaPlatformStats[];
      console.warn('Expected platform stats to be an array, got:', typeof data);
      return [];
    }
  });
};

export const useTrendingTopics = () => {
  return useQuery({
    queryKey: ['/api/social-posts/trending-topics'],
    queryFn: getQueryFn(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Provide a function to handle empty response
    select: (data: any): SocialTrendingTopic[] => {
      if (!data) return [];
      // If the data is already an array, return it directly
      if (Array.isArray(data)) return data as SocialTrendingTopic[];
      // Otherwise, return an empty array as fallback
      console.warn('Expected trending topics to be an array, but got:', typeof data);
      return [];
    }
  });
};

// Invalidate cache when new posts/data comes in via WebSocket
export const invalidateSocialQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['/api/social-posts'] });
  queryClient.invalidateQueries({ queryKey: ['/api/sentiment-reports'] });
  queryClient.invalidateQueries({ queryKey: ['/api/social-posts/count-by-platform'] });
  queryClient.invalidateQueries({ queryKey: ['/api/social-posts/trending-topics'] });
};