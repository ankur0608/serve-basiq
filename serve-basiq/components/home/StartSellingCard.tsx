'use client';

import { useState } from 'react';
import { FaStore } from 'react-icons/fa6';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/auth/LoginModal';
import { useUIStore } from '@/lib/store';

export default function StartSellingCard() {
  const { data: session, status } = useSession();
  const { currentUser } = useUIStore();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check BOTH the store and the session for the isWorker flag
  const isWorker = currentUser?.isWorker === true || (session?.user as any)?.isWorker === true;

  // Check if we are waiting for the profile to load
  const isProfileLoading =
    status === 'authenticated' &&
    currentUser === null &&
    (session?.user as any)?.isWorker === undefined;

  const handleAction = () => {
    // 1. Not logged in -> Show Login
    if (status === 'unauthenticated') {
      setIsModalOpen(true);
      return;
    }

    // 2. Prevent clicks if loading
    if (isProfileLoading) return;

    // 3. IS a worker -> Switch mode and go to Dashboard
    if (isWorker) {
      const handleSwitch = async () => {
        if (!currentUser) return;
        try {
          await fetch('/api/user/switch-mode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, isWebsite: false })
          });
          if ((useUIStore.getState() as any).setCurrentUser) {
            (useUIStore.getState() as any).setCurrentUser({ ...currentUser, isWebsite: false });
          }
          router.push('/provider/dashboard');
        } catch (error) {
          console.error("Failed to switch mode", error);
          router.push('/provider/dashboard');
        }
      };
      handleSwitch();
      return;
    }

    // 4. NOT a worker -> Go to Apply Page
    router.push('/become-pro');
  };

  return (
    <>
      <button 
        onClick={handleAction}
        disabled={status === 'loading' || isProfileLoading}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all border border-gray-100 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer w-full h-full"
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-orange-50 text-orange-500">
          <FaStore size={24} />
        </div>
        <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">
          {isWorker ? "Dashboard" : "Start Selling"}
        </h3>
        <p className="text-xs text-slate-500 text-center">
          {isWorker ? "Provider Hub" : "Join as Partner"}
        </p>
      </button>

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}