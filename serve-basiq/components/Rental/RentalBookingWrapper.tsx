'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaArrowRight, FaXmark } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store";
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

import RentalBookingForm from './RentalBookingForm';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';
import SuccessModal from '@/components/ui/SuccessModal';

interface Props {
    rentalId: string;
    rentalName: string;
    rentalImage?: string;
    ownerLocation?: string;
    price: number,
    priceType?: string; // ✅ ADDED THIS TO FIX THE TYPESCRIPT ERROR
    hourlyPrice?: number;
    dailyPrice?: number;
    weeklyPrice?: number;
    monthlyPrice?: number;
    fixedPrice?: number;
    isAvailable?: boolean;
    type?: 'RENTAL';
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
    price,
    priceType, // ✅ DESTRUCTURED IT
    hourlyPrice,
    dailyPrice,
    weeklyPrice,
    monthlyPrice,
    fixedPrice,
    isAvailable = true,
    type = 'RENTAL',
    currentUser,
    userAddresses,
    defaultOpen = false,
    onRequestClose
}: Props) {
    const { data: session, status } = useSession();
    const [isBookingOpen, setIsBookingOpen] = useState(defaultOpen);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const onOpenLogin = useUIStore((state) => state.onOpenLogin);

    useEffect(() => { setMounted(true); }, []);

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
        if (defaultOpen && mounted) checkAndProceed();
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
            {!defaultOpen && (
                <button
                    onClick={handleProceedClick}
                    disabled={!isAvailable}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-200 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {!isAvailable
                        ? 'Currently Unavailable'
                        : (priceType === 'QUOTE' ? 'Request Quote' : 'Request Rental')}
                    {isAvailable && <FaArrowRight className="group-hover:translate-x-1 transition" />}
                </button>
            )}

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

            {mounted && isBookingOpen && activeUser && (
                defaultOpen ? (
                    <div className="w-full h-full">
                        <RentalBookingForm
                            rentalId={rentalId} rentalName={rentalName} rentalImage={rentalImage} ownerLocation={ownerLocation}
                            price={price} priceType={priceType} hourlyPrice={hourlyPrice} dailyPrice={dailyPrice} weeklyPrice={weeklyPrice} monthlyPrice={monthlyPrice} fixedPrice={fixedPrice}
                            isAvailable={isAvailable}
                            userId={activeUser?.id} userAddresses={effectiveAddresses} userDetails={activeUser}
                            onSuccess={handleBookingSuccess} onRequestClose={handleClose}
                        />
                    </div>
                ) : (
                    createPortal(
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                            {/* ✅ Changed rounded-[32px] to rounded-3xl to fix your warning */}
                            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
                                <button onClick={handleClose} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition backdrop-blur-sm">
                                    <FaXmark size={14} />
                                </button>
                                <RentalBookingForm
                                    rentalId={rentalId} rentalName={rentalName} rentalImage={rentalImage} ownerLocation={ownerLocation}
                                    price={price} priceType={priceType} hourlyPrice={hourlyPrice} dailyPrice={dailyPrice} weeklyPrice={weeklyPrice} monthlyPrice={monthlyPrice} fixedPrice={fixedPrice}
                                    isAvailable={isAvailable}
                                    userId={activeUser?.id} userAddresses={effectiveAddresses} userDetails={activeUser}
                                    onSuccess={handleBookingSuccess} onRequestClose={handleClose}
                                />
                            </div>
                        </div>,
                        document.body
                    )
                )
            )}

            {mounted && isSuccessOpen && (
                <SuccessModal
                    isOpen={isSuccessOpen}
                    onClose={() => {
                        setIsSuccessOpen(false);
                        if (onRequestClose) onRequestClose();
                    }}
                    title={priceType === 'QUOTE' ? "Quote Requested!" : "Rental Requested!"}
                    message={`Your request for ${rentalName} has been sent. The owner will review it and get back to you shortly.`}
                    buttonText="View My Requests"
                    onButtonClick={() => router.push('/profile/bookings')}
                />
            )}
        </>
    );
}