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
import { useEffect, useState, useMemo } from "react";
import { fullLogout } from "@/lib/logout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileEditModal, { ProfileData } from "@/components/profile/ProfileEditModal";
import MobileVerificationModal from "@/components/auth/MobileVerificationModal";
import BecomeProviderBanner from "@/components/profile/BecomeProviderBanner";

export default function ProfilePage() {
    const { data: session, status, update: updateSession } = useSession();
    const {
        currentUser,
        setCurrentUser,
        logout,
        isEditProfileOpen,
        onOpenEditProfile,
        onCloseEditProfile,
    } = useUIStore();

    // 1. Fetch fresh profile data from the API silently in the background
    const { data: profileDataFromApi, isLoading, error, refetch } = useUserProfile();
    const { mutateAsync: updateProfile } = useUpdateProfile();

    const [isHydrated, setIsHydrated] = useState(false);
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Sync API data to global store silently when it arrives
    useEffect(() => {
        if (profileDataFromApi) {
            setCurrentUser(profileDataFromApi);
        }
    }, [profileDataFromApi, setCurrentUser]);

    useEffect(() => {
        if (error?.message === "Unauthorized") {
            logout();
        }
    }, [error, logout]);

    // 👉 2. INSTANT UI RENDER LOGIC
    // We merge session -> store -> API data. 
    // This guarantees the UI loads instantly if they come from the Dashboard, 
    // and updates silently when the API finishes.
    const userAny = useMemo(() => {
        return {
            ...(session?.user as any),
            ...currentUser,
            ...profileDataFromApi
        };
    }, [profileDataFromApi, currentUser, session]);

    if (!isHydrated) return null;

    // Only show spinner if we have NO data in session, store, or API
    if (status === "loading" && !userAny?.id) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <FaSpinner className="animate-spin text-4xl text-slate-300" />
            </div>
        );
    }

    if (status === "unauthenticated")
        return <div className="p-10 text-center">Please Login</div>;

    const isGoogleLogin = !!session?.user?.email;

    const primaryAddress = userAny.addresses && userAny.addresses.length > 0
        ? userAny.addresses[0]
        : {};

    const profileData: ProfileData = {
        name: userAny.name || "",
        email: userAny.email || "",
        phone: userAny.phone || "",
        image: userAny.profileImage || userAny.image || userAny.img || "",
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
                // 🛠️ FIX: Prioritize profileImage
                userImage={userAny.profileImage || userAny.image || userAny.img}
                onLogout={fullLogout}
                onEditClick={onOpenEditProfile}
            />

            <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-6">
                <ProfileStats />

                {/* Only show banner if isWorker is explicitly false */}
                {!userAny.isWorker && (
                    <BecomeProviderBanner />
                )}

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
                    isEmailLocked={isGoogleLogin}
                    isPhoneLocked={true}
                    onAddPhoneClick={() => {
                        onCloseEditProfile();
                        setIsPhoneModalOpen(true);
                    }}
                    onSave={async (formData, file) => {
                        await updateProfile({ formData, file, currentUser: userAny });

                        await refetch();
                        await updateSession();
                    }}
                />

                <MobileVerificationModal
                    userId={userAny.id}
                    isOpen={isPhoneModalOpen}
                    onClose={() => {
                        setIsPhoneModalOpen(false);
                        onOpenEditProfile();
                    }}
                    onSuccess={async () => {
                        setIsPhoneModalOpen(false);
                        await refetch(); // Refresh API data
                        onOpenEditProfile();
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
            className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${!isLast ? "border-b border-gray-100" : ""}`}
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