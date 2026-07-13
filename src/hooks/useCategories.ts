import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { Category } from '../types';

interface CategoryWithCount extends Category {
  vendorCount: number;
}

export function useCategories() {
  return useQuery<CategoryWithCount[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      // Fetch categories
      const categoriesResponse = await apiClient.get<{ data: Category[] }>(
        '/items/categories?fields=id,name,slug,icon,description'
      );
      
      // Fetch all vendors with minimal fields (just category ID for counting)
      const vendorsResponse = await apiClient.get<{ data: any[] }>(
        '/items/vendors?fields=category&limit=-1&filter[status][_eq]=published'
      );
      
      // Count vendors per category
      const vendorCounts: Record<number, number> = {};
      vendorsResponse.data.data.forEach((vendor) => {
        const categoryId = typeof vendor.category === 'object' ? vendor.category?.id : vendor.category;
        if (categoryId) {
          vendorCounts[categoryId] = (vendorCounts[categoryId] || 0) + 1;
        }
      });
      
      // Merge counts with categories
      const categoriesWithCounts = categoriesResponse.data.data.map((category) => ({
        ...category,
        vendorCount: vendorCounts[typeof category.id === 'string' ? parseInt(category.id) : category.id] || 0,
      }));
      
      return categoriesWithCounts;
    },
  });
}