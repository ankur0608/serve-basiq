'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaArrowRight, FaXmark } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store";
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

// Components
import BookingForm from './BookingForm';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';
import SuccessModal from '@/components/ui/SuccessModal'; // ✅ Import the new modal

interface Props {
    serviceId: string;
    serviceName: string;
    price: number;
    currentUser: any;
    userAddresses: any[];
    defaultOpen?: boolean;
    onRequestClose?: () => void;
}

export default function BookingWrapper({
    serviceId,
    serviceName,
    price,
    currentUser,
    userAddresses,
    defaultOpen = false,
    onRequestClose
}: Props) {
    const { data: session, status } = useSession();

    // States
    const [isBookingOpen, setIsBookingOpen] = useState(defaultOpen);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false); // ✅ Success State
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const onOpenLogin = useUIStore((state) => state.onOpenLogin);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. Fetch Profile
    const { data: fetchedUser, isLoading: isFetchingUser, refetch: refetchUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        enabled: status === "authenticated" && !currentUser,
        staleTime: 0,
    });

    // 2. Merge Data
    const activeUser = currentUser || fetchedUser || session?.user;
    const effectiveAddresses = userAddresses?.length > 0 ? userAddresses : (fetchedUser?.addresses || []);

    const handleClose = () => {
        setIsBookingOpen(false);
        if (onRequestClose) onRequestClose();
    };

    // ✅ HANDLE SUCCESS
    const handleBookingSuccess = () => {
        setIsBookingOpen(false); // Close Form
        setIsSuccessOpen(true);  // Open Success Modal
    };

    const checkAndProceed = () => {
        if (status === "loading" || (status === "authenticated" && !currentUser && isFetchingUser)) return;

        if (!activeUser) {
            handleClose();
            if (onOpenLogin) onOpenLogin();
            else router.push('/login?callbackUrl=' + window.location.pathname);
            return;
        }

        if (activeUser.isPhoneVerified !== true) {
            setIsMobileModalOpen(true);
            return;
        }

        setIsBookingOpen(true);
    };

    useEffect(() => {
        if (defaultOpen && mounted) {
            checkAndProceed();
        }
    }, [defaultOpen, mounted, status, isFetchingUser]);

    const handleProceedClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        checkAndProceed();
    };

    if (defaultOpen && (status === "loading" || (status === "authenticated" && !currentUser && isFetchingUser))) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <>
            {/* 1. BUTTON */}
            {!defaultOpen && (
                <button
                    onClick={handleProceedClick}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-200"
                >
                    Proceed to Booking <FaArrowRight className="group-hover:translate-x-1 transition" />
                </button>
            )}

            {/* 2. MOBILE VERIFICATION */}
            {mounted && isMobileModalOpen && (
                <MobileVerificationModal
                    userId={activeUser?.id}
                    isOpen={isMobileModalOpen}
                    onClose={() => { setIsMobileModalOpen(false); if (defaultOpen) handleClose(); }}
                    onSuccess={async () => {
                        setIsMobileModalOpen(false);
                        await refetchUser();
                        setIsBookingOpen(true);
                        router.refresh();
                    }}
                />
            )}

            {/* 3. BOOKING FORM */}
            {mounted && isBookingOpen && activeUser && (
                defaultOpen ? (
                    // Inline Mode
                    <div className="w-full h-full">
                        <BookingForm
                            serviceId={serviceId}
                            serviceName={serviceName}
                            price={price}
                            userId={activeUser?.id}
                            userAddresses={effectiveAddresses}
                            userDetails={activeUser}
                            // ✅ Pass success handler instead of closing immediately
                            onSuccess={handleBookingSuccess}
                            onRequestClose={handleClose}
                        />
                    </div>
                ) : (
                    // Portal Mode
                    createPortal(
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                <button onClick={handleClose} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition backdrop-blur-sm">
                                    <FaXmark size={14} />
                                </button>
                                <BookingForm
                                    serviceId={serviceId}
                                    serviceName={serviceName}
                                    price={price}
                                    userId={activeUser?.id}
                                    userAddresses={effectiveAddresses}
                                    userDetails={activeUser}
                                    // ✅ Pass success handler
                                    onSuccess={handleBookingSuccess}
                                    onRequestClose={handleClose}
                                />
                            </div>
                        </div>,
                        document.body
                    )
                )
            )}

            {/* 4. ✅ SUCCESS MODAL */}
            {mounted && isSuccessOpen && (
                <SuccessModal
                    isOpen={isSuccessOpen}
                    onClose={() => {
                        setIsSuccessOpen(false);
                        if (onRequestClose) onRequestClose(); // Close parent wrapper if needed
                    }}
                    title="Booking Confirmed!"
                    message={`Your request for ${serviceName} has been received. The provider will contact you shortly.`}
                    buttonText="View My Bookings"
                    onButtonClick={() => router.push('/profile/bookings')} // Redirect to bookings page
                />
            )}
        </>
    );
}