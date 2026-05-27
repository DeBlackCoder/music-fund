import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api-client';
import { Campaign } from '@/src/types';

interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface CampaignFilters {
  status?: 'active' | 'goal_reached' | 'all';
  genre?: string;
  artistId?: string;
  limit?: number;
  page?: number;
  sort?: string;
}

// Get campaigns list
export function useCampaigns(filters: CampaignFilters = {}) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const { data } = await apiClient.get<{ success: boolean; data: CampaignsResponse }>(
        `/campaigns?${params.toString()}`
      );
      return data.data;
    },
  });
}

// Get single campaign
export function useCampaign(slug: string) {
  return useQuery({
    queryKey: ['campaign', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Campaign }>(
        `/campaigns/${slug}`
      );
      return data.data;
    },
    enabled: !!slug,
  });
}

// Like campaign
export function useLikeCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const { data } = await apiClient.post(`/campaigns/${slug}/like`);
      return data.data;
    },
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', slug] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// Unlike campaign
export function useUnlikeCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const { data } = await apiClient.delete(`/campaigns/${slug}/like`);
      return data.data;
    },
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', slug] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// Create campaign
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignData: any) => {
      const { data } = await apiClient.post('/campaigns/create', campaignData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
