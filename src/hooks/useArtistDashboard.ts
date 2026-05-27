import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api-client';

interface ArtistDashboardData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    goalReachedCampaigns: number;
    pendingCampaigns: number;
    totalRaised: number;
    totalVotes: number;
    totalWithdrawn: number;
    pendingWithdrawals: number;
    followerCount: number;
    availableForWithdrawal: number;
  };
  recentCampaigns: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    goalAmount: number;
    raisedAmount: number;
    voteCount: number;
    createdAt: string;
  }>;
  recentVotes: Array<{
    id: string;
    voter: {
      name: string;
      avatar: string;
    };
    campaign: {
      title: string;
      slug: string;
    };
    voteCount: number;
    amount: number;
    createdAt: string;
  }>;
  charts: {
    monthlyEarnings: Array<{
      _id: { year: number; month: number };
      earnings: number;
      votes: number;
    }>;
  };
}

export function useArtistDashboard() {
  return useQuery({
    queryKey: ['artistDashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ArtistDashboardData }>(
        '/artist/dashboard'
      );
      return data.data;
    },
  });
}
