import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Keyword, InsertKeyword } from "@shared/schema";

export const useKeywords = (onlyActive?: boolean) => {
  const queryKey = ["/api/keywords"];
  
  if (onlyActive !== undefined) {
    queryKey.push(`active=${onlyActive}`);
  }
  
  const { data, isLoading, error } = useQuery<Keyword[]>({ 
    queryKey 
  });
  
  const createKeyword = useMutation({
    mutationFn: async (keyword: InsertKeyword) => {
      const response = await apiRequest("POST", "/api/keywords", keyword);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keywords"] });
    },
  });
  
  const updateKeyword = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertKeyword> }) => {
      const response = await apiRequest("PUT", `/api/keywords/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keywords"] });
    },
  });
  
  const deleteKeyword = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/keywords/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keywords"] });
    },
  });
  
  return {
    data,
    isLoading,
    error,
    createKeyword,
    updateKeyword,
    deleteKeyword
  };
};
