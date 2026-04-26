"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaHeart, FaRegHeart, FaStar, FaXmark, FaLocationDot } from "react-icons/fa6";
import AppImage from "@/components/ui/AppImage";
import RentalBookingWrapper from '@/components/Rental/RentalBookingWrapper';
import LoginModal from "@/components/auth/LoginModal";
import MobileVerificationModal from "@/components/auth/MobileVerificationModal";

export interface RentalProps {
    id: string;
    name: string;
    categoryName: string;
    image: string;
    location: string;
    rating: number;
    price: number;
    priceType: string;
    unit?: string; // ✅ Added unit just in case it's passed from the backend
    dailyPrice?: number | null;
    monthlyPrice?: number | null;
    fixedPrice?: number | null;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
}

interface RentalCardProps {
    rental: RentalProps;
    isFav?: boolean;
    toggleFav?: (e: React.MouseEvent) => void;
    currentUser?: any;
}

export default function RentalCard({ rental, isFav = false, toggleFav, currentUser }: RentalCardProps) {
    const router = useRouter();
    const { data: session, update } = useSession();

    // Modal states
    const [showBooking, setShowBooking] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const {
        id, name, categoryName, image, location, rating = 0,
        price, priceType, unit,
        dailyPrice, monthlyPrice, fixedPrice,
        addressLine1, addressLine2, city, state, pincode
    } = rental;

    // ✅ FIX: Robust case-insensitive check to determine if it's a quote
    const isQuote = priceType?.toUpperCase() === 'QUOTE' || unit?.toUpperCase() === 'QUOTE';

    const effectiveDailyPrice = dailyPrice ?? (priceType === 'DAILY' ? price : undefined);
    const effectiveMonthlyPrice = monthlyPrice ?? (priceType === 'MONTHLY' ? price : undefined);
    const effectiveFixedPrice = fixedPrice ?? (priceType === 'FIXED' ? price : undefined);

    let displayPrice = 0;
    if (priceType === 'DAILY') displayPrice = effectiveDailyPrice || 0;
    else if (priceType === 'MONTHLY') displayPrice = effectiveMonthlyPrice || 0;
    else if (priceType === 'FIXED') displayPrice = effectiveFixedPrice || 0;

    if (displayPrice === 0 && price > 0) displayPrice = price;

    const ownerAddress = useMemo(() => {
        return [addressLine1, addressLine2, city, state, pincode]
            .filter(part => part && part.trim() !== "")
            .join(", ");
    }, [addressLine1, addressLine2, city, state, pincode]);

    const effectiveUser = useMemo(() => {
        if (currentUser) return currentUser;
        if (session?.user) {
            return {
                ...session.user,
                id: (session.user as any).id,
                isPhoneVerified: (session.user as any).isPhoneVerified,
                phone: (session.user as any).phone,
                addresses: []
            };
        }
        return null;
    }, [currentUser, session]);

    // Handle scroll locking for all modals
    useEffect(() => {
        if (showBooking || showLoginModal || showVerifyModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [showBooking, showLoginModal, showVerifyModal]);

    const handleBookClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevents redirecting to details page

        if (!session) {
            setShowLoginModal(true);
            return;
        }

        if (!effectiveUser?.isPhoneVerified) {
            setShowVerifyModal(true);
            return;
        }

        setShowBooking(true);
    };

    const handleDetailsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/rentals/${id}`);
    };

    const handleVerificationSuccess = async () => {
        await update(); // Refresh session data
        setShowVerifyModal(false);
        setShowBooking(true);
    };

    return (
        <>
            <div onClick={handleDetailsClick} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow h-full relative">

                <div className="relative h-44 w-full bg-gray-100 overflow-hidden cursor-pointer">
                    <AppImage
                        src={image}
                        alt={name}
                        type="card"
                        className="absolute inset-0 w-full h-full [&_img]:group-hover:scale-105 [&_img]:transition-transform [&_img]:duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm text-white uppercase tracking-wide bg-orange-600 z-10">
                        {categoryName}
                    </span>

                    {toggleFav && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFav(e);
                            }}
                            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow hover:bg-white transition-colors z-10"
                        >
                            {isFav ? (
                                <FaHeart size={12} className="text-red-500" />
                            ) : (
                                <FaRegHeart size={12} className="text-gray-400" />
                            )}
                        </button>
                    )}
                </div>

                <div className="p-3 flex flex-col gap-1 flex-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{name}</h3>

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1 truncate max-w-[65%]">
                            <FaLocationDot size={10} className="text-gray-400" /> {location}
                        </span>
                        <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-1.5 rounded">
                            <FaStar size={10} /> {rating > 0 ? rating.toFixed(1) : 'New'}
                        </span>
                    </div>

                    <div className="text-sm font-bold text-gray-800 mt-2">
                        {/* ✅ FIX: Applied the robust isQuote logic */}
                        {isQuote ? (
                            <span className="text-blue-600">Custom Quote</span>
                        ) : (
                            <>
                                ₹{displayPrice.toLocaleString()} <span className="text-xs font-medium text-gray-400">/ {priceType?.toLowerCase() || 'day'}</span>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50">
                        <button onClick={handleDetailsClick} className="flex-1 border border-gray-200 text-xs py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-bold transition-colors">Details</button>

                        <button onClick={handleBookClick} className="flex-1 bg-black text-white text-xs py-2 rounded-lg hover:bg-gray-800 font-bold shadow-sm transition-colors">
                            {/* ✅ FIX: Update button text if it is a quote */}
                            {isQuote ? 'Request Quote' : 'Book'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                initialStep="INPUT_DETAILS"
                initialRole="user"
            />

            <MobileVerificationModal
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                onSuccess={handleVerificationSuccess}
                userId={effectiveUser?.id || ""}
            />

            {showBooking && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setShowBooking(false); }}>
                    <div className="relative w-full max-w-sm md:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setShowBooking(false)} className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/20 shadow-sm">
                            <FaXmark size={18} />
                        </button>

                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
                            <RentalBookingWrapper
                                rentalId={id}
                                rentalName={name}
                                rentalImage={image}
                                ownerLocation={ownerAddress}
                                price={price}
                                priceType={priceType} // ✅ PASSED PRICETYPE HERE TO FIX THE ERROR
                                dailyPrice={typeof effectiveDailyPrice === 'number' ? effectiveDailyPrice : undefined}
                                monthlyPrice={typeof effectiveMonthlyPrice === 'number' ? effectiveMonthlyPrice : undefined}
                                fixedPrice={typeof effectiveFixedPrice === 'number' ? effectiveFixedPrice : undefined}
                                currentUser={effectiveUser}
                                userAddresses={effectiveUser?.addresses || []}
                                defaultOpen={true}
                                onRequestClose={() => setShowBooking(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}