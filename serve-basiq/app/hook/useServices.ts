import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define the structure of the API response
interface ListingsData {
    services: any[];
    rentals: any[];
}

// --- API FETCH FUNCTION ---
const fetchServicesFn = async (userId?: string): Promise<ListingsData> => {
    if (!userId) return { services: [], rentals: [] };

    try {
        const res = await fetch(`/api/services?userId=${userId}`);

        // If request fails, return empty arrays
        if (!res.ok) return { services: [], rentals: [] };

        const data = await res.json();

        // ✅ FIX: The API returns an object { services: [...], rentals: [...] }
        // We must return that structure, not check for Array.isArray(data)
        return {
            services: Array.isArray(data.services) ? data.services : [],
            rentals: Array.isArray(data.rentals) ? data.rentals : []
        };
    } catch (error) {
        console.error("Fetch error:", error);
        return { services: [], rentals: [] };
    }
};

export function useServices(userId: string | undefined) {
    const queryClient = useQueryClient();
    const queryKey = ['services', userId];

    // --- 1. FETCH QUERY ---
    const { data, isLoading, refetch } = useQuery({
        queryKey: queryKey,
        queryFn: () => fetchServicesFn(userId),
        enabled: !!userId,
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

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to delete");

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => {
            console.error("Delete error:", error);
        }
    });

    return {
        // ✅ Safely extract arrays from the data object
        services: data?.services || [],
        rentals: data?.rentals || [],

        isLoading,
        refetch,
        deleteService: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending
    };
}