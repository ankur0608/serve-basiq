import { useInfiniteQuery, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useFavorites } from './useFavorites';

export interface ServiceItem {
    id: string;
    name: string;
    categoryId?: string;
    categoryName: string;
    subcategoryId?: string;
    subcategoryName?: string;
    price: number;
    priceType: 'FIXED' | 'HOURLY' | 'QUOTE';
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
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'service'],
        queryFn: async () => {
            const startTime = performance.now();
            const res = await fetch('/api/categories?type=SERVICE');
            const endTime = performance.now();
            
            console.log(`🚀 [Client API] Categories fetched in ${(endTime - startTime).toFixed(2)}ms`);
            
            return res.json();
        },
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    const {
        data: services,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
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

            const startTime = performance.now();
            const res = await fetch(`/api/services?${params.toString()}`);
            const endTime = performance.now();
            
            console.log(`🚀 [Client API] Services fetched in ${(endTime - startTime).toFixed(2)}ms`);

            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        },
        getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
        initialPageParam: undefined,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,

        // 🚀 Caching limits: 30 mins fresh, 45 mins in memory
        staleTime: 1000 * 60 * 30,
        gcTime: 1000 * 60 * 45,

        select: (data) => {
            const rawItems = data.pages.flatMap((page: any) => page.items || []);
            const uniqueMap = new Map<string, ServiceItem>();

            for (const item of rawItems) {
                if (!uniqueMap.has(item.id)) {
                    uniqueMap.set(item.id, {
                        id: item.id,
                        name: item.name,
                        categoryId: item.category?.id,
                        categoryName: item.category?.name || "General",
                        subcategoryId: item.subcategory?.id,
                        subcategoryName: item.subcategory?.name,
                        price: Number(item.price) || 0,
                        priceType: item.priceType === 'QUOTE' ? 'QUOTE' : (item.priceType || 'FIXED'),
                        rating: Number(item.rating) || 0,
                        reviewCount: item._count?.reviews || 0,
                        location: item.user?.addresses?.[0]?.city || item.city || "Remote",
                        image: item.serviceimg || item.mainimg || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
                        type: 'Service'
                    });
                }
            }
            return Array.from(uniqueMap.values());
        }
    });

    return {
        services: services || [],
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