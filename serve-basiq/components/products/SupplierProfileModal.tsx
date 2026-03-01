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
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-200"
            >
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-white hover:text-slate-200 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full p-2 transition z-10"
                >
                    <FaXmark size={18} />
                </button>

                <div className="h-32 bg-gradient-to-br from-blue-600 to-violet-700" />

                <div className="px-6 pb-8 -mt-16 relative">
                    <div className="w-28 h-28 mx-auto rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-white mb-4 relative z-10">
                        {displayImage ? (
                            <AppImage
                                src={displayImage}
                                alt={displayName}
                                type="avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                <FaStore size={40} />
                            </div>
                        )}
                    </div>

                    <div className="text-center mb-6">
                        <h3 className="text-xl font-black text-slate-900 flex items-center justify-center gap-2 mb-1">
                            {displayName}
                            {supplier.isVerified && (
                                <FaCircleCheck className="text-blue-500 text-base" />
                            )}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-1">
                            <FaLocationDot size={12} />
                            {loc}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-2xl border text-center">
                            <FaUser className="mx-auto mb-1 text-slate-400" size={16} />
                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                                Owner
                            </p>
                            <p className="text-xs font-bold text-slate-900 truncate">
                                {supplier.name || "Hidden"}
                            </p>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border text-center">
                            <FaCalendarDays className="mx-auto mb-1 text-slate-400" size={16} />
                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                                Joined
                            </p>
                            <p className="text-xs font-bold text-slate-900">
                                {memberSince}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-6">
                        {supplier.email && (
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50 border text-blue-900">
                                <FaEnvelope size={12} />
                                <span className="text-xs truncate">
                                    {supplier.email}
                                </span>
                            </div>
                        )}

                        {supplier.phone && (
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50 border text-emerald-900">
                                <FaPhone size={12} />
                                <span className="text-xs">
                                    {supplier.phone}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-3">
                        {supplier.websiteUrl && (
                            <a href={supplier.websiteUrl} target="_blank">
                                <FaGlobe />
                            </a>
                        )}
                        {supplier.instagramUrl && (
                            <a href={supplier.instagramUrl} target="_blank">
                                <FaInstagram />
                            </a>
                        )}
                        {supplier.facebookUrl && (
                            <a href={supplier.facebookUrl} target="_blank">
                                <FaFacebook />
                            </a>
                        )}
                        {supplier.youtubeUrl && (
                            <a href={supplier.youtubeUrl} target="_blank">
                                <FaYoutube />
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
                className="ml-auto text-xs font-bold text-blue-600 hover:underline"
            >
                View Profile
            </button>

            {mounted && isOpen &&
                createPortal(modalContent, document.body)}
        </>
    );
}