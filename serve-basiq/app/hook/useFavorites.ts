import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useFavorites() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['favorites'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { services: [], products: [] };
            return res.json();
        },
        staleTime: 1000 * 60 * 10, 
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: 'SERVICE' | 'PRODUCT' }) => {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type }),
            });
        },
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
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['favorites'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
    });

    return {
        favoriteServices: data?.services || [],
        favoriteProducts: data?.products || [],
        isLoading,
        toggleFavorite: toggleMutation.mutate,
    };
}