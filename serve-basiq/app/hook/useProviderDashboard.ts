'use client';

import { useQuery } from '@tanstack/react-query';

export const useProviderDashboard = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['provider-dashboard', userId], 
    queryFn: async () => {
      if (!userId) return null;

      console.log(`📡 [API CALL] Fetching fresh dashboard data for: ${userId}`);

      const res = await fetch('/api/provider/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch provider status');
      }

      return res.json();
    },

    enabled: !!userId, 
    staleTime: 1000 * 60 * 10, 
    gcTime: 1000 * 60 * 30,  

    refetchOnWindowFocus: false, 
    refetchOnMount: false,      
    refetchOnReconnect: false, 
    retry: 1, 
  });
};