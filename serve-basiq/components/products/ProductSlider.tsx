"use client";

import { useRef } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import AppImage from "@/components/ui/AppImage";

// Import your wrappers
import ProductWrapper from '@/components/products/ProductWrapper';
import RentalBookingWrapper from '@/components/Rental/RentalBookingWrapper';
import BookingWrapper from '@/components/booking/BookingWrapper';

export interface SliderItem {
    id: string;
    name: string;
    price: number;
    unit?: string;
    productImage: string | null;
    gallery?: string[];
    category?: { name: string } | null;

    // Additional fields needed for the wrappers
    listingType?: 'PRODUCT' | 'SERVICE' | 'RENTAL';
    moq?: number;
    hourlyPrice?: number | null;
    dailyPrice?: number | null;
    // 👉 FIX 1: Added weeklyPrice to the interface
    weeklyPrice?: number | null;
    monthlyPrice?: number | null;
    fixedPrice?: number | null;
    ownerLocation?: string;
}

interface ProductSliderProps {
    title: string;
    products: SliderItem[];
    currentUser?: any;
}

export default function ProductSlider({ title, products, currentUser }: ProductSliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (!products || products.length === 0) return null;

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="w-full mt-16 mb-8 relative">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h3>

                <div className="flex items-center gap-2">
                    <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm transition-all duration-300" aria-label="Scroll left">
                        <FaChevronLeft className="text-sm pr-0.5" />
                    </button>
                    <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm transition-all duration-300" aria-label="Scroll right">
                        <FaChevronRight className="text-sm pl-0.5" />
                    </button>
                </div>
            </div>

            <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 pt-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {products.map((prod) => {
                    const img = prod.productImage || (prod.gallery && prod.gallery[0]) || "https://images.unsplash.com/photo-1586769852044-692d6e3703f0";

                    const type = prod.listingType || 'PRODUCT';
                    let linkPath = `/products/${prod.id}`;
                    if (type === 'SERVICE') linkPath = `/services/${prod.id}`;
                    if (type === 'RENTAL') linkPath = `/rentals/${prod.id}`;

                    return (
                        <div key={prod.id} className="group relative shrink-0 w-64 md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] snap-start bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col overflow-hidden">

                            <Link href={linkPath} className="grow flex flex-col outline-none">
                                <div className="aspect-square w-full bg-slate-50 relative overflow-hidden">
                                    <AppImage src={img} alt={prod.name} type="thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                    {prod.category && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <span className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-extrabold text-slate-700 uppercase tracking-widest shadow-sm">
                                                {prod.category.name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 pb-2 flex flex-col grow bg-white">
                                    <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                                        {prod.name}
                                    </h4>
                                    <div className="mt-auto flex items-end justify-between pb-2">
                                        <div className="flex flex-col">
                                            <span className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5 font-bold">Price</span>
                                            <p className="text-sm font-medium text-slate-500">
                                                <span className="text-slate-900 font-black text-lg md:text-xl">₹{Number(prod.price).toLocaleString()}</span>
                                                {prod.unit && <span className="text-slate-400 ml-0.5 text-xs">/{prod.unit}</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <div className="p-4 pt-2 bg-white relative z-20">
                                {type === 'PRODUCT' && (
                                    <ProductWrapper
                                        productId={prod.id}
                                        productName={prod.name}
                                        productPrice={Number(prod.price)}
                                        productUnit={prod.unit || 'PIECE'}
                                        moq={Number(prod.moq) || 1}
                                        currentUser={currentUser}
                                        userAddresses={currentUser?.addresses || []}
                                    />
                                )}

                                {type === 'RENTAL' && (
                                    <RentalBookingWrapper
                                        rentalId={prod.id}
                                        rentalName={prod.name}
                                        rentalImage={img}
                                        ownerLocation={prod.ownerLocation || 'Location not specified'}
                                        price={Number(prod.price)}
                                        hourlyPrice={prod.hourlyPrice ?? undefined}
                                        dailyPrice={prod.dailyPrice ?? undefined}
                                        // 👉 FIX 2: Passed weeklyPrice to the wrapper
                                        weeklyPrice={prod.weeklyPrice ?? undefined}
                                        monthlyPrice={prod.monthlyPrice ?? undefined}
                                        fixedPrice={prod.fixedPrice ?? undefined}
                                        currentUser={currentUser}
                                        userAddresses={currentUser?.addresses || []}
                                    />
                                )}

                                {type === 'SERVICE' && (
                                    <BookingWrapper
                                        serviceId={prod.id}
                                        serviceName={prod.name}
                                        price={Number(prod.price)}
                                        currentUser={currentUser}
                                        userAddresses={currentUser?.addresses || []}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.scrollbar-hide::-webkit-scrollbar { display: none; }` }} />
        </div>
    );
}