import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Type definitions for government entities
export interface GovEntity {
  id: number;
  name: string;
  code: string;
  type: string;
  description: string | null;
  parentId: number | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGovEntityData {
  name: string;
  code: string;
  type: string;
  description?: string;
  parentId?: number;
  status: 'active' | 'inactive';
}

export interface UpdateGovEntityData extends Partial<CreateGovEntityData> {
  id: number;
}

// Hook to fetch a single government entity by ID
export function useGovEntity(id?: number) {
  return useQuery({
    queryKey: id ? ['/api/gov-entities', id] : null, // Only fetch if ID is provided
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const response = await apiRequest('GET', `/api/gov-entities/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error fetching entity: ${response.status}`
          );
        }
        
        return await response.json() as GovEntity;
      } catch (error) {
        console.error('Error fetching government entity:', error);
        throw error;
      }
    },
    enabled: !!id, // Only run the query if an ID is provided
  });
}

// Hook to fetch all government entities
export function useGovEntities() {
  return useQuery({
    queryKey: ['/api/gov-entities'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/gov-entities');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error fetching entities: ${response.status}`
          );
        }
        
        return await response.json() as GovEntity[];
      } catch (error) {
        console.error('Error fetching government entities:', error);
        throw error;
      }
    },
  });
}

// Hook to create a new government entity
export function useCreateGovEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateGovEntityData) => {
      try {
        const response = await apiRequest('POST', '/api/gov-entities', data);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error creating entity: ${response.status}`
          );
        }
        
        return await response.json() as GovEntity;
      } catch (error) {
        console.error('Error creating government entity:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the gov entities list
      queryClient.invalidateQueries({ queryKey: ['/api/gov-entities'] });
      
      toast({
        title: 'Success',
        description: 'Entity created successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating entity',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });
}

// Hook to update an existing government entity
export function useUpdateGovEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateGovEntityData) => {
      try {
        const { id, ...updateData } = data;
        const response = await apiRequest('PUT', `/api/gov-entities/${id}`, updateData);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error updating entity: ${response.status}`
          );
        }
        
        return await response.json() as GovEntity;
      } catch (error) {
        console.error('Error updating government entity:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch both the entity detail and the entities list
      queryClient.invalidateQueries({ queryKey: ['/api/gov-entities', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/gov-entities'] });
      
      toast({
        title: 'Success',
        description: 'Entity updated successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating entity',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });
}

// Hook to delete a government entity
export function useDeleteGovEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await apiRequest('DELETE', `/api/gov-entities/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error deleting entity: ${response.status}`
          );
        }
        
        return id; // Return the deleted entity ID
      } catch (error) {
        console.error('Error deleting government entity:', error);
        throw error;
      }
    },
    onSuccess: (id) => {
      // Invalidate and refetch the entities list
      queryClient.invalidateQueries({ queryKey: ['/api/gov-entities'] });
      
      // Remove the entity from the cache
      queryClient.removeQueries({ queryKey: ['/api/gov-entities', id] });
      
      toast({
        title: 'Success',
        description: 'Entity deleted successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting entity',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });
}

// Define social post interface
export interface SocialPost {
  id: number;
  content: string;
  platform: string;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  postUrl: string | null;
  sentiment: number | null;
  engagement: any; // Could be further typed if needed
  createdAt: Date | null;
  postedAt: Date | null;
  keywords: string[] | null;
}

// Hook to fetch social posts related to a government entity
export function useGovEntityPosts(entityId?: number) {
  return useQuery({
    queryKey: entityId ? ['/api/gov-entities', entityId, 'posts'] : null,
    queryFn: async () => {
      if (!entityId) return [];
      
      try {
        const response = await apiRequest('GET', `/api/gov-entities/${entityId}/posts`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error fetching entity posts: ${response.status}`
          );
        }
        
        return await response.json() as SocialPost[];
      } catch (error) {
        console.error('Error fetching entity posts:', error);
        throw error;
      }
    },
    enabled: !!entityId, // Only run the query if an entity ID is provided
  });
}