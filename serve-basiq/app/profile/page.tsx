'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useUIStore } from '@/lib/store';
import {
    FaUser, FaCalendarCheck, FaGear, FaPencil, FaIdCard, FaSpinner,
    FaPhone, FaEnvelope, FaCircleCheck
} from 'react-icons/fa6';
import clsx from 'clsx';

import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';
import { fullLogout } from '@/lib/logout';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const { currentUser, onOpenLogin, setCurrentUser } = useUIStore();

    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'profile' | 'settings'>('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);

    // Loading state for saving
    const [isSaving, setIsSaving] = useState(false);

    const isGoogleLogin = !!session?.user?.email;

    // --- FETCH PROFILE ---
    const fetchProfile = useCallback(async () => {
        const identifier =
            currentUser?.id ||
            session?.user?.email ||
            currentUser?.phone;

        if (!identifier) return;

        try {
            const res = await fetch(`/api/user/profile?identifier=${identifier}`);
            if (!res.ok) return;

            const data = await res.json();
            console.log("🔄 Fetched Profile Data:", data);

            setCurrentUser(data);
            setAddresses(data.addresses || []);
        } catch (error) {
            console.error("Profile fetch failed", error);
        }
    }, [currentUser?.id, session?.user?.email, currentUser?.phone, setCurrentUser]);

    // Initial Fetch
    useEffect(() => {
        if (status === "authenticated" || currentUser) {
            fetchProfile();
        }
    }, [status, fetchProfile, currentUser?.id]);

    // --- HANDLERS ---
    const handleLogout = async () => {
        await fullLogout();
    };

    // Inside ProfilePage.tsx

    const handleSaveData = async (data: any) => {
        setIsSaving(true);
        try {
            // Log what we are sending
            console.log("📤 [Frontend] Sending Data:", data);

            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id, ...data })
            });

            const result = await res.json();

            // 🛑 Catch API Errors (like Duplicate Email)
            if (!res.ok) {
                alert(result.error || "Failed to update profile.");
                setIsSaving(false);
                return;
            }

            // Success
            setCurrentUser(result);
            setAddresses(result.addresses || []);
            setShowEditModal(false);

            // Visual Confirmation
            alert("Profile Updated Successfully!");

        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    const onVerificationSuccess = async () => {
        console.log("🎉 Verification Success! Refreshing Profile...");
        setShowVerifyModal(false);
        await fetchProfile();
    };

    // --- RENDER HELPERS ---
    if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-gray-300" /></div>;
    if (status === 'unauthenticated' && !currentUser) return <div className="min-h-screen flex items-center justify-center"><button onClick={onOpenLogin} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Login to View Profile</button></div>;

    const primaryAddress = addresses && addresses.length > 0 ? addresses[0] : {};
    const displayImage = currentUser?.img || session?.user?.image || '';
    const isWorker = currentUser?.isWorker || false;

    const modalInitialData = {
        name: currentUser?.name || '',
        email: currentUser?.email || session?.user?.email || '',
        phone: currentUser?.phone || '',
        addressLine1: primaryAddress.line1 || '',
        addressLine2: primaryAddress.line2 || '',
        landmark: primaryAddress.landmark || '',
        city: primaryAddress.city || '',
        state: primaryAddress.state || '',
        pincode: primaryAddress.pincode || '',
    };

    return (
        <div className="min-h-screen pb-32 bg-slate-50">
            <ProfileHeader
                onEditClick={() => setShowEditModal(true)}
                userImage={displayImage}
                onLogout={handleLogout}
            />

            <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-6">
                <ProfileStats />

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex overflow-x-auto no-scrollbar">
                    {[{ id: 'overview', label: 'Overview', icon: FaUser }, { id: 'bookings', label: isWorker ? 'My Jobs' : 'Bookings', icon: FaCalendarCheck }, { id: 'profile', label: 'My Data', icon: FaIdCard }, { id: 'settings', label: 'Settings', icon: FaGear }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={clsx("flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap px-4", activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}>
                            <tab.icon /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-slate-900">Personal Information</h3>
                                <button onClick={() => setShowEditModal(true)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"><FaPencil className="text-sm" /></button>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Phone</span>
                                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <FaPhone className="text-gray-400 text-xs" />
                                        {currentUser?.phone ? (
                                            <>{currentUser.phone} <FaCircleCheck className="text-green-500 text-xs" title="Verified" /></>
                                        ) : (
                                            <button onClick={() => setShowVerifyModal(true)} className="text-blue-600 font-bold text-xs hover:underline">+ Add & Verify</button>
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Email</span>
                                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <FaEnvelope className="text-gray-400 text-xs" />
                                        {currentUser?.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            <ProfileEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                initialData={modalInitialData}
                onSave={handleSaveData}
                isEmailLocked={isGoogleLogin}
                isPhoneLocked={true}
                onAddPhoneClick={() => {
                    setShowEditModal(false);
                    setTimeout(() => setShowVerifyModal(true), 200);
                }}
            />

            <MobileVerificationModal
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                onSuccess={onVerificationSuccess}
                userId={currentUser?.id || session?.user?.email || ''}
            />
        </div>
    );
}