'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Pencil,
    Settings,
    Hexagon,
    Check,
    User,
    MapPin,
    FileText,
    X,
    Loader2
} from 'lucide-react';
import StepOnePersonal from './StepOneProfile';
import StepTwoAddress from './StepTwoAddress';
import StepThreeKYC from './StepThreeKYC';

// Helper to wrap the form steps in a modal
const EditModal = ({ isOpen, onClose, title, children, onSave, loading }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
                    <button onClick={onClose} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all">Cancel</button>
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
    onEdit: () => void; // Keeps the original full wizard flow
}

export default function ProfileView({ stats, user, onEdit }: ProfileViewProps) {
    const router = useRouter();
    const [activeModal, setActiveModal] = useState<'PERSONAL' | 'ADDRESS' | 'KYC' | null>(null);
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

    // Handle Save Logic (For Modals)
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
                <StepThreeKYC form={form} updateField={updateField} showToast={(msg) => alert(msg)} errors={errors} getInputClass={getInputClass} />
            </EditModal>


            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 text-center relative overflow-hidden group max-w-4xl mx-auto">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10"></div>
                {/* ✅ REVERTED: Clicking the profile image now triggers `onEdit` (Full Wizard) 
                    instead of opening the Personal modal directly.
                */}
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
                        <p className="text-slate-600 flex justify-between"><strong>Account Type:</strong> <span className="text-slate-900 font-bold">{user?.providerType || "BOTH"}</span></p>
                    </div>
                </div>

                {/* 2. Location & Business Card */}
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

                {/* 3. KYC Card */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-purple-500 p-6 relative overflow-hidden group md:col-span-2">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-3 text-sm">
                            <p className="text-slate-600 flex justify-between"><strong>ID Type:</strong> <span className="text-slate-900">{kyc.idProofType || "N/A"}</span></p>
                            <p className="text-slate-600 flex justify-between"><strong>GST Registered:</strong> <span className="text-slate-900">{kyc.gstRegistered ? "Yes" : "No"}</span></p>
                            {kyc.gstRegistered && (
                                <p className="text-slate-600 flex justify-between"><strong>GST Number:</strong> <span className="text-slate-900 font-mono">{kyc.gstNumber}</span></p>
                            )}
                        </div>
                        <div className="flex flex-col justify-center items-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">ID Proof Status</p>
                            {kyc.idProofFrontImg ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-2 bg-emerald-100 px-3 py-1 rounded-full text-sm">
                                    <Check size={16} /> Uploaded & Verified
                                </span>
                            ) : (
                                <span className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1 rounded-full">Missing Document</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Global Edit (Keeps original flow) */}
            <div className="flex justify-center mt-8">
                <button onClick={onEdit} className="px-8 py-3 bg-[#0f172a] text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95">
                    <Pencil size={16} /> Start Full Verification Wizard
                </button>
            </div>
        </div>
    );
}