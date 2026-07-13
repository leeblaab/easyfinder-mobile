import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { Vendor } from '../types';

export function useVendorsByLocation(city: string) {
  return useQuery<Vendor[]>({
    queryKey: ['vendorsByLocation', city],
    queryFn: async () => {
      if (!city) return [];
      
      try {
        // First get all published vendors
        const response = await apiClient.get<{ data: Vendor[] }>(
          `/items/vendors?filter[status][_eq]=published&fields=id,name,slug,logo,category.name,service_areas,verified,phone,whatsapp_link,website,description`
        );
        
        // Then filter client-side since service_areas is a JSON field and Directus doesn't support _contains for JSON
        const vendors = response.data.data;
        return vendors.filter(vendor => {
          if (Array.isArray(vendor.service_areas)) {
            return vendor.service_areas.some(area => 
              area.toLowerCase().includes(city.toLowerCase())
            );
          } else if (typeof vendor.service_areas === 'string') {
            // If service_areas is a comma-separated string
            return vendor.service_areas.toLowerCase().includes(city.toLowerCase());
          }
          return false;
        });
      } catch (error) {
        console.error('Error fetching vendors by location:', error);
        return [];
      }
    },
    enabled: !!city,
  });
}