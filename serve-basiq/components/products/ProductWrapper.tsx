'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaPaperPlane, FaXmark } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store";

// Components
import ProductRequestForm from './ProductRequestForm';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';

interface Props {
    productId: string;
    productName: string;
    productPrice: number;
    productUnit: string;
    moq: number;
    currentUser: any;
    userAddresses: any[];
    defaultOpen?: boolean; 
    onRequestClose?: () => void;
}

export default function ProductWrapper({
    productId,
    productName,
    productPrice,
    productUnit,
    moq,
    currentUser,
    userAddresses,
    defaultOpen = false,
    onRequestClose
}: Props) {
    const [isFormOpen, setIsFormOpen] = useState(defaultOpen);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const onOpenLogin = useUIStore((state) => state.onOpenLogin);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClose = () => {
        setIsFormOpen(false);
        if (onRequestClose) onRequestClose();
    };

    // Logic to validate user before showing form
    const checkAndProceed = () => {
        if (!currentUser) {
            handleClose(); 
            if (onOpenLogin) onOpenLogin();
            else router.push('/login?callbackUrl=' + window.location.pathname);
            return;
        }

        if (!currentUser.isPhoneVerified) {
            setIsMobileModalOpen(true);
            return;
        }

        // Only open form if verified
        setIsFormOpen(true);
    };

    // If defaultOpen is true (e.g. inside Modal), run check immediately
    useEffect(() => {
        if (defaultOpen && mounted) {
            checkAndProceed();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultOpen, mounted]);

    const handleRequestClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        checkAndProceed();
    };

    return (
        <>
            {/* 1. BUTTON: Only show if NOT defaultOpen (e.g. on Details Page Bottom Bar) */}
            {!defaultOpen && (
                <button
                    onClick={handleRequestClick}
                    className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                    Request Quote <FaPaperPlane />
                </button>
            )}

            {/* 2. MOBILE VERIFICATION MODAL */}
            {mounted && isMobileModalOpen && (
                <MobileVerificationModal
                    userId={currentUser?.id}
                    isOpen={isMobileModalOpen}
                    onClose={() => {
                        setIsMobileModalOpen(false);
                        if(defaultOpen) handleClose();
                    }}
                    onSuccess={() => {
                        setIsMobileModalOpen(false);
                        setIsFormOpen(true);
                        router.refresh();
                    }}
                />
            )}

            {/* 3. PRODUCT REQUEST FORM */}
            {mounted && isFormOpen && (
                defaultOpen ? (
                    // ✅ INLINE MODE (For ProductCard Modal)
                    <div className="w-full h-full">
                        <ProductRequestForm
                            productId={productId}
                            productName={productName}
                            price={productPrice}
                            unit={productUnit}
                            moq={moq}
                            userId={currentUser?.id}
                            userAddresses={userAddresses}
                            onRequestClose={handleClose}
                        />
                    </div>
                ) : (
                    // ✅ PORTAL MODE (For standalone button usage)
                    createPortal(
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition z-10"
                                >
                                    <FaXmark size={24} />
                                </button>
                                <ProductRequestForm
                                    productId={productId}
                                    productName={productName}
                                    price={productPrice}
                                    unit={productUnit}
                                    moq={moq}
                                    userId={currentUser?.id}
                                    userAddresses={userAddresses}
                                    onRequestClose={handleClose}
                                />
                            </div>
                        </div>,
                        document.body
                    )
                )
            )}
        </>
    );
}