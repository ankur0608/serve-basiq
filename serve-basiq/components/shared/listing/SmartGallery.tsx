// components/listing/SmartGallery.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { FaXmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import AppVideo from '@/components/ui/AppVideo';

const isVideo = (url: string | null | undefined) =>
    !!(url && url.match(/\.(mp4|webm|mov|mkv)$/i));

function useImageAspectRatio(src: string) {
    const [ratio, setRatio] = useState<number | null>(null);

    useEffect(() => {
        if (!src || isVideo(src)) { setRatio(1); return; }
        const img = new Image();
        img.onload = () => setRatio(img.naturalWidth / img.naturalHeight);
        img.onerror = () => setRatio(1);
        img.src = src;
    }, [src]);

    return ratio;
}

// ─── SmartGalleryItem ─────────────────────────────────────────────────────────
interface SmartGalleryItemProps {
    src: string;
    alt: string;
    index: number;
    onClick: (index: number) => void;
}

function SmartGalleryItem({ src, alt, index, onClick }: SmartGalleryItemProps) {
    const ratio = useImageAspectRatio(src);

    // Pick container aspect ratio class based on natural image proportions
    const containerClass = (() => {
        if (ratio === null) return 'aspect-square';   // still loading
        if (ratio > 1.6)   return 'aspect-video';     // wide landscape  (16:9 ish)
        if (ratio > 1.1)   return 'aspect-[4/3]';     // mild landscape
        if (ratio < 0.7)   return 'aspect-[3/4]';     // portrait
        return 'aspect-square';                        // square-ish
    })();

    return (
        <div
            onClick={() => onClick(index)}
            className={`
                relative group w-full ${containerClass}
                rounded-2xl overflow-hidden bg-white
                border border-slate-100 cursor-pointer
                hover:border-slate-300 hover:shadow-md
                transition-all duration-300
            `}
        >
            {isVideo(src) ? (
                <AppVideo src={src} className="w-full h-full object-cover" />
            ) : (
                <>
                    {/* Subtle zoom overlay on hover */}
                    <div className="
                        absolute inset-0 bg-black/0 group-hover:bg-black/5
                        transition-colors duration-300 z-10 rounded-2xl
                    " />
                    <img
                        src={src}
                        alt={alt}
                        className="
                            w-full h-full object-contain p-1.5
                            group-hover:scale-105
                            transition-transform duration-500
                        "
                    />
                </>
            )}
        </div>
    );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
interface LightboxProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

function Lightbox({ images, currentIndex, onClose, onNext, onPrev }: LightboxProps) {
    const src = images[currentIndex];

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft')  onPrev();
            if (e.key === 'Escape')     onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onNext, onPrev, onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={onClose}
        >
            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all z-[110]"
                aria-label="Close"
            >
                <FaXmark size={24} />
            </button>

            {/* Prev */}
            {images.length > 1 && (
                <button
                    onClick={e => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 md:left-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3.5 md:p-5 rounded-full transition-all z-[110] hover:-translate-x-1"
                    aria-label="Previous"
                >
                    <FaChevronLeft size={24} />
                </button>
            )}

            {/* Image */}
            <div
                className="w-full max-w-5xl flex items-center justify-center"
                style={{ maxHeight: '85vh' }}
                onClick={e => e.stopPropagation()}
            >
                {isVideo(src) ? (
                    <AppVideo
                        src={src}
                        className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
                    />
                ) : (
                    <img
                        src={src}
                        alt={`Gallery item ${currentIndex + 1}`}
                        className="
                            max-w-full max-h-[85vh]
                            w-auto h-auto
                            object-contain
                            rounded-xl shadow-2xl select-none
                        "
                        draggable={false}
                    />
                )}
            </div>

            {/* Next */}
            {images.length > 1 && (
                <button
                    onClick={e => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3.5 md:p-5 rounded-full transition-all z-[110] hover:translate-x-1"
                    aria-label="Next"
                >
                    <FaChevronRight size={24} />
                </button>
            )}

            {/* Counter */}
            {images.length > 1 && (
                <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 text-white font-medium bg-black/60 px-5 py-2 rounded-full text-sm md:text-base tracking-wider border border-white/10 select-none shadow-lg">
                    {currentIndex + 1}
                    <span className="text-white/40 mx-1">/</span>
                    {images.length}
                </div>
            )}
        </div>
    );
}

// ─── SmartGalleryGrid (exported) ──────────────────────────────────────────────
interface SmartGalleryGridProps {
    images: string[];
    title?: string;
}

export default function SmartGalleryGrid({ images, title = 'Gallery Media' }: SmartGalleryGridProps) {
    const [lightboxOpen,   setLightboxOpen]   = useState(false);
    const [currentIndex,   setCurrentIndex]   = useState(0);

    const openLightbox = useCallback((index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    }, []);

    const nextImage = useCallback(() =>
        setCurrentIndex(prev => (prev + 1) % images.length),
    [images.length]);

    const prevImage = useCallback(() =>
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length),
    [images.length]);

    if (images.length === 0) return null;

    return (
        <>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200" id="Gallery">
                <h3 className="text-xl font-bold text-slate-900 mb-6">{title}</h3>

                {/*
                    Masonry via CSS columns:
                    each item breaks-inside-avoid and self-sizes to its natural aspect ratio.
                    Portrait images get more height, landscapes get less — nothing is ever cropped.
                */}
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                    {images.map((src, i) => (
                        <div key={`${src}-${i}`} className="break-inside-avoid">
                            <SmartGalleryItem
                                src={src}
                                alt={`Gallery ${i + 1}`}
                                index={i}
                                onClick={openLightbox}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {lightboxOpen && (
                <Lightbox
                    images={images}
                    currentIndex={currentIndex}
                    onClose={closeLightbox}
                    onNext={nextImage}
                    onPrev={prevImage}
                />
            )}
        </>
    );
}