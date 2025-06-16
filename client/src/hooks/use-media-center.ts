import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/useToast';

// Journalist Types
export interface Journalist {
  id: number;
  name: string;
  arabicName?: string;
  email: string;
  phone?: string;
  organization: string;
  avatarUrl?: string;
  bio?: string;
  arabicBio?: string;
  beat?: string;
  socialLinks?: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJournalistData {
  name: string;
  arabicName?: string;
  email: string;
  phone?: string;
  organization: string;
  avatarUrl?: string;
  bio?: string;
  arabicBio?: string;
  beat?: string;
  socialLinks?: Record<string, string>;
  isActive?: boolean;
}

export interface UpdateJournalistData extends Partial<CreateJournalistData> {
  id: number;
}

// Media Source Types
export interface MediaSource {
  id: number;
  name: string;
  arabicName?: string;
  country: string;
  type: string;
  website: string;
  logoUrl?: string;
  description?: string;
  arabicDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaSourceData {
  name: string;
  arabicName?: string;
  country: string;
  type: string;
  website: string;
  logoUrl?: string;
  description?: string;
  arabicDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: Record<string, string>;
  isActive?: boolean;
}

export interface UpdateMediaSourceData extends Partial<CreateMediaSourceData> {
  id: number;
}

// Press Release Types
export interface PressRelease {
  id: number;
  title: string;
  arabicTitle?: string;
  content: string;
  arabicContent?: string;
  summary?: string;
  arabicSummary?: string;
  status: string;
  publishDate?: Date;
  category?: string;
  featuredImage?: string;
  attachments?: any[];
  distributionList?: any[];
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePressReleaseData {
  title: string;
  arabicTitle?: string;
  content: string;
  arabicContent?: string;
  summary?: string;
  arabicSummary?: string;
  status?: string;
  publishDate?: Date;
  category?: string;
  featuredImage?: string;
  attachments?: any[];
  distributionList?: any[];
}

export interface UpdatePressReleaseData extends Partial<CreatePressReleaseData> {
  id: number;
}

// Query parameter interfaces
export interface JournalistQueryParams {
  organization?: string;
  beat?: string;
  isActive?: boolean;
  search?: string;
}

export interface MediaSourceQueryParams {
  country?: string;
  type?: string;
  isActive?: boolean;
  search?: string;
}

export interface PressReleaseQueryParams {
  status?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

// Journalists Hooks
export function useJournalists(params: JournalistQueryParams = {}) {
  // Convert params object to URL search params
  const queryParams = new URLSearchParams();
  
  if (params.organization) queryParams.append('organization', params.organization);
  if (params.beat) queryParams.append('beat', params.beat);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/journalists?${queryString}` : '/api/journalists';
  
  return useQuery({
    queryKey: ['/api/journalists', params],
    queryFn: async () => {
      const response = await apiRequest('GET', endpoint);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error fetching journalists: ${response.status}`);
      }
      return await response.json() as Journalist[];
    },
  });
}

export function useJournalist(id?: number) {
  return useQuery({
    queryKey: ['/api/journalists', id],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await apiRequest('GET', `/api/journalists/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error fetching journalist: ${response.status}`);
      }
      return await response.json() as Journalist;
    },
    enabled: !!id,
  });
}

