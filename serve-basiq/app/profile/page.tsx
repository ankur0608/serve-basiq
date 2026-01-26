'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useUIStore } from '@/lib/store';
import {
    FaUser, FaCalendarCheck, FaGear, FaPencil, FaIdCard, FaSpinner,
    FaPhone, FaEnvelope, FaCircleCheck, FaRightFromBracket
} from 'react-icons/fa6';
import clsx from 'clsx';

// Components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';
import ActivityTabs from '@/components/profile/ActivityTabs';
import { fullLogout } from '@/lib/logout';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const { currentUser, onOpenLogin, setCurrentUser } = useUIStore();

    // ✅ Tabs state matching the Image
    const [activeTab, setActiveTab] = useState<'bookings' | 'orders' | 'favourites' | 'settings'>('bookings');

    const [showEditModal, setShowEditModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    // ✅ Data State
    const [addresses, setAddresses] = useState<any[]>([]);
    const [orders, setOrders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const isGoogleLogin = !!session?.user?.email;

    /* =========================================================
       FETCH DATA
    ========================================================= */
    const fetchProfileData = useCallback(async () => {
        const identifier = currentUser?.id || session?.user?.email || currentUser?.phone;

        if (!identifier) return;

        if (!currentUser) setIsLoadingData(true);

        try {
            const res = await fetch(`/api/user/profile?identifier=${identifier}`);
            if (!res.ok) return;

            const data = await res.json();

            // 1. Update Global User Store
            const prevUser = useUIStore.getState().currentUser;
            if (!prevUser || prevUser.id !== data.id) {
                setCurrentUser(data);
            }

            // 2. Set Page State
            setAddresses(data.addresses || []);
            setOrders(data.orders || []);
            setBookings(data.bookings || []);

        } catch (err) {
            console.error('Profile fetch failed:', err);
        } finally {
            setIsLoadingData(false);
        }
    }, [currentUser?.id, currentUser?.phone, session?.user?.email, setCurrentUser]);

    // Initial Fetch
    useEffect(() => {
        if (status !== 'authenticated' && !currentUser) return;
        fetchProfileData();
    }, [status, fetchProfileData]);

    /* =========================================================
       HANDLERS
    ========================================================= */
    const handleLogout = async () => await fullLogout();

    const handleSaveData = async (data: any) => {
        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id, ...data }),
            });
            if (!res.ok) return;
            await fetchProfileData();
            setShowEditModal(false);
        } catch (err) { console.error('Save failed:', err); }
    };

    const onVerificationSuccess = async () => {
        setShowVerifyModal(false);
        await fetchProfileData();
    };

    /* =========================================================
       HELPERS
    ========================================================= */
    const formatDateForInput = (dateString: string | Date | null | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const primaryAddress = addresses && addresses.length > 0 ? addresses[0] : {};
    const displayImage = currentUser?.img || session?.user?.image || '';

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
        state: primaryAddress.state || '',
        pincode: primaryAddress.pincode || '',
    };

    // Tabs Config (Matches Image)
    const tabsList = [
        { id: 'bookings', label: 'My Bookings' },
        { id: 'orders', label: 'My Orders' },
        { id: 'favourites', label: 'Favourites' },
        { id: 'settings', label: 'Settings' },
    ];

    /* =========================================================
       RENDER
    ========================================================= */
    if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-gray-300" /></div>;

    if (status === 'unauthenticated' && !currentUser) return (
        <div className="min-h-screen flex items-center justify-center">
            <button onClick={onOpenLogin} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Login to View Profile</button>
        </div>
    );

    return (
        <div className="min-h-screen pb-32 bg-slate-50">
            <ProfileHeader onEditClick={() => setShowEditModal(true)} userImage={displayImage} onLogout={handleLogout} />

            <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-6">

                <ProfileStats />

                {/* ============================================================
                    ✅ TABS SELECTOR (Matches Image Style: Pills)
                   ============================================================ */}
                <div className="flex flex-wrap items-center gap-3">
                    {tabsList.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                'px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap shadow-sm',
                                activeTab === tab.id
                                    ? 'bg-slate-900 text-white transform scale-105'
                                    : 'bg-white text-slate-600 hover:bg-gray-100'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ============================================================
                    ✅ TAB CONTENT AREA
                   ============================================================ */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">

                    {isLoadingData ? (
                        <div className="flex justify-center items-center h-48">
                            <FaSpinner className="animate-spin text-2xl text-blue-500" />
                        </div>
                    ) : (
                        <>
                            {/* 1. BOOKINGS */}
                            {activeTab === 'bookings' && (
                                <div className="animate-fade-in">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg text-slate-900">Recent Bookings</h3>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{bookings.length} Total</span>
                                    </div>
                                    <ActivityTabs data={bookings} type="bookings" />
                                </div>
                            )}

                            {/* 2. ORDERS */}
                            {activeTab === 'orders' && (
                                <div className="animate-fade-in">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg text-slate-900">Order History</h3>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{orders.length} Total</span>
                                    </div>
                                    <ActivityTabs data={orders} type="orders" />
                                </div>
                            )}

                            {/* 3. FAVOURITES (BLANK) */}
                            {activeTab === 'favourites' && (
                                <div className="animate-fade-in py-10 text-center">
                                    {/* Intentionally left blank or simple empty state */}
                                    <p className="text-gray-400 text-sm">No favourites yet.</p>
                                </div>
                            )}

                            {/* 4. SETTINGS (Contains User Data + Logout) */}
                            {activeTab === 'settings' && (
                                <div className="space-y-8 animate-fade-in">

                                    {/* Personal Information Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-lg text-slate-900">Personal Information</h3>
                                            <button onClick={() => setShowEditModal(true)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition">
                                                <FaPencil className="text-sm" />
                                            </button>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                                            <InfoRow label="Full Name" value={currentUser?.name} icon={<FaUser />} />
                                            <InfoRow label="Phone" value={currentUser?.phone} icon={<FaPhone />} isVerified={true} />
                                            <InfoRow label="Email" value={currentUser?.email} icon={<FaEnvelope />} />
                                            <InfoRow label="Date of Birth" value={currentUser?.dob ? formatDateForInput(currentUser.dob) : 'Not Set'} icon={<FaCalendarCheck />} />
                                            <InfoRow label="Language" value={currentUser?.preferredLanguage} icon={<FaIdCard />} />
                                        </div>
                                    </div>

                                    {/* Logout Button */}
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 mb-4">Account</h3>
                                        <button onClick={handleLogout} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition">
                                            <FaRightFromBracket /> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
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
                onSuccess={onVerificationSuccess} userId={currentUser?.id || ''}
            />
        </div>
    );
}

function InfoRow({ label, value, icon, isVerified }: any) {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 last:border-0 pb-3 last:pb-0">
            <span className="text-xs font-bold text-gray-400 uppercase">{label}</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-gray-400 text-xs">{icon}</span>
                {value || <span className="text-gray-400 italic">Not provided</span>}
                {isVerified && <FaCircleCheck className="text-green-500 text-xs" title="Verified" />}
            </span>
        </div>
    );
}