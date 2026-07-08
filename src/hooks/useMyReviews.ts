import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { useAuthStore } from '../stores/useAuthStore';

export interface MyReview {
  id: string | number;
  rating: number;
  comment: string;
  date_created: string;
  status: string;
  vendor?: {
    id: string | number;
    name: string;
  } | null;
}

export function useMyReviews() {
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id;

  return useQuery<MyReview[]>({
    queryKey: ['my-reviews', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiClient.get<{ data: MyReview[] }>(
        `/items/reviews?filter[user_created][_eq]=${userId}&fields=*,vendor.id,vendor.name`
      );
      return response.data.data;
    },
    enabled: isAuthenticated && !!userId,
  });
}
