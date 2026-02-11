'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaHeart, FaRegHeart, FaStar, FaXmark } from "react-icons/fa6";
import BookingWrapper from '@/components/booking/BookingWrapper';

export interface ServiceProps {
    id: string;
    name: string;
    categoryName: string;
    subcategoryName?: string;
    image: string;
    location: string;
    rating: number;
    reviewCount?: number;
    price: number;
    priceType: string;
    type: 'Service' | 'Rental';
}

interface ServiceCardProps {
    service: ServiceProps;
    isFav?: boolean;
    toggleFav?: (e: React.MouseEvent) => void;
    currentUser?: any;
}

export default function ServiceCard({ service, isFav = false, toggleFav, currentUser }: ServiceCardProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [showBooking, setShowBooking] = useState(false);

    const {
        id,
        name,
        categoryName,
        image,
        location,
        rating = 0,
        price,
        priceType,
        type = 'Service'
    } = service;

    const detailPath = type === 'Rental' ? `/rentals/${id}` : `/services/${id}`;

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
        e.stopPropagation();
        setShowBooking(true);
    };

    const handleDetailsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(detailPath);
    };

    return (
        <>
            {/* --- CARD COMPONENT --- */}
            <div
                onClick={() => router.push(detailPath)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow"
            >
                <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
                    <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm text-white uppercase tracking-wide ${type === 'Rental' ? 'bg-orange-500' : 'bg-blue-600'
                        }`}>
                        {categoryName}
                    </span>
                    {toggleFav && (
                        <button onClick={toggleFav} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow hover:bg-white transition-colors z-10">
                            {isFav ? <FaHeart size={12} className="text-red-500" /> : <FaRegHeart size={12} className="text-gray-400" />}
                        </button>
                    )}
                </div>

                <div className="p-3 flex flex-col gap-1 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate max-w-[65%]">📍 {location}</span>
                        <span className="flex items-center gap-1 text-yellow-500 font-medium"><FaStar size={10} /> {rating > 0 ? rating.toFixed(1) : 'New'}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5">₹{price} <span className="text-xs font-normal text-gray-500">/ {priceType.toLowerCase()}</span></div>

                    <div className="flex gap-2 mt-2 pt-1">
                        <button onClick={handleDetailsClick} className="flex-1 border border-gray-300 text-xs py-1.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors">Details</button>
                        <button onClick={handleBookClick} className="flex-1 bg-black text-white text-xs py-1.5 rounded-lg hover:bg-gray-800 font-medium shadow-sm transition-colors">Book</button>
                    </div>
                </div>
            </div>

            {/* --- STYLED BOOKING MODAL --- */}
            {showBooking && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setShowBooking(false)}
                >
                    <div
                        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* CLOSE BUTTON:
                            Positioned to float elegantly over the dark header of BookingWrapper.
                            Uses white text to contrast with the dark blue header.
                        */}
                        <button
                            onClick={() => setShowBooking(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/20 shadow-sm"
                            title="Close"
                        >
                            <FaXmark size={20} />
                        </button>

                        {/* Content Area - Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
                            {/* The Wrapper has its own dark header. 
                                We rely on that header to fill the top of the modal.
                            */}
                            <BookingWrapper
                                serviceId={id}
                                serviceName={name}
                                price={price}
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