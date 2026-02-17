// import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';

// // --- SHARED TYPES ---
// export interface RentalItem {
//     id: string;
//     name: string;
//     categoryName: string;
//     categoryId?: string;
//     subcategoryName: string;
//     subcategoryId?: string;
//     dailyPrice?: number;
//     monthlyPrice?: number;
//     fixedPrice?: number;
//     price: number;
//     priceType: string;
//     rating: number;
//     reviewCount: number;
//     location: string;
//     image: string;
//     type: 'Rental';
//     addressLine1?: string;
//     addressLine2?: string;
//     city?: string;
//     state?: string;
//     pincode?: string;
// }

// export interface CategoryData {
//     id: string;
//     name: string;
//     image?: string;
//     children: { id: string; name: string }[];
// }

// export function useRentalsExplorer() {
//     // 1. Fetch User Profile
//     const { data: currentUser } = useQuery({
//         queryKey: ['user', 'profile'],
//         queryFn: async () => {
//             const res = await fetch('/api/user/profile');
//             if (!res.ok) return null;
//             return res.json();
//         },
//         staleTime: 1000 * 60 * 5,
//     });

//     // 2. Fetch Rentals
//     const { data: apiResponse, isLoading: rentalsLoading } = useQuery({
//         queryKey: ['rentals', 'explorer'],
//         queryFn: async () => {
//             const res = await fetch('/api/rentals?limit=100');
//             return res.json();
//         },
//         staleTime: 1000 * 60 * 1,
//     });

//     // 3. Fetch Categories
//     const { data: categoriesData } = useQuery({
//         queryKey: ['categories', 'rental'],
//         queryFn: async () => {
//             const res = await fetch('/api/categories?type=RENTAL');
//             const data = await res.json();
//             return Array.isArray(data) ? data : [];
//         },
//         staleTime: 1000 * 60 * 60,
//     });

//     // --- Data Normalization Helper ---
//     const normalizeRentals = (data: any): RentalItem[] => {
//         if (!data) return [];
//         let rawData = [];
//         if (Array.isArray(data)) {
//             rawData = data;
//         } else if (data.data && Array.isArray(data.data)) {
//             rawData = data.data;
//         }

//         return rawData.map((item: any) => {
//             const genericPrice = Number(item.price) || 0;
//             const type = item.priceType || 'DAILY';

//             const effectiveDaily = Number(item.dailyPrice) || (type === 'DAILY' ? genericPrice : 0);
//             const effectiveMonthly = Number(item.monthlyPrice) || (type === 'MONTHLY' ? genericPrice : 0);
//             const effectiveFixed = Number(item.fixedPrice) || (type === 'FIXED' ? genericPrice : 0);

//             const displayPrice = effectiveDaily || effectiveFixed || effectiveMonthly || genericPrice;
//             const displayType = effectiveDaily ? 'DAILY' : (effectiveFixed ? 'FIXED' : 'MONTHLY');

//             return {
//                 id: item.id,
//                 name: item.name,
//                 categoryId: item.categoryId || item.category?.id,
//                 categoryName: item.category?.name || "Other",
//                 subcategoryId: item.subCategoryId || item.subcategory?.id,
//                 subcategoryName: item.subcategory?.name || "General",
//                 dailyPrice: effectiveDaily,
//                 monthlyPrice: effectiveMonthly,
//                 fixedPrice: effectiveFixed,
//                 price: displayPrice,
//                 priceType: displayType,
//                 rating: Number(item.rating) || 0,
//                 reviewCount: item._count?.reviews || 0,
//                 location: item.city || item.user?.city || "Remote",
//                 image: item.rentalImg || item.coverImg || "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&q=80",
//                 type: 'Rental',
//                 addressLine1: item.addressLine1,
//                 addressLine2: item.addressLine2,
//                 city: item.city,
//                 state: item.state,
//                 pincode: item.pincode
//             };
//         });
//     };

//     return {
//         currentUser,
//         rawRentals: normalizeRentals(apiResponse),
//         rawCategories: (categoriesData || []) as CategoryData[],
//         isLoading: rentalsLoading,
//     };
// }

import { useInfiniteQuery, useQuery, keepPreviousData } from '@tanstack/react-query';
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
            location: item.city || item.user?.city || "Remote",
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
    search?: string;
}

export function useRentalsExplorer({ category, search }: UseRentalsProps = {}) {
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

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching // 👈 Grab this for the overlay
    } = useInfiniteQuery({
        queryKey: ['rentals', 'infinite', category, search],
        queryFn: async ({ pageParam = undefined }) => {
            const params = new URLSearchParams();
            params.append('limit', '12');
            if (pageParam) params.append('cursor', pageParam as string);
            if (category) params.append('categoryId', category);
            if (search) params.append('search', search);

            const res = await fetch(`/api/rentals?${params.toString()}`);
            return res.json();
        },
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        initialPageParam: undefined,
        placeholderData: keepPreviousData, // 👈 KEY FIX: Keeps items on screen during filter
        staleTime: 1000 * 60 * 5,
    });

    const rawRentals = useMemo(() => {
        if (!data) return [];
        const allItems = data.pages.flatMap((page: any) => page.items || []);
        return normalizeRentals(allItems);
    }, [data]);

    return {
        currentUser,
        rawRentals,
        rawCategories: (categoriesData || []) as CategoryData[],
        isLoading,
        isFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
}