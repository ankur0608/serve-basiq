"use client";

import { useSession } from "next-auth/react";
import { useUIStore } from "@/lib/store";
import { FaCalendarCheck, FaBoxOpen, FaGear, FaChevronRight, FaSpinner } from "react-icons/fa6";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { fullLogout } from "@/lib/logout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileEditModal, { ProfileData } from "@/components/profile/ProfileEditModal";
import imageCompression from 'browser-image-compression';

export default function ProfilePage() {
    const { data: session, status, update: updateSession } = useSession();
    const {
        currentUser,
        setCurrentUser,
        lastFetched, // ✅ Get last fetched time
        logout,
        isEditProfileOpen,
        onOpenEditProfile,
        onCloseEditProfile
    } = useUIStore();

    // Prevent hydration mismatch
    const [isHydrated, setIsHydrated] = useState(false);
    const isFetching = useRef(false);

    // Wait for Zustand to load from localStorage
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        // 1. Wait for hydration and auth
        if (!isHydrated || status !== "authenticated") return;

        // 2. CACHE CHECK: Is data fresh? (e.g., fetched less than 5 mins ago)
        const CACHE_DURATION = 5 * 60 * 1000; // 5 Minutes
        const isDataFresh = currentUser?.isFullProfile && (Date.now() - lastFetched < CACHE_DURATION);

        // If fresh, STOP. Do NOT fetch.
        if (isDataFresh) {
            // console.log("✅ Using cached profile data");
            return;
        }

        // 3. Prevent double fetching
        if (isFetching.current) return;
        isFetching.current = true;

        const fetchProfile = async () => {
            try {
                // ✅ No timestamp param, allow browser caching if needed
                const res = await fetch(`/api/user/profile`);

                if (res.status === 401) {
                    logout();
                    return;
                }
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data); // This updates 'lastFetched' automatically in store
                }
            } catch (error) {
                console.error("Profile fetch error", error);
            } finally {
                isFetching.current = false;
            }
        };

        fetchProfile();

    }, [status, isHydrated, currentUser, lastFetched, setCurrentUser, logout]);

    // --- SAVE LOGIC (Compressed) ---
    const handleSaveProfile = async (formData: ProfileData, file: File | null) => {
        try {
            // @ts-ignore
            const userId = currentUser?.id || session?.user?.id;
            if (!userId) return;

            let uploadedImageUrl = formData.image;

            if (file) {
                let fileToUpload = file;
                if (file.type.startsWith('image/')) {
                    try {
                        const options = { maxSizeMB: 1, maxWidthOrHeight: 1080, useWebWorker: true, initialQuality: 0.8 };
                        fileToUpload = await imageCompression(file, options);
                    } catch (e) { console.warn("Compression failed", e); }
                }

                const uploadData = new FormData();
                uploadData.append('file', fileToUpload);
                const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
                if (res.ok) {
                    const d = await res.json();
                    uploadedImageUrl = d.url || (d.key ? `${process.env.NEXT_PUBLIC_R2_DOMAIN}/${d.key}` : null);
                }
            }

            const payload = { userId, ...formData, image: uploadedImageUrl, profileImage: uploadedImageUrl };

            const updateRes = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (updateRes.ok) {
                const updatedUser: any = {
                    ...currentUser,
                    ...formData,
                    img: uploadedImageUrl,
                    image: uploadedImageUrl,
                    isFullProfile: true
                };
                setCurrentUser(updatedUser); // Updates localStorage immediately
                await updateSession({ name: formData.name, image: uploadedImageUrl });
                onCloseEditProfile();
            }
        } catch (e) { console.error(e); }
    };

    // --- RENDER ---

    // 1. Show nothing until hydrated (avoids flicker)
    if (!isHydrated) return null;

    // 2. Fallback to session user if store is empty
    const userToShow = currentUser || (session?.user as any);

    // 3. Only show loading if we TRULY have no data
    if (status === "loading" && !userToShow) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <FaSpinner className="animate-spin text-4xl text-slate-300" />
            </div>
        );
    }

    if (status === "unauthenticated") return <div className="p-10 text-center">Please Login</div>;

    const userAny = userToShow || {};

    const profileData: ProfileData = {
        name: userAny.name || '',
        email: userAny.email || '',
        phone: userAny.phone || '',
        image: userAny.img || userAny.image || '',
        dateOfBirth: userAny.dateOfBirth || userAny.dob || '',
        preferredLanguage: userAny.preferredLanguage || 'English',
        addressLine1: userAny.addressLine1 || userAny.line1 || '',
        addressLine2: userAny.addressLine2 || userAny.line2 || '',
        landmark: userAny.landmark || '',
        city: userAny.city || '',
        district: userAny.district || '',
        state: userAny.state || '',
        pincode: userAny.pincode || ''
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