'use client';

import { useState } from 'react';
import { FaArrowRight, FaXmark } from 'react-icons/fa6';
import BookingForm from './BookingForm'; // Import the form you created earlier
import { useRouter } from 'next/navigation';

interface Props {
    serviceId: string;
    serviceName: string;
    price: number;
    currentUserId?: string; // The ID of the person VIEWING the page
    userAddresses: any[];    // Addresses of the person VIEWING the page
}

export default function BookingWrapper({
    serviceId,
    serviceName,
    price,
    currentUserId,
    userAddresses
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleOpen = () => {
        if (!currentUserId) {
            // Redirect to login if not authenticated
            router.push('/login?callbackUrl=' + window.location.pathname);
            return;
        }
        setIsOpen(true);
    };

    return (
        <>
            {/* THE BUTTON */}
            <button
                onClick={handleOpen}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-200"
            >
                Proceed to Booking <FaArrowRight className="group-hover:translate-x-1 transition" />
            </button>

            {/* THE MODAL */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition"
                        >
                            <FaXmark size={24} />
                        </button>

                        {/* The Form Component */}
                        <BookingForm
                            serviceId={serviceId}
                            serviceName={serviceName}
                            price={price}
                            userId={currentUserId!}
                            userAddresses={userAddresses}
                            onRequestClose={() => setIsOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}