'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import {
    FaArrowLeft, FaPencil, FaUser, FaPhone, FaEnvelope,
    FaCalendarCheck, FaIdCard, FaRightFromBracket, FaCircleCheck
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

    // Prepare data for modals
    const addresses = currentUser?.addresses || [];
    const primaryAddress: any = addresses.length > 0 ? addresses[0] : {};

    // ✅ FIXED: Added 'district' to modalInitialData
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
        district: primaryAddress.district || '', // <--- ADDED THIS LINE
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
                // Ideally refresh data here
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

                {/* Personal Info Section */}
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
                        <InfoRow label="Phone" value={currentUser?.phone} icon={<FaPhone />} isVerified={true} />
                        <InfoRow label="Email" value={currentUser?.email} icon={<FaEnvelope />} />
                        <InfoRow label="Date of Birth" value={currentUser?.dob ? formatDateForInput(currentUser.dob) : 'Not Set'} icon={<FaCalendarCheck />} />
                        <InfoRow label="Language" value={currentUser?.preferredLanguage} icon={<FaIdCard />} />
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Account</h3>
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
        <div className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-gray-400 text-xs">{icon}</span>
                {value || <span className="text-gray-400 italic">Not provided</span>}
                {isVerified && <FaCircleCheck className="text-green-500 text-xs" title="Verified" />}
            </span>
        </div>
    );
}