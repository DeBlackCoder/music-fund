import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api-client';

interface InitializeVoteData {
  campaignId: string;
  voteCount: number;
  voterEmail: string;
}

interface InitializeVoteResponse {
  transactionRef: string;
  voteCount: number;
  votePrice: number;
  totalAmount: number;
  authorizationUrl: string;
  accessCode: string;
}

interface VerifyVoteData {
  reference: string;
}

// Initialize vote payment
export function useInitializeVote() {
  return useMutation({
    mutationFn: async (voteData: InitializeVoteData) => {
      const { data } = await apiClient.post<{
        success: boolean;
        data: InitializeVoteResponse;
      }>('/vote/initialize', voteData);
      return data.data;
    },
  });
}

// Verify vote payment
export function useVerifyVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (verifyData: VerifyVoteData) => {
      const { data } = await apiClient.post('/vote/verify', verifyData);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate campaigns to refresh vote counts
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
    },
  });
}
