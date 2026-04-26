'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { useUIStore } from "@/lib/store";

// --- Types ---
interface UserStats {
    bookings: number;
    cancellations: number;
}

interface FavoriteDetails {
    services: any[];
    products: any[];
    rentals: any[];
}

interface UpdateProfileParams {
    formData: any;
    currentUser: any;
}

export function useUserStats() {
    return useQuery<UserStats>({
        queryKey: ['user', 'stats'],
        queryFn: async () => {
            const res = await fetch('/api/user/stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });
}

export function useFavoritesDetails() {
    return useQuery<FavoriteDetails>({
        queryKey: ['favorites', 'details'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites/details');
            if (!res.ok) return { services: [], products: [], rentals: [] };
            return res.json();
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
    });
}

export function useUserProfile() {
    return useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (res.status === 401) throw new Error("Unauthorized");
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: false,
    });
}

export function useActiveBookings() {
    return useQuery({
        queryKey: ['user', 'bookings', 'active'],
        queryFn: async () => {
            const res = await fetch('/api/user/bookings/active');
            if (!res.ok) throw new Error('Failed to fetch bookings');
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { update: updateSession } = useSession();
    const { onCloseEditProfile } = useUIStore();

    return useMutation({
        mutationFn: async ({ formData, currentUser }: UpdateProfileParams) => {
            const userId = currentUser?.id;
            if (!userId) throw new Error("User ID not found");

            // ✅ Clean, fast database patch! No uploads happen here anymore.
            const updateRes = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!updateRes.ok) {
                const errorData = await updateRes.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to update profile");
            }
            
            return { payload: formData };
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
            await queryClient.invalidateQueries({ queryKey: ['provider-dashboard'] });

            await updateSession({
                name: data.payload.name,
                image: data.payload.image // Ensure session gets the new image
            });

            if (onCloseEditProfile) {
                onCloseEditProfile();
            }
        }
    });
}

export function useUserOrders() {
    return useQuery({
        queryKey: ['user', 'orders'],
        queryFn: async () => {
            const res = await fetch('/api/user/orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });
}