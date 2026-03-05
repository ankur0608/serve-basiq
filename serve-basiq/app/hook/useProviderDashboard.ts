'use client';

import { useQuery } from '@tanstack/react-query';

export const useProviderDashboard = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['provider-dashboard', userId],
    queryFn: async () => {
      if (!userId) return null;

      const res = await fetch('/api/provider/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error('Failed to fetch provider status');

      const data = await res.json();
      return data;
    },

    enabled: !!userId,

    // 🚀 PRODUCTION SETTINGS
    staleTime: 1000 * 60 * 5, // Data is "fresh" for 5 mins (Instant loads)
    gcTime: 1000 * 60 * 30,    // Keep in memory for 30 mins

    refetchOnWindowFocus: true, // Auto-update when user comes back to tab
    retry: 2,
  });
};