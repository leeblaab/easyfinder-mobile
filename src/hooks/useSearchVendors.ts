import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { Vendor } from '../types';

export function useSearchVendors(query: string) {
  return useQuery<Vendor[]>({
    queryKey: ['searchVendors', query],
    queryFn: async () => {
      if (query.trim().length < 2) return [];
      const response = await apiClient.get<{ data: Vendor[] }>(
        `/items/vendors?filter[name][_icontains]=${encodeURIComponent(
          query.trim()
        )}&fields=id,name,slug,logo,category.name,service_areas,verified&limit=20`
      );
      return response.data.data;
    },
    enabled: query.trim().length >= 2,
  });
}
