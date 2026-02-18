import { useState, useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

// --- SHARED TYPES ---
export interface ProductItem {
    id: string;
    name: string;
    description: string;
    price: number;
    minOrderQty: number;
    unit: string;
    images: string[];
    categoryId?: string;
    categoryName: string;
    subcategoryId?: string;
    subcategoryName?: string;
    rating: number;
    reviewsCount: number;
    inStock: boolean;
    location: string;
    provider: {
        id: string;
        name: string;
        shopName: string;
        image: string;
        verified: boolean;
    };
}

export interface CategoryData {
    id: string;
    name: string;
    image?: string;
    children: { id: string; name: string }[];
}

// Normalizer
const normalizeProducts = (data: any[]): ProductItem[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => {
        let rawImageList: string[] = [];
        if (Array.isArray(item.images) && item.images.length > 0) rawImageList = item.images;
        else if (item.image) rawImageList = [item.image];
        else if (item.productImage) rawImageList = [item.productImage];

        const validImages = rawImageList.filter(url => !url.includes('via.placeholder.com'));
        if (validImages.length === 0) validImages.push("https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80");

        return {
            id: item.id,
            name: item.name,
            description: item.description || item.desc || "",
            price: Number(item.price) || 0,
            minOrderQty: item.moq || 1,
            unit: item.unit || 'pcs',
            images: validImages,
            categoryId: item.category?.id,
            categoryName: item.category?.name || "General",
            subcategoryId: item.subcategory?.id,
            subcategoryName: item.subcategory?.name,
            rating: item.rating || 0,
            reviewsCount: item._count?.reviews || 0,
            inStock: item.stockStatus !== 'OUT_OF_STOCK',
            location: item.city || item.user?.city || "Worldwide",
            provider: {
                id: item.user?.id,
                name: item.user?.name,
                shopName: item.supplier || item.user?.shopName || "Seller",
                image: item.user?.profileImage || item.user?.image || "",
                verified: item.isVerified || false
            }
        };
    });
};

interface UseProductsExplorerProps {
    category?: string;
    subcategory?: string;
    search?: string;
    location?: string;
    sort?: string;
}

export function useProductsExplorer({
    category,
    subcategory,
    search = "",
    location,
    sort
}: UseProductsExplorerProps = {}) {
    const queryClient = useQueryClient();

    // 1. Debounce Search
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // 2. Fetch User Profile
    const { data: currentUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 1000 * 60 * 10,
    });

    // 3. Fetch Favorites
    const { data: favData } = useQuery({
        queryKey: ['favorites', 'user'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { products: [] };
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    // 4. INFINITE Query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
    } = useInfiniteQuery({
        queryKey: ['products', 'infinite', category, subcategory, debouncedSearch, location, sort],
        queryFn: async ({ pageParam = undefined }) => {
            const params = new URLSearchParams();
            // INCREASED LIMIT TO 24 FOR BETTER UX
            params.append('limit', '24');

            if (pageParam) params.append('cursor', pageParam as string);
            if (category) params.append('categoryId', category);
            if (subcategory) params.append('subcategoryId', subcategory);
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (location) params.append('location', location);
            if (sort) params.append('sort', sort);

            const res = await fetch(`/api/products/all?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch products");
            return res.json();
        },
        getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,
        initialPageParam: undefined,
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });

    // Flatten pages & Deduplicate
    const rawProducts = useMemo(() => {
        if (!data) return [];

        // 1. Flatten
        const allItems = data.pages.flatMap((page: any) => page.products || page.items || []);

        // 2. Normalize first (handles image logic)
        const normalizedItems = normalizeProducts(allItems);

        // 3. DEDUPLICATION (The Fix)
        const uniqueMap = new Map();
        normalizedItems.forEach((item) => {
            if (!uniqueMap.has(item.id)) {
                uniqueMap.set(item.id, item);
            }
        });

        return Array.from(uniqueMap.values());
    }, [data]);

    // 5. Fetch Categories
    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'product'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=PRODUCT');
            return res.json();
        },
        staleTime: 1000 * 60 * 60 * 24,
    });

    // Toggle Favorite
    const toggleMutation = useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type: 'PRODUCT' })
            });
        },
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ['favorites', 'user'] });
            const previousFavs = queryClient.getQueryData(['favorites', 'user']);

            queryClient.setQueryData(['favorites', 'user'], (old: any) => {
                const list = old?.products || [];
                return {
                    ...old,
                    products: list.includes(id) ? list.filter((x: string) => x !== id) : [...list, id]
                };
            });
            return { previousFavs };
        },
        onError: (err, vars, context) => {
            queryClient.setQueryData(['favorites', 'user'], context?.previousFavs);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites', 'user'] });
        }
    });

    return {
        currentUser,
        favorites: favData?.products || [],
        toggleFavorite: (e: React.MouseEvent, id: string) => {
            e.preventDefault(); e.stopPropagation();
            toggleMutation.mutate({ id });
        },
        rawProducts,
        rawCategories: (categoriesData || []) as CategoryData[],
        isLoading,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
}