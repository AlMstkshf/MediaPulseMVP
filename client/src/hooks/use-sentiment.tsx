import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";
import type { SentimentReport, InsertSentimentReport, SocialPost } from "@shared/schema";

export const useSentimentReports = (filters?: {
  platform?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) => {
  const { toast } = useToast();
  
  // Memoize query parameters to prevent unnecessary re-renders
  const { queryKey, queryString } = useMemo(() => {
    const queryKey = ["/api/sentiment-reports"];
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.platform) {
        queryParams.append("platform", filters.platform);
        queryKey.push(`platform=${filters.platform}`);
      }
      
      if (filters.dateFrom) {
        const dateFromStr = filters.dateFrom.toISOString();
        queryParams.append("dateFrom", dateFromStr);
        queryKey.push(`dateFrom=${dateFromStr}`);
      }
      
      if (filters.dateTo) {
        const dateToStr = filters.dateTo.toISOString();
        queryParams.append("dateTo", dateToStr);
        queryKey.push(`dateTo=${dateToStr}`);
      }
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return { queryKey, queryString };
  }, [
    filters?.platform, 
    filters?.dateFrom, 
    filters?.dateTo
  ]);
  
  return useQuery<SentimentReport[], Error>({ 
    queryKey,
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/sentiment-reports${queryString}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sentiment reports: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('API response is not an array of sentiment reports');
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching sentiment reports:", error);
        toast({
          title: "Error loading sentiment data",
          description: error instanceof Error ? error.message : "Failed to load sentiment reports",
          variant: "destructive",
        });
        throw error;
      }
    },
    // Retry failed requests 3 times with exponential backoff
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useSentimentReport = (id: number) => {
  const { toast } = useToast();
  
  return useQuery<SentimentReport, Error>({ 
    queryKey: [`/api/sentiment-reports/${id}`],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/sentiment-reports/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sentiment report: ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error(`Error fetching sentiment report ${id}:`, error);
        toast({
          title: "Error loading sentiment report",
          description: error instanceof Error ? error.message : "Failed to load sentiment report",
          variant: "destructive",
        });
        throw error;
      }
    },
    // Only run query if ID is valid
    enabled: !!id,
    // Retry failed requests 3 times with exponential backoff
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useCreateSentimentReport = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (report: InsertSentimentReport) => {
      try {
        const response = await apiRequest("POST", "/api/sentiment-reports", report);
        
        if (!response.ok) {
          throw new Error(`Failed to create sentiment report: ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Error creating sentiment report:", error);
        toast({
          title: "Error creating sentiment report",
          description: error instanceof Error ? error.message : "Failed to create sentiment report",
          variant: "destructive",
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sentiment-reports"] });
      toast({
        title: "Report created",
        description: "Sentiment report has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Mutation error creating sentiment report:", error);
    }
  });
};

export const useSocialPosts = (filters?: {
  platform?: string;
  sentiment?: number;
  keywords?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}) => {
  const { toast } = useToast();
  
  // Memoize query parameters to prevent unnecessary re-renders
  const { queryKey, queryString } = useMemo(() => {
    const queryKey = ["/api/social-posts"];
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.platform) {
        queryParams.append("platform", filters.platform);
        queryKey.push(`platform=${filters.platform}`);
      }
      
      if (filters.sentiment !== undefined) {
        queryParams.append("sentiment", filters.sentiment.toString());
        queryKey.push(`sentiment=${filters.sentiment}`);
      }
      
      if (filters.keywords && filters.keywords.length > 0) {
        queryParams.append("keywords", filters.keywords.join(","));
        queryKey.push(`keywords=${filters.keywords.join(",")}`);
      }
      
      if (filters.dateFrom) {
        const dateFromStr = filters.dateFrom.toISOString();
        queryParams.append("dateFrom", dateFromStr);
        queryKey.push(`dateFrom=${dateFromStr}`);
      }
      
      if (filters.dateTo) {
        const dateToStr = filters.dateTo.toISOString();
        queryParams.append("dateTo", dateToStr);
        queryKey.push(`dateTo=${dateToStr}`);
      }
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return { queryKey, queryString };
  }, [
    filters?.platform,
    filters?.sentiment,
    filters?.keywords,
    filters?.dateFrom,
    filters?.dateTo
  ]);
  
  return useQuery<SocialPost[], Error>({ 
    queryKey,
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/social-posts${queryString}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch social posts: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('API response is not an array of social posts');
        }
        
        return data.map(post => ({
          ...post,
          // Ensure key properties exist for consistency
          engagement: post.engagement || { likes: 0, comments: 0, shares: 0 },
          keywords: post.keywords || [],
          postUrl: post.postUrl || `#post-${post.id}`,
          createdAt: post.createdAt || post.postedAt
        }));
      } catch (error) {
        console.error("Error fetching social posts:", error);
        toast({
          title: "Error loading social posts",
          description: error instanceof Error ? error.message : "Failed to load social posts",
          variant: "destructive",
        });
        throw error;
      }
    },
    // Retry failed requests 3 times with exponential backoff
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
