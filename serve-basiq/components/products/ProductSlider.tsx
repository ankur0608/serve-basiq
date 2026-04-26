"use client";

import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import SliderCard, { SliderItem } from "@/components/ui/SliderCard";

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
            // Scroll by roughly one card width (280px) + gap (16px)
            scrollRef.current.scrollBy({
                left: direction === "left" ? -296 : 296,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="w-full relative">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    {title}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm transition-all duration-300"
                        aria-label="Scroll left"
                    >
                        <FaChevronLeft size={12} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm transition-all duration-300"
                        aria-label="Scroll right"
                    >
                        <FaChevronRight size={12} />
                    </button>
                </div>
            </div>

            {/* ── Scrollable track ────────────────────────────────── */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map((prod) => (
                    <SliderCard key={prod.id} item={prod} currentUser={currentUser} />
                ))}
            </div>

            {/* Hide webkit scrollbar */}
            <style>{`
                div[data-slider]::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}