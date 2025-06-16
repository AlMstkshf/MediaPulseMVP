import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { MediaItem, InsertMediaItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export const useMediaItems = (filters?: {
  mediaType?: string;
  category?: string;
  tags?: string[];
}) => {
  const { toast } = useToast();
  
  // Build query params and key - memoized to avoid rebuilding on each render
  const { queryKey, queryString } = useMemo(() => {
    const queryKey = ["/api/media"];
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.mediaType) {
        queryParams.append("mediaType", filters.mediaType);
        queryKey.push(`mediaType=${filters.mediaType}`);
      }
      
      if (filters.category) {
        queryParams.append("category", filters.category);
        queryKey.push(`category=${filters.category}`);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        queryParams.append("tags", filters.tags.join(","));
        queryKey.push(`tags=${filters.tags.join(",")}`);
      }
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return { queryKey, queryString };
  }, [filters?.mediaType, filters?.category, filters?.tags]);
  
  return useQuery<MediaItem[], Error>({ 
    queryKey,
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/media${queryString}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch media items: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('API response is not an array of media items');
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching media items:", error);
        toast({
          title: "Error loading media",
          description: error instanceof Error ? error.message : "Failed to load media items",
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

export const useMediaItem = (id: number) => {
  const { toast } = useToast();
  
  return useQuery<MediaItem, Error>({ 
    queryKey: [`/api/media/${id}`],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/media/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch media item: ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error(`Error fetching media item ${id}:`, error);
        toast({
          title: "Error loading media item",
          description: error instanceof Error ? error.message : "Failed to load media item",
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

export const useCreateMediaItem = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (item: InsertMediaItem) => {
      try {
        const response = await apiRequest("POST", "/api/media", item);
        
        if (!response.ok) {
          throw new Error(`Failed to create media item: ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Error creating media item:", error);
        toast({
          title: "Error creating media",
          description: error instanceof Error ? error.message : "Failed to create media item",
          variant: "destructive",
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Media created",
        description: "Media item has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Mutation error creating media item:", error);
    }
  });
};

export const useUpdateMediaItem = (id: number) => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (item: Partial<InsertMediaItem>) => {
      try {
        const response = await apiRequest("PUT", `/api/media/${id}`, item);
        
        if (!response.ok) {
          throw new Error(`Failed to update media item: ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error(`Error updating media item ${id}:`, error);
        toast({
          title: "Error updating media",
          description: error instanceof Error ? error.message : "Failed to update media item",
          variant: "destructive",
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/media/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Media updated",
        description: "Media item has been updated successfully",
      });
    },
    onError: (error) => {
      console.error(`Mutation error updating media item ${id}:`, error);
    }
  });
};

export const useDeleteMediaItem = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await apiRequest("DELETE", `/api/media/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to delete media item: ${response.statusText}`);
        }
        
        return id;
      } catch (error) {
        console.error(`Error deleting media item ${id}:`, error);
        toast({
          title: "Error deleting media",
          description: error instanceof Error ? error.message : "Failed to delete media item",
          variant: "destructive",
        });
        throw error;
      }
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      queryClient.invalidateQueries({ queryKey: [`/api/media/${id}`] });
      toast({
        title: "Media deleted",
        description: "Media item has been deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Mutation error deleting media item:", error);
    }
  });
};
