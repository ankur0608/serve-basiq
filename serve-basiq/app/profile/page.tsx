"use client";

import { useSession } from "next-auth/react";
import { useUIStore } from "@/lib/store";
import { FaCalendarCheck, FaBoxOpen, FaGear, FaChevronRight, FaSpinner } from "react-icons/fa6";
import Link from "next/link";
import { useEffect } from "react";
import { fullLogout } from "@/lib/logout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileEditModal, { ProfileData } from "@/components/profile/ProfileEditModal";

export default function ProfilePage() {
    const { data: session, status, update: updateSession } = useSession();
    const { currentUser, setCurrentUser, logout, isEditProfileOpen, onOpenEditProfile, onCloseEditProfile } = useUIStore();

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const fetchBasicProfile = async () => {
                const identifier = session.user.email || session.user.id;
                try {
                    const res = await fetch(`/api/user/profile?identifier=${identifier}`);
                    if (res.status === 401) { logout(); return; }
                    if (res.ok) {
                        const data = await res.json();
                        setCurrentUser(data);
                    }
                } catch (err) { console.error(err); }
            };
            fetchBasicProfile();
        }
    }, [status, session]);

    const handleSaveProfile = async (formData: ProfileData, file: File | null) => {
        try {
            // @ts-ignore
            const userId = currentUser?.id || session?.user?.id;
            if (!userId) return;

            let uploadedImageUrl = formData.image;
            if (file) {
                const uploadData = new FormData();
                uploadData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
                if (res.ok) { const d = await res.json(); uploadedImageUrl = d.url; }
            }

            const payload = { userId, ...formData, image: uploadedImageUrl };
            const updateRes = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (updateRes.ok) {
                // @ts-ignore
                const updatedUser = { ...currentUser, ...formData, id: userId, img: uploadedImageUrl };
                // @ts-ignore
                setCurrentUser(updatedUser);
                await updateSession({ name: formData.name, image: uploadedImageUrl });
            }
        } catch (e) { console.error(e); }
    };

    if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-slate-50"><FaSpinner className="animate-spin text-4xl text-slate-300" /></div>;
    if (status === "unauthenticated") return <div>Please Login</div>;

    const userAny = currentUser as any || {};
    const profileData: ProfileData = {
        name: userAny.name || session?.user?.name || '',
        email: userAny.email || session?.user?.email || '',
        phone: userAny.phone || '',
        image: userAny.img || session?.user?.image || '',
        dateOfBirth: userAny.dateOfBirth || '',
        preferredLanguage: userAny.preferredLanguage || 'English',
        addressLine1: userAny.addressLine1 || '',
        addressLine2: userAny.addressLine2 || '', // ✅ Ensure this is mapped correctly
        landmark: userAny.landmark || '',
        city: userAny.city || '',
        state: userAny.state || '',
        pincode: userAny.pincode || ''
    };

    return (
        <div className="min-h-screen pb-32 bg-slate-50 animate-in fade-in">
            <ProfileHeader userImage={userAny.img || session?.user?.image} onLogout={fullLogout} onEditClick={onOpenEditProfile} />
            <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-6">
                <ProfileStats />
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col">
                        <MenuLink href="/profile/bookings" icon={<FaCalendarCheck className="text-blue-500" />} label="My Bookings" />
                        <MenuLink href="/profile/orders" icon={<FaBoxOpen className="text-blue-600" />} label="My Orders" />
                        <MenuLink href="/profile/settings" icon={<FaGear className="text-slate-600" />} label="Settings" isLast />
                    </div>
                </div>
            </div>
            <ProfileEditModal isOpen={isEditProfileOpen} onClose={onCloseEditProfile} initialData={profileData} onSave={handleSaveProfile} />
        </div>
    );
}

function MenuLink({ href, icon, label, isLast }: any) {
    return (
        <Link href={href} className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${!isLast ? "border-b border-gray-100" : ""}`}>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg">{icon}</div>
                <span className="font-bold text-slate-900">{label}</span>
            </div>
            <FaChevronRight className="text-gray-300 text-sm" />
        </Link>
    );
}