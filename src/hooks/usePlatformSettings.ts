import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api-client';
import { PlatformSettings } from '@/src/types';

// Get platform settings
export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platformSettings'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: PlatformSettings }>(
        '/settings'
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
