'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa6";
import { BadgeCheck, MapPin } from 'lucide-react';
import BookingWrapper from '@/components/booking/BookingWrapper';

// ✅ FIX 1: Add 'export' here so other files can import it
export interface ServiceProps {
    id: string;
    name: string;
    category: string;
    image: string;
    location: string;
    rating: number;
    price: number;
    priceType: string;
    isVerified?: boolean;
    providerName?: string;
    providerImage?: string | null;
    reviewCount?: number;
    user?: any; 
}

// ✅ FIX 2: Make interactive props optional so Server Components can use this card
interface ServiceCardProps {
    service: ServiceProps;
    isFav?: boolean;                       
    toggleFav?: (e: React.MouseEvent) => void; 
    currentUser?: any;
    index?: number;
}

export default function ServiceCard({ service, isFav = false, toggleFav, currentUser }: ServiceCardProps) {
    const [showBooking, setShowBooking] = useState(false);

    const {
        id,
        name,
        category,
        image,
        location,
        rating = 4.8,
        reviewCount = 0,
        price,
        priceType,
        user
    } = service;

    const displayImage = image || 'https://via.placeholder.com/500x300';
    
    // Fallback logic for provider name
    const providerName = service.providerName || user?.name || user?.shopName || "Verified Pro";

    const handleBookNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowBooking(true);
    };

    return (
        <>
            <Link
                href={`/services/${id}`}
                className="group block w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black overflow-hidden relative"
            >
                {/* --- Image Section --- */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <Image
                        src={displayImage}
                        alt={name || 'Service Image'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge: Category */}
                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 uppercase tracking-wide">
                        {category || "Service"}
                    </span>

                    {/* Wishlist Button - Only show if toggleFav is passed */}
                    {toggleFav && (
                        <button
                            onClick={toggleFav}
                            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-gray-100 active:scale-95 transition-all z-10 flex items-center justify-center"
                        >
                            {isFav ? (
                                <FaHeart className="text-red-500 text-sm md:text-base" />
                            ) : (
                                <FaRegHeart className="text-gray-400 text-sm md:text-base hover:text-red-400" />
                            )}
                        </button>
                    )}
                </div>

                {/* --- Content Section --- */}
                <div className="p-4 space-y-3">
                    
                    {/* Location + Verified */}
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-1 truncate max-w-[60%]">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="truncate">{location || 'Remote/Online'}</span>
                        </div>
                        {service.isVerified && (
                            <span className="text-green-600 text-[10px] md:text-xs flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded-md border border-green-100 ml-auto">
                                <BadgeCheck size={12} /> Verified
                            </span>
                        )}
                    </div>

                    {/* Service Name */}
                    <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-1 group-hover:text-blue-700 transition-colors">
                        {name}
                    </h3>

                    {/* Rating + Provider */}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-100">
                            <FaStar size={10} /> {rating} <span className="text-amber-600/60 font-medium">({reviewCount})</span>
                        </div>
                        <span className="text-xs text-gray-500">by <strong>{providerName}</strong></span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-900">₹{price}</span>
                        <span className="text-sm font-medium text-slate-500 lowercase">
                            {priceType === 'HOURLY' ? '/ hr' : priceType === 'FIXED' ? '(fixed)' : '/ visit'}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-2 text-sm font-bold hover:bg-gray-50 transition-colors">
                            View Details
                        </button>
                        <button
                            onClick={handleBookNow}
                            className="flex-1 bg-black text-white rounded-xl py-2 text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </Link>

            {/* Modal Logic */}
            {showBooking && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setShowBooking(false); 
                    }}
                >
                    <div className="w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
                        <BookingWrapper
                            serviceId={id}
                            serviceName={name}
                            price={price}
                            currentUser={currentUser}
                            userAddresses={currentUser?.addresses || []}
                            defaultOpen={true}
                            onRequestClose={() => setShowBooking(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}