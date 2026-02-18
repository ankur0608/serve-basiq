import { useInfiniteQuery, useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useFavorites } from './useFavorites';

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
    search, category, subcategory, location, sort
}: UseServicesExplorerProps) {

    const queryClient = useQueryClient();
    const { favoriteServices, toggleFavorite } = useFavorites();

    const { data: currentUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 1000 * 60 * 10,
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'service'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=SERVICE');
            return res.json();
        },
        staleTime: 1000 * 60 * 60 * 24,
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching, // 👈 Needed for the loading overlay
        isError
    } = useInfiniteQuery({
        queryKey: ['services', 'explorer', search, category, subcategory, location, sort],
        queryFn: async ({ pageParam = undefined }) => {
            const params = new URLSearchParams();
            params.append('limit', '24');
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

        // --- CRITICAL FIX FOR FLASHING ---
        placeholderData: keepPreviousData, // Keeps old data visible while fetching new filter data

        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });

    const services = useMemo(() => {
        if (!data) return [];

        // 1. Flatten all pages into a single array
        const rawItems = data.pages.flatMap((page: any) => page.items || []);

        // 2. DEDUPLICATION LOGIC
        // We use a Map to filter out duplicate IDs. 
        // If the API returns the same item in two different pages, this prevents the React key error.
        const uniqueItems = new Map();

        rawItems.forEach((item: any) => {
            if (!uniqueItems.has(item.id)) {
                uniqueItems.set(item.id, item);
            }
        });

        // 3. Transform to ServiceItem interface
        return Array.from(uniqueItems.values()).map((item: any): ServiceItem => ({
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
        favoriteIds: favoriteServices,
        toggleFavorite,
        isLoading,
        isFetching,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
}