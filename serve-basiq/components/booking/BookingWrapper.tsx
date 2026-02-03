'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaArrowRight, FaXmark } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store";

// Import the forms
import BookingForm from './BookingForm';
import MobileVerificationModal from '../auth/MobileVerificationModal';

interface Props {
    serviceId: string;
    serviceName: string;
    price: number;
    currentUser: any;
    userAddresses: any[];
    defaultOpen?: boolean; 
    onRequestClose?: () => void; // ✅ Added this prop to handle closing from parent
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
    const [isBookingOpen, setIsBookingOpen] = useState(defaultOpen);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const onOpenLogin = useUIStore((state) => state.onOpenLogin);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper to close: Call internal state setter AND parent's close function if provided
    const handleClose = () => {
        setIsBookingOpen(false);
        if (onRequestClose) onRequestClose();
    };

    const handleProceedClick = () => {
        if (!currentUser) {
            if (onOpenLogin) onOpenLogin();
            else router.push('/login');
            return;
        }

        if (!currentUser.isPhoneVerified) {
            console.log("User logged in but phone not verified. Opening Mobile Modal.");
            setIsMobileModalOpen(true);
            return;
        }

        setIsBookingOpen(true);
    };

    return (
        <>
            {/* --- 1. THE BUTTON (Hide if defaultOpen is true) --- */}
            {!defaultOpen && (
                <button
                    onClick={handleProceedClick}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-200"
                >
                    Proceed to Booking <FaArrowRight className="group-hover:translate-x-1 transition" />
                </button>
            )}

            {/* --- 2. MOBILE VERIFICATION MODAL --- */}
            {mounted && isMobileModalOpen && (
                <MobileVerificationModal
                    userId={currentUser.id}
                    isOpen={isMobileModalOpen}
                    onClose={() => setIsMobileModalOpen(false)}
                    onSuccess={() => {
                        setIsMobileModalOpen(false);
                        setIsBookingOpen(true);
                        router.refresh();
                    }}
                />
            )}

            {/* --- 3. BOOKING FORM --- */}
            {mounted && isBookingOpen && (
                defaultOpen ? (
                    // ✅ Render INLINE (for ProductCard Modal)
                    <div className="w-full h-full">
                        <BookingForm
                            serviceId={serviceId}
                            serviceName={serviceName}
                            price={price}
                            userId={currentUser?.id}
                            userAddresses={userAddresses}
                            onRequestClose={handleClose} 
                        />
                    </div>
                ) : (
                    // ✅ Render PORTAL (for Service Details Page)
                    createPortal(
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-20"
                                >
                                    <FaXmark size={20} />
                                </button>

                                <BookingForm
                                    serviceId={serviceId}
                                    serviceName={serviceName}
                                    price={price}
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