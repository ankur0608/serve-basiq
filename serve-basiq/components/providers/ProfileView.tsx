'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Pencil,
    Check,
    User,
    MapPin,
    FileText,
    Link as LinkIcon,
    X,
    Loader2,
    Instagram,
    Facebook,
    Youtube,
    Globe,
    Calendar,
    Languages
} from 'lucide-react';

import StepOnePersonal from './StepOneProfile';
import StepSocial from './StepSocial';
import StepTwoAddress from './StepTwoAddress';
import StepThreeKYC from './StepThreeKYC';

// Helper to wrap the form steps in a modal
const EditModal = ({ isOpen, onClose, title, children, onSave, loading }: any) => {

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Container - Strict flex layout for perfect centering and internal scrolling */}
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh]">

                {/* Header (Fixed) */}
                <div className="shrink-0 flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-2 -mr-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {children}
                </div>

                {/* Footer (Fixed) */}
                <div className="shrink-0 p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 font-bold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={loading}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
};

interface ProfileViewProps {
    stats: any;
    user: any;
    onEdit: () => void;
}

export default function ProfileView({ stats, user, onEdit }: ProfileViewProps) {
    const router = useRouter();
    const [activeModal, setActiveModal] = useState<'PERSONAL' | 'SOCIAL' | 'ADDRESS' | 'KYC' | null>(null);
    const [loading, setLoading] = useState(false);

    // Form State (initialized with user data for editing)
    const [form, setForm] = useState({
        userId: user?.id,
        fullName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        gender: user?.gender || 'MALE',
        dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        preferredLanguage: user?.preferredLanguage || 'English',
        providerType: user?.providerType || 'BOTH',
        shopName: user?.shopName || '',

        // Social Links
        instagramUrl: user?.instagramUrl || '',
        facebookUrl: user?.facebookUrl || '',
        youtubeUrl: user?.youtubeUrl || '',
        websiteUrl: user?.websiteUrl || '',

        // Addresses
        addressLine1: user?.addresses?.find((a: any) => a.type === 'Home')?.line1 || '',
        addressLine2: user?.addresses?.find((a: any) => a.type === 'Home')?.line2 || '',
        landmark: user?.addresses?.find((a: any) => a.type === 'Home')?.landmark || '',
        city: user?.addresses?.find((a: any) => a.type === 'Home')?.city || '',
        state: user?.addresses?.find((a: any) => a.type === 'Home')?.state || '',
        pincode: user?.addresses?.find((a: any) => a.type === 'Home')?.pincode || '',

        // Business Address
        bizAddressLine1: user?.addresses?.find((a: any) => a.type === 'Work')?.line1 || '',
        bizAddressLine2: user?.addresses?.find((a: any) => a.type === 'Work')?.line2 || '',
        bizCity: user?.addresses?.find((a: any) => a.type === 'Work')?.city || '',
        bizState: user?.addresses?.find((a: any) => a.type === 'Work')?.state || '',
        bizPincode: user?.addresses?.find((a: any) => a.type === 'Work')?.pincode || '',
        sameAsPersonal: false,

        // KYC
        idProofType: user?.kycDetails?.idProofType || 'Aadhaar',
        idProofNumber: user?.kycDetails?.idProofNumber || '',
        idProofImg: user?.kycDetails?.idProofFrontImg || '',
        gstRegistered: user?.kycDetails?.gstRegistered || false,
        gstNumber: user?.kycDetails?.gstNumber || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update Field Helper
    const updateField = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const getInputClass = (field: string) =>
        `w-full border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all ${errors[field] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'}`;

    // Handle Save Logic
    const handleSave = async () => {
        setLoading(true);
        try {
            // Check for Provider Type change to trigger Status API
            if (activeModal === 'PERSONAL' && form.providerType !== user?.providerType) {
                await fetch('/api/user/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: form.userId,
                        providerType: form.providerType
                    })
                });
            }

            // Update Profile API
            const res = await fetch('/api/provider/update-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setActiveModal(null);
                router.refresh();
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Derived Display Data
    const imageUrl = user?.profileImage || user?.img || "https://i.pravatar.cc/150";
    const homeAddress = user?.addresses?.find((a: any) => a.type === 'Home');
    const workAddress = user?.addresses?.find((a: any) => a.type === 'Work') || homeAddress;
    const kyc = user?.kycDetails || {};

    // Helper to count social links
    const socialCount = [user?.instagramUrl, user?.facebookUrl, user?.youtubeUrl, user?.websiteUrl].filter(Boolean).length;

    // Helpers for display format
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatGender = (gender: string) => {
        if (!gender) return "N/A";
        return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">

            {/* --- MODALS --- */}
            <EditModal
                isOpen={activeModal === 'PERSONAL'}
                onClose={() => setActiveModal(null)}
                title="Edit Personal Details"
                onSave={handleSave}
                loading={loading}
            >
                <StepOnePersonal form={form} updateField={updateField} errors={errors} getInputClass={getInputClass} />
            </EditModal>

            <EditModal
                isOpen={activeModal === 'SOCIAL'}
                onClose={() => setActiveModal(null)}
                title="Edit Social Profiles"
                onSave={handleSave}
                loading={loading}
            >
                <StepSocial form={form} updateField={updateField} getInputClass={getInputClass} />
            </EditModal>

            <EditModal
                isOpen={activeModal === 'ADDRESS'}
                onClose={() => setActiveModal(null)}
                title="Edit Address & Business Info"
                onSave={handleSave}
                loading={loading}
            >
                <StepTwoAddress form={form} setForm={setForm} updateField={updateField} getInputClass={getInputClass} />
            </EditModal>

            <EditModal
                isOpen={activeModal === 'KYC'}
                onClose={() => setActiveModal(null)}
                title="Update KYC Documents"
                onSave={handleSave}
                loading={loading}
            >
                <StepThreeKYC form={form} updateField={updateField} showToast={(msg: string) => alert(msg)} errors={errors} getInputClass={getInputClass} />
            </EditModal>


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

                {/* ✅ DYNAMIC STATUS COLOR */}
                <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${user?.isVerified ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Service Provider'} •
                    <span className={user?.isVerified ? 'text-emerald-700' : 'text-amber-700'}>
                        {user?.isVerified ? ' Verified' : ' Pending Verification'}
                    </span>
                </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

                {/* 1. Account & Personal Details Card */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 p-6 relative overflow-hidden group">
                    <button
                        onClick={() => setActiveModal('PERSONAL')}
                        className="absolute top-4 right-4 p-2 bg-blue-50 text-blue-600 rounded-lg transition-all hover:bg-blue-100"
                    >
                        <Pencil size={18} />
                    </button>
                    <User className="absolute -bottom-6 -right-6 text-blue-50 opacity-50" size={120} />

                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2">
                        <User size={14} /> Personal Details
                    </h3>
                    <div className="space-y-3 text-sm relative z-10">
                        <p className="text-slate-600 flex justify-between"><strong>Full Name:</strong> <span className="text-slate-900">{user?.name || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Email:</strong> <span className="text-slate-900">{user?.email || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Phone:</strong> <span className="text-slate-900">{user?.phone || "N/A"}</span></p>

                        {/* ✅ NEW FIELDS ADDED HERE */}
                        <p className="text-slate-600 flex justify-between"><strong>Gender:</strong> <span className="text-slate-900">{formatGender(user?.gender)}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Date of Birth:</strong> <span className="text-slate-900">{formatDate(user?.dob)}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Language:</strong> <span className="text-slate-900">{user?.preferredLanguage || "English"}</span></p>

                        <div className="pt-2 mt-2 border-t border-slate-50">
                            <p className="text-slate-600 flex justify-between items-center">
                                <strong>Account Type:</strong>
                                <span className="px-2 py-1 bg-slate-100 rounded text-slate-900 font-bold text-xs">{user?.providerType || "BOTH"}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Social Profiles Card */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-pink-500 p-6 relative overflow-hidden group">
                    <button
                        onClick={() => setActiveModal('SOCIAL')}
                        className="absolute top-4 right-4 p-2 bg-pink-50 text-pink-500 rounded-lg transition-all hover:bg-pink-100"
                    >
                        <Pencil size={18} />
                    </button>
                    <LinkIcon className="absolute -bottom-6 -right-6 text-pink-50 opacity-50" size={120} />

                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2">
                        <LinkIcon size={14} /> Social Profiles
                    </h3>

                    <div className="relative z-10">
                        {socialCount > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {/* Instagram */}
                                {user?.instagramUrl ? (
                                    <a href={user.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-700 p-2 bg-slate-50 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors">
                                        <Instagram size={14} className="text-pink-500" /> Instagram
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 p-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 cursor-not-allowed">
                                        <Instagram size={14} className="opacity-50" />
                                        <span className="opacity-60">Instagram</span>
                                        <span className="ml-auto text-[10px] font-semibold opacity-50">N/A</span>
                                    </div>
                                )}

                                {/* Facebook */}
                                {user?.facebookUrl ? (
                                    <a href={user.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-700 p-2 bg-slate-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <Facebook size={14} className="text-blue-600" /> Facebook
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 p-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 cursor-not-allowed">
                                        <Facebook size={14} className="opacity-50" />
                                        <span className="opacity-60">Facebook</span>
                                        <span className="ml-auto text-[10px] font-semibold opacity-50">N/A</span>
                                    </div>
                                )}

                                {/* YouTube */}
                                {user?.youtubeUrl ? (
                                    <a href={user.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-700 p-2 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                                        <Youtube size={14} className="text-red-600" /> YouTube
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 p-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 cursor-not-allowed">
                                        <Youtube size={14} className="opacity-50" />
                                        <span className="opacity-60">YouTube</span>
                                        <span className="ml-auto text-[10px] font-semibold opacity-50">N/A</span>
                                    </div>
                                )}

                                {/* Website */}
                                {user?.websiteUrl ? (
                                    <a href={user.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-700 p-2 bg-slate-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                        <Globe size={14} className="text-emerald-500" /> Website
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 p-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 cursor-not-allowed">
                                        <Globe size={14} className="opacity-50" />
                                        <span className="opacity-60">Website</span>
                                        <span className="ml-auto text-[10px] font-semibold opacity-50">N/A</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                                <LinkIcon size={32} className="mb-2 opacity-50" />
                                <p className="text-xs">No social profiles linked</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Location & Business Card */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-500 p-6 relative overflow-hidden group">
                    <button
                        onClick={() => setActiveModal('ADDRESS')}
                        className="absolute top-4 right-4 p-2 bg-orange-50 text-orange-600 rounded-lg transition-all hover:bg-orange-100"
                    >
                        <Pencil size={18} />
                    </button>
                    <MapPin className="absolute -bottom-6 -right-6 text-orange-50 opacity-50" size={120} />

                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2">
                        <MapPin size={14} /> Location & Business
                    </h3>
                    <div className="space-y-3 text-sm relative z-10">
                        <p className="text-slate-600 flex justify-between"><strong>Shop Name:</strong> <span className="text-slate-900">{stats?.service?.shopName || user?.shopName || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>City:</strong> <span className="text-slate-900">{workAddress?.city || "N/A"}</span></p>
                        <div className="text-slate-600">
                            <strong>Address:</strong>
                            <p className="text-slate-900 mt-1 line-clamp-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {workAddress?.line1 || "No address added"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4. KYC Card */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-purple-500 p-6 relative overflow-hidden group">
                    <button
                        onClick={() => setActiveModal('KYC')}
                        className="absolute top-4 right-4 p-2 bg-purple-50 text-purple-600 rounded-lg transition-all hover:bg-purple-100"
                    >
                        <Pencil size={18} />
                    </button>
                    <FileText className="absolute -bottom-6 -right-6 text-purple-50 opacity-50" size={120} />

                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2">
                        <FileText size={14} /> KYC Verification
                    </h3>
                    <div className="space-y-4 relative z-10">
                        <div className="space-y-3 text-sm">
                            <p className="text-slate-600 flex justify-between"><strong>ID Type:</strong> <span className="text-slate-900">{kyc.idProofType || "N/A"}</span></p>
                            <p className="text-slate-600 flex justify-between"><strong>GST Reg:</strong> <span className="text-slate-900">{kyc.gstRegistered ? "Yes" : "No"}</span></p>
                        </div>
                        <div className="flex flex-col justify-center items-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Document Status</p>
                            {kyc.idProofFrontImg ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full text-xs">
                                    <Check size={14} /> Verified
                                </span>
                            ) : (
                                <span className="text-red-500 font-bold text-xs bg-red-50 px-3 py-1 rounded-full">Missing</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}