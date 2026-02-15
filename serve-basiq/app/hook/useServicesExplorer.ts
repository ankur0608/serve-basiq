import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFavorites } from './useFavorites'; // Ensure this points to your file

// --- TYPES ---
export interface ServiceItem {
    id: string;
    name: string;
    categoryId?: string;
    categoryName: string;
    subcategoryId?: string;
    subcategoryName?: string;
    price: number;
    priceType: 'FIXED' | 'HOURLY' | 'ESTIMATE';
    rating: number;
    reviewCount: number;
    location: string;
    image: string;
    type: 'Service';
}

interface UseServicesExplorerProps {
    search?: string;
    category?: string;
    subcategory?: string;
    location?: string;
    sort?: string;
}

export function useServicesExplorer({
    search,
    category,
    subcategory,
    location,
    sort
}: UseServicesExplorerProps) {

    // 1. Reuse your existing Favorites Hook
    const { favoriteServices, toggleFavorite } = useFavorites();

    // 2. User Profile Query
    const { data: currentUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    // 3. Categories Query
    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'service'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=SERVICE');
            return res.json();
        },
        staleTime: 1000 * 60 * 60,
    });

    // 4. Infinite Scroll Query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useInfiniteQuery({
        queryKey: ['services', 'explorer', search, category, subcategory, location, sort],
        queryFn: async ({ pageParam = undefined }) => {
            const params = new URLSearchParams();
            params.append('limit', '12');

            if (pageParam) params.append('cursor', pageParam as string);
            if (search) params.append('search', search);
            if (category) params.append('categoryId', category);
            if (subcategory) params.append('subcategoryId', subcategory);
            if (location) params.append('location', location);
            if (sort) params.append('sort', sort);

            const res = await fetch(`/api/services?${params.toString()}`);
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        },
        getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
        initialPageParam: undefined,
        staleTime: 1000 * 60 * 1,
    });

    // 5. Data Normalization (Moved logic out of component)
    const services = useMemo(() => {
        if (!data) return [];
        const rawItems = data.pages.flatMap((page: any) => page.items || []);

        return rawItems.map((item: any): ServiceItem => ({
            id: item.id,
            name: item.name,
            categoryId: item.category?.id,
            categoryName: item.category?.name || "General",
            subcategoryId: item.subcategory?.id,
            subcategoryName: item.subcategory?.name,
            price: Number(item.price) || 0,
            priceType: item.priceType || 'FIXED',
            rating: Number(item.rating) || 0,
            reviewCount: item._count?.reviews || 0,
            location: item.user?.city || item.city || "Remote",
            image: item.serviceimg || item.mainimg || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
            type: 'Service'
        }));
    }, [data]);

    return {
        services,
        categories: categoriesData || [],
        currentUser,
        favoriteIds: favoriteServices, // Array of IDs from your hook
        toggleFavorite,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
}