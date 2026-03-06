'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import {
    FaArrowLeft, FaPencil, FaUser, FaPhone, FaEnvelope,
    FaCalendarCheck, FaIdCard, FaRightFromBracket, FaCircleCheck,
    FaMapLocationDot, FaHouse, FaBriefcase, FaPlus
} from 'react-icons/fa6';
import Link from 'next/link';
import { fullLogout } from '@/lib/logout';

// 👉 IMPORT YOUR CUSTOM HOOK
import { useUpdateProfile } from '@/app/hook/useProfileQueries';

// Modals
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import AddressEditModal from '@/components/profile/AddressEditModal';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';
import ConfirmLogoutModal from '@/components/auth/ConfirmLogoutModal';

export default function SettingsPage() {
    const { data: session } = useSession();

    // 👉 1. Pull `logout` from useUIStore to clear local state instantly
    const { currentUser, setCurrentUser, logout } = useUIStore();

    // 👉 INITIALIZE THE HOOK
    const { mutateAsync: updateProfile } = useUpdateProfile();

    const [showEditModal, setShowEditModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    // ADDRESS MODAL STATES
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const isGoogleLogin = !!session?.user?.email;

    // --- Helpers ---
    const formatDateForInput = (dateString: string | Date | null | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const addresses = currentUser?.addresses || [];
    const primaryAddress: any = addresses.length > 0 ? addresses[0] : {};

    const profileModalInitialData = {
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
        image: currentUser?.image || currentUser?.img || '', // Ensure existing image is passed
    };

    const handleSaveProfileData = async (formData: any, file: File | null) => {
        if (!currentUser?.id) return;

        try {
            // This hook handles the image compression, S3/R2 upload, AND the PATCH request!
            await updateProfile({
                formData,
                file,
                currentUser
            });

            // Refresh Local State after successful upload and save
            const updated = await fetch(`/api/user/profile?identifier=${currentUser?.id}`).then(r => r.json());
            setCurrentUser(updated);
            setShowEditModal(false);

        } catch (err) {
            console.error('Profile save failed:', err);
        }
    };

    // HANDLE ADDRESS SAVE
    const handleSaveAddress = async (addressData: any) => {
        try {
            let updatedAddresses = [...addresses];

            const formattedAddress = {
                id: addressData.id || Date.now().toString(),
                type: addressData.type,
                line1: addressData.addressLine1,
                line2: addressData.addressLine2,
                landmark: addressData.landmark,
                city: addressData.city,
                district: addressData.district,
                state: addressData.state,
                pincode: addressData.pincode,
                country: addressData.country || 'India'
            };

            if (addressData.id) {
                updatedAddresses = updatedAddresses.map((a: any) => a.id === addressData.id ? formattedAddress : a);
            } else {
                updatedAddresses.push(formattedAddress);
            }

            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id, addresses: updatedAddresses }),
            });

            if (res.ok) {
                const updated = await fetch(`/api/user/profile?identifier=${currentUser?.id}`).then(r => r.json());
                setCurrentUser(updated);
                setShowAddressModal(false);
            }
        } catch (err) { console.error('Address save failed:', err); }
    };

    const handleEditAddressClick = (addr: any) => {
        setEditingAddress(addr);
        setShowAddressModal(true);
    };

    const handleAddNewAddressClick = () => {
        setEditingAddress(null);
        setShowAddressModal(true);
    };

    const handleSecureLogout = async () => {
        logout(); // Wipes Zustand store
        await fullLogout(); // Kills NextAuth session & redirects
    };
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                <Link href="/profile" className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600">
                    <FaArrowLeft />
                </Link>
                <h1 className="text-lg font-bold text-slate-900">Settings</h1>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

                {/* --- 1. Personal Information --- */}
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

                {/* --- 2. Saved Addresses --- */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-slate-900">Saved Addresses</h3>
                        <button
                            onClick={handleAddNewAddressClick}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition"
                        >
                            <FaPlus /> Add New
                        </button>
                    </div>

                    {addresses.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <FaMapLocationDot className="mx-auto text-3xl text-slate-300 mb-3" />
                            <p className="text-slate-500 text-sm font-medium mb-4">No addresses saved yet.</p>
                            <button
                                onClick={handleAddNewAddressClick}
                                className="text-sm font-bold text-white bg-slate-900 px-5 py-2 rounded-lg hover:bg-black transition"
                            >
                                Add Your First Address
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr: any, index: number) => (
                                <div key={addr.id || index} className="p-5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors relative group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm shrink-0">
                                                {addr.type?.toLowerCase() === 'home' ? <FaHouse /> : <FaBriefcase />}
                                            </div>
                                            <span className="font-bold text-slate-900">{addr.type || 'Home'}</span>
                                        </div>
                                        <button
                                            onClick={() => handleEditAddressClick(addr)}
                                            className="w-8 h-8 rounded-full bg-white text-slate-400 shadow-sm border border-slate-200 flex items-center justify-center hover:text-blue-600 hover:border-blue-200 transition"
                                        >
                                            <FaPencil className="text-xs" />
                                        </button>
                                    </div>
                                    <div className="text-sm font-medium text-slate-600 space-y-1">
                                        <p>{addr.line1}</p>
                                        {addr.line2 && <p>{addr.line2}</p>}
                                        {addr.landmark && <p className="text-xs text-slate-400">Landmark: {addr.landmark}</p>}
                                        <p>{addr.city}, {addr.state} - <span className="font-bold text-slate-900">{addr.pincode}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- 3. Account Actions --- */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Account Actions</h3>

                    <button
                        onClick={() => {
                            // console.log("logout clicked");
                            setShowLogoutModal(true);
                        }} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                        <FaRightFromBracket /> Logout
                    </button>
                </div>

            </div>

            {/* --- Modals --- */}
            <ProfileEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                initialData={profileModalInitialData}
                onSave={handleSaveProfileData}
                isEmailLocked={isGoogleLogin}
                isPhoneLocked={true}
                onAddPhoneClick={() => { setShowEditModal(false); setTimeout(() => setShowVerifyModal(true), 200); }}
            />

            <AddressEditModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                initialData={editingAddress}
                onSave={handleSaveAddress}
            />

            <MobileVerificationModal
                isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)}
                onSuccess={async () => {
                    setShowVerifyModal(false);
                    const updated = await fetch(`/api/user/profile?identifier=${currentUser?.id}`).then(r => r.json());
                    setCurrentUser(updated);
                }}
                userId={currentUser?.id || ''}
            />
            <ConfirmLogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleSecureLogout}
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