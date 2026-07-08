import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { useAuthStore } from '../stores/useAuthStore';
import { Vendor } from '../types';

export function useMySubmissions() {
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id;

  return useQuery<Vendor[]>({
    queryKey: ['my-submissions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiClient.get<{ data: Vendor[] }>(
        `/items/vendors?filter[user_created][_eq]=${userId}&fields=*,category.name`
      );
      return response.data.data;
    },
    enabled: isAuthenticated && !!userId,
  });
}
