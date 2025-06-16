import { useQuery, useMutation } from "@tanstack/react-query";
import { GovEntity, InsertGovEntity, SocialPost } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useGovEntities(filters?: {
  entityType?: string;
  region?: string;
  isActive?: boolean;
}) {
  // Build the query string based on provided filters
  let queryParams = new URLSearchParams();
  if (filters) {
    if (filters.entityType) queryParams.append("entityType", filters.entityType);
    if (filters.region) queryParams.append("region", filters.region);
    if (filters.isActive !== undefined) queryParams.append("isActive", String(filters.isActive));
  }
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const endpoint = `/api/gov-entities${queryString}`;
  const queryKey = ["/api/gov-entities", queryString];
  
  return useQuery<GovEntity[], Error>({
    queryKey,
    queryFn: () => fetch(endpoint).then(res => {
      if (!res.ok) throw new Error('Failed to fetch entities');
      return res.json();
    }),
  });
}

export function useGovEntity(id: number) {
  const endpoint = `/api/gov-entities/${id}`;
  
  return useQuery<GovEntity, Error>({
    queryKey: ["/api/gov-entities", id],
    queryFn: () => fetch(endpoint).then(res => {
      if (!res.ok) throw new Error('Failed to fetch entity');
      return res.json();
    }),
    enabled: !!id, // Only run the query if an ID is provided
  });
}

// Comment explaining the fix
// We need to properly normalize sentiment values from -1,1 scale to 0-100 scale for the UI

export function useGovEntityPosts(entityId: number) {
  const endpoint = `/api/gov-entities/${entityId}/posts`;
  
  return useQuery<SocialPost[], Error>({
    queryKey: ["/api/gov-entities", entityId, "posts"],
    queryFn: async () => {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to fetch posts for entity ${entityId}`);
      
      const posts = await res.json();
      
      // Ensure posts is an array
      if (!Array.isArray(posts)) {
        console.error("API response is not an array:", posts);
        return [];
      }
      
      // Normalize sentiment values from -1/1 scale to 0-100 scale if needed
      return posts.map(post => {
        // Check if sentiment is in -1 to 1 range
        if (post.sentiment !== null && post.sentiment !== undefined && 
            post.sentiment >= -1 && post.sentiment <= 1) {
          // Convert from [-1, 1] to [0, 100]
          const normalizedSentiment = Math.round(((post.sentiment + 1) / 2) * 100);
          return { ...post, sentiment: normalizedSentiment };
        }
        return post;
      });
    },
    enabled: !!entityId,
  });
}

export function useCreateGovEntity() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (entity: InsertGovEntity) => {
      const res = await apiRequest("POST", "/api/gov-entities", entity);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create government entity");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the entities list query
      queryClient.invalidateQueries({ queryKey: ["/api/gov-entities"] });
      toast({
        title: "Entity Created",
        description: "Government entity was successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Entity",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateGovEntity() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertGovEntity> }) => {
      const res = await apiRequest("PATCH", `/api/gov-entities/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update government entity");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific entity queries
      queryClient.invalidateQueries({ queryKey: ["/api/gov-entities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gov-entities", variables.id] });
      toast({
        title: "Entity Updated",
        description: "Government entity was successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Entity",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteGovEntity() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/gov-entities/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete government entity");
      }
      return true;
    },
    onSuccess: () => {
      // Invalidate the entities list query
      queryClient.invalidateQueries({ queryKey: ["/api/gov-entities"] });
      toast({
        title: "Entity Deleted",
        description: "Government entity was successfully deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Entity",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLinkEntityToPost() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      postId, 
      entityId, 
      mentionType, 
      sentimentScore 
    }: { 
      postId: number; 
      entityId: number; 
      mentionType?: string; 
      sentimentScore?: number;
    }) => {
      const res = await apiRequest(
        "POST", 
        `/api/social-posts/${postId}/entities/${entityId}`, 
        { mentionType, sentimentScore }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to link entity to post");
      }
      return true;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/social-posts", variables.postId, "entities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gov-entities", variables.entityId, "posts"] });
      toast({
        title: "Entity Linked",
        description: "Government entity was successfully linked to the post",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Link Entity",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}