'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { useUIStore } from "@/lib/store";
import imageCompression from "browser-image-compression";

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
    file: File | null;
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
    const { update: updateSession, data: session } = useSession();
    const { setCurrentUser, onCloseEditProfile } = useUIStore();

    return useMutation({
        mutationFn: async ({ formData, file, currentUser }: UpdateProfileParams) => {
            const userId = currentUser?.id || session?.user?.id;
            if (!userId) throw new Error("User ID not found");

            let uploadedImageUrl = formData.image;

            if (file) {
                let fileToUpload = file;
                if (file.type.startsWith("image/")) {
                    try {
                        const options = {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1080,
                            useWebWorker: true,
                            initialQuality: 0.8,
                        };
                        fileToUpload = await imageCompression(file, options);
                    } catch (e) {
                        console.warn("Compression failed", e);
                    }
                }

                const uploadData = new FormData();
                uploadData.append("file", fileToUpload);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadData,
                });

                if (res.ok) {
                    const d = await res.json();
                    uploadedImageUrl = d.url || (d.key ? `${process.env.NEXT_PUBLIC_R2_DOMAIN}/${d.key}` : null);
                }
            }

            const payload = {
                userId,
                ...formData,
                image: uploadedImageUrl,
                profileImage: uploadedImageUrl,
            };

            const updateRes = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!updateRes.ok) throw new Error("Failed to update profile");

            return { payload, uploadedImageUrl };
        },
        onSuccess: async (data, variables) => {
            const { payload, uploadedImageUrl } = data;
            const { currentUser, formData } = variables;

            const updatedUser = {
                ...currentUser,
                ...formData,
                img: uploadedImageUrl,
                image: uploadedImageUrl,
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                district: formData.district,
                state: formData.state,
                pincode: formData.pincode,
                landmark: formData.landmark,
                isFullProfile: true,
            };

            setCurrentUser(updatedUser);

            await updateSession({ name: formData.name, image: uploadedImageUrl });

            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

            onCloseEditProfile();
        },
        onError: (error) => {
            console.error("Profile update error:", error);
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