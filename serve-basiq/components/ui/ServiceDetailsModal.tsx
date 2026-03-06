'use client';

import {
    X, MapPin, ShieldCheck, Clock, Calendar, Truck,
    Package, Image as ImageIcon, PlayCircle, Info, User, CheckCircle2, CalendarDays
} from 'lucide-react';
import clsx from 'clsx';

interface ServiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

export function ServiceDetailsModal({ isOpen, onClose, data }: ServiceDetailsModalProps) {
    if (!isOpen || !data) return null;

    const mainImg = data.rentalImg || data.serviceimg || data.mainimg || "";
    const coverImg = data.coverImg || mainImg;
    const gallery = data.gallery || [];

    const isRental = !!data.rentalImg || data.listingType === 'RENTAL';
    const typeLabel = isRental ? "Rental Service" : "Service";

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header (Sticky) */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                            isRental ? "bg-orange-500" : "bg-blue-500"
                        )}>
                            <Package size={16} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">Listing Details</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{typeLabel}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto w-full custom-scrollbar">

                    <div className="w-full h-48 sm:h-64 bg-slate-100 relative">
                        {coverImg ? (
                            <img src={coverImg} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon size={48} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        <div className="absolute bottom-0 left-0 w-full p-6 text-white flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase bg-white/20 backdrop-blur-md px-2 py-1 rounded">
                                        {data.category?.name || 'General'}
                                    </span>
                                    {data.subcategory && (
                                        <span className="text-[10px] font-bold uppercase bg-black/30 backdrop-blur-md px-2 py-1 rounded">
                                            {data.subcategory.name}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold">{data.name}</h1>
                            </div>
                            <div className="w-20 h-20 rounded-xl border-4 border-white bg-white shadow-lg overflow-hidden shrink-0 hidden sm:block">
                                <img src={mainImg} alt="Main" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pricing Details</h4>
                                <div className="text-3xl font-extrabold text-slate-900 mb-4">
                                    ₹{Number(data.price).toLocaleString()}
                                    <span className="text-sm font-bold text-slate-400 uppercase ml-1">
                                        / {data.priceType || 'FIXED'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {data.dailyPrice && (
                                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Daily</p>
                                            <p className="font-bold text-slate-700">₹{data.dailyPrice}</p>
                                        </div>
                                    )}
                                    {data.monthlyPrice && (
                                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Monthly</p>
                                            <p className="font-bold text-slate-700">₹{data.monthlyPrice}</p>
                                        </div>
                                    )}
                                    {data.securityDeposit !== null && data.securityDeposit !== undefined && data.securityDeposit > 0 && (
                                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 col-span-2 flex justify-between items-center">
                                            <span className="text-[10px] text-amber-600 font-bold uppercase flex items-center gap-1">
                                                <ShieldCheck size={14} /> Security Deposit
                                            </span>
                                            <span className="font-bold text-amber-700">₹{data.securityDeposit}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-center">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Provided By</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                                        {data.user?.profileImage ? (
                                            <img src={data.user.profileImage} alt={data.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={24} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-900 text-lg flex items-center gap-1">
                                            {data.user?.shopName || data.user?.name}
                                            {data.user?.isVerified && <CheckCircle2 size={16} className="text-blue-500 fill-blue-50" />}
                                        </h5>
                                        <p className="text-sm text-slate-500 font-medium">{data.user?.name}</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {isRental ? (
                                <>
                                    <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
                                        <Truck size={20} className="text-blue-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Mode</p>
                                            <p className="text-xs font-bold text-slate-700">{data.rentalMode || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
                                        <Clock size={20} className="text-emerald-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Min Time</p>
                                            <p className="text-xs font-bold text-slate-700">{data.minDuration || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
                                        <Calendar size={20} className="text-orange-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Max Time</p>
                                            <p className="text-xs font-bold text-slate-700">{data.maxDuration || 'Unlimited'}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
                                        <Package size={20} className="text-purple-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Condition</p>
                                            <p className="text-xs font-bold text-slate-700">{data.itemCondition || 'N/A'}</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-3 col-span-2">
                                        <Clock size={24} className={data.is24x7 ? "text-emerald-500 shrink-0" : "text-blue-500 shrink-0"} />
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Working Hours</p>
                                            <p className="text-sm font-bold text-slate-700">
                                                {data.is24x7 ? "24/7 Available" : `${data.openTime || 'N/A'} - ${data.closeTime || 'N/A'}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-3 col-span-2">
                                        <CalendarDays size={24} className="text-orange-500 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Working Days</p>
                                            <p className="text-sm font-bold text-slate-700 line-clamp-1">
                                                {data.workingDays?.length ? data.workingDays.join(', ') : 'All Days'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Location */}
                        {(data.addressLine1 || data.city) && (
                            <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3">
                                <MapPin size={20} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Location</h4>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                        {[data.addressLine1, data.addressLine2, data.city, data.state, data.pincode]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                    {data.radiusKm && (
                                        <p className="text-xs text-slate-400 font-medium mt-1">
                                            Serves within {data.radiusKm} km radius
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Info size={16} className="text-slate-400" /> Description
                            </h4>
                            <div className="bg-white border border-slate-100 rounded-2xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {data.desc || "No description provided."}
                            </div>
                        </div>

                        {/* Gallery */}
                        {gallery.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-slate-400" /> Gallery
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {gallery.map((url: string, i: number) => {
                                        const isVid = url.match(/\.(mp4|webm)$/i) || url.includes('video');
                                        return (
                                            <div key={i} className="aspect-square rounded-xl bg-black border border-slate-200 overflow-hidden relative group">
                                                {isVid ? (
                                                    <>
                                                        <video src={url} className="w-full h-full object-cover opacity-80" muted playsInline />
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <PlayCircle size={24} className="text-white/80" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}