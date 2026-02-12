import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

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

export function useProductsExplorer() {
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

    // Sync local favorites state when data arrives
    useEffect(() => {
        if (favData?.products) {
            setFavorites(favData.products);
        }
    }, [favData]);

    // 3. Fetch Products
    const { data: apiResponse, isLoading: prodLoading } = useQuery({
        queryKey: ['products', 'explorer'],
        queryFn: async () => {
            const res = await fetch('/api/products/all?limit=100');
            return res.json();
        },
        staleTime: 1000 * 60 * 1,
    });

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

    // --- Data Normalization Helper ---
    const normalizeProducts = (data: any): ProductItem[] => {
        if (!data || !data.products) return [];

        return data.products.map((item: any) => {
            let rawImageList: string[] = [];
            if (Array.isArray(item.images) && item.images.length > 0) {
                rawImageList = item.images;
            } else if (item.image && typeof item.image === 'string' && item.image.trim() !== "") {
                rawImageList = [item.image];
            }
            const validImages = rawImageList.filter(url => !url.includes('via.placeholder.com'));
            if (validImages.length === 0) {
                validImages.push("https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80");
            }

            return {
                id: item.id,
                name: item.name,
                description: item.description,
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
                inStock: true,
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

    // --- Action: Toggle Favorite ---
    const toggleFavorite = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyFav = favorites.includes(id);
        const newFavorites = isCurrentlyFav ? favorites.filter(favId => favId !== id) : [...favorites, id];

        // Optimistic UI Update
        setFavorites(newFavorites);

        try {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type: 'PRODUCT' })
            });
        } catch (error) {
            console.error(error);
            // Revert on failure
            setFavorites(favorites);
        }
    };

    return {
        currentUser,
        favorites,
        toggleFavorite,
        rawProducts: normalizeProducts(apiResponse),
        rawCategories: (categoriesData || []) as CategoryData[],
        isLoading: prodLoading,
    };
}