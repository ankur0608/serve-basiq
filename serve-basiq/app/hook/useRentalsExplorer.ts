import { useInfiniteQuery, useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';

// --- SHARED TYPES ---
export interface RentalItem {
    id: string;
    name: string;
    categoryName: string;
    categoryId?: string;
    subcategoryName: string;
    subcategoryId?: string;
    dailyPrice?: number;
    monthlyPrice?: number;
    fixedPrice?: number;
    price: number;
    priceType: string;
    rating: number;
    reviewCount: number;
    location: string;
    image: string;
    type: 'Rental';
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
}

export interface CategoryData {
    id: string;
    name: string;
    image?: string;
    children: { id: string; name: string }[];
}

const normalizeRentals = (data: any[]): RentalItem[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => {
        const genericPrice = Number(item.price) || 0;
        const type = item.priceType || 'DAILY';
        const effectiveDaily = Number(item.dailyPrice) || (type === 'DAILY' ? genericPrice : 0);
        const effectiveMonthly = Number(item.monthlyPrice) || (type === 'MONTHLY' ? genericPrice : 0);
        const effectiveFixed = Number(item.fixedPrice) || (type === 'FIXED' ? genericPrice : 0);
        const displayPrice = effectiveDaily || effectiveFixed || effectiveMonthly || genericPrice;
        const displayType = effectiveDaily ? 'DAILY' : (effectiveFixed ? 'FIXED' : 'MONTHLY');

        return {
            id: item.id,
            name: item.name,
            categoryId: item.categoryId || item.category?.id,
            categoryName: item.category?.name || "Other",
            subcategoryId: item.subCategoryId || item.subcategory?.id,
            subcategoryName: item.subcategory?.name || "General",
            dailyPrice: effectiveDaily,
            monthlyPrice: effectiveMonthly,
            fixedPrice: effectiveFixed,
            price: displayPrice,
            priceType: displayType,
            rating: Number(item.rating) || 0,
            reviewCount: item._count?.reviews || 0,
            // Map location to the User's Work address array safely
            location: item.user?.addresses?.[0]?.city || item.city || "Remote",
            image: item.rentalImg || item.coverImg || "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&q=80",
            type: 'Rental',
            addressLine1: item.addressLine1,
            addressLine2: item.addressLine2,
            city: item.city,
            state: item.state,
            pincode: item.pincode
        };
    });
};

interface UseRentalsProps {
    category?: string;
    subcategory?: string;
    search?: string;
    location?: string;
    sort?: string;
}

export function useRentalsExplorer({ category, subcategory, search, location, sort }: UseRentalsProps = {}) {
    const queryClient = useQueryClient();

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
        queryKey: ['categories', 'rental'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=RENTAL');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 60,
    });

    const { data: favoriteIds = [] } = useQuery<string[]>({
        queryKey: ['favorites', 'RENTAL'],
        queryFn: async () => {
            // 👇 Make sure this URL matches your actual GET route for favorites
            const res = await fetch('/api/favorites?type=RENTAL');
            if (!res.ok) return [];
            const data = await res.json();

            return data.map((f: any) => f.itemId || f.rentalId || f.id);
        },
        enabled: !!currentUser,
        staleTime: 1000 * 60 * 5,
    });

    // Toggle favorite mutation with Optimistic UI updates
    const { mutate: toggleFavorite } = useMutation({
        mutationFn: async ({ id, type }: { id: string; type: 'RENTAL' | 'SERVICE' }) => {
            // 👇 THIS WAS CAUSING THE 405 ERROR. IT IS NOW FIXED.
            const res = await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type }),
            });
            if (!res.ok) throw new Error('Failed to toggle favorite');
            return res.json();
        },
        // Optimistic UI update
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ['favorites', 'RENTAL'] });

            const previousFavorites = queryClient.getQueryData<string[]>(['favorites', 'RENTAL']);

            queryClient.setQueryData<string[]>(['favorites', 'RENTAL'], (old = []) =>
                old.includes(id) ? old.filter(favId => favId !== id) : [...old, id]
            );

            return { previousFavorites };
        },
        // Rollback on error
        onError: (err, variables, context) => {
            if (context?.previousFavorites) {
                queryClient.setQueryData(['favorites', 'RENTAL'], context.previousFavorites);
            }
        },
        // Refetch on settle
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites', 'RENTAL'] });
        }
    });
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching
    } = useInfiniteQuery({
        queryKey: ['rentals', 'infinite', category, subcategory, search, location, sort],
        queryFn: async ({ pageParam = undefined }) => {
            const params = new URLSearchParams();
            params.append('limit', '24');

            if (pageParam) params.append('cursor', pageParam as string);
            if (category) params.append('categoryId', category);
            if (subcategory) params.append('subcategoryId', subcategory);
            if (search) params.append('search', search);
            if (location) params.append('location', location);
            if (sort) params.append('sort', sort);

            const res = await fetch(`/api/rentals?${params.toString()}`);
            return res.json();
        },
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        initialPageParam: undefined,
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
    });

    const rawRentals = useMemo(() => {
        if (!data) return [];
        const allItems = data.pages.flatMap((page: any) => page.items || []);
        const normalizedItems = normalizeRentals(allItems);

        const uniqueMap = new Map();
        normalizedItems.forEach((item) => {
            if (!uniqueMap.has(item.id)) {
                uniqueMap.set(item.id, item);
            }
        });

        return Array.from(uniqueMap.values());
    }, [data]);

    return {
        currentUser,
        rawRentals,
        rawCategories: (categoriesData || []) as CategoryData[],
        isLoading,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        favoriteIds,      // ✅ Exported here
        toggleFavorite    // ✅ Exported here
    };
}