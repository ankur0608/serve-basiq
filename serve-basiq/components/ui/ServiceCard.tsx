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
// 'use client';

// import React, { useState, useMemo } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useSession } from 'next-auth/react';
// import { FaHeart, FaRegHeart, FaStar, FaXmark } from "react-icons/fa6";
// import { BadgeCheck, MapPin } from 'lucide-react';
// import BookingWrapper from '@/components/booking/BookingWrapper';

// export interface ServiceProps {
//     id: string;
//     name: string;
//     category: string;
//     image: string;
//     location: string;
//     rating: number;
//     price: number;
//     priceType: string;
//     isVerified?: boolean;
//     providerName?: string;
//     providerImage?: string | null;
//     reviewCount?: number;
//     user?: any;
//     // ✅ Added type to distinguish between Service and Rental
//     type?: 'SERVICE' | 'RENTAL';
// }

// interface ServiceCardProps {
//     service: ServiceProps;
//     isFav?: boolean;
//     toggleFav?: (e: React.MouseEvent) => void;
//     currentUser?: any;
//     index?: number;
// }

// export default function ServiceCard({ service, isFav = false, toggleFav, currentUser }: ServiceCardProps) {
//     const { data: session } = useSession();
//     const [showBooking, setShowBooking] = useState(false);

//     const {
//         id,
//         name,
//         category,
//         image,
//         location,
//         rating = 4.8,
//         reviewCount = 0,
//         price,
//         priceType,
//         user,
//         type = 'SERVICE' // ✅ Default to Service
//     } = service;

//     const displayImage = image || 'https://via.placeholder.com/500x300';
//     const providerName = service.providerName || user?.name || user?.shopName || "Verified Pro";

//     // ✅ DYNAMIC PATH: Redirects to /rentals/ or /services/ correctly
//     const detailPath = type === 'RENTAL' ? `/rentals/${id}` : `/services/${id}`;

//     const effectiveUser = useMemo(() => {
//         if (currentUser) return currentUser;
//         if (session?.user) {
//             return {
//                 ...session.user,
//                 id: (session.user as any).id,
//                 isPhoneVerified: (session.user as any).isPhoneVerified,
//                 addresses: []
//             };
//         }
//         return null;
//     }, [currentUser, session]);

//     const handleBookNow = (e: React.MouseEvent) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setShowBooking(true);
//     };

//     return (
//         <>
//             <Link
//                 href={detailPath} // ✅ Use dynamic path here
//                 className="group block w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black overflow-hidden relative"
//             >
//                 {/* --- Image Section --- */}
//                 <div className="relative h-48 w-full overflow-hidden bg-gray-100">
//                     <Image
//                         src={displayImage}
//                         alt={name || 'Service Image'}
//                         fill
//                         className="object-cover group-hover:scale-105 transition-transform duration-300"
//                     />
//                     <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 uppercase tracking-wide">
//                         {category || "Service"}
//                     </span>
//                     {toggleFav && (
//                         <button
//                             onClick={toggleFav}
//                             className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-gray-100 active:scale-95 transition-all z-10 flex items-center justify-center"
//                         >
//                             {isFav ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400" />}
//                         </button>
//                     )}
//                 </div>

//                 {/* --- Content Section --- */}
//                 <div className="p-4 space-y-3">
//                     <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
//                         <div className="flex items-center gap-1 truncate max-w-[60%]">
//                             <MapPin size={14} className="text-slate-400" />
//                             <span className="truncate">{location || 'Remote/Online'}</span>
//                         </div>
//                         {service.isVerified && (
//                             <span className="text-green-600 text-[10px] md:text-xs flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded-md border border-green-100 ml-auto">
//                                 <BadgeCheck size={12} /> Verified
//                             </span>
//                         )}
//                     </div>

//                     <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-1 group-hover:text-blue-700 transition-colors">
//                         {name}
//                     </h3>

//                     <div className="flex justify-between items-center text-sm text-gray-600">
//                         <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-100">
//                             <FaStar size={10} /> {rating} <span className="text-amber-600/60 font-medium">({reviewCount})</span>
//                         </div>
//                         <span className="text-xs text-gray-500">by <strong>{providerName}</strong></span>
//                     </div>

//                     <div className="flex items-baseline gap-1">
//                         <span className="text-lg font-bold text-slate-900">₹{price}</span>
//                         <span className="text-sm font-medium text-slate-500 lowercase">
//                             {priceType === 'HOURLY' ? '/ hr' : priceType === 'FIXED' ? '(fixed)' : '/ visit'}
//                         </span>
//                     </div>

//                     <div className="flex gap-3 pt-2">
//                         <div className="flex-1 text-center border border-gray-300 text-gray-700 rounded-xl py-2 text-sm font-bold hover:bg-gray-50 transition-colors">
//                             View Details
//                         </div>
//                         <button
//                             onClick={handleBookNow}
//                             className="flex-1 bg-black text-white rounded-xl py-2 text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
//                         >
//                             Book Now
//                         </button>
//                     </div>
//                 </div>
//             </Link>

//             {/* Modal Logic */}
//             {showBooking && (
//                 <div
//                     className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200"
//                     onClick={() => setShowBooking(false)}
//                 >
//                     <div className="relative w-full max-w-lg h-[92vh] md:h-[85vh] flex flex-col bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
//                         <button onClick={() => setShowBooking(false)} className="absolute top-4 right-4 z-50 p-2 bg-white/10 text-white rounded-full transition"><FaXmark size={20} /></button>
//                         <BookingWrapper
//                             serviceId={id}
//                             serviceName={name}
//                             price={price}
//                             currentUser={effectiveUser}
//                             userAddresses={effectiveUser?.addresses || []}
//                             defaultOpen={true}
//                             onRequestClose={() => setShowBooking(false)}
//                         />
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }