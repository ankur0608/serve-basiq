"use client";

import { useRef } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import AppImage from "@/components/ui/AppImage";

interface BasicProduct {
    id: string;
    name: string;
    price: number | string;
    unit: string;
    productImage: string | null;
    gallery: string[];
    category?: { name: string } | null;
}

interface ProductSliderProps {
    title: string;
    products: BasicProduct[];
}

export default function ProductSlider({ title, products }: ProductSliderProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (!products || products.length === 0) return null;

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            // Dynamically scroll by the exact visible width of the container
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

                {/* Modern Navigation Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm transition-all duration-300"
                        aria-label="Scroll left"
                    >
                        <FaChevronLeft className="text-sm pr-0.5" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm transition-all duration-300"
                        aria-label="Scroll right"
                    >
                        <FaChevronRight className="text-sm pl-0.5" />
                    </button>
                </div>
            </div>

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6 pt-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map((prod) => {
                    const img = prod.productImage || (prod.gallery && prod.gallery[0]) || "https://images.unsplash.com/photo-1586769852044-692d6e3703f0";

                    return (
                        <Link
                            href={`/products/${prod.id}`}
                            key={prod.id}
                            // MATHEMATICAL SIZING:
                            // Mobile: Fixed 240px wide
                            // Tablet (md): Exactly 3 items -> calc(33.333% - 11px)
                            // Desktop (lg): Exactly 4 items -> calc(25% - 12px)
                            className="group relative shrink-0 w-[240px] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] snap-start bg-white rounded-2xl border border-slate-100 hover:border-transparent hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col overflow-hidden"
                        >
                            {/* Image Wrapper */}
                            <div className="aspect-square w-full bg-slate-50 relative overflow-hidden">
                                <AppImage
                                    src={img}
                                    alt={prod.name}
                                    type="thumbnail"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />

                                {/* Blurred Category Badge */}
                                {prod.category && (
                                    <div className="absolute top-2 left-2 z-10">
                                        <span className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-[6px] text-[9px] font-extrabold text-slate-700 uppercase tracking-widest shadow-sm">
                                            {prod.category.name}
                                        </span>
                                    </div>
                                )}

                                {/* Subtle overlay on hover */}
                                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Card Content */}
                            <div className="p-4 flex flex-col flex-grow bg-white">
                                <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                                    {prod.name}
                                </h4>

                                <div className="mt-auto flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5 font-bold">Price</span>
                                        <p className="text-sm font-medium text-slate-500">
                                            <span className="text-slate-900 font-black text-lg md:text-xl">₹{prod.price}</span>
                                            <span className="text-slate-400 ml-0.5 text-xs">/{prod.unit}</span>
                                        </p>
                                    </div>

                                    {/* Modern Arrow Indicator */}
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Inline style to hide scrollbar */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
}