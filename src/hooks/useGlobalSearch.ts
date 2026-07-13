import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { Category, Vendor } from '../types';

interface SearchResult {
  type: 'category' | 'vendor';
  data: Category | Vendor;
}

export function useGlobalSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ['globalSearch', query],
    queryFn: async () => {
      if (query.trim().length < 2) return [];
      
      try {
        // Parallel API calls for categories and vendors
        const [categoriesResponse, vendorsResponse] = await Promise.allSettled([
          apiClient.get<{ data: Category[] }>(
            `/items/categories?filter[name][_contains]=${encodeURIComponent(
              query.trim()
            )}&fields=id,name,slug,icon,description&limit=10`
          ),
          apiClient.get<{ data: Vendor[] }>(
            `/items/vendors?filter[name][_contains]=${encodeURIComponent(
              query.trim()
            )}&fields=id,name,slug,logo,category.name,service_areas,verified&limit=20`
          )
        ]);

        let categoryResults: SearchResult[] = [];
        let vendorResults: SearchResult[] = [];

        // Handle categories response
        if (categoriesResponse.status === 'fulfilled') {
          categoryResults = categoriesResponse.value.data.data.map(category => ({
            type: 'category',
            data: category
          }));
        }

        // Handle vendors response
        if (vendorsResponse.status === 'fulfilled') {
          vendorResults = vendorsResponse.value.data.data.map(vendor => ({
            type: 'vendor',
            data: vendor
          }));
          
          // Additional client-side filtering for service_areas since Directus doesn't support _icontains for JSON fields
          const additionalVendors = (await apiClient.get<{ data: Vendor[] }>(
            `/items/vendors?fields=id,name,slug,logo,category.name,service_areas,verified&limit=50`
          )).data.data;
          
          const queryLower = query.trim().toLowerCase();
          const additionalMatches = additionalVendors.filter(vendor => {
            // Check if vendor already included from initial search
            const alreadyIncluded = vendorResults.some(v => v.data.id === vendor.id);
            
            // Look for matches in service_areas that weren't caught by name search
            if (!alreadyIncluded) {
              if (Array.isArray(vendor.service_areas)) {
                return vendor.service_areas.some(area => 
                  area.toLowerCase().includes(queryLower)
                );
              } else if (typeof vendor.service_areas === 'string') {
                return vendor.service_areas.toLowerCase().includes(queryLower);
              }
            }
            return false;
          });
          
          // Add additional matches to results, keeping within limit
          const remainingSlots = 20 - vendorResults.length;
          const limitedAdditional = additionalMatches.slice(0, remainingSlots);
          
          vendorResults = [
            ...vendorResults,
            ...limitedAdditional.map((vendor): SearchResult => ({
              type: 'vendor',
              data: vendor
            }))
          ];
        }

        // Combine results
        return [...categoryResults, ...vendorResults];
      } catch (error) {
        console.error('Search error:', error);
        return [];
      }
    },
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}