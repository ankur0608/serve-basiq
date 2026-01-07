'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Import useSession
import { useUIStore } from '@/lib/store';
import {
    FaUser, FaCalendarCheck, FaGear, FaPencil, FaHouse,
    FaPlus, FaTrash, FaEnvelope, FaIdCard, FaGoogle, FaSpinner // Import Spinner
} from 'react-icons/fa6';
import clsx from 'clsx';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

// ... (Keep your Interface Address code here)

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession(); // Get auth status
    const { currentUser, logout, onOpenLogin, setCurrentUser } = useUIStore();

    // Tabs
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'profile' | 'settings'>('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);

    // 1. Fetch Profile Data from DB if we have a user ID (from Google or Login)
    useEffect(() => {
        // We accept currentUser.id OR session email to fetch profile
        const identifier = currentUser?.id || session?.user?.email;

        if (!identifier) return;

        const fetchProfile = async () => {
            try {
                // Modified fetch to support sending email if ID isn't numeric yet
                const res = await fetch(`/api/user/profile?identifier=${identifier}`);

                if (res.ok) {
                    const data = await res.json();
                    // Merge DB data with what we already have (Google session)
                    setCurrentUser({ ...currentUser, ...data });
                    setAddresses(data.addresses ?? []);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };

        fetchProfile();
    }, [currentUser?.id, session?.user?.email, setCurrentUser]); // Depend on session email too

    // ... (Keep your Helper: Display Name Logic here)
    const primaryAddress = addresses[0];
    const displayName = currentUser?.name || (currentUser?.phone ? `User ${currentUser.phone.slice(-4)}` : 'Valued Customer');

    const modalInitialData = {
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        addressLine: primaryAddress?.line1 || '',
        city: primaryAddress?.city || '',
        state: primaryAddress?.state || '',
        pincode: primaryAddress?.pincode || '',
    };

    // ... (Keep handleSaveData here)
    const handleSaveData = async (data: typeof modalInitialData) => {
        // ... (Keep your existing save logic)
    };

    // 2. LOADING STATE: Prevents "Guest Access" flash while checking Google Session
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <FaSpinner className="animate-spin text-4xl text-slate-300" />
                    <p className="text-slate-400 text-sm font-bold animate-pulse">Loading Profile...</p>
                </div>
            </div>
        );
    }

    // 3. Guest View (Only show if definitely unauthenticated and no currentUser)
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

    // If we reach here, we are logged in (either via Phone or Google)
    const isWorker = currentUser?.isWorker || false;

    return (
        <div className="min-h-screen pb-32 bg-slate-50">
            {/* Header */}
            <ProfileHeader onEditClick={() => setShowEditModal(true)} />

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

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px]">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="text-center py-12 animate-fade-in border border-dashed border-gray-200 rounded-xl">
                            <p className="text-gray-400 text-sm">No recent activity found.</p>
                            {!isWorker && <Link href="/services" className="text-blue-600 font-bold text-sm hover:underline mt-2 inline-block">Find a Service</Link>}
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div className="text-center py-12 animate-fade-in border border-dashed border-gray-200 rounded-xl">
                            <FaCalendarCheck className="mx-auto text-4xl text-gray-200 mb-3" />
                            <p className="text-gray-400 text-sm">No bookings found.</p>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-slate-900">Personal Information</h3>
                                    <button onClick={() => setShowEditModal(true)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition shadow-sm">
                                        <FaPencil className="text-sm" />
                                    </button>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">

                                    {/* Name Field */}
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Name</span>
                                        <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <FaUser className="text-gray-400 text-xs" />
                                            {displayName}
                                        </span>
                                    </div>

                                    {/* Phone Field */}
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Phone</span>
                                        <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <FaGear className="text-gray-400 text-xs" />
                                            {currentUser?.phone ? (
                                                currentUser.phone
                                            ) : (
                                                <button onClick={() => setShowEditModal(true)} className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition">
                                                    + Add Phone
                                                </button>
                                            )}
                                        </span>
                                    </div>

                                    {/* Email Field */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Email</span>
                                        <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <FaEnvelope className="text-gray-400 text-xs" />
                                            {currentUser?.email ? (
                                                currentUser.email
                                            ) : (
                                                <button onClick={() => setShowEditModal(true)} className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition">
                                                    + Add Email
                                                </button>
                                            )}
                                        </span>
                                    </div>

                                </div>
                            </div>
                            {/* ... Address section remains the same ... */}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="font-bold text-lg text-slate-900 mb-4">App Settings</h3>
                            <div onClick={() => { logout(); router.push('/'); }} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center"><FaGoogle /></div>
                                    <div><div className="font-bold text-red-600 text-sm">Logout</div><div className="text-xs text-red-400/70">Sign out</div></div>
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
            />
        </div>
    );
}