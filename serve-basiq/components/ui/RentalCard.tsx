"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaHeart, FaRegHeart, FaStar, FaXmark, FaLocationDot } from "react-icons/fa6";
import AppImage from "@/components/ui/AppImage";
import RentalBookingWrapper from '@/components/Rental/RentalBookingWrapper';

export interface RentalProps {
    id: string;
    name: string;
    categoryName: string;
    image: string;
    location: string;
    rating: number;
    price: number;
    priceType: string;
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
    const { data: session } = useSession();
    const [showBooking, setShowBooking] = useState(false);

    const {
        id, name, categoryName, image, location, rating = 0,
        price, priceType,
        dailyPrice, monthlyPrice, fixedPrice,
        addressLine1, addressLine2, city, state, pincode
    } = rental;

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
                addresses: []
            };
        }
        return null;
    }, [currentUser, session]);

    const handleBookClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevents redirecting to details page
        setShowBooking(true);
    };

    const handleDetailsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/rentals/${id}`);
    };

    return (
        <>
            {/* The Outer Div makes the ENTIRE card clickable */}
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
                                e.stopPropagation(); // Prevents redirecting to details page
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

                    <div className="text-sm font-bold text-gray-900 mt-2">
                        ₹{displayPrice} <span className="text-xs font-medium text-gray-400">/ {priceType?.toLowerCase() || 'day'}</span>
                    </div>

                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50">
                        <button onClick={handleDetailsClick} className="flex-1 border border-gray-200 text-xs py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-bold transition-colors">Details</button>
                        <button onClick={handleBookClick} className="flex-1 bg-slate-900 text-white text-xs py-2 rounded-lg hover:bg-slate-800 font-bold shadow-sm transition-colors">Book</button>
                    </div>
                </div>
            </div>

            {showBooking && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={(e) => { e.stopPropagation(); setShowBooking(false); }}>
                    <div className="relative w-full max-w-sm md:max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
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