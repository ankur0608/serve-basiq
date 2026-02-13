'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Pencil,
    Settings,
    LogOut,
    RefreshCw,
    Hexagon,
    Check,
    Loader2,
    User,
    MapPin,
    FileText
} from 'lucide-react';
import clsx from 'clsx';

interface ProfileViewProps {
    stats: any;
    user: any;
    onEdit: () => void;
}

export default function ProfileView({ stats, user, onEdit }: ProfileViewProps) {
    const router = useRouter();

    // Fallback to default avatar if user.img is missing
    const imageUrl = user?.profileImage || user?.img || "https://i.pravatar.cc/150";

    // Find addresses safely
    const homeAddress = user?.addresses?.find((a: any) => a.type === 'Home');
    const workAddress = user?.addresses?.find((a: any) => a.type === 'Work') || homeAddress;

    // ✅ EXTRACT KYC DETAILS
    const kyc = user?.kycDetails || {};

    // --- ACCOUNT MODE LOGIC ---
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [updatingType, setUpdatingType] = useState(false);
    const [currentType, setCurrentType] = useState(user?.providerType || 'BOTH');

    const handleUpdateType = async (newType: string) => {
        if (!user?.id) return;
        setUpdatingType(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, providerType: newType })
            });
            if (res.ok) {
                setCurrentType(newType);
                setShowTypeModal(false);
                router.refresh(); // Refresh to update server components if needed
            }
        } catch (error) {
            console.error("Failed to update type", error);
        } finally {
            setUpdatingType(false);
        }
    };

    const getTypeLabel = (type: string) => {
        if (type === 'SERVICE') return 'Service Provider Only';
        if (type === 'PRODUCT') return 'Product Seller Only';
        return 'Hybrid (Services & Products)';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">

            {/* --- ACCOUNT MODE MODAL --- */}
            {showTypeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Switch Account Mode</h3>
                            <button onClick={() => setShowTypeModal(false)} className="text-slate-400 hover:text-slate-600">
                                <LogOut size={20} className="rotate-180" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {['SERVICE', 'PRODUCT', 'BOTH'].map((type) => (
                                <button
                                    key={type}
                                    disabled={updatingType}
                                    onClick={() => handleUpdateType(type)}
                                    className={clsx(
                                        "w-full p-3 rounded-xl text-left font-bold text-sm border transition-all flex justify-between items-center",
                                        currentType === type
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                                    )}
                                >
                                    <span>{getTypeLabel(type)}</span>
                                    {updatingType && currentType !== type ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        currentType === type && <Check size={16} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 text-center relative overflow-hidden group max-w-4xl mx-auto">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10"></div>
                <div className="relative inline-block cursor-pointer" onClick={onEdit}>
                    <img
                        src={imageUrl}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl transition-transform group-hover:scale-105 bg-white"
                        onError={(e) => e.currentTarget.src = "https://i.pravatar.cc/150"}
                        alt="Profile"
                    />
                    <div className="absolute bottom-2 right-2 bg-[#0f172a] text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-blue-600 transition-colors">
                        <Pencil size={16} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-4">{user?.name || "Provider Name"}</h2>
                <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Service Provider'} • {user?.isVerified ? 'Verified' : 'Pending Verification'}
                </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

                {/* 1. Account Mode (New Card) */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-indigo-500 p-6 relative overflow-hidden group">
                    <Settings className="absolute top-4 right-4 text-indigo-100 -rotate-12 group-hover:rotate-0 transition-transform duration-500" size={48} />
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2">
                        <Hexagon size={14} /> Account Mode
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">Current Configuration</p>
                            <p className="text-lg font-black text-slate-900 flex items-center gap-2">
                                {getTypeLabel(currentType)}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowTypeModal(true)}
                            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} /> Switch Mode
                        </button>
                    </div>
                </div>

                {/* 2. Personal Details */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 p-6 relative overflow-hidden">
                    <User className="absolute top-4 right-4 text-blue-100 -rotate-12" size={48} />
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2"><User size={14} /> Personal Details</h3>
                    <div className="space-y-3 text-sm">
                        <p className="text-slate-600 flex justify-between"><strong>Full Name:</strong> <span className="text-slate-900">{user?.name || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Email:</strong> <span className="text-slate-900">{user?.email || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Phone:</strong> <span className="text-slate-900">{user?.phone || "N/A"}</span></p>
                    </div>
                </div>

                {/* 3. Location */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-500 p-6 relative overflow-hidden">
                    <MapPin className="absolute top-4 right-4 text-orange-100 -rotate-12" size={48} />
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2"><MapPin size={14} /> Location</h3>
                    <div className="space-y-3 text-sm">
                        <p className="text-slate-600 flex justify-between"><strong>Shop/Biz Name:</strong> <span className="text-slate-900">{stats?.service?.shopName || user?.shopName || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>City:</strong> <span className="text-slate-900">{workAddress?.city || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Address:</strong> <span className="text-slate-900 truncate max-w-[200px]">{workAddress?.line1 || "N/A"}</span></p>
                    </div>
                </div>

                {/* 4. KYC */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-purple-500 p-6 relative overflow-hidden">
                    <FileText className="absolute top-4 right-4 text-purple-100 -rotate-12" size={48} />
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2"><FileText size={14} /> KYC Verification</h3>
                    <div className="space-y-3 text-sm">
                        <p className="text-slate-600 flex justify-between"><strong>ID Type:</strong> <span className="text-slate-900">{kyc.idProofType || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between items-center"><strong>Status:</strong>
                            {kyc.idProofFrontImg ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full text-xs"><Check size={12} /> Uploaded</span>
                            ) : (
                                <span className="text-red-500 font-bold text-xs">Missing</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <button onClick={onEdit} className="px-8 py-3 bg-[#0f172a] text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95">
                    <Pencil size={16} /> Edit Profile Details
                </button>
            </div>
        </div>
    );
}