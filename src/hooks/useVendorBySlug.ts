import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { Vendor } from '../types';

export function useVendorBySlug(slug: string) {
  return useQuery<Vendor | null>({
    queryKey: ['vendor', slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await apiClient.get<{ data: Vendor[] }>(
        `/items/vendors?filter[slug][_eq]=${slug}&fields=*,category.name`
      );
      return response.data.data[0] || null;
    },
    enabled: !!slug,
  });
}
