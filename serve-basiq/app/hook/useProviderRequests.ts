'use client';

import { useQuery } from '@tanstack/react-query';

export const useProviderRequests = (userId: string | undefined, providerType: string) => {
    return useQuery({
        queryKey: ['provider-requests', userId, providerType],
        queryFn: async () => {
            if (!userId) return { bookings: [], orders: [] };

            const res = await fetch(`/api/provider/requests?userId=${userId}&type=${providerType}`);
            if (!res.ok) throw new Error('Failed to fetch requests');

            return res.json();
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    });
};