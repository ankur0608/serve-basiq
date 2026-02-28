'use client';

import { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
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

    const scrollToGallery = () => {
        const section = document.getElementById('Gallery');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const displayThumbnails = allImages.slice(0, 5);

    return (
        <div className="mb-10">

            {/* MAIN IMAGE */}
            <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-3xl overflow-hidden bg-slate-200 group border border-slate-200 shadow-sm">

                <AppImage
                    src={activeImg}
                    alt={productName}
                    type="banner"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                />

                {/* <button
                    onClick={scrollToGallery}
                    className="absolute bottom-6 left-6 bg-white shadow-xl border border-slate-200 text-slate-900 font-semibold px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                    <FaImages className="text-blue-600 text-lg" />
                    View Full Gallery
                </button> */}
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                {displayThumbnails.map((img, i) => (
                    <div
                        key={i}
                        onClick={() => setActiveImg(img)}
                        className={`relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all border-2 
                        ${activeImg === img
                                ? 'border-blue-500 shadow-md scale-95'
                                : 'border-transparent hover:border-slate-300'
                            }`}
                    >
                        <AppImage
                            src={img}
                            alt={`Thumb ${i}`}
                            type="thumbnail"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}