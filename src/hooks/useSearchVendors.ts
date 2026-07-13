import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { Vendor } from '../types';

export function useSearchVendors(query: string) {
  return useQuery<Vendor[]>({
    queryKey: ['searchVendors', query],
    queryFn: async () => {
      if (query.trim().length < 2) return [];
      
      try {
        // First get vendors that match by name
        const response = await apiClient.get<{ data: Vendor[] }>(
          `/items/vendors?filter[name][_contains]=${encodeURIComponent(
            query.trim()
          )}&fields=id,name,slug,logo,category.name,service_areas,verified&limit=20`
        );
        
        let vendors = response.data.data;
        
        // If we got fewer than 20 results, try to get more by searching in service areas
        if (vendors.length < 20) {
          const allVendorsResponse = await apiClient.get<{ data: Vendor[] }>(
            `/items/vendors?fields=id,name,slug,logo,category.name,service_areas,verified&limit=50`
          );
          
          const allVendors = allVendorsResponse.data.data;
          const queryLower = query.trim().toLowerCase();
          
          // Find vendors that match by service area but weren't already included
          const serviceAreaMatches = allVendors.filter(vendor => {
            // Skip if already in results
            if (vendors.some(v => v.id === vendor.id)) return false;
            
            // Check service areas for match
            if (Array.isArray(vendor.service_areas)) {
              return vendor.service_areas.some(area => 
                area.toLowerCase().includes(queryLower)
              );
            } else if (typeof vendor.service_areas === 'string') {
              return vendor.service_areas.toLowerCase().includes(queryLower);
            }
            return false;
          });
          
          // Add service area matches to results, up to the limit
          const remainingSlots = 20 - vendors.length;
          const additionalVendors = serviceAreaMatches.slice(0, remainingSlots);
          
          vendors = [...vendors, ...additionalVendors];
        }
        
        return vendors;
      } catch (error) {
        console.error('Error searching vendors:', error);
        return [];
      }
    },
    enabled: query.trim().length >= 2,
  });
}