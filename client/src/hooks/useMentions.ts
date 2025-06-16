import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { api } from './useApi';
import { API_ENDPOINTS } from '@/config/api';

/**
 * Interface for a Mention
 */
export interface Mention {
  id: number;
  source: string;
  content: string;
  authorName: string;
  authorUsername?: string;
  sourceUrl: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  entityName: string;
  entityType: string;
  createdAt: string;
  mentionedAt: string;
}

/**
 * Options for fetching mentions
 */
interface MentionsOptions {
  entity?: string;
  entityType?: string;
  source?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Custom hook for fetching mentions data
 * 
 * @param options Optional parameters for filtering mentions
 * @returns Query result with mentions data, loading and error states
 */
export function useMentions(options: MentionsOptions = {}): UseQueryResult<Mention[], Error> {
  const { toast } = useToast();
  
  return useQuery<Mention[], Error>({
    queryKey: [API_ENDPOINTS.MENTIONS, options],
    queryFn: async () => {
      try {
        const { data } = await api.get<Mention[]>(API_ENDPOINTS.MENTIONS, { 
          params: options 
        });
        
        return data;
      } catch (err: any) {
        console.error('Error fetching mentions:', err);
        
        let errorMessage = 'Failed to fetch mentions';
        
        if (err.response) {
          errorMessage = err.response.data?.message || errorMessage;
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        throw new Error(errorMessage);
      }
    },
  });
}