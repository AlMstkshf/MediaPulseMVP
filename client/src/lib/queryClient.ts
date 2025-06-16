/**
 * Query Client Configuration
 * 
 * This module sets up the TanStack Query client with configurations for both
 * development and Replit environments.
 */

import { QueryClient } from '@tanstack/react-query';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from '../utils/replit-config';

// Create a new QueryClient with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Default fetcher function for queries
export const defaultQueryFn = async ({ queryKey }: { queryKey: string[] }) => {
  // Convert query key to URL
  const url = Array.isArray(queryKey) ? queryKey.join('/') : queryKey;
  const baseUrl = getApiBaseUrl();
  
  try {
    const { data } = await axios.get(`${baseUrl}${url}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error fetching data from ${url}:`, axiosError);
    throw axiosError;
  }
};

// Helper function to get the query function
export const getQueryFn = () => {
  return async ({ queryKey }: any) => {
    // Extract URL and params from queryKey
    if (!queryKey || !queryKey.length) {
      throw new Error('Invalid query key');
    }

    const url = queryKey[0];
    const params = queryKey.length > 1 ? queryKey[1] : undefined;
    const baseUrl = getApiBaseUrl();
    
    try {
      const { data } = await axios.get(`${baseUrl}${url}`, { 
        params,
        withCredentials: true 
      });
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching data from ${url}:`, axiosError);
      throw axiosError;
    }
  };
};

// Set default query function
queryClient.setDefaultOptions({
  queries: {
    queryFn: defaultQueryFn,
  },
});

// HTTP methods for API requests
type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Make an API request with the specified method
 */
export const apiRequest = async <T = any>(
  method: HttpMethod,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${url}`;
  
  try {
    const response = await axios({
      method,
      url: fullUrl,
      data,
      withCredentials: true,
      ...config,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error making ${method} request to ${url}:`, axiosError);
    throw axiosError;
  }
};