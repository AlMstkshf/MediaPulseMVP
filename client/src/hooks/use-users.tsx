import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { User, InsertUser } from "@shared/schema";

export const useUsers = () => {
  const queryKey = ["/api/users"];
  
  const { data, isLoading, error } = useQuery<Omit<User, 'password'>[]>({ 
    queryKey 
  });
  
  const createUser = useMutation({
    mutationFn: async (user: InsertUser) => {
      const response = await apiRequest("POST", "/api/users", user);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
  
  const deleteUser = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
  
  return {
    data,
    isLoading,
    error,
    createUser,
    deleteUser
  };
};

export const useUser = (id: number) => {
  return useQuery<Omit<User, 'password'>>({ 
    queryKey: [`/api/users/${id}`],
  });
};