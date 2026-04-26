import { useQuery } from '@tanstack/react-query';

// --- Types ---
export type SubCategory = {
    id: string;
    name: string;
    image: string | null;
};

export type Category = {
    id: string;
    name: string;
    image: string | null;
    type: 'SERVICE' | 'PRODUCT' | 'RENTAL' | 'BOTH';
    children: SubCategory[];
};

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories', 'all'],
        queryFn: async () => {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json() as Promise<Category[]>;
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });
};