import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api-client';
import { toast } from 'sonner';

interface Withdrawal {
  id: string;
  artist: {
    id: string;
    name: string;
    artistName: string;
    email: string;
    phone: string;
    avatar: string;
  };
  campaign: {
    id: string;
    title: string;
    slug: string;
  };
  amount: number;
  platformCommission: number;
  netAmount: number;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
  };
  status: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: {
    id: string;
    name: string;
    email: string;
  };
  rejectionReason?: string;
  transactionRef?: string;
}

interface WithdrawalsResponse {
  withdrawals: Withdrawal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: {
    total: number;
    pending: number;
    approved: number;
    processed: number;
    rejected: number;
  };
}

interface UseAdminWithdrawalsParams {
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export function useAdminWithdrawals(params: UseAdminWithdrawalsParams = {}) {
  const { status = 'all', page = 1, limit = 50, sort = '-requestedAt' } = params;

  return useQuery({
    queryKey: ['adminWithdrawals', status, page, limit, sort],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        status,
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });

      const { data } = await apiClient.get<{ success: boolean; data: WithdrawalsResponse }>(
        `/admin/withdrawals?${queryParams}`
      );
      return data.data;
    },
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (withdrawalId: string) => {
      const { data } = await apiClient.post(`/admin/withdrawals/${withdrawalId}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['adminAnalytics'] });
      toast.success('Withdrawal approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to approve withdrawal');
    },
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ withdrawalId, reason }: { withdrawalId: string; reason: string }) => {
      const { data } = await apiClient.post(`/admin/withdrawals/${withdrawalId}/reject`, {
        reason,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['adminAnalytics'] });
      toast.success('Withdrawal rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to reject withdrawal');
    },
  });
}
