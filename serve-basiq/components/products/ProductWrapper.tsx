'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaPaperPlane, FaXmark } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store";
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

import ProductRequestForm from './ProductRequestForm';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';
import SuccessModal from '@/components/ui/SuccessModal';

interface Props {
    productId: string;
    productName: string;
    productPrice: number;
    priceType?: string; 
    productUnit: string;
    moq: number;
    type?: 'SERVICE' | 'PRODUCT' | 'RENTAL';
    currentUser: any;
    userAddresses: any[];
    defaultOpen?: boolean;
    onRequestClose?: () => void;
}

export default function ProductWrapper({
    productId,
    productName,
    productPrice,
    priceType, 
    type,
    productUnit,
    moq,
    currentUser,
    userAddresses,
    defaultOpen = false,
    onRequestClose
}: Props) {
    const { data: session, status } = useSession();

    // States
    const [isFormOpen, setIsFormOpen] = useState(defaultOpen);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const onOpenLogin = useUIStore((state) => state.onOpenLogin);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isPropUserIncomplete = currentUser && (currentUser.isPhoneVerified === undefined || !currentUser.addresses);
    const shouldFetch = status === "authenticated" && (!currentUser || isPropUserIncomplete);

    const { data: fetchedUser, isLoading: isFetchingUser, refetch: refetchUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        enabled: shouldFetch,
        staleTime: 0,
    });

    const activeUser = fetchedUser || (isPropUserIncomplete ? null : currentUser) || null;

    const effectiveAddresses = (activeUser?.addresses && activeUser.addresses.length > 0)
        ? activeUser.addresses
        : (userAddresses || []);

    const handleClose = () => {
        setIsFormOpen(false);
        if (onRequestClose) onRequestClose();
    };

    const handleRequestSuccess = () => {
        setIsFormOpen(false);
        setIsSuccessOpen(true);
    };

    const checkAndProceed = () => {
        if (status === "loading" || (shouldFetch && isFetchingUser)) return;

        if (!activeUser && !session) {
            handleClose();
            if (onOpenLogin) onOpenLogin();
            else router.push('/login?callbackUrl=' + window.location.pathname);
            return;
        }

        if (activeUser && activeUser.isPhoneVerified !== true) {
            setIsMobileModalOpen(true);
            return;
        }

        setIsFormOpen(true);
    };

    useEffect(() => {
        if (defaultOpen && mounted) {
            checkAndProceed();
        }
    }, [defaultOpen, mounted, status, isFetchingUser, activeUser]);

    useEffect(() => {
        if (isFormOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isFormOpen]);

    const handleRequestClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        checkAndProceed();
    };

    // ✅ ROBUST QUOTE CHECK
    const isQuote = priceType?.toUpperCase() === 'QUOTE' || Number(productPrice) === 0 || !productPrice;

    if (defaultOpen && (status === "loading" || (shouldFetch && isFetchingUser))) {
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
                    onClick={handleRequestClick}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-[0.98]"
                >
                    {isQuote ? 'Request Quote' : 'Order Now'} <FaPaperPlane size={16} />
                </button>
            )}

            {mounted && isMobileModalOpen && (
                <MobileVerificationModal
                    userId={activeUser?.id || (session?.user as any)?.id}
                    isOpen={isMobileModalOpen}
                    onClose={() => {
                        setIsMobileModalOpen(false);
                        if (defaultOpen) handleClose();
                    }}
                    onSuccess={async () => {
                        setIsMobileModalOpen(false);
                        await refetchUser();
                        setIsFormOpen(true);
                        router.refresh();
                    }}
                />
            )}

            {/* PRODUCT REQUEST FORM */}
            {mounted && isFormOpen && activeUser && (
                defaultOpen ? (
                    <div className="w-full h-full">
                        <ProductRequestForm
                            productId={productId}
                            productName={productName}
                            price={productPrice}
                            priceType={priceType} 
                            unit={productUnit}
                            moq={moq}
                            userId={activeUser?.id}
                            userAddresses={effectiveAddresses}
                            userDetails={activeUser}
                            onSuccess={handleRequestSuccess}
                            onRequestClose={handleClose}
                        />
                    </div>
                ) : (
                    createPortal(
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                
                                {/* ✅ FIX: Solid white close button so it doesn't get lost in the dark header */}
                                <button
                                    onClick={handleClose}
                                    className="absolute top-3 right-3 z-[60] w-8 h-8 flex items-center justify-center bg-white text-slate-900 hover:bg-gray-100 rounded-full shadow-md transition"
                                >
                                    <FaXmark size={14} />
                                </button>
                                
                                <ProductRequestForm
                                    productId={productId}
                                    productName={productName}
                                    price={productPrice}
                                    priceType={priceType} 
                                    unit={productUnit}
                                    moq={moq}
                                    userId={activeUser?.id}
                                    userAddresses={effectiveAddresses}
                                    userDetails={activeUser}
                                    onSuccess={handleRequestSuccess}
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
                    title={isQuote ? "Quote Requested!" : "Order Requested!"}
                    message={`Your ${isQuote ? 'quote' : 'order'} request for ${productName} has been sent successfully.`}
                    buttonText="View My Orders"
                    onButtonClick={() => router.push('/profile/orders')}
                />
            )}
        </>
    );
}