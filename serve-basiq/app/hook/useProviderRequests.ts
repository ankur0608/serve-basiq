'use client';

import { useQuery } from '@tanstack/react-query';

export const useProviderRequests = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['provider-requests', userId],
        queryFn: async () => {
            if (!userId) return { bookings: [], orders: [] };

            const res = await fetch(`/api/provider/requests?userId=${userId}`);
            if (!res.ok) throw new Error('Failed to fetch requests');

            return res.json();
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 2,
    });
};
