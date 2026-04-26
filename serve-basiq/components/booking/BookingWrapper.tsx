'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaArrowRight, FaXmark } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store";
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

import BookingForm from './BookingForm';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';
import SuccessModal from '@/components/ui/SuccessModal';

interface Props {
    serviceId: string;
    serviceName: string;
    price: number;
    type?: 'SERVICE' | 'PRODUCT' | 'RENTAL';
    priceType?: string;
    currentUser: any;
    userAddresses: any[];
    defaultOpen?: boolean;
    onRequestClose?: () => void;
}

export default function BookingWrapper({
    serviceId,
    serviceName,
    price,
    type,
    priceType,
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

    // ✅ FIX: Robust case-insensitive check
    const isQuote = priceType?.toUpperCase() === 'QUOTE';

    useEffect(() => {
        setMounted(true);
    }, []);

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

    const activeUser = currentUser || fetchedUser || session?.user;
    const effectiveAddresses = userAddresses?.length > 0 ? userAddresses : (fetchedUser?.addresses || []);

    const handleClose = () => {
        setIsBookingOpen(false);
        if (onRequestClose) onRequestClose();
    };

    const handleBookingSuccess = () => {
        setIsBookingOpen(false);
        setIsSuccessOpen(true);
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
            {!defaultOpen && (
                <button
                    onClick={handleProceedClick}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-200"
                >
                    {/* ✅ FIX: Button displays "To be discussed" */}
                    {isQuote ? 'Request Quote' : 'Proceed to Booking'}
                    <FaArrowRight className="group-hover:translate-x-1 transition" />
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
                        <BookingForm
                            serviceId={serviceId}
                            serviceName={serviceName}
                            price={price}
                            priceType={priceType}
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
                            <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] max-h-[88dvh] md:max-h-[85vh]">
                                <button onClick={handleClose} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition backdrop-blur-sm">
                                    <FaXmark size={14} />
                                </button>
                                <BookingForm
                                    serviceId={serviceId}
                                    serviceName={serviceName}
                                    price={price}
                                    priceType={priceType}
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

            {mounted && isSuccessOpen && (
                <SuccessModal
                    isOpen={isSuccessOpen}
                    onClose={() => {
                        setIsSuccessOpen(false);
                        if (onRequestClose) onRequestClose(); 
                    }}
                    title={isQuote ? "Quote Request Sent!" : "Booking Confirmed!"}
                    message={
                        isQuote
                            ? `Your quote request for ${serviceName} has been received. The provider will contact you shortly to discuss pricing.`
                            : `Your request for ${serviceName} has been received. The provider will contact you shortly.`
                    }
                    buttonText="View My Bookings"
                    onButtonClick={() => router.push('/profile/bookings')} 
                />
            )}
        </>
    );
}