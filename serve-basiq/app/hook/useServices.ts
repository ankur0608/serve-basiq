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
        staleTime: Infinity,

        gcTime: 1000 * 60 * 60 * 24,

        refetchOnWindowFocus: false,

        refetchOnMount: false
    });

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