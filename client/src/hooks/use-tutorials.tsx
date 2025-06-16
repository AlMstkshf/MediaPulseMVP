import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Tutorial, InsertTutorial } from "@shared/schema";
import { useTranslation } from "react-i18next";

export const useTutorials = (filters?: {
  level?: string;
  language?: string;
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = filters?.language || i18n.language;
  
  const queryKey = ["/api/tutorials"];
  const queryParams = new URLSearchParams();
  
  // Add language to query key and params
  queryParams.append("language", currentLanguage);
  queryKey.push(`language=${currentLanguage}`);
  
  // Add additional filters if they exist
  if (filters) {
    if (filters.level) {
      queryParams.append("level", filters.level);
      queryKey.push(`level=${filters.level}`);
    }
  }
  
  // Create the full URL with query parameters
  const url = `/api/tutorials?${queryParams.toString()}`;
  
  return useQuery<Tutorial[]>({ 
    queryKey,
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch tutorials');
      }
      return response.json();
    }
  });
};

export const useTutorial = (id: number) => {
  return useQuery<Tutorial>({ 
    queryKey: [`/api/tutorials/${id}`],
  });
};

export const useCreateTutorial = () => {
  return useMutation({
    mutationFn: async (tutorial: InsertTutorial) => {
      const response = await apiRequest("POST", "/api/tutorials", tutorial);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutorials"] });
    },
  });
};
