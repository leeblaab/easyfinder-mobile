import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { Vendor } from '../types';

interface Filters {
  city?: string;
  verifiedOnly?: boolean;
}

interface PaginatedVendors {
  vendors: Vendor[];
  hasMore: boolean;
  nextOffset: number;
}

const LIMIT = 10;

export function useVendorsByCategory(slug: string, filters: Filters = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery<PaginatedVendors>({
    queryKey: ['vendorsByCategory', slug, filters],
    queryFn: async ({ pageParam }): Promise<PaginatedVendors> => {
      const offset = (pageParam as number) ?? 0;
      
      if (!slug) return { vendors: [], hasMore: false, nextOffset: 0 };

      // Step 1: Get category ID
      const categoryResponse = await apiClient.get<{ data: any[] }>(
        `/items/categories?filter[slug][_eq]=${encodeURIComponent(slug)}&fields=id`
      );

      if (!categoryResponse.data.data || categoryResponse.data.data.length === 0) {
        return { vendors: [], hasMore: false, nextOffset: 0 };
      }

      const categoryId = categoryResponse.data.data[0].id;

      // Step 2: Build query parameters (NO city filter on server - we'll filter client-side)
      const params = new URLSearchParams();
      params.append('filter[status][_eq]', 'published');
      params.append('filter[category][_eq]', categoryId.toString());
      params.append('limit', LIMIT.toString());
      params.append('offset', offset.toString());
      params.append('fields', 'id,name,slug,logo,category,service_areas,verified,phone,whatsapp_link,website,description');

      // Add verified filter on server (this works fine)
      if (filters.verifiedOnly) {
        params.append('filter[verified][_eq]', 'true');
      }

      // Step 3: Fetch vendors
      const vendorsResponse = await apiClient.get<{ data: Vendor[] }>(
        `/items/vendors?${params.toString()}`
      );

      let vendors = vendorsResponse.data.data;

      // Step 4: Filter client-side by city (since service_areas is JSON)
      if (filters.city) {
        const cityName = filters.city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        vendors = vendors.filter(vendor => {
          if (!vendor.service_areas) return false;
          
          // Handle both array and string formats
          const areas = Array.isArray(vendor.service_areas) 
            ? vendor.service_areas 
            : typeof vendor.service_areas === 'string'
              ? vendor.service_areas.split(',').map(s => s.trim())
              : [];
          
          // Check if any service area contains the city name (case-insensitive)
          return areas.some((area: string) => 
            area.toLowerCase().includes(cityName.toLowerCase())
          );
        });
      }

      const hasMore = vendorsResponse.data.data.length === LIMIT;
      const nextOffset = offset + LIMIT;

      return { vendors, hasMore, nextOffset };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    initialPageParam: 0,
    enabled: !!slug,
  });

  // Flatten all pages into a single array
  const vendors = data?.pages.flatMap((page) => page.vendors) ?? [];

  return {
    vendors,
    isLoading,
    isError,
    hasMore: hasNextPage ?? false,
    loadMore: fetchNextPage,
    isLoadingMore: isFetchingNextPage,
    refetch,
  };
}