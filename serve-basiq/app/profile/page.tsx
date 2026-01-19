'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useUIStore } from '@/lib/store';
import {
    FaUser, FaCalendarCheck, FaGear, FaPencil,
    FaIdCard, FaGoogle, FaSpinner, FaPhone, FaEnvelope
} from 'react-icons/fa6';
import clsx from 'clsx';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const { currentUser, logout, onOpenLogin, setCurrentUser } = useUIStore();

    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'profile' | 'settings'>('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);

    // --- 1. DETERMINE LOGIN METHOD ---
    const isGoogleLogin = !!session?.user?.email;
    const isMobileLogin = !isGoogleLogin && !!currentUser?.phone;

    // --- 2. FETCH DATA ---
    useEffect(() => {
        const fetchProfile = async () => {
            const identifier = currentUser?.id || session?.user?.email || currentUser?.phone;
            if (!identifier) return;

            try {
                const res = await fetch(`/api/user/profile?identifier=${identifier}`);
                if (res.ok) {
                    const dbData = await res.json();
                    const finalImage = dbData.img || session?.user?.image || null;
                    setCurrentUser({
                        ...currentUser,
                        ...dbData,
                        img: finalImage,
                        addresses: dbData.addresses || []
                    });
                    setAddresses(dbData.addresses || []);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };

        if (status === 'authenticated' || currentUser?.id) {
            fetchProfile();
        }
    }, [status, session?.user, currentUser?.id, setCurrentUser]);

    // --- 3. NUCLEAR LOGOUT LOGIC (THE FIX) ---
    const handleLogout = async () => {
        try {
            // 1. CRITICAL FIX: Manually wipe the Local Storage Key
            // This kills the persistent data seen in your screenshot
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('servemate-storage');
                window.localStorage.removeItem('nextauth.message');
                window.sessionStorage.clear();
            }

            // 2. Clear Zustand Store State
            logout();

            // 3. Clear Server Cookies (API)
            await fetch('/api/auth/logout', { method: 'POST' });

            // 4. NextAuth SignOut (No redirect, we handle it)
            await signOut({ redirect: false });

            // 5. Hard Browser Refresh to Home
            // This ensures all memory caches are dumped
            window.location.href = '/';

        } catch (error) {
            console.error("Logout error", error);
            // Fallback: If anything fails, force clear and reload
            if (typeof window !== 'undefined') {
                window.localStorage.clear();
                window.sessionStorage.clear();
            }
            window.location.href = '/';
        }
    };

    // --- PREPARE DATA FOR MODAL ---
    const primaryAddress = addresses && addresses.length > 0 ? addresses[0] : {};
    const displayImage = currentUser?.img || session?.user?.image || '';

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

    // --- SAVE DATA ---
    const handleSaveData = async (data: typeof modalInitialData) => {
        // Optimistic Update
        const optimisticAddress = {
            ...primaryAddress,
            line1: data.addressLine1,
            line2: data.addressLine2,
            landmark: data.landmark,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            type: "Home",
            country: "India"
        };

        const previousUser = { ...currentUser };

        setCurrentUser({
            ...currentUser!,
            name: data.name,
            email: data.email,
            phone: data.phone,
            addresses: [optimisticAddress]
        });
        setAddresses([optimisticAddress]);
        setShowEditModal(false);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id, ...data })
            });

            const serverData = await res.json();

            if (!res.ok) {
                setCurrentUser(previousUser as any);
                alert(serverData.message || "Failed to save profile.");
                return;
            }

            setAddresses(serverData.addresses || []);
            setCurrentUser({ ...currentUser!, ...serverData });

        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("Something went wrong.");
            setCurrentUser(previousUser as any);
        }
    };

    // Loading & Guest States
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <FaSpinner className="animate-spin text-4xl text-slate-300" />
            </div>
        );
    }

    if (status === 'unauthenticated' && !currentUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"><FaUser /></div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Guest Access</h2>
                    <p className="text-gray-500 mb-6 text-sm">Please login to access your profile.</p>
                    <button onClick={onOpenLogin} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition">Login / Sign Up</button>
                </div>
            </div>
        );
    }

    const isWorker = currentUser?.isWorker || false;

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
                    {[
                        { id: 'overview', label: 'Overview', icon: FaUser },
                        { id: 'bookings', label: isWorker ? 'My Jobs' : 'Bookings', icon: FaCalendarCheck },
                        { id: 'profile', label: 'My Data', icon: FaIdCard },
                        { id: 'settings', label: 'Settings', icon: FaGear },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={clsx("flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap px-4", activeTab === tab.id ? (isWorker ? "bg-slate-900 text-white shadow-md" : "bg-blue-600 text-white shadow-md") : "text-gray-500 hover:bg-gray-50")}>
                            <tab.icon /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
                    {(activeTab === 'overview' || activeTab === 'bookings') && (
                        <div className="text-center py-12 animate-fade-in border border-dashed border-gray-200 rounded-xl">
                            <p className="text-gray-400 text-sm">No activity found.</p>
                            {activeTab === 'overview' && !isWorker && <Link href="/services" className="text-blue-600 font-bold text-sm hover:underline mt-2 inline-block">Find a Service</Link>}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-slate-900">Personal Information</h3>
                                <button onClick={() => setShowEditModal(true)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition shadow-sm"><FaPencil className="text-sm" /></button>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Name</span>
                                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <FaUser className="text-gray-400 text-xs" />
                                        {currentUser?.name ? currentUser.name : <span className="text-gray-400 italic font-normal">No name added</span>}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Phone</span>
                                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <FaPhone className="text-gray-400 text-xs" />
                                        {currentUser?.phone ? <>{currentUser.phone}</> : <button onClick={() => setShowEditModal(true)} className="text-blue-600 font-bold text-xs">+ Add</button>}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Email</span>
                                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <FaEnvelope className="text-gray-400 text-xs" />
                                        {currentUser?.email ? <>{currentUser.email}</> : <button onClick={() => setShowEditModal(true)} className="text-blue-600 font-bold text-xs">+ Add</button>}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="font-bold text-lg text-slate-900 mb-4">App Settings</h3>
                            {/* Uses the nuclear handleLogout function */}
                            <div onClick={handleLogout} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center"><FaGoogle /></div>
                                    <div><div className="font-bold text-red-600 text-sm">Logout</div><div className="text-xs text-red-400/70">Sign out of account</div></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ProfileEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                initialData={modalInitialData}
                onSave={handleSaveData}
                isEmailLocked={isGoogleLogin}
                isPhoneLocked={isMobileLogin}
            />
        </div>
    );
}