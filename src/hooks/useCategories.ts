import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { Category } from '../types';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Category[] }>(
        '/items/categories?fields=id,name,slug,icon,description'
      );
      return response.data.data;
    },
  });
}
