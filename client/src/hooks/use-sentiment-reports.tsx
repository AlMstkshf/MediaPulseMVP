import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SentimentReport } from "@shared/schema";

interface SentimentReportOptions {
  platform?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export function useSentimentReports(options: SentimentReportOptions = {}) {
  const queryClient = useQueryClient();
  
  // Build query string from options
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (options.platform) {
      params.append('platform', options.platform);
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
  const queryKey = [`/api/sentiment-reports${queryString}`];
  
  // Fetch sentiment reports with specified filters
  const { data, isLoading, error, refetch } = useQuery<SentimentReport[]>({
    queryKey,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/sentiment-reports${queryString}`);
      return response.json();
    },
  });
  
  // Create new sentiment report
  const createReport = useMutation({
    mutationFn: async (report: any) => {
      const response = await apiRequest('POST', '/api/sentiment-reports', report);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the reports query to refetch with updated data
      queryClient.invalidateQueries({ queryKey: ['/api/sentiment-reports'] });
    },
  });
  
  // Generate a summary report
  const generateSummaryReport = useMutation({
    mutationFn: async (params: {
      dateFrom: Date;
      dateTo: Date;
      platform?: string;
      format?: string;
    }) => {
      const queryParams = new URLSearchParams();
      queryParams.append('dateFrom', params.dateFrom.toISOString());
      queryParams.append('dateTo', params.dateTo.toISOString());
      
      if (params.platform) {
        queryParams.append('platform', params.platform);
      }
      
      if (params.format) {
        queryParams.append('format', params.format);
      }
      
      const response = await apiRequest(
        'GET', 
        `/api/sentiment-reports/summary?${queryParams.toString()}`
      );
      return response.json();
    },
  });
  
  return {
    data,
    isLoading,
    error,
    createReport,
    generateSummaryReport,
    refreshReports: refetch
  };
}