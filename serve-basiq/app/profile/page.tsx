"use client";

import { useSession } from "next-auth/react";
import { useUIStore } from "@/lib/store";
import { FaCalendarCheck, FaBoxOpen, FaGear, FaChevronRight, FaSpinner } from "react-icons/fa6";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { fullLogout } from "@/lib/logout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileEditModal, { ProfileData } from "@/components/profile/ProfileEditModal";

export default function ProfilePage() {
    const { data: session, status, update: updateSession } = useSession();

    const {
        currentUser,
        setCurrentUser,
        logout,
        isEditProfileOpen,
        onOpenEditProfile,
        onCloseEditProfile
    } = useUIStore();

    // Ref to prevent double-fetching in React Strict Mode
    const isFetching = useRef(false);

    useEffect(() => {
        // Only run if user is logged in
        if (status === "authenticated" && session?.user) {

            // ✅ LOGIC: Fetch if currentUser is null OR if it's missing the full DB data (isFullProfile)
            // This stops the infinite loop because once we fetch, isFullProfile becomes true.
            const needsData = !currentUser || !currentUser.isFullProfile;

            if (needsData && !isFetching.current) {
                isFetching.current = true;

                const fetchProfile = async () => {
                    try {
                        // Timestamp prevents browser caching
                        const res = await fetch(`/api/user/profile?t=${Date.now()}`);

                        if (res.status === 401) {
                            logout();
                            return;
                        }
                        if (res.ok) {
                            const data = await res.json();
                            setCurrentUser(data); // This sets isFullProfile: true
                        }
                    } catch (error) {
                        console.error("Profile fetch error", error);
                    } finally {
                        isFetching.current = false;
                    }
                };

                fetchProfile();
            }
        }
    }, [status, session, currentUser, setCurrentUser, logout]);

    // Handle Saving Logic
    const handleSaveProfile = async (formData: ProfileData, file: File | null) => {
        try {
            // @ts-ignore
            const userId = currentUser?.id || session?.user?.id;
            if (!userId) return;

            let uploadedImageUrl = formData.image;

            // 1. Upload new image if exists
            if (file) {
                const uploadData = new FormData();
                uploadData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
                if (res.ok) {
                    const d = await res.json();
                    uploadedImageUrl = d.url;
                }
            }

            // 2. Prepare Payload
            const payload = {
                userId,
                ...formData,
                image: uploadedImageUrl,
                profileImage: uploadedImageUrl
            };

            // 3. Send to API
            const updateRes = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (updateRes.ok) {
                // 4. Update Local Store Optimistically
                const updatedUser = {
                    ...currentUser,
                    ...formData,
                    img: uploadedImageUrl,
                    // Ensure we keep the flag true so it doesn't re-fetch
                    isFullProfile: true
                };

                // @ts-ignore
                setCurrentUser(updatedUser);

                // 5. Update Session (for Header/Nav)
                await updateSession({ name: formData.name, image: uploadedImageUrl });

                onCloseEditProfile();
            }
        } catch (e) { console.error(e); }
    };

    // Loading State
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <FaSpinner className="animate-spin text-4xl text-slate-300" />
            </div>
        );
    }

    if (status === "unauthenticated") return <div className="p-10 text-center">Please Login</div>;

    const userAny = (currentUser as any) || {};

    // ✅ PREPARE DATA FOR MODAL
    // Now simpler because API returns flattened keys (addressLine1, city, etc)
    const profileData: ProfileData = {
        name: userAny.name || session?.user?.name || '',
        email: userAny.email || session?.user?.email || '',
        phone: userAny.phone || '',
        image: userAny.img || userAny.image || session?.user?.image || '',
        dateOfBirth: userAny.dateOfBirth || userAny.dob || '',
        preferredLanguage: userAny.preferredLanguage || 'English',

        // Direct mapping now works because API flattened it
        addressLine1: userAny.addressLine1 || '',
        addressLine2: userAny.addressLine2 || '',
        landmark: userAny.landmark || '',
        city: userAny.city || '',
        state: userAny.state || '',
        pincode: userAny.pincode || ''
    };

    return (
        <div className="min-h-screen pb-32 bg-slate-50 animate-in fade-in">
            <ProfileHeader
                userImage={userAny.img || session?.user?.image}
                onLogout={fullLogout}
                onEditClick={onOpenEditProfile}
            />

            <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-6">
                <ProfileStats />

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col">
                        <MenuLink href="/profile/bookings" icon={<FaCalendarCheck className="text-blue-500" />} label="My Bookings" />
                        <MenuLink href="/profile/orders" icon={<FaBoxOpen className="text-blue-600" />} label="My Orders" />
                        <MenuLink href="/profile/settings" icon={<FaGear className="text-slate-600" />} label="Settings" isLast />
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
        <Link href={href} className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${!isLast ? "border-b border-gray-100" : ""}`}>
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