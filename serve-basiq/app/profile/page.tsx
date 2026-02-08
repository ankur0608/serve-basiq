"use client";

import { useSession } from "next-auth/react";
import { useUIStore } from "@/lib/store";
import { useUserProfile } from "@/app/hook/useProfileQueries"; // ✅ Import the new hook
import { useQueryClient } from "@tanstack/react-query";
import {
    FaCalendarCheck,
    FaBoxOpen,
    FaGear,
    FaChevronRight,
    FaSpinner,
} from "react-icons/fa6";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fullLogout } from "@/lib/logout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileEditModal, {
    ProfileData,
} from "@/components/profile/ProfileEditModal";
import imageCompression from "browser-image-compression";

export default function ProfilePage() {
    const { data: session, status, update: updateSession } = useSession();
    const queryClient = useQueryClient();

    const {
        currentUser,
        setCurrentUser,
        logout,
        isEditProfileOpen,
        onOpenEditProfile,
        onCloseEditProfile,
    } = useUIStore();

    // ✅ HOOK: Fetch User Profile (Replaces all the manual useEffect/fetch logic)
    const { data: profileDataFromApi, isLoading, error } = useUserProfile();

    const [isHydrated, setIsHydrated] = useState(false);

    // 1. Wait for Zustand hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // 2. Sync Hook Data to Zustand Store
    useEffect(() => {
        if (profileDataFromApi) {
            setCurrentUser(profileDataFromApi);
        }
    }, [profileDataFromApi, setCurrentUser]);

    // 3. Handle Unauthorized Error
    useEffect(() => {
        if (error?.message === "Unauthorized") {
            logout();
        }
    }, [error, logout]);

    // --- SAVE LOGIC ---
    const handleSaveProfile = async (
        formData: ProfileData,
        file: File | null
    ) => {
        try {
            // @ts-ignore
            const userId = currentUser?.id || session?.user?.id;
            if (!userId) return;

            let uploadedImageUrl = formData.image;

            // 1. Upload Image (if exists)
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
                    uploadedImageUrl =
                        d.url ||
                        (d.key ? `${process.env.NEXT_PUBLIC_R2_DOMAIN}/${d.key}` : null);
                }
            }

            // 2. Prepare Payload
            const payload = {
                userId,
                ...formData,
                image: uploadedImageUrl,
                profileImage: uploadedImageUrl,
            };

            // 3. API Call
            const updateRes = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (updateRes.ok) {
                // 4. Update Store Immediately (Optimistic Update)
                const updatedUser: any = {
                    ...currentUser,
                    ...formData,
                    img: uploadedImageUrl,
                    image: uploadedImageUrl,
                    // Flattened updates
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

                // ✅ VITAL: Tell React Query the data is dirty so it refetches next time
                queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

                onCloseEditProfile();
            }
        } catch (e) {
            console.error(e);
        }
    };

    // --- RENDER ---

    if (!isHydrated) return null;

    // Use store data if available (for instant load), otherwise fallback to session
    const userToShow = currentUser || (session?.user as any);

    // Show spinner only if we have NO data at all and are loading
    if ((status === "loading" || isLoading) && !userToShow) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <FaSpinner className="animate-spin text-4xl text-slate-300" />
            </div>
        );
    }

    if (status === "unauthenticated")
        return <div className="p-10 text-center">Please Login</div>;

    const userAny = userToShow || {};

    // Address fallback logic
    const primaryAddress =
        userAny.addresses && userAny.addresses.length > 0
            ? userAny.addresses[0]
            : {};

    const profileData: ProfileData = {
        name: userAny.name || "",
        email: userAny.email || "",
        phone: userAny.phone || "",
        image: userAny.img || userAny.image || "",
        dateOfBirth: userAny.dateOfBirth || userAny.dob || "",
        preferredLanguage: userAny.preferredLanguage || "English",
        addressLine1: userAny.addressLine1 || primaryAddress.line1 || "",
        addressLine2: userAny.addressLine2 || primaryAddress.line2 || "",
        landmark: userAny.landmark || primaryAddress.landmark || "",
        city: userAny.city || primaryAddress.city || "",
        district: userAny.district || primaryAddress.district || "",
        state: userAny.state || primaryAddress.state || "",
        pincode: userAny.pincode || primaryAddress.pincode || "",
    };

    return (
        <div className="min-h-screen pb-32 bg-slate-50 animate-in fade-in">
            <ProfileHeader
                userImage={userAny.img || userAny.image}
                onLogout={fullLogout}
                onEditClick={onOpenEditProfile}
            />

            <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-6">
                <ProfileStats />
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col">
                        <MenuLink
                            href="/profile/bookings"
                            icon={<FaCalendarCheck className="text-blue-500" />}
                            label="My Bookings"
                        />
                        <MenuLink
                            href="/profile/orders"
                            icon={<FaBoxOpen className="text-blue-600" />}
                            label="My Orders"
                        />
                        <MenuLink
                            href="/profile/settings"
                            icon={<FaGear className="text-slate-600" />}
                            label="Settings"
                            isLast
                        />
                    </div>
                </div>
                <ProfileEditModal
                    isOpen={isEditProfileOpen}
                    onClose={onCloseEditProfile}
                    initialData={profileData}
                    onSave={handleSaveProfile}
                />
            </div>
        </div>
    );
}

function MenuLink({ href, icon, label, isLast }: any) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${!isLast ? "border-b border-gray-100" : ""
                }`}
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg">
                    {icon}
                </div>
                <span className="font-bold text-slate-900">{label}</span>
            </div>
            <FaChevronRight className="text-gray-300 text-sm" />
        </Link>
    );
}