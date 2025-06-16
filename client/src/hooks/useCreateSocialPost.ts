import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { CreateSocialPostData, SocialPost } from '@/hooks/use-social';

interface UseCreateSocialPostOptions {
  onSuccess?: (post: SocialPost) => void;
  onError?: (error: Error) => void;
  notify?: boolean;
}

export function useCreateSocialPost(options: UseCreateSocialPostOptions = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createMutation = useMutation({
    mutationFn: async (data: CreateSocialPostData) => {
      try {
        setIsSubmitting(true);
        const response = await apiRequest('POST', '/api/social-posts', data);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to create post: ${response.status}`
          );
        }
        
        return await response.json() as SocialPost;
      } catch (error) {
        console.error('Error creating social post:', error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh post lists
      queryClient.invalidateQueries({ queryKey: ['/api/social-posts'] });
      
      // Invalidate platform activity data and metrics
      queryClient.invalidateQueries({ queryKey: ['/api/social/platform-activity'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/metrics'] });
      
      // If the entity ID is available, also invalidate entity-specific data
      if (data.entityId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/gov-entities', data.entityId, 'posts'] 
        });
      }
      
      // Only show toast if notification is not disabled
      if (options.notify !== false) {
        toast({
          title: 'Post Created',
          description: 'Social post has been created successfully',
        });
      }
      
      // Invalidate social counts query to trigger polling updates
      queryClient.invalidateQueries({ 
        queryKey: ['/api/social-posts/count-by-platform'] 
      });
      
      // Call custom success handler if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      // Only show toast if notification is not disabled
      if (options.notify !== false) {
        toast({
          title: 'Error Creating Post',
          description: error.message || 'Failed to create social post',
          variant: 'destructive',
        });
      }
      
      // Call custom error handler if provided
      if (options.onError) {
        options.onError(error);
      }
    },
  });
  
  const createPost = async (data: CreateSocialPostData) => {
    return createMutation.mutateAsync(data);
  };
  
  return {
    createPost,
    isLoading: isSubmitting || createMutation.isPending,
    isError: createMutation.isError,
    error: createMutation.error,
  };
}