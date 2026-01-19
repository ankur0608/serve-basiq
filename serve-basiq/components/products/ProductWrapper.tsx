'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaPaperPlane, FaXmark } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store"; // Ensure you have this or remove if not using global store

// Components
import ProductRequestForm from './ProductRequestForm';
import MobileVerificationModal from '@/components/booking/MobileVerificationModal'; // Adjust path if needed

interface Props {
    productId: string;
    productName: string;
    productPrice: number;
    productUnit: string;
    moq: number;
    currentUser: any; // ✅ Now accepts the full user object (id, phone, isPhoneVerified)
    userAddresses: any[];
}

export default function ProductWrapper({
    productId,
    productName,
    productPrice,
    productUnit,
    moq,
    currentUser,
    userAddresses
}: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const onOpenLogin = useUIStore((state) => state.onOpenLogin); // Optional global login

    useEffect(() => {
        setMounted(true);
    }, []);

    // 🚦 THE LOGIC
    const handleRequestClick = () => {
        // 1. Not Logged In? -> Redirect
        if (!currentUser) {
            if (onOpenLogin) onOpenLogin();
            else router.push('/login?callbackUrl=' + window.location.pathname);
            return;
        }

        // 2. Logged in but Phone NOT Verified? -> Open Verification
        if (!currentUser.isPhoneVerified) {
            console.log("User logged in but phone not verified. Opening Mobile Modal.");
            setIsMobileModalOpen(true);
            return;
        }

        // 3. All Good? -> Open Request Form
        setIsFormOpen(true);
    };

    return (
        <>
            {/* 1. THE TRIGGER BUTTON */}
            <button
                onClick={handleRequestClick}
                className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition transform active:scale-95 flex items-center justify-center gap-2"
            >
                Request Quote <FaPaperPlane />
            </button>

            {/* 2. MOBILE VERIFICATION MODAL */}
            {mounted && isMobileModalOpen && (
                <MobileVerificationModal
                    userId={currentUser.id}
                    isOpen={isMobileModalOpen}
                    onClose={() => setIsMobileModalOpen(false)}
                    onSuccess={() => {
                        setIsMobileModalOpen(false); // Close verify modal
                        setIsFormOpen(true);         // Open form immediately
                        router.refresh();            // Refresh server data
                    }}
                />
            )}

            {/* 3. PRODUCT REQUEST FORM MODAL */}
            {mounted && isFormOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md">
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition"
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
                            onRequestClose={() => setIsFormOpen(false)}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}