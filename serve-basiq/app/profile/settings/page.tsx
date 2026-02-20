'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import {
    FaArrowLeft, FaPencil, FaUser, FaPhone, FaEnvelope,
    FaCalendarCheck, FaIdCard, FaRightFromBracket, FaCircleCheck,
    FaMapLocationDot, FaHouse, FaBriefcase, FaShieldHalved, FaCircleXmark
} from 'react-icons/fa6';
import Link from 'next/link';
import { fullLogout } from '@/lib/logout';

// Modals
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';

export default function SettingsPage() {
    const { data: session } = useSession();
    const { currentUser, setCurrentUser } = useUIStore();

    const [showEditModal, setShowEditModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const isGoogleLogin = !!session?.user?.email;

    // --- Helpers ---
    const formatDateForInput = (dateString: string | Date | null | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Prepare data for modals & display
    const addresses = currentUser?.addresses || [];
    const primaryAddress: any = addresses.length > 0 ? addresses[0] : {};

    const modalInitialData = {
        name: currentUser?.name || '',
        email: currentUser?.email || session?.user?.email || '',
        phone: currentUser?.phone || '',
        dateOfBirth: formatDateForInput(currentUser?.dob),
        preferredLanguage: currentUser?.preferredLanguage || 'English',
        addressLine1: primaryAddress.line1 || '',
        addressLine2: primaryAddress.line2 || '',
        landmark: primaryAddress.landmark || '',
        city: primaryAddress.city || '',
        district: primaryAddress.district || '',
        state: primaryAddress.state || '',
        pincode: primaryAddress.pincode || '',
    };

    // --- Handlers ---
    const handleSaveData = async (data: any) => {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id, ...data }),
            });
            if (res.ok) {
                // Refresh data here
                const updated = await fetch(`/api/user/profile?identifier=${currentUser?.id}`).then(r => r.json());
                setCurrentUser(updated);
                setShowEditModal(false);
            }
        } catch (err) { console.error('Save failed:', err); }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                <Link href="/profile" className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600">
                    <FaArrowLeft />
                </Link>
                <h1 className="text-lg font-bold text-slate-900">Settings</h1>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

                {/* --- 1. Personal Info Section --- */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-900">Personal Information</h3>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition"
                        >
                            <FaPencil />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <InfoRow label="Full Name" value={currentUser?.name} icon={<FaUser />} />
                        <InfoRow
                            label="Phone"
                            value={currentUser?.phone}
                            icon={<FaPhone />}
                            isVerified={currentUser?.isPhoneVerified}
                        />
                        <InfoRow label="Email" value={currentUser?.email} icon={<FaEnvelope />} />
                        <InfoRow label="Date of Birth" value={currentUser?.dob ? formatDateForInput(currentUser.dob) : 'Not Set'} icon={<FaCalendarCheck />} />
                        <InfoRow label="Language" value={currentUser?.preferredLanguage} icon={<FaIdCard />} />
                    </div>
                </div>

                {/* --- 2. Account & System Details Section --- */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-slate-900 mb-6">Account Details</h3>
                    <div className="space-y-5">
                        <InfoRow label="Account Role" value={currentUser?.role} icon={<FaShieldHalved />} />
                        <InfoRow
                            label="Account Type"
                            value={currentUser?.isWorker ? "Service Provider" : "Customer"}
                            icon={<FaBriefcase />}
                        />
                        <InfoRow
                            label="Phone Verification"
                            value={currentUser?.isPhoneVerified ? "Verified" : "Unverified"}
                            icon={currentUser?.isPhoneVerified ? <FaCircleCheck className="text-green-500" /> : <FaCircleXmark className="text-red-500" />}
                        />
                    </div>
                </div>

                {/* --- 3. Saved Addresses Section --- */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-900">Saved Addresses</h3>
                    </div>

                    {addresses.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <FaMapLocationDot className="mx-auto text-3xl text-slate-300 mb-2" />
                            <p className="text-slate-500 text-sm font-medium">No addresses saved yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr: any, index: number) => (
                                <div key={addr.id || index} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                                            {addr.type?.toLowerCase() === 'home' ? <FaHouse /> : <FaBriefcase />}
                                        </div>
                                        <span className="font-bold text-slate-900">{addr.type || 'Home'}</span>
                                    </div>
                                    <div className="text-sm font-medium text-slate-600 space-y-1">
                                        <p>{addr.line1}</p>
                                        {addr.line2 && <p>{addr.line2}</p>}
                                        {addr.landmark && <p className="text-xs text-slate-400">Landmark: {addr.landmark}</p>}
                                        <p>{addr.city}, {addr.state} - <span className="font-bold text-slate-900">{addr.pincode}</span></p>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide pt-1">{addr.country || 'India'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- 4. Account Actions --- */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Logout Options</h3>
                    <button onClick={() => fullLogout()} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition">
                        <FaRightFromBracket /> Logout
                    </button>
                </div>

            </div>

            {/* Modals */}
            <ProfileEditModal
                isOpen={showEditModal} onClose={() => setShowEditModal(false)}
                initialData={modalInitialData} onSave={handleSaveData}
                isEmailLocked={isGoogleLogin} isPhoneLocked={true}
                onAddPhoneClick={() => { setShowEditModal(false); setTimeout(() => setShowVerifyModal(true), 200); }}
            />
            <MobileVerificationModal
                isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)}
                onSuccess={async () => {
                    setShowVerifyModal(false);
                    // Refresh user data
                    const updated = await fetch(`/api/user/profile?identifier=${currentUser?.id}`).then(r => r.json());
                    setCurrentUser(updated);
                }}
                userId={currentUser?.id || ''}
            />
        </div>
    );
}

// Reusing the InfoRow component
function InfoRow({ label, value, icon, isVerified }: any) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0 gap-1 sm:gap-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide shrink-0">{label}</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2 sm:text-right">
                <span className="text-gray-400 text-xs hidden sm:block">{icon}</span>
                {value || <span className="text-gray-400 italic">Not provided</span>}
                {isVerified === true && <FaCircleCheck className="text-green-500 text-xs shrink-0" title="Verified" />}
            </span>
        </div>
    );
}