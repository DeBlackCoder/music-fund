import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api-client';

interface AdminAnalyticsData {
  overview: {
    totalUsers: number;
    totalArtists: number;
    totalFans: number;
    totalCampaigns: number;
    activeCampaigns: number;
    goalReachedCampaigns: number;
    pendingCampaigns: number;
    totalVotes: number;
  };
  financial: {
    totalRaised: number;
    platformEarnings: number;
    uploadFeesCollected: number;
    totalRevenue: number;
  };
  recentActivity: {
    newUsersLast30Days: number;
    newCampaignsLast30Days: number;
    votesLast30Days: number;
  };
  charts: {
    revenueByMonth: Array<{
      _id: { year: number; month: number };
      revenue: number;
    }>;
    genreDistribution: Array<{
      _id: string;
      count: number;
      totalRaised: number;
    }>;
  };
  topArtists: Array<{
    artistId: string;
    name: string;
    artistName: string;
    avatar: string;
    totalRaised: number;
    totalVotes: number;
    campaignCount: number;
  }>;
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: AdminAnalyticsData }>(
        '/admin/analytics'
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
