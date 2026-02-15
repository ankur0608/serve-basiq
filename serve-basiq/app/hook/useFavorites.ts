import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useFavorites() {
    const queryClient = useQueryClient();

    // 1. Fetch Favorites
    const { data, isLoading } = useQuery({
        queryKey: ['favorites'], // Global key for the whole app
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { services: [], products: [] };
            return res.json();
        },
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    });

    // 2. Toggle Mutation (Optimistic Updates)
    const toggleMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: 'SERVICE' | 'PRODUCT' }) => {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type }),
            });
        },
        // When user clicks, immediately update UI before API responds
        onMutate: async ({ id, type }) => {
            await queryClient.cancelQueries({ queryKey: ['favorites'] });
            const previousData = queryClient.getQueryData(['favorites']);

            queryClient.setQueryData(['favorites'], (old: any) => {
                const listKey = type === 'SERVICE' ? 'services' : 'products';
                const currentList = old?.[listKey] || [];
                const exists = currentList.includes(id);

                return {
                    ...old,
                    [listKey]: exists
                        ? currentList.filter((itemId: string) => itemId !== id)
                        : [...currentList, id]
                };
            });

            return { previousData };
        },
        // If API fails, roll back to previous state
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['favorites'], context?.previousData);
        },
        // Always refetch after error or success to ensure data is correct
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
    });

    return {
        favoriteServices: data?.services || [],
        favoriteProducts: data?.products || [],
        isLoading,
        toggleFavorite: toggleMutation.mutate, // Pass { id, type } to this
    };
}