// app/hook/useGlobalSearch.ts
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/app/hook/useDebounce'; // Adjust path if necessary

interface SearchResult {
    services: any[];
    products: any[];
    rentals: any[];
}

export function useGlobalSearch(query: string, delay: number = 500) {
    // 1. Debounce the incoming query
    const debouncedQuery = useDebounce(query, delay);

    return useQuery<SearchResult>({
        // 2. Use the debounced query in the queryKey so it only refetches when the debounced value changes
        queryKey: ['globalSearch', debouncedQuery],
        queryFn: async () => {
            // 3. Use the debounced query for the actual fetch
            if (!debouncedQuery.trim()) return { services: [], products: [], rentals: [] };

            const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
            if (!res.ok) throw new Error('Search failed');
            return res.json();
        },
        // 4. Only enable the query if the debounced string has content
        enabled: !!debouncedQuery.trim(),
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        refetchOnWindowFocus: false,
    });
}