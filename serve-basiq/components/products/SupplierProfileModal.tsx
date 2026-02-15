'use client';

import { useState, useRef, useEffect } from 'react';
import {
    FaXmark, FaCircleCheck, FaStore, FaUser, FaCalendarDays,
    FaEnvelope, FaPhone, FaLocationDot, FaInstagram, FaFacebook, FaYoutube, FaGlobe
} from 'react-icons/fa6';
import AppImage from '@/components/ui/AppImage';

interface SupplierProps {
    supplier: {
        id: string;
        name: string | null;
        shopName: string | null;
        email: string | null;
        phone: string | null;
        image: string | null;
        profileImage: string | null;
        isVerified: boolean;
        createdAt?: Date | string;
        instagramUrl?: string | null;
        facebookUrl?: string | null;
        youtubeUrl?: string | null;
        websiteUrl?: string | null;
        addresses?: { city: string; state: string; country: string }[];
    } | null | undefined; // Allow undefined for safer usage
}

export default function SupplierProfileModal({ supplier }: SupplierProps) {
    const [isOpen, setIsOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
    }, [isOpen]);

    if (!supplier) return null;

    const displayName = supplier.shopName || supplier.name || "Verified Seller";
    const displayImage = supplier.profileImage || supplier.image || "";
    const memberSince = supplier.createdAt
        ? new Date(supplier.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : "Recently";

    // Get Address (Safety check)
    const loc = supplier.addresses && supplier.addresses.length > 0
        ? `${supplier.addresses[0].city}, ${supplier.addresses[0].state}`
        : "Location not shared";

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition cursor-pointer"
            >
                View Profile
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">

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

                        {/* Header Background */}
                        <div className="h-32 bg-gradient-to-br from-blue-600 to-violet-700 relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        </div>

                        <div className="px-6 pb-8 -mt-16 relative">
                            {/* Avatar */}
                            <div className="w-28 h-28 mx-auto rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-white mb-4 relative z-10">
                                {displayImage ? (
                                    <AppImage src={displayImage} alt={displayName} type="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                        <FaStore size={40} />
                                    </div>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 flex items-center justify-center gap-2 mb-1">
                                    {displayName}
                                    {supplier.isVerified && <FaCircleCheck className="text-blue-500 text-base" title="Verified" />}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-1">
                                    <FaLocationDot className="text-slate-400" size={12} /> {loc}
                                </p>
                            </div>

                            {/* Grid Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                    <div className="text-slate-400 mb-1 flex justify-center"><FaUser size={16} /></div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Owner</p>
                                    <p className="text-xs font-bold text-slate-900 truncate px-1">{supplier.name || "Hidden"}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                                    <div className="text-slate-400 mb-1 flex justify-center"><FaCalendarDays size={16} /></div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Joined</p>
                                    <p className="text-xs font-bold text-slate-900">{memberSince}</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 mb-6">
                                {supplier.email && (
                                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-900">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><FaEnvelope size={12} /></div>
                                        <span className="text-xs font-medium truncate">{supplier.email}</span>
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-900">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><FaPhone size={12} /></div>
                                        <span className="text-xs font-medium">{supplier.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Social Links */}
                            <div className="flex justify-center gap-3">
                                {supplier.websiteUrl && <a href={supplier.websiteUrl} target="_blank" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-600 hover:text-white transition"><FaGlobe /></a>}
                                {supplier.instagramUrl && <a href={supplier.instagramUrl} target="_blank" className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition"><FaInstagram /></a>}
                                {supplier.facebookUrl && <a href={supplier.facebookUrl} target="_blank" className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition"><FaFacebook /></a>}
                                {supplier.youtubeUrl && <a href={supplier.youtubeUrl} target="_blank" className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition"><FaYoutube /></a>}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}