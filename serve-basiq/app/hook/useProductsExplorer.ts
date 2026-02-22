import { useMemo } from 'react';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

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
            minOrderQty: item.moq || item.minOrderQty || 1,
            unit: item.unit || 'pcs',
            images: validImages,
            categoryId: item.category?.id || item.categoryId,
            categoryName: item.category?.name || item.categoryName || "General",
            subcategoryId: item.subcategory?.id || item.subcategoryId,
            subcategoryName: item.subcategory?.name || item.subcategoryName,
            rating: item.rating || 0,
            reviewsCount: item.reviewsCount || item._count?.reviews || 0,
            inStock: item.inStock !== false && item.stockStatus !== 'OUT_OF_STOCK',
            // Location is now sent properly formatted from the API
            location: item.location || "Worldwide",
            provider: {
                id: item.provider?.id || item.user?.id,
                name: item.provider?.name || item.user?.name,
                shopName: item.provider?.shopName || item.supplier || item.user?.shopName || "Seller",
                image: item.provider?.image || item.user?.profileImage || item.user?.image || "",
                verified: item.provider?.verified || item.isVerified || false
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

    // 1. Fetch User Profile
    const { data: currentUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 1000 * 60 * 10,
    });

    const { data: favData } = useQuery({
        queryKey: ['favorites', 'user'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { products: [] };
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    // 3. INFINITE Query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
    } = useInfiniteQuery({
        queryKey: ['products', 'infinite', category, subcategory, search, location, sort],
        queryFn: async ({ pageParam = undefined }) => {
            const params = new URLSearchParams();
            params.append('limit', '24');

            if (pageParam) params.append('cursor', pageParam as string);
            if (category) params.append('categoryId', category);
            if (subcategory) params.append('subcategoryId', subcategory);
            if (search) params.append('search', search); 
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

    const rawProducts = useMemo(() => {
        if (!data) return [];

        const allItems = data.pages.flatMap((page: any) => page.products || page.items || []);

        const normalizedItems = normalizeProducts(allItems);

        const uniqueMap = new Map();
        normalizedItems.forEach((item) => {
            if (!uniqueMap.has(item.id)) {
                uniqueMap.set(item.id, item);
            }
        });

        return Array.from(uniqueMap.values());
    }, [data]);

    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'product'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=PRODUCT');
            return res.json();
        },
        staleTime: 1000 * 60 * 60 * 24,
    });

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