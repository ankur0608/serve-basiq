'use client';

import { useState } from 'react';
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
    } | null;
}

export default function SupplierProfileModal({ supplier }: SupplierProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!supplier) return null;

    const displayName = supplier.shopName || supplier.name || "Verified Seller";
    const displayImage = supplier.profileImage || supplier.image || "";
    const memberSince = supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently";

    // Get Address (Safety check if addresses array is empty)
    const loc = supplier.addresses && supplier.addresses.length > 0
        ? `${supplier.addresses[0].city}, ${supplier.addresses[0].state}`
        : "Location not shared";

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="ml-auto text-sm font-bold text-blue-600 hover:underline hover:text-blue-700 transition"
            >
                View Profile
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">

                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-white hover:text-slate-200 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full p-2 transition z-10"
                        >
                            <FaXmark size={18} />
                        </button>

                        {/* Header */}
                        <div className="h-32 bg-gradient-to-br from-blue-600 to-violet-700 relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        </div>

                        <div className="px-6 pb-8 -mt-16 relative">
                            {/* Avatar */}
                            <div className="w-32 h-32 mx-auto rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-white mb-4">
                                {displayImage ? (
                                    <AppImage src={displayImage} alt={displayName} type="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                        <FaStore size={50} />
                                    </div>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2 mb-1">
                                    {displayName}
                                    {supplier.isVerified && <FaCircleCheck className="text-blue-500 text-lg" title="Verified" />}
                                </h3>
                                <p className="text-slate-500 font-medium flex items-center justify-center gap-2">
                                    <FaLocationDot className="text-slate-400" /> {loc}
                                </p>
                            </div>

                            {/* Grid Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                    <div className="text-slate-400 mb-2 flex justify-center"><FaUser size={20} /></div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Owner</p>
                                    <p className="text-sm font-bold text-slate-900 truncate px-2">{supplier.name || "Hidden"}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                    <div className="text-slate-400 mb-2 flex justify-center"><FaCalendarDays size={20} /></div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Member Since</p>
                                    <p className="text-sm font-bold text-slate-900">{memberSince}</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-8">
                                {supplier.email && (
                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-900">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><FaEnvelope /></div>
                                        <span className="text-sm font-medium">{supplier.email}</span>
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-900">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><FaPhone /></div>
                                        <span className="text-sm font-medium">{supplier.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Social Links */}
                            <div className="flex justify-center gap-4">
                                {supplier.websiteUrl && <a href={supplier.websiteUrl} target="_blank" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition"><FaGlobe /></a>}
                                {supplier.instagramUrl && <a href={supplier.instagramUrl} target="_blank" className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition"><FaInstagram /></a>}
                                {supplier.facebookUrl && <a href={supplier.facebookUrl} target="_blank" className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition"><FaFacebook /></a>}
                                {supplier.youtubeUrl && <a href={supplier.youtubeUrl} target="_blank" className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition"><FaYoutube /></a>}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}