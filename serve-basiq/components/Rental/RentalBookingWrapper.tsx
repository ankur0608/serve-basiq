'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaArrowRight, FaXmark } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store";
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

// Components
import RentalBookingForm from './RentalBookingForm';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';
import SuccessModal from '@/components/ui/SuccessModal';

interface Props {
    rentalId: string;
    rentalName: string;
    rentalImage?: string;
    ownerLocation?: string;

    // ✅ UPDATED: Accept all pricing models from schema
    hourlyPrice?: number;
    dailyPrice?: number;
    weeklyPrice?: number;
    monthlyPrice?: number;
    fixedPrice?: number;

    currentUser: any;
    userAddresses: any[];
    defaultOpen?: boolean;
    onRequestClose?: () => void;
}

export default function RentalBookingWrapper({
    rentalId,
    rentalName,
    rentalImage,
    ownerLocation,

    // ✅ Destructure new price props
    hourlyPrice,
    dailyPrice,
    weeklyPrice,
    monthlyPrice,
    fixedPrice,

    currentUser,
    userAddresses,
    defaultOpen = false,
    onRequestClose
}: Props) {
    const { data: session, status } = useSession();

    // States
    const [isBookingOpen, setIsBookingOpen] = useState(defaultOpen);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const onOpenLogin = useUIStore((state) => state.onOpenLogin);

    useEffect(() => {
        setMounted(true);
    }, []);

    const shouldFetchProfile = status === "authenticated" && (!currentUser || !currentUser.addresses || currentUser.addresses.length === 0);

    const { data: fetchedUser, isLoading: isFetchingUser, refetch: refetchUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        enabled: shouldFetchProfile,
        staleTime: 0,
    });

    const activeUser = fetchedUser || currentUser || session?.user;
    const effectiveAddresses = fetchedUser?.addresses || userAddresses || [];

    const handleClose = () => {
        setIsBookingOpen(false);
        if (onRequestClose) onRequestClose();
    };

    const handleBookingSuccess = () => {
        setIsBookingOpen(false);
        setIsSuccessOpen(true);
    };

    const checkAndProceed = () => {
        if (status === "loading" || (status === "authenticated" && !activeUser && isFetchingUser)) return;

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

    if (defaultOpen && (status === "loading" || (shouldFetchProfile && isFetchingUser))) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white min-h-[300px]">
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
                    Request Rental <FaArrowRight className="group-hover:translate-x-1 transition" />
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

            {/* 3. RENTAL BOOKING FORM */}
            {mounted && isBookingOpen && activeUser && (
                defaultOpen ? (
                    <div className="w-full h-full">
                        <RentalBookingForm
                            rentalId={rentalId}
                            rentalName={rentalName}
                            rentalImage={rentalImage}
                            ownerLocation={ownerLocation}

                            // ✅ Pass all prices down
                            hourlyPrice={hourlyPrice}
                            dailyPrice={dailyPrice}
                            weeklyPrice={weeklyPrice}
                            monthlyPrice={monthlyPrice}
                            fixedPrice={fixedPrice}

                            userId={activeUser?.id}
                            userAddresses={effectiveAddresses}
                            userDetails={activeUser}
                            onSuccess={handleBookingSuccess}
                            onRequestClose={handleClose}
                        />
                    </div>
                ) : (
                    createPortal(
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
                                <button onClick={handleClose} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition backdrop-blur-sm">
                                    <FaXmark size={14} />
                                </button>
                                <RentalBookingForm
                                    rentalId={rentalId}
                                    rentalName={rentalName}
                                    rentalImage={rentalImage}
                                    ownerLocation={ownerLocation}

                                    // ✅ Pass all prices down
                                    hourlyPrice={hourlyPrice}
                                    dailyPrice={dailyPrice}
                                    weeklyPrice={weeklyPrice}
                                    monthlyPrice={monthlyPrice}
                                    fixedPrice={fixedPrice}

                                    userId={activeUser?.id}
                                    userAddresses={effectiveAddresses}
                                    userDetails={activeUser}
                                    onSuccess={handleBookingSuccess}
                                    onRequestClose={handleClose}
                                />
                            </div>
                        </div>,
                        document.body
                    )
                )
            )}

            {/* 4. SUCCESS MODAL */}
            {mounted && isSuccessOpen && (
                <SuccessModal
                    isOpen={isSuccessOpen}
                    onClose={() => {
                        setIsSuccessOpen(false);
                        if (onRequestClose) onRequestClose();
                    }}
                    title="Rental Requested!"
                    message={`Your request for ${rentalName} has been sent. The owner will review dates and approve shortly.`}
                    buttonText="View My Rentals"
                    onButtonClick={() => router.push('/profile/bookings')}
                />
            )}
        </>
    );
}