'use client';

import { useQuery } from '@tanstack/react-query';

export const useProviderDashboard = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['provider-dashboard', userId],
    queryFn: async () => {
      if (!userId) return null;

      console.log(`📡 [HOOK] Fetching dashboard for: ${userId}`);

      const res = await fetch('/api/provider/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!res.ok) {
        console.error("❌ [HOOK] Network response failed");
        throw new Error('Network response was not ok');
      }

      const data = await res.json();

      // 🔍 LOG: Verify data in browser console
      console.log("✨ [HOOK] Data Received:", data);
      console.log("   -> KYC inside User:", data?.user?.kycDetails);

      return data;
    },
    enabled: !!userId, // Only run if userId is available
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    refetchOnWindowFocus: false,
  });
};