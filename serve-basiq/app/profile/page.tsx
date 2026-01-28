"use client";

import { useSession } from "next-auth/react";
import { useUIStore } from "@/lib/store";
import {
    FaCalendarCheck,
    FaBoxOpen,
    FaGear,
    FaChevronRight,
    FaSpinner,
} from "react-icons/fa6";
import Link from "next/link";
import { useEffect, useRef } from "react";

// Components
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import { fullLogout } from "@/lib/logout";

export default function ProfilePage() {
    const { data: session, status } = useSession();

    const {
        currentUser,
        onOpenLogin,
        setCurrentUser,
        logout,
        isEditProfileOpen,
        onOpenEditProfile,
        onCloseEditProfile,
    } = useUIStore();

    // ✅ prevents repeated API calls
    const hasFetched = useRef(false);

    // ✅ reset on logout
    useEffect(() => {
        if (status === "unauthenticated") {
            hasFetched.current = false;
        }
    }, [status]);

    // ✅ fetch profile ONCE
    useEffect(() => {
        if (status !== "authenticated") return;
        if (!session?.user) return;

        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchBasicProfile = async () => {
            const identifier =
                session.user.email || session.user.id;

            if (!identifier) return;

            try {
                const res = await fetch(
                    `/api/user/profile?identifier=${identifier}`
                );

                if (res.status === 401) {
                    logout();
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data);
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
            }
        };

        fetchBasicProfile();
    }, [status, session?.user?.email]);

    // ---------------- UI STATES ----------------

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <FaSpinner className="animate-spin text-4xl text-slate-300" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <p className="text-slate-500 font-medium">
                    Please login to view your profile
                </p>
                <button
                    onClick={onOpenLogin}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg"
                >
                    Login Now
                </button>
            </div>
        );
    }

    const displayImage =
        currentUser?.img || session?.user?.image || "";

    return (
        <div className="min-h-screen pb-32 bg-slate-50 animate-in fade-in">

            <ProfileHeader
                userImage={displayImage}
                onLogout={fullLogout}
                onEditClick={onOpenEditProfile}
            />

            <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-6">
                <ProfileStats />

                {/* Menu */}
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
            </div>

            {/* Edit profile modal example */}
            {/* 
            {isEditProfileOpen && (
                <EditProfileForm
                    isOpen={isEditProfileOpen}
                    onClose={onCloseEditProfile}
                />
            )} 
            */}
        </div>
    );
}

// ---------------------------------------------------

function MenuLink({ href, icon, label, isLast }: any) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${
                !isLast ? "border-b border-gray-100" : ""
            }`}
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg">
                    {icon}
                </div>
                <span className="font-bold text-slate-900">
                    {label}
                </span>
            </div>
            <FaChevronRight className="text-gray-300 text-sm" />
        </Link>
    );
}
