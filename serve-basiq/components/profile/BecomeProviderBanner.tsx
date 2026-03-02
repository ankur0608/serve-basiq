'use client';

import { useState } from 'react';
import { FaBriefcase } from 'react-icons/fa6';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/auth/LoginModal';
import { useUIStore } from '@/lib/store';

export default function BecomeProviderBanner() {
    const { data: session, status } = useSession();
    const { currentUser } = useUIStore();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ Check BOTH the store and the session for the isWorker flag
    const isWorker = currentUser?.isWorker === true || (session?.user as any)?.isWorker === true;

    // ✅ NEW: Are we logged in, but waiting for the database to send us the user profile?
    // If the session doesn't know they are a worker, and the store is empty, we must wait.
    const isProfileLoading =
        status === 'authenticated' &&
        currentUser === null &&
        (session?.user as any)?.isWorker === undefined;

    const handleAction = () => {
        // Condition 1: User is NOT logged in -> Show Login Modal
        if (status === 'unauthenticated') {
            setIsModalOpen(true);
            return;
        }

        // Condition 2: Prevent clicks if data is still syncing
        if (isProfileLoading) return;

        // Condition 3: User IS logged in & IS a worker -> Go to Dashboard
        if (isWorker) {
            router.push('/provider/dashboard');
            return;
        }

        // Condition 4: User IS logged in & is NOT a worker -> Go to Apply Page
        router.push('/become-pro');
    };

    // ✅ Show skeleton if NextAuth is loading OR if we are waiting for Zustand to get the profile
    if (status === 'loading' || isProfileLoading) {
        return <div className="h-32 bg-slate-100 animate-pulse rounded-2xl w-full"></div>;
    }

    return (
        <>
            <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden shadow-md">
                <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                    <FaBriefcase className="w-48 h-48 text-white" />
                </div>

                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2">
                        {isWorker ? "Provider Dashboard" : "Become a Service Provider"}
                    </h3>
                    <p className="text-slate-300 text-sm mb-5">
                        {isWorker
                            ? "Manage your services, orders, and bookings."
                            : "Earn money by offering your skills."}
                    </p>
                    <button
                        onClick={handleAction}
                        className="inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition-colors text-sm"
                    >
                        <FaBriefcase />
                        {isWorker ? "Go to Dashboard" : "Apply Now"}
                    </button>
                </div>
            </div>

            <LoginModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}