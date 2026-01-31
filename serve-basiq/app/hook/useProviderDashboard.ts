'use client';

import { useQuery } from '@tanstack/react-query';

export const useProviderDashboard = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['provider-dashboard', userId], // Unique key for caching

    queryFn: async () => {
      if (!userId) return null;

      console.log(`📡 [API CALL] Fetching fresh dashboard data for: ${userId}`);

      const res = await fetch('/api/provider/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        cache: 'no-store' // Ensure we don't hit Next.js fetch cache, rely on React Query instead
      });

      if (!res.ok) {
        throw new Error('Failed to fetch provider status');
      }

      return res.json();
    },

    // ✅ EXECUTION RULES
    enabled: !!userId, // 1. Only run if userId exists

    // ✅ CACHING RULES (The "Don't call if not needed" part)
    staleTime: 1000 * 60 * 10, // 2. Data is considered "Fresh" for 10 minutes. No API calls during this time.
    gcTime: 1000 * 60 * 30,    // 3. Keep data in memory (garbage collection) for 30 minutes.

    // ✅ RE-FETCHING RULES
    refetchOnWindowFocus: false, // 4. Don't fetch when clicking back to the tab
    refetchOnMount: false,       // 5. Don't fetch when component remounts (if data exists in cache)
    refetchOnReconnect: false,   // 6. Don't fetch if internet disconnects and reconnects
    retry: 1,                    // 7. If it fails, retry only once
  });
};