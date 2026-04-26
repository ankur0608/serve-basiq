"use client";

import React, { memo } from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";

import ProductWrapper from '@/components/products/ProductWrapper';
import RentalBookingWrapper from '@/components/Rental/RentalBookingWrapper';
import BookingWrapper from '@/components/booking/BookingWrapper';

export interface SliderItem {
    id: string;
    name: string;
    price: number;
    priceType?: string;
    unit?: string;
    productImage: string | null;
    gallery?: string[];
    category?: { name: string } | null;
    listingType?: 'PRODUCT' | 'SERVICE' | 'RENTAL';
    moq?: number;
    hourlyPrice?: number | null;
    dailyPrice?: number | null;
    weeklyPrice?: number | null;
    monthlyPrice?: number | null;
    fixedPrice?: number | null;
    ownerLocation?: string;
}

interface SliderCardProps {
    item: SliderItem;
    currentUser?: any;
}

const SliderCard = memo(({ item, currentUser }: SliderCardProps) => {
    const img =
        item.productImage ||
        (item.gallery && item.gallery[0]) ||
        "https://images.unsplash.com/photo-1586769852044-692d6e3703f0";

    const type = item.listingType || 'PRODUCT';
    let linkPath = `/products/${item.id}`;
    if (type === 'SERVICE') linkPath = `/services/${item.id}`;
    if (type === 'RENTAL') linkPath = `/rentals/${item.id}`;

    const isQuote =
        item.priceType?.toUpperCase() === 'QUOTE' ||
        item.unit?.toUpperCase() === 'QUOTE' ||
        !item.price ||
        Number(item.price) === 0;
    // Price unit label
    const priceUnit =
        type === 'PRODUCT'
            ? item.unit?.toLowerCase() || 'piece'
            : type === 'RENTAL'
                ? item.priceType?.toLowerCase() || 'day'
                : item.priceType?.toUpperCase() === 'HOURLY' ? 'hour' : 'fixed';

    return (
        <div className="group relative shrink-0 w-[260px] sm:w-[280px] bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col overflow-hidden snap-start">

            {/* ── Image + category badge ───────────────────────────── */}
            <Link href={linkPath} className="grow flex flex-col outline-none">
                <div className="aspect-[4/3] w-full bg-slate-50 relative overflow-hidden">
                    <AppImage
                        src={img}
                        alt={item.name}
                        type="thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {item.category && (
                        <div className="absolute top-2 left-2 z-10">
                            <span className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-extrabold text-slate-700 uppercase tracking-widest shadow-sm">
                                {item.category.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Name + price ─────────────────────────────────── */}
                <div className="p-4 pb-2 flex flex-col grow">
                    <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                        {item.name}
                    </h4>

                    <div className="mt-auto pb-1">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block mb-0.5">
                            {isQuote ? 'Pricing' : 'Price'}
                        </span>

                        {isQuote ? (
                            /* ── QUOTE: just show label, no number ── */
                            <span className="text-blue-600 font-black text-base">
                                Custom Quote
                            </span>
                        ) : (
                            /* ── Fixed / hourly / per-day price ─── */
                            <p className="flex items-baseline gap-0.5">
                                <span className="text-slate-900 font-black text-lg">
                                    ₹{Number(item.price).toLocaleString()}
                                </span>
                                <span className="text-slate-400 text-xs">/{priceUnit}</span>
                            </p>
                        )}
                    </div>
                </div>
            </Link>

            {/* ── CTA / booking button ─────────────────────────────── */}
            <div className="p-4 pt-2 bg-white relative z-20">
                {type === 'PRODUCT' && (
                    <ProductWrapper
                        productId={item.id}
                        productName={item.name}
                        productPrice={Number(item.price)}
                        priceType={item.priceType}
                        productUnit={item.unit || 'PIECE'}
                        moq={Number(item.moq) || 1}
                        currentUser={currentUser}
                        userAddresses={currentUser?.addresses || []}
                    />
                )}

                {type === 'RENTAL' && (
                    <RentalBookingWrapper
                        rentalId={item.id}
                        rentalName={item.name}
                        rentalImage={img}
                        ownerLocation={item.ownerLocation || 'Location not specified'}
                        price={Number(item.price)}
                        priceType={item.priceType}
                        hourlyPrice={item.hourlyPrice ?? undefined}
                        dailyPrice={item.dailyPrice ?? undefined}
                        weeklyPrice={item.weeklyPrice ?? undefined}
                        monthlyPrice={item.monthlyPrice ?? undefined}
                        fixedPrice={item.fixedPrice ?? undefined}
                        currentUser={currentUser}
                        userAddresses={currentUser?.addresses || []}
                    />
                )}

                {type === 'SERVICE' && (
                    <BookingWrapper
                        serviceId={item.id}
                        serviceName={item.name}
                        price={Number(item.price)}
                        priceType={item.priceType}
                        currentUser={currentUser}
                        userAddresses={currentUser?.addresses || []}
                    />
                )}
            </div>
        </div>
    );
});

SliderCard.displayName = "SliderCard";
export default SliderCard;