export function useCreateJournalist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateJournalistData) => {
      const response = await apiRequest('POST', '/api/journalists', data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error creating journalist: ${response.status}`);
      }
      return await response.json() as Journalist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journalists'] });
      toast({
        title: 'Success',
        description: 'Journalist profile created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create journalist profile',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateJournalist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: UpdateJournalistData) => {
      const { id, ...updateData } = data;
      const response = await apiRequest('PUT', `/api/journalists/${id}`, updateData);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error updating journalist: ${response.status}`);
      }
      return await response.json() as Journalist;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/journalists', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/journalists'] });
      toast({
        title: 'Success',
        description: 'Journalist profile updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update journalist profile',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteJournalist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/journalists/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error deleting journalist: ${response.status}`);
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/journalists'] });
      queryClient.removeQueries({ queryKey: ['/api/journalists', id] });
      toast({
        title: 'Success',
        description: 'Journalist profile deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete journalist profile',
        variant: 'destructive',
      });
    },
  });
}

// Media Sources Hooks
export function useMediaSources(params: MediaSourceQueryParams = {}) {
  // Convert params object to URL search params
  const queryParams = new URLSearchParams();
  
  if (params.country) queryParams.append('country', params.country);
  if (params.type) queryParams.append('type', params.type);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/media-sources?${queryString}` : '/api/media-sources';
  
  return useQuery({
    queryKey: ['/api/media-sources', params],
    queryFn: async () => {
      const response = await apiRequest('GET', endpoint);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error fetching media sources: ${response.status}`);
      }
      return await response.json() as MediaSource[];
    },
  });
}

export function useMediaSource(id?: number) {
  return useQuery({
    queryKey: ['/api/media-sources', id],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await apiRequest('GET', `/api/media-sources/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error fetching media source: ${response.status}`);
      }
      return await response.json() as MediaSource;
    },
    enabled: !!id,
  });
}

export function useCreateMediaSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateMediaSourceData) => {
      const response = await apiRequest('POST', '/api/media-sources', data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error creating media source: ${response.status}`);
      }
      return await response.json() as MediaSource;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media-sources'] });
      toast({
        title: 'Success',
        description: 'Media source created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create media source',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateMediaSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: UpdateMediaSourceData) => {
      const { id, ...updateData } = data;
      const response = await apiRequest('PUT', `/api/media-sources/${id}`, updateData);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error updating media source: ${response.status}`);
      }
      return await response.json() as MediaSource;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/media-sources', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/media-sources'] });
      toast({
        title: 'Success',
        description: 'Media source updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update media source',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteMediaSource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/media-sources/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error deleting media source: ${response.status}`);
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/media-sources'] });
      queryClient.removeQueries({ queryKey: ['/api/media-sources', id] });
      toast({
        title: 'Success',
        description: 'Media source deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete media source',
        variant: 'destructive',
      });
    },
  });
}

// Press Releases Hooks
export function usePressReleases(params: PressReleaseQueryParams = {}) {
  // Convert params object to URL search params
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.category) queryParams.append('category', params.category);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom.toISOString());
  if (params.dateTo) queryParams.append('dateTo', params.dateTo.toISOString());
  if (params.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/press-releases?${queryString}` : '/api/press-releases';
  
  return useQuery({
    queryKey: ['/api/press-releases', params],
    queryFn: async () => {
      const response = await apiRequest('GET', endpoint);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error fetching press releases: ${response.status}`);
      }
      return await response.json() as PressRelease[];
    },
  });
}

export function usePressRelease(id?: number) {
  return useQuery({
    queryKey: ['/api/press-releases', id],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await apiRequest('GET', `/api/press-releases/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error fetching press release: ${response.status}`);
      }
      return await response.json() as PressRelease;
    },
    enabled: !!id,
  });
}

export function useCreatePressRelease() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreatePressReleaseData) => {
      const response = await apiRequest('POST', '/api/press-releases', data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error creating press release: ${response.status}`);
      }
      return await response.json() as PressRelease;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/press-releases'] });
      toast({
        title: 'Success',
        description: 'Press release created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create press release',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePressRelease() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: UpdatePressReleaseData) => {
      const { id, ...updateData } = data;
      const response = await apiRequest('PUT', `/api/press-releases/${id}`, updateData);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error updating press release: ${response.status}`);
      }
      return await response.json() as PressRelease;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/press-releases', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/press-releases'] });
      toast({
        title: 'Success',
        description: 'Press release updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update press release',
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePressRelease() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/press-releases/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error deleting press release: ${response.status}`);
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/press-releases'] });
      queryClient.removeQueries({ queryKey: ['/api/press-releases', id] });
      toast({
        title: 'Success',
        description: 'Press release deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete press release',
        variant: 'destructive',
      });
    },
  });
}

// Function to publish a press release
export function usePublishPressRelease() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/press-releases/${id}/publish`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error publishing press release: ${response.status}`);
      }
      return await response.json() as PressRelease;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/press-releases', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/press-releases'] });
      toast({
        title: 'Success',
        description: 'Press release published successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish press release',
        variant: 'destructive',
      });
    },
  });
}

// Function to schedule a press release
export function useSchedulePressRelease() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, publishDate }: { id: number, publishDate: Date }) => {
      const response = await apiRequest('POST', `/api/press-releases/${id}/schedule`, { publishDate });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error scheduling press release: ${response.status}`);
      }
      return await response.json() as PressRelease;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/press-releases', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/press-releases'] });
      toast({
        title: 'Success',
        description: 'Press release scheduled successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule press release',
        variant: 'destructive',
      });
    },
  });
}