// 'use client';

// import { useState } from 'react';
// import { FaArrowRight, FaXmark } from 'react-icons/fa6';
// import BookingForm from './BookingForm'; // Import the form you created earlier
// import { useRouter } from 'next/navigation';

// interface Props {
//     serviceId: string;
//     serviceName: string;
//     price: number;
//     currentUserId?: string; // The ID of the person VIEWING the page
//     userAddresses: any[];    // Addresses of the person VIEWING the page
// }

// export default function BookingWrapper({
//     serviceId,
//     serviceName,
//     price,
//     currentUserId,
//     userAddresses
// }: Props) {
//     const [isOpen, setIsOpen] = useState(false);
//     const router = useRouter();

//     const handleOpen = () => {
//         if (!currentUserId) {
//             // Redirect to login if not authenticated
//             router.push('/login?callbackUrl=' + window.location.pathname);
//             return;
//         }
//         setIsOpen(true);
//     };

//     return (
//         <>
//             {/* THE BUTTON */}
//             <button
//                 onClick={handleOpen}
//                 className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-200"
//             >
//                 Proceed to Booking <FaArrowRight className="group-hover:translate-x-1 transition" />
//             </button>

//             {/* THE MODAL */}
//             {isOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
//                     <div className="relative w-full max-w-md">
//                         {/* Close Button */}
//                         <button
//                             onClick={() => setIsOpen(false)}
//                             className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition"
//                         >
//                             <FaXmark size={24} />
//                         </button>

//                         {/* The Form Component */}
//                         <BookingForm
//                             serviceId={serviceId}
//                             serviceName={serviceName}
//                             price={price}
//                             userId={currentUserId!}
//                             userAddresses={userAddresses}
//                             onRequestClose={() => setIsOpen(false)}
//                         />
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }

'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaArrowRight, FaXmark } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store"; // Assuming you have this

// Import the forms
import BookingForm from './BookingForm';
import MobileVerificationModal from './MobileVerificationModal';

interface Props {
    serviceId: string;
    serviceName: string;
    price: number;
    currentUser: any; // Contains: id, phone, isPhoneVerified
    userAddresses: any[];
}

export default function BookingWrapper({
    serviceId,
    serviceName,
    price,
    currentUser,
    userAddresses
}: Props) {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const onOpenLogin = useUIStore((state) => state.onOpenLogin); // Open your global login modal

    useEffect(() => {
        setMounted(true);
    }, []);

    // 🚦 THE LOGIC
    const handleProceedClick = () => {
        // 1. Not Logged In? -> Open Login Modal (or redirect)
        if (!currentUser) {
            // Option A: Redirect
            // router.push('/login?callbackUrl=' + window.location.pathname);

            // Option B: Open Global Login Modal (Better UX)
            if (onOpenLogin) onOpenLogin();
            else router.push('/login');

            return;
        }

        // 2. Logged in (Google) but Phone NOT Verified? -> Open Verification
        // We use the 'isPhoneVerified' key from your schema
        if (!currentUser.isPhoneVerified) {
            console.log("User logged in but phone not verified. Opening Mobile Modal.");
            setIsMobileModalOpen(true);
            return;
        }

        // 3. All Good? -> Open Booking Form
        setIsBookingOpen(true);
    };

    return (
        <>
            {/* --- 1. THE BUTTON --- */}
            <button
                onClick={handleProceedClick}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-200"
            >
                Proceed to Booking <FaArrowRight className="group-hover:translate-x-1 transition" />
            </button>

            {/* --- 2. MOBILE VERIFICATION MODAL (For Google Users) --- */}
            {mounted && isMobileModalOpen && (
                <MobileVerificationModal
                    userId={currentUser.id}
                    isOpen={isMobileModalOpen}
                    onClose={() => setIsMobileModalOpen(false)}
                    onSuccess={() => {
                        setIsMobileModalOpen(false); // Close verify modal
                        setIsBookingOpen(true);      // Open booking modal immediately
                        router.refresh();            // Update server data to reflect verified status
                    }}
                />
            )}

            {/* --- 3. BOOKING FORM MODAL --- */}
            {mounted && isBookingOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md">
                        <button
                            onClick={() => setIsBookingOpen(false)}
                            className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition"
                        >
                            <FaXmark size={24} />
                        </button>

                        <BookingForm
                            serviceId={serviceId}
                            serviceName={serviceName}
                            price={price}
                            userId={currentUser?.id}
                            userAddresses={userAddresses}
                            onRequestClose={() => setIsBookingOpen(false)}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}