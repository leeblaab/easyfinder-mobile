import { useState, useCallback } from 'react';

export function usePullToRefresh(refetch: (() => Promise<any>) | (() => Promise<any>)[]) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (Array.isArray(refetch)) {
        await Promise.all(refetch.map((f) => f()));
      } else {
        await refetch();
      }
    } catch (error) {
      console.warn('Pull-to-refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
}
