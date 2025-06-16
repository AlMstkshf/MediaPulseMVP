import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Media item types
export interface MediaItem {
  id: number;
  title: string;
  description: string | null;
  mediaType: string; // 'image', 'video', 'audio', 'document'
  contentUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[] | null;
  category: string | null;
  source: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  createdBy: number;
}

export interface CreateMediaItemData {
  title: string;
  description?: string;
  mediaType: string;
  contentUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  category?: string;
  source?: string;
}

export interface UpdateMediaItemData extends Partial<CreateMediaItemData> {
  id: number;
}

export interface MediaQueryParams {
  category?: string;
  mediaType?: string;
  tags?: string[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  page?: number;
}

// Hook to fetch all media items with optional filtering
export function useMediaItems(params: MediaQueryParams = {}) {
  // Convert params object to URL search params
  const queryParams = new URLSearchParams();
  
  if (params.category) queryParams.append('category', params.category);
  if (params.mediaType) queryParams.append('mediaType', params.mediaType);
  if (params.tags?.length) queryParams.append('tags', params.tags.join(','));
  if (params.search) queryParams.append('search', params.search);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom.toISOString());
  if (params.dateTo) queryParams.append('dateTo', params.dateTo.toISOString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.page) queryParams.append('page', params.page.toString());
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/media?${queryString}` : '/api/media';
  
  return useQuery({
    queryKey: ['/api/media', params],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', endpoint);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error fetching media items: ${response.status}`
          );
        }
        
        return await response.json() as MediaItem[];
      } catch (error) {
        console.error('Error fetching media items:', error);
        throw error;
      }
    },
  });
}

// Hook to fetch a single media item by ID
export function useMediaItem(id?: number) {
  return useQuery({
    queryKey: id ? ['/api/media', id] : null,
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const response = await apiRequest('GET', `/api/media/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error fetching media item: ${response.status}`
          );
        }
        
        return await response.json() as MediaItem;
      } catch (error) {
        console.error('Error fetching media item:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
}

// Hook to create a media item
export function useCreateMediaItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateMediaItemData) => {
      try {
        const response = await apiRequest('POST', '/api/media', data);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error creating media item: ${response.status}`
          );
        }
        
        return await response.json() as MediaItem;
      } catch (error) {
        console.error('Error creating media item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      
      toast({
        title: 'Success',
        description: 'Media item created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create media item',
        variant: 'destructive',
      });
    },
  });
}

// Hook to update a media item
export function useUpdateMediaItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: UpdateMediaItemData) => {
      try {
        const { id, ...updateData } = data;
        const response = await apiRequest('PUT', `/api/media/${id}`, updateData);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error updating media item: ${response.status}`
          );
        }
        
        return await response.json() as MediaItem;
      } catch (error) {
        console.error('Error updating media item:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate both the specific item and the list
      queryClient.invalidateQueries({ queryKey: ['/api/media', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      
      toast({
        title: 'Success',
        description: 'Media item updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update media item',
        variant: 'destructive',
      });
    },
  });
}

// Hook to delete a media item
export function useDeleteMediaItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await apiRequest('DELETE', `/api/media/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error deleting media item: ${response.status}`
          );
        }
        
        return id;
      } catch (error) {
        console.error('Error deleting media item:', error);
        throw error;
      }
    },
    onSuccess: (id) => {
      // Invalidate the list and remove the item from cache
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      queryClient.removeQueries({ queryKey: ['/api/media', id] });
      
      toast({
        title: 'Success',
        description: 'Media item deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete media item',
        variant: 'destructive',
      });
    },
  });
}

// Hook to upload a media file
export function useUploadMedia() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File, metadata: Partial<CreateMediaItemData> }) => {
      try {
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);
        
        // Append metadata as JSON
        formData.append('metadata', JSON.stringify(metadata));
        
        // Make the upload request
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error uploading media: ${response.status}`
          );
        }
        
        return await response.json() as MediaItem;
      } catch (error) {
        console.error('Error uploading media:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      
      toast({
        title: 'Upload Successful',
        description: 'Media file uploaded successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload media file',
        variant: 'destructive',
      });
    },
  });
}