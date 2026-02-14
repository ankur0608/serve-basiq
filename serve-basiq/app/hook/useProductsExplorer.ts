import { useState, useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

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

// Helper to normalize a list of products
const normalizeProducts = (data: any[]): ProductItem[] => {
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
        let rawImageList: string[] = [];
        if (Array.isArray(item.images) && item.images.length > 0) {
            rawImageList = item.images;
        } else if (item.image && typeof item.image === 'string' && item.image.trim() !== "") {
            rawImageList = [item.image];
        } else if (item.productImage) {
            rawImageList = [item.productImage];
        }

        const validImages = rawImageList.filter(url => !url.includes('via.placeholder.com'));
        if (validImages.length === 0) {
            validImages.push("https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80");
        }

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
}

export function useProductsExplorer({ category, subcategory, search }: UseProductsExplorerProps = {}) {
    const [favorites, setFavorites] = useState<string[]>([]);

    // 1. Fetch User Profile
    const { data: currentUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    // 2. Fetch Favorites
    const { data: favData } = useQuery({
        queryKey: ['favorites', 'user'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { products: [] };
            return res.json();
        },
        staleTime: 0,
    });

    // Sync local favorites
    useEffect(() => {
        if (favData?.products) {
            setFavorites(favData.products);
        }
    }, [favData]);

    // 3. INFINITE Query for Products
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['products', 'infinite', category, subcategory, search],
        queryFn: async ({ pageParam = undefined }) => {
            const params = new URLSearchParams();
            params.append('limit', '12');
            if (pageParam) params.append('cursor', pageParam as string);
            if (category) params.append('categoryId', category);
            if (subcategory) params.append('subcategoryId', subcategory);
            if (search) params.append('search', search);

            const res = await fetch(`/api/products/all?${params.toString()}`);
            return res.json();
        },
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        initialPageParam: undefined,
    });

    // Flatten pages
    const rawProducts = useMemo(() => {
        if (!data) return [];
        // The API returns { products: [...], nextCursor: ... }
        const allItems = data.pages.flatMap((page: any) => page.products || []);
        return normalizeProducts(allItems);
    }, [data]);

    // 4. Fetch Categories
    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'product'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=PRODUCT');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 60,
    });

    // --- Action: Toggle Favorite ---
    const toggleFavorite = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyFav = favorites.includes(id);
        const newFavorites = isCurrentlyFav ? favorites.filter(favId => favId !== id) : [...favorites, id];
        setFavorites(newFavorites);

        try {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type: 'PRODUCT' })
            });
        } catch (error) {
            console.error(error);
            setFavorites(favorites);
        }
    };

    return {
        currentUser,
        favorites,
        toggleFavorite,
        rawProducts,
        rawCategories: (categoriesData || []) as CategoryData[],
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
}