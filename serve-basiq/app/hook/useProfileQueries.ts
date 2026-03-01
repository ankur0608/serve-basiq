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
    const { update: updateSession } = useSession();
    const { setCurrentUser, onCloseEditProfile } = useUIStore();

    return useMutation({
        mutationFn: async ({ formData, file, currentUser }: UpdateProfileParams) => {
            const userId = currentUser?.id;
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
                        const compressedBlob = await imageCompression(file, options);
                        fileToUpload = new File([compressedBlob], file.name, {
                            type: compressedBlob.type,
                        });
                    } catch (e) {
                        console.warn("Compression failed, using original file", e);
                    }
                }

                const presignedRes = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filename: fileToUpload.name,
                        fileType: fileToUpload.type,
                        fileSize: fileToUpload.size,
                    }),
                });

                if (!presignedRes.ok) {
                    const errorData = await presignedRes.json();
                    throw new Error(errorData.message || "Failed to get upload URL");
                }

                const { uploadUrl, publicUrl } = await presignedRes.json();

                const uploadRes = await fetch(uploadUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": fileToUpload.type,
                    },
                    body: fileToUpload,
                });

                if (!uploadRes.ok) {
                    throw new Error("Failed to upload image to storage container");
                }

                uploadedImageUrl = publicUrl;
            }

            const payload = { ...formData, image: uploadedImageUrl };

            const updateRes = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!updateRes.ok) throw new Error("Failed to update profile");

            return { payload, uploadedImageUrl };
        },
        onSuccess: async (data) => {
            // 👉 1. Invalidate cache immediately for profile
            await queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

            // 👉 2. IMPORTANT: Force Dashboard to fetch fresh data so DOB/Language appears
            await queryClient.invalidateQueries({ queryKey: ['provider-dashboard'] });

            // Update session display image
            await updateSession({
                name: data.payload.name,
                image: data.uploadedImageUrl
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