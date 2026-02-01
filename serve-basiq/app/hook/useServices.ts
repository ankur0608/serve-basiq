import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- API FETCH FUNCTION ---
const fetchServicesFn = async (userId?: string) => {
    if (!userId) return [];

    const res = await fetch(`/api/services?userId=${userId}`);
    // If 404 or empty, return empty array to prevent crashes
    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
};

export function useServices(userId: string | undefined) {
    const queryClient = useQueryClient();
    const queryKey = ['services', userId];

    // --- 1. FETCH QUERY ---
    const { data: services = [], isLoading, refetch } = useQuery({
        queryKey: queryKey,
        queryFn: () => fetchServicesFn(userId),
        enabled: !!userId, // Only fetch if userId exists

        // ✅ Call API only once on mount, never auto-refetch unless invalidated
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    // --- 2. DELETE MUTATION ---
    const deleteMutation = useMutation({
        mutationFn: async (serviceId: string) => {
            if (!userId) throw new Error("Missing User ID");

            const res = await fetch('/api/services', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, serviceId })
            });

            if (!res.ok) throw new Error("Failed to delete");
            return { success: true };
        },
        onSuccess: () => {
            // ✅ Automatically refresh the list after a successful delete
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => {
            console.error("Delete error:", error);
        }
    });

    return {
        services,
        isLoading,
        refetch, // Exposed for ServiceSettingsView to trigger updates
        deleteService: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending
    };
}