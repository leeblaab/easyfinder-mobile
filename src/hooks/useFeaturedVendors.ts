import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { Vendor } from '../types';

export function useFeaturedVendors() {
  return useQuery<Vendor[]>({
    queryKey: ['featuredVendors'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Vendor[] }>(
        '/items/vendors?filter[verified][_eq]=true&limit=10&fields=id,name,slug,logo,category.name,service_areas,verified'
      );
      return response.data.data;
    },
  });
}
