import { useQuery } from '@tanstack/react-query';

export const useProviderDashboard = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['provider-dashboard', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const res = await fetch('/api/services/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await res.json();
      return data; // Expecting { success: true, services: [], user: {}, stats: {} }
    },
    enabled: !!userId, // Only fetch if userId exists
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    refetchOnWindowFocus: false,
  });
};