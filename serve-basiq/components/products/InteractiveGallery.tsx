'use client';

import { useState } from 'react';
import { FaImages } from 'react-icons/fa6';

interface Props {
    mainProductImage: string;
    productImages: string[];
    productName: string;
}

export default function InteractiveProductGallery({
    mainProductImage,
    productImages,
    productName
}: Props) {

    const allImages = [mainProductImage, ...productImages.filter(img => img !== mainProductImage)];
    const [activeImg, setActiveImg] = useState(mainProductImage);

    const displayThumbnails = allImages.slice(0, 5);

    return (
        <div className="mb-10">

            {/* MAIN IMAGE */}
            <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-3xl overflow-hidden bg-white group border border-slate-200 shadow-sm flex items-center justify-center">
                
                {/* 🚨 CHANGED: Replaced <AppImage> with standard <img> so styles aren't overridden */}
                <img
                    src={activeImg}
                    alt={productName}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                />

            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                {displayThumbnails.map((img, i) => (
                    <div
                        key={i}
                        onClick={() => setActiveImg(img)}
                        className={`relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all border-2 bg-white
                        ${activeImg === img
                                ? 'border-blue-500 shadow-md scale-95'
                                : 'border-slate-100 hover:border-slate-300'
                            }`}
                    >
                        {/* 🚨 CHANGED: Replaced <AppImage> with standard <img> here too */}
                        <img
                            src={img}
                            alt={`Thumb ${i}`}
                            className="w-full h-full object-contain p-1.5"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}