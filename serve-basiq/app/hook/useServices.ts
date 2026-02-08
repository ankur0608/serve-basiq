'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useServices(userId: string | undefined) {
    const queryClient = useQueryClient();
    const queryKey = ['services', userId];

    const { data, isLoading, refetch } = useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            if (!userId) return { services: [], rentals: [] };
            const res = await fetch(`/api/provider/services?userId=${userId}`);
            if (!res.ok) throw new Error("Failed to fetch services");
            return res.json();
        },
        enabled: !!userId,

        // ✅ CRITICAL CACHING SETTINGS
        // 1. Infinity: Data is "fresh" forever. Navigating away and back WON'T trigger a fetch.
        staleTime: Infinity,

        // 2. Garbage Collection: Keep data in memory for 24 hours even if unused.
        gcTime: 1000 * 60 * 60 * 24,

        // 3. Window Focus: Don't refetch just because the user clicked a different tab.
        refetchOnWindowFocus: false,

        // 4. Mount: Don't refetch if component remounts and data is already in cache.
        refetchOnMount: false
    });

    // ✅ DELETE MUTATION (Triggers Refetch)
    const deleteMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: 'SERVICE' | 'RENTAL' }) => {
            const res = await fetch('/api/provider/services', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, id, type })
            });
            if (!res.ok) throw new Error("Delete failed");
            return res.json();
        },
        onSuccess: () => {
            // ⚡ This forces the API to call again ONLY when you delete an item
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return {
        services: data?.services || [],
        rentals: data?.rentals || [],
        isLoading,
        refetch,
        deleteItem: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending
    };
}