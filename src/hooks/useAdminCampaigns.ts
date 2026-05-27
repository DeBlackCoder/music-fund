import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api-client';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  slug: string;
  title: string;
  artist: {
    id: string;
    name: string;
    artistName: string;
    email: string;
    avatar: string;
    verified: boolean;
  };
  coverImage: string;
  audioFile: string;
  genre: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  voteCount: number;
  status: string;
  uploadFeePaid: boolean;
  uploadFeeAmount: number;
  deadline: string;
  daysLeft: number;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  };
  rejectedAt?: string;
  rejectionReason?: string;
  analytics: {
    views: number;
    shares: number;
    likes: number;
  };
}

interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: {
    total: number;
    pending: number;
    active: number;
    goalReached: number;
    rejected: number;
    ended: number;
  };
}

interface UseAdminCampaignsParams {
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export function useAdminCampaigns(params: UseAdminCampaignsParams = {}) {
  const { status = 'all', page = 1, limit = 50, sort = '-createdAt' } = params;

  return useQuery({
    queryKey: ['adminCampaigns', status, page, limit, sort],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        status,
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });

      const { data } = await apiClient.get<{ success: boolean; data: CampaignsResponse }>(
        `/admin/campaigns?${queryParams}`
      );
      return data.data;
    },
  });
}

export function useApproveCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { data } = await apiClient.post(`/admin/campaigns/${campaignId}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['adminAnalytics'] });
      toast.success('Campaign approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to approve campaign');
    },
  });
}

export function useRejectCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, reason }: { campaignId: string; reason: string }) => {
      const { data } = await apiClient.post(`/admin/campaigns/${campaignId}/reject`, {
        reason,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['adminAnalytics'] });
      toast.success('Campaign rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to reject campaign');
    },
  });
}
