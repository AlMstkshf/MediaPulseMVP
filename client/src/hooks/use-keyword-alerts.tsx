import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { KeywordAlert, Keyword, SocialPost } from "@shared/schema";

// Extended type that includes related entities
interface KeywordAlertWithDetails extends KeywordAlert {
  keyword?: Keyword;
  post?: SocialPost;
  createdAt: Date; // Using detected as createdAt for UI consistency
}

interface KeywordAlertOptions {
  limit?: number;
  keywordId?: number;
  read?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export function useKeywordAlerts(options: KeywordAlertOptions = {}) {
  const queryClient = useQueryClient();
  
  // Build query string from options
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    
    if (options.keywordId !== undefined) {
      params.append('keywordId', options.keywordId.toString());
    }
    
    if (options.read !== undefined) {
      params.append('read', options.read.toString());
    }
    
    if (options.dateFrom) {
      params.append('dateFrom', options.dateFrom.toISOString());
    }
    
    if (options.dateTo) {
      params.append('dateTo', options.dateTo.toISOString());
    }
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };
  
  const queryString = buildQueryString();
  const queryKey = [`/api/keyword-alerts${queryString}`];
  
  // Fetch keyword alerts with specified filters
  const { data, isLoading, error, refetch } = useQuery<KeywordAlertWithDetails[]>({
    queryKey,
    queryFn: async () => {
      // First get all the alerts
      const response = await apiRequest('GET', `/api/keyword-alerts${queryString}`);
      const alerts: KeywordAlert[] = await response.json();
      
      // For each alert, get the details
      const detailedAlerts = await Promise.all(
        alerts.map(async (alert) => {
          try {
            // Get the detailed alert that includes related keyword and post
            const detailsResponse = await apiRequest('GET', `/api/keyword-alerts/${alert.id}/details`);
            const detailedAlert = await detailsResponse.json();
            return {
              ...detailedAlert,
              createdAt: new Date(alert.detected) // Use detected as createdAt
            };
          } catch (error) {
            console.error(`Failed to get details for alert ${alert.id}:`, error);
            // Return a basic version if detailed fetch fails
            return {
              ...alert,
              createdAt: new Date(alert.detected)
            } as KeywordAlertWithDetails;
          }
        })
      );
      
      return detailedAlerts;
    },
  });
  
  // Mark an alert as read
  const markAsRead = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest(
        'POST', 
        `/api/keyword-alerts/${alertId}/mark-as-read`
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate alerts query to refetch with updated data
      queryClient.invalidateQueries({ queryKey: ['/api/keyword-alerts'] });
    },
  });
  
  // Get detailed view of a specific alert including related keyword and post
  const getAlertDetails = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest(
        'GET', 
        `/api/keyword-alerts/${alertId}/details`
      );
      return response.json();
    },
  });
  
  return {
    data,
    isLoading,
    error,
    markAsRead,
    getAlertDetails,
    refreshAlerts: refetch
  };
}