import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api-client';
import { toast } from 'sonner';

interface PlatformSettings {
  uploadFee: number;
  votePrice: number;
  platformCommission: number;
  minGoalAmount: number;
  maxGoalAmount: number;
  defaultCampaignDuration: number;
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<PlatformSettings>) => {
      const { data } = await apiClient.put('/settings', settings);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      toast.success('Platform settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update settings');
    },
  });
}
