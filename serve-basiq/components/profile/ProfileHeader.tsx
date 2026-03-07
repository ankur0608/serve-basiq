'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import {
    FaPhone,
    FaRightFromBracket,
    FaPencil,
    FaGaugeHigh
} from 'react-icons/fa6';
import clsx from 'clsx';
import ConfirmLogoutModal from '@/components/auth/ConfirmLogoutModal';

interface ProfileHeaderProps {
    onEditClick: () => void;
    onLogout: () => void;
    userImage?: string | null;
}

export default function ProfileHeader({
    onEditClick,
    userImage,
    onLogout
}: ProfileHeaderProps) {

    const router = useRouter();
    const { currentUser } = useUIStore();
    const { data: session } = useSession();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Prevent flicker by checking store first
    const isWorker =
        currentUser?.isWorker || session?.user?.isWorker || false;

    const displayName =
        currentUser?.name || session?.user?.name || "User";

    const displayImage =
        userImage ||
        currentUser?.image ||
        currentUser?.profileImage ||
        currentUser?.img ||
        session?.user?.image;

    const displayPhone =
        currentUser?.phone || session?.user?.phone;

    const getInitials = () =>
        displayName.substring(0, 2).toUpperCase();

    const handleProviderClick = async () => {
        if (!isWorker || !currentUser) return;

        try {
            // First switch mode in DB to isWebsite: false (Provider Mode)
            await fetch('/api/user/switch-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, isWebsite: false })
            });

            // Update local state if store provides setter
            if ((useUIStore.getState() as any).setCurrentUser) {
                (useUIStore.getState() as any).setCurrentUser({ ...currentUser, isWebsite: false });
            }

            // Then navigate
            router.push('/provider/dashboard');
        } catch (error) {
            console.error("Failed to switch mode:", error);
            // Fallback navigate anyway if it's just a UI flag
            router.push('/provider/dashboard');
        }
    };

    return (
        <>
            <div
                className={clsx(
                    "pt-12 pb-24 px-4 relative overflow-hidden transition-colors duration-500",
                    isWorker
                        ? "bg-slate-900 text-white"
                        : "bg-blue-600 text-white"
                )}
            >

                {/* Background Pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'radial-gradient(#ffffff 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />

                <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">

                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold text-white shadow-2xl border-4 border-white/10 overflow-hidden relative shrink-0">
                        {displayImage ? (
                            <img
                                src={displayImage}
                                alt="Profile"
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <span>{getInitials()}</span>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 mb-2">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                            <h1 className="text-3xl font-extrabold">
                                {displayName}
                            </h1>

                            <button
                                onClick={onEditClick}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition backdrop-blur-sm cursor-pointer"
                                aria-label="Edit Profile"
                            >
                                <FaPencil className="text-sm" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-white/70 text-sm font-medium">
                            {displayPhone && (
                                <>
                                    <span className="flex items-center gap-1.5">
                                        <FaPhone className="text-xs" />
                                        {displayPhone}
                                    </span>

                                    <span className="hidden md:inline w-1 h-1 bg-white/40 rounded-full"></span>
                                </>
                            )}

                            <span
                                className={clsx(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                                    isWorker
                                        ? "bg-green-400/20 text-green-100 border-green-400/30"
                                        : "bg-white/20 text-white border-white/30"
                                )}
                            >
                                {isWorker ? "Professional" : "Customer"}
                            </span>
                        </div>
                    </div>

                    {/* Worker Actions */}
                    {isWorker && (
                        <div className="flex items-center gap-3">

                            <button
                                onClick={handleProviderClick}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all backdrop-blur-sm shadow-lg border bg-green-500 text-white border-green-400 hover:bg-green-600"
                            >
                                <FaGaugeHigh /> Dashboard
                            </button>

                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-bold transition-all backdrop-blur-sm"
                                aria-label="Logout"
                            >
                                <FaRightFromBracket />
                            </button>

                        </div>
                    )}
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <ConfirmLogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={onLogout}
            />
        </>
    );
}