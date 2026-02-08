'use client';

import { useQuery } from '@tanstack/react-query';

// --- Types ---
interface UserStats {
    bookings: number;
    cancellations: number;
}

interface FavoriteDetails {
    services: any[];
    products: any[];
}

// --- 1. Hook for User Stats (Bookings/Orders count) ---
export function useUserStats() {
    return useQuery<UserStats>({
        queryKey: ['user', 'stats'],
        queryFn: async () => {
            const res = await fetch('/api/user/stats'); // Make sure this matches your route path
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        },
        // ✅ CACHING MAGIC:
        staleTime: 1000 * 60 * 5, // Data is "fresh" for 5 minutes. Won't refetch automatically.
        gcTime: 1000 * 60 * 30,   // Keep in memory for 30 minutes.
        refetchOnWindowFocus: false, // Don't refetch just because user clicked alt-tab
    });
}

// --- 2. Hook for Favorites Details ---
export function useFavoritesDetails() {
    return useQuery<FavoriteDetails>({
        queryKey: ['favorites', 'details'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites/details');
            if (!res.ok) return { services: [], products: [] }; // Return empty on error to prevent crash
            return res.json();
        },
        staleTime: 1000 * 60 * 10, // 10 minutes cache
        gcTime: 1000 * 60 * 60,   // 1 hour memory
        refetchOnWindowFocus: false,
    });
}

export function useUserProfile() {
    return useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');

            // Handle 401 specifically so we can logout in the UI
            if (res.status === 401) {
                throw new Error("Unauthorized");
            }

            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        },
        staleTime: 1000 * 60 * 5, // 5 Minutes Cache (Won't refetch if data is fresh)
        gcTime: 1000 * 60 * 30,   // Keep in memory for 30 mins
        retry: false, // Don't retry if user is unauthorized
    });
}