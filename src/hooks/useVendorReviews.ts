import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';

export interface Review {
  id: number | string;
  rating: number;
  comment: string;
  date_created?: string;
  user_created?: {
    first_name?: string;
    avatar?: string;
  } | null;
}

export function useVendorReviews(vendorId: string | number) {
  const queryClient = useQueryClient();

  const query = useQuery<Review[]>({
    queryKey: ['reviews', vendorId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Review[] }>(
        `/items/reviews?filter[vendor][_eq]=${vendorId}&fields=*,user_created.first_name`
      );
      return response.data.data;
    },
    enabled: !!vendorId,
  });

  const submitMutation = useMutation({
    mutationFn: async (newReview: {
      rating: number;
      comment: string;
      vendor: string | number;
      status: 'pending';
    }) => {
      const response = await apiClient.post('/items/reviews', newReview);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch reviews for this vendor
      queryClient.invalidateQueries({ queryKey: ['reviews', vendorId] });
    },
  });

  return {
    ...query,
    submitReview: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
}
