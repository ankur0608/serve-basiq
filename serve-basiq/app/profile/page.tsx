"use client";

import { useSession } from "next-auth/react";
import { useUIStore } from "@/lib/store";
import { useUserProfile, useUpdateProfile } from "@/app/hook/useProfileQueries";
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
import ProfileEditModal, { ProfileData } from "@/components/profile/ProfileEditModal";

export default function ProfilePage() {
    const { data: session, status } = useSession();

    const {
        currentUser,
        setCurrentUser,
        logout,
        isEditProfileOpen,
        onOpenEditProfile,
        onCloseEditProfile,
    } = useUIStore();

    // 1. Fetch Data
    const { data: profileDataFromApi, isLoading, error } = useUserProfile();

    // ✅ FIX 1: Use 'mutateAsync' instead of 'mutate' to get a Promise
    const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile();

    const [isHydrated, setIsHydrated] = useState(false);

    // Wait for Zustand hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Sync Hook Data to Zustand Store
    useEffect(() => {
        if (profileDataFromApi) {
            setCurrentUser(profileDataFromApi);
        }
    }, [profileDataFromApi, setCurrentUser]);

    // Handle Unauthorized Error
    useEffect(() => {
        if (error?.message === "Unauthorized") {
            logout();
        }
    }, [error, logout]);

    // --- RENDER ---

    if (!isHydrated) return null;

    const userToShow = currentUser || (session?.user as any);

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
                    // ✅ FIX 2: Pass an async function that awaits the mutation
                    onSave={async (formData, file) => {
                        await updateProfile({ formData, file, currentUser: userAny });
                    }}
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