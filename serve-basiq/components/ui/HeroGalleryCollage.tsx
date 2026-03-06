"use client";

import React from 'react';
import AppImage from '@/components/ui/AppImage';
import { FaImages } from 'react-icons/fa6';

interface HeroGalleryCollageProps {
    images: string[];
    altText: string;
    onViewAll?: () => void;
}

export default function HeroGalleryCollage({ images, altText, onViewAll }: HeroGalleryCollageProps) {
    if (!images || images.length === 0) return null;

    const displayImages = images.slice(0, 5);
    const remainingCount = images.length - 5;

    return (
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
            <div className="md:hidden relative h-[35vh] w-full rounded-3xl overflow-hidden shadow-md">
                <AppImage
                    src={displayImages[0]}
                    alt={altText}
                    type="banner"
                    className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                    <button
                        onClick={onViewAll}
                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg"
                    >
                        <FaImages />
                        1 / {images.length}
                    </button>
                )}
            </div>

            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[50vh] rounded-3xl overflow-hidden shadow-sm">
                <div className={`relative group overflow-hidden ${displayImages.length === 1 ? 'col-span-4 row-span-2' : displayImages.length === 2 ? 'col-span-2 row-span-2' : 'col-span-2 row-span-2'}`}>
                    <AppImage
                        src={displayImages[0]}
                        alt={`${altText} main`}
                        type="banner"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                    />
                </div>

                {displayImages.length > 1 && (
                    <div className={`relative group overflow-hidden ${displayImages.length === 2 ? 'col-span-2 row-span-2' : displayImages.length === 3 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'}`}>
                        <AppImage src={displayImages[1]} alt={`${altText} 2`} type="gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
                    </div>
                )}

                {displayImages.length > 2 && (
                    <div className={`relative group overflow-hidden ${displayImages.length === 3 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'}`}>
                        <AppImage src={displayImages[2]} alt={`${altText} 3`} type="gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
                    </div>
                )}

                {displayImages.length > 3 && (
                    <div className="relative group overflow-hidden col-span-1 row-span-1">
                        <AppImage src={displayImages[3]} alt={`${altText} 4`} type="gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
                    </div>
                )}

                {displayImages.length > 4 && (
                    <div className="relative group overflow-hidden col-span-1 row-span-1 cursor-pointer" onClick={onViewAll}>
                        <AppImage src={displayImages[4]} alt={`${altText} 5`} type="gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />

                        <div className="absolute inset-0 bg-slate-900/40 hover:bg-slate-900/50 transition-colors flex flex-col items-center justify-center">
                            {remainingCount > 0 ? (
                                <span className="text-white text-2xl font-bold">+{remainingCount}</span>
                            ) : (
                                <FaImages className="text-white text-3xl" />
                            )}
                            <span className="text-white font-medium mt-1">View All Photos</span>
                        </div>
                    </div>
                )}
            </div>

            {displayImages.length > 1 && displayImages.length < 5 && (
                <button
                    onClick={onViewAll}
                    className="hidden md:flex absolute bottom-8 right-12 bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold items-center gap-2 shadow-lg hover:bg-slate-50 transition border border-slate-200"
                >
                    <FaImages />
                    Show all photos
                </button>
            )}
        </div>
    );
}