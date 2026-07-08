import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { Vendor } from '../types';

export function useVendorsByCategory(slug: string) {
  return useQuery<Vendor[]>({
    queryKey: ['vendorsByCategory', slug],
    queryFn: async () => {
      if (!slug) return [];
      const response = await apiClient.get<{ data: Vendor[] }>(
        `/items/vendors?filter[category.slug][_eq]=${slug}&fields=id,name,slug,logo,category.name,service_areas,verified`
      );
      return response.data.data;
    },
    enabled: !!slug,
  });
}
