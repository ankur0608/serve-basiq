'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    FaXmark, FaCircleCheck, FaStore, FaUser, FaCalendarDays,
    FaEnvelope, FaPhone, FaLocationDot, FaInstagram, FaFacebook, FaYoutube, FaGlobe
} from 'react-icons/fa6';
import AppImage from '@/components/ui/AppImage';

interface SupplierProps {
    supplier: {
        id: string;
        name?: string | null;
        shopName?: string | null;
        email?: string | null;
        phone?: string | null;
        image?: string | null;
        profileImage?: string | null;
        isVerified?: boolean;
        createdAt?: Date | string;
        instagramUrl?: string | null;
        facebookUrl?: string | null;
        youtubeUrl?: string | null;
        websiteUrl?: string | null;
        addresses?: { city: string; state: string; country: string }[];
    } | null | undefined;
}

export default function SupplierProfileModal({ supplier }: SupplierProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!supplier) return null;

    const displayName = supplier.shopName || supplier.name || "Verified Seller";
    const displayImage = supplier.profileImage || supplier.image || "";
    const memberSince = supplier.createdAt
        ? new Date(supplier.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : "Recently";

    const loc = supplier.addresses?.length
        ? `${supplier.addresses[0].city}, ${supplier.addresses[0].state}`
        : "Location not shared";

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div
                ref={modalRef}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-200"
            >
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/30 backdrop-blur-md rounded-full p-2 transition-all z-20"
                >
                    <FaXmark size={20} />
                </button>

                {/* Sleek Gradient Header */}
                <div className="h-36 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                </div>

                <div className="px-6 pb-8 -mt-16 relative">
                    {/* Avatar (Border Removed, added soft shadow) */}
                    <div className="w-[110px] h-[110px] mx-auto rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden bg-white mb-4 relative z-10 flex items-center justify-center">
                        {displayImage ? (
                            <AppImage
                                src={displayImage}
                                alt={displayName}
                                type="avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FaStore size={40} className="text-slate-300" />
                        )}
                    </div>

                    {/* Name & Location */}
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2 mb-1.5">
                            {displayName}
                            {supplier.isVerified && (
                                <FaCircleCheck className="text-blue-500 text-lg" />
                            )}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-1.5">
                            <FaLocationDot className="text-slate-400" size={14} />
                            {loc}
                        </p>
                    </div>

                    {/* Stats Cards (Borders Removed) */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-2xl text-center shadow-sm">
                            <FaUser className="mx-auto mb-2 text-slate-400" size={18} />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                                Owner
                            </p>
                            <p className="text-sm font-bold text-slate-800 truncate">
                                {supplier.name || "Hidden"}
                            </p>
                        </div>

                        <div className="bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-2xl text-center shadow-sm">
                            <FaCalendarDays className="mx-auto mb-2 text-slate-400" size={18} />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                                Joined
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                                {memberSince}
                            </p>
                        </div>
                    </div>

                    {/* Contact Info (Borders Removed) */}
                    <div className="space-y-2.5 mb-8">
                        {supplier.email && (
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50/50 hover:bg-blue-50 transition-colors text-blue-700">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <FaEnvelope size={14} />
                                </div>
                                <span className="text-sm font-semibold truncate">
                                    {supplier.email}
                                </span>
                            </div>
                        )}

                        {supplier.phone && (
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 transition-colors text-emerald-700">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <FaPhone size={14} />
                                </div>
                                <span className="text-sm font-semibold">
                                    {supplier.phone}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Social Media Links (Styled as buttons) */}
                    <div className="flex justify-center gap-4">
                        {supplier.websiteUrl && (
                            <a href={supplier.websiteUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                                <FaGlobe size={18} />
                            </a>
                        )}
                        {supplier.instagramUrl && (
                            <a href={supplier.instagramUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-pink-600 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                                <FaInstagram size={20} />
                            </a>
                        )}
                        {supplier.facebookUrl && (
                            <a href={supplier.facebookUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                                <FaFacebook size={18} />
                            </a>
                        )}
                        {supplier.youtubeUrl && (
                            <a href={supplier.youtubeUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                                <FaYoutube size={18} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors ml-auto"
            >
                View Profile
            </button>

            {mounted && isOpen &&
                createPortal(modalContent, document.body)}
        </>
    );
}