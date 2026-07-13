import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';

interface LocationCount {
  slug: string;
  name: string;
  vendorCount: number;
}

export function useLocationVendorCounts() {
  return useQuery<LocationCount[]>({
    queryKey: ['locationVendorCounts'],
    queryFn: async () => {
      // Fetch all vendors with service_areas
      const response = await apiClient.get<{ data: any[] }>(
        '/items/vendors?fields=service_areas&limit=-1&filter[status][_eq]=published'
      );

      // Define UAE cities with multiple name variations for matching
      const cities = [
        { 
          slug: 'dubai', 
          name: 'Dubai',
          aliases: ['dubai', 'dxb', 'دبي']
        },
        { 
          slug: 'abu-dhabi', 
          name: 'Abu Dhabi',
          aliases: ['abu dhabi', 'abudhabi', 'abu-dhabi', 'ad', 'أبو ظبي']
        },
        { 
          slug: 'sharjah', 
          name: 'Sharjah',
          aliases: ['sharjah', 'shj', 'الشارقة']
        },
        { 
          slug: 'ajman', 
          name: 'Ajman',
          aliases: ['ajman', 'عجمان']
        },
        { 
          slug: 'ras-al-khaimah', 
          name: 'Ras Al Khaimah',
          aliases: ['ras al khaimah', 'ras alkhaimah', 'rak', 'رأس الخيمة']
        },
        { 
          slug: 'fujairah', 
          name: 'Fujairah',
          aliases: ['fujairah', 'fuj', 'الفجيرة']
        },
        { 
          slug: 'umm-al-quwain', 
          name: 'Umm Al Quwain',
          aliases: ['umm al quwain', 'umm alquwain', 'uaq', 'أم القيوين']
        },
        { 
          slug: 'al-ain', 
          name: 'Al Ain',
          aliases: ['al ain', 'alain', 'العين']
        },
      ];

      // Initialize counts
      const counts: Record<string, number> = {};
      cities.forEach((city) => {
        counts[city.slug] = 0;
      });

      // Helper function to normalize area names
      const normalizeArea = (area: string): string => {
        return area
          .toLowerCase()
          .trim()
          .replace(/[-_]/g, ' ')  // Replace hyphens/underscores with spaces
          .replace(/\s+/g, ' ');  // Normalize multiple spaces
      };

      // Helper function to parse service_areas (handles both arrays and strings)
      const parseServiceAreas = (serviceAreas: any): string[] => {
        if (!serviceAreas) return [];
        
        // If it's already an array
        if (Array.isArray(serviceAreas)) {
          return serviceAreas.flatMap((area: any) => {
            if (typeof area === 'string') {
              // Split by comma in case array items contain comma-separated values
              return area.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
            return [];
          });
        }
        
        // If it's a comma-separated string
        if (typeof serviceAreas === 'string') {
          return serviceAreas
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
        
        return [];
      };

      // Count vendors per city
      response.data.data.forEach((vendor) => {
        const areas = parseServiceAreas(vendor.service_areas);
        
        areas.forEach((area: string) => {
          const normalizedArea = normalizeArea(area);
          
          // Check against each city's aliases
          cities.forEach((city) => {
            const isMatch = city.aliases.some((alias) => {
              const normalizedAlias = normalizeArea(alias);
              return normalizedArea.includes(normalizedAlias) || 
                     normalizedAlias.includes(normalizedArea);
            });
            
            if (isMatch) {
              counts[city.slug]++;
            }
          });
        });
      });
    console.log('Sample vendor service_areas:', response.data.data.slice(0, 5).map(v => v.service_areas));
      // Return formatted data
      return cities.map((city) => ({
        ...city,
        vendorCount: counts[city.slug],
      }));
    },
  });
}