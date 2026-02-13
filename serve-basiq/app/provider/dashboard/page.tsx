'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useProviderDashboard } from '@/app/hook/useProviderDashboard';
import {
    LayoutGrid, ClipboardList, Package, UserCircle,
    BellRing, ArrowLeft, Loader2, AlertTriangle, Settings
} from 'lucide-react';
import clsx from 'clsx';

// --- IMPORTS ---
// Assuming ProfileView is now the new component you created
import { NavButton, MobileNavBtn } from '@/components/providers/DashboardComponents';
import { DashboardHomeView, ProfileView } from '@/components/providers/GeneralViews';
import { AddProductView } from '@/components/providers/AddProductView';
import { ManagementView } from '@/components/providers/Management';
import { VerificationView } from '@/components/providers/VerificationView';
import RequestsView from '@/components/providers/RequestsView';
import { RestrictionModal } from '@/components/providers/RestrictionModal';
import { ProductsView } from '@/components/providers/ProductsView';

export default function ProviderDashboard() {
    const { currentUser, setCurrentUser } = useUIStore();
    const router = useRouter();

    // 1. Fetch General Dashboard Data
    const { data: dashboardData, isLoading: loading, refetch: refetchDashboard, isError } = useProviderDashboard(currentUser?.id);

    // Local State
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);

    // Modal State (Restriction only, Type modal moved to ProfileView)
    const [showRestrictionModal, setShowRestrictionModal] = useState(false);

    // ✅ SAFE DATA EXTRACTION
    const bookings = dashboardData?.bookings || [];
    const orders = dashboardData?.orders || [];
    const userData = dashboardData?.user;
    const providerType = dashboardData?.user?.providerType || 'BOTH';
    const isVerified = dashboardData?.isSetupComplete || false;

    // ✅ FIX: Default Stats Object
    const safeStats = useMemo(() => {
        return dashboardData?.stats || {
            revenue: 0,
            jobsCompleted: 0,
            pendingRequests: 0,
            rating: 0
        };
    }, [dashboardData]);

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Auto-show restriction modal if setup is incomplete
    useEffect(() => {
        if (dashboardData && !dashboardData.isSetupComplete) {
            setShowRestrictionModal(true);
        }
    }, [dashboardData]);

    // --- HANDLERS ---

    const handleBackToHome = async () => {
        if (!currentUser) return;
        try {
            await fetch('/api/user/switch-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, isWebsite: true })
            });
            setCurrentUser({ ...currentUser, isWebsite: true });
            router.push('/');
        } catch (error) {
            showToast("Failed to switch mode", "error");
        }
    };

    const displayName = userData?.name || currentUser?.name || "Provider";
    const displayImg = userData?.profileImage || userData?.img || "https://i.pravatar.cc/150";
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Handle protected view navigation
    const handleViewChange = (view: string) => {
        const publicViews = ['dashboard', 'profile', 'edit-profile'];
        if (!publicViews.includes(view) && !isVerified) {
            setShowRestrictionModal(true);
            return;
        }
        setActiveView(view);
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FC] gap-3">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            <p className="font-bold text-sm text-slate-600 animate-pulse">Loading ServeBasiq Dashboard...</p>
        </div>
    );

    if (isError) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FC] text-red-600 gap-3">
            <AlertTriangle className="h-10 w-10" />
            <p className="font-bold">Failed to load provider data.</p>
            <button onClick={() => refetchDashboard()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm">Retry Connection</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8F9FC] font-sans text-slate-800 relative">

            {/* --- MODALS & OVERLAYS --- */}
            <RestrictionModal
                isOpen={showRestrictionModal}
                onClose={() => setShowRestrictionModal(false)}
                onSetup={() => { setShowRestrictionModal(false); handleViewChange('edit-profile'); }}
            />

            {toast && (
                <div className={clsx("fixed top-5 right-5 z-[110] animate-in slide-in-from-right duration-300 flex items-center gap-3 p-4 rounded-xl shadow-xl border-l-4 min-w-75 bg-white",
                    toast.type === 'success' ? "border-emerald-500 text-emerald-700" : "border-red-500 text-red-700")}>
                    <span className="font-bold text-sm">{toast.msg}</span>
                </div>
            )}

            {/* --- SIDEBAR (Desktop) --- */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 z-50 shadow-sm">
                <div className="flex items-center gap-3 h-20 px-8 border-b border-slate-100">
                    <div className="bg-blue-600 text-white p-2 rounded-xl"><Settings size={24} /></div>
                    <div>
                        <h1 className="text-slate-900 font-black text-xl leading-none">ServeBasiq</h1>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter mt-1">Provider Admin</p>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    <NavButton id="dashboard" icon={LayoutGrid} label="Dashboard" active={activeView} set={handleViewChange} />
                    <NavButton id="requests" icon={ClipboardList} label="Operations" active={activeView} set={handleViewChange} badge={dashboardData?.stats?.pendingRequests} />
                    <NavButton id="settings" icon={Package} label="Management" active={activeView} set={handleViewChange} />
                    <NavButton id="profile" icon={UserCircle} label="Account" active={activeView} set={handleViewChange} />
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => handleViewChange('profile')}>
                        <img src={displayImg} className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" alt="User" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{providerType}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="md:hidden font-black text-blue-600 text-lg">SB</div>
                        <div className="hidden md:block">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-slate-900 capitalize">
                                    {activeView === 'settings' ? 'Service Management' : activeView.replace('-', ' ')}
                                </h2>
                                {/* Display-only badge since logic is now in ProfileView */}
                                {/* <div className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 border flex items-center gap-1 cursor-default">
                                    <Settings size={12} /> {providerType}
                                </div> */}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{currentDate}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <button onClick={handleBackToHome} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 group transition-all">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline">Exit to Website</span>
                        </button>
                        <button className="relative p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
                            <BellRing size={20} />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                        </button>
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 cursor-pointer shadow-sm" onClick={() => handleViewChange('profile')}>
                            <img src={displayImg} className="h-full w-full object-cover" alt="Profile" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32 lg:pb-8 scroll-smooth">
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* 1. Dashboard Home */}
                        {activeView === 'dashboard' && (
                            <DashboardHomeView
                                stats={{ stats: safeStats }}
                                setActiveView={handleViewChange}
                                onBackToHome={handleBackToHome}
                                isVerified={isVerified}
                            />
                        )}

                        {activeView === 'requests' && (
                            <RequestsView
                                showToast={showToast}
                                providerType={providerType}
                            />
                        )}

                        {/* 3. Account Profile - Using the NEW ProfileView with internal modal logic */}
                        {activeView === 'profile' && (
                            <ProfileView
                                stats={{ stats: safeStats }}
                                user={userData}
                                onEdit={() => handleViewChange('edit-profile')}
                            />
                        )}

                        {/* 4. Service / Product Management (Parent View) */}
                        {activeView === 'settings' && (
                            providerType === 'PRODUCT' ? (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-slate-900">Inventory Management</h2>
                                    {currentUser?.id && (
                                        <ProductsView
                                            setActiveView={handleViewChange}
                                            userId={currentUser.id}
                                            setSelectedProduct={setSelectedProduct}
                                            showToast={showToast}
                                            providerType={providerType}
                                        />
                                    )}
                                </div>
                            ) : (
                                <ManagementView
                                    currentUser={currentUser}
                                    userData={userData}
                                    showToast={showToast}
                                    setActiveView={handleViewChange}
                                    providerType={providerType}
                                />
                            )
                        )}

                        {/* 5. Products Specific Tab (for Hybrid Providers) */}
                        {activeView === 'products' && (
                            <div className="space-y-6">
                                {currentUser?.id && (
                                    <ProductsView
                                        setActiveView={handleViewChange}
                                        userId={currentUser.id}
                                        setSelectedProduct={setSelectedProduct}
                                        showToast={showToast}
                                        providerType={providerType}
                                    />
                                )}
                            </div>
                        )}

                        {/* 6. Verification / Edit Profile */}
                        {activeView === 'edit-profile' && (
                            <VerificationView
                                userId={currentUser?.id || ""}
                                existingData={userData}
                                showToast={showToast}
                                onBack={() => {
                                    refetchDashboard();
                                    handleViewChange('profile');
                                }}
                            />
                        )}

                        {/* 7. Add/Edit Product Form */}
                        {activeView === 'add-product' && currentUser?.id && (
                            <AddProductView
                                setActiveView={handleViewChange}
                                userId={currentUser.id}
                                showToast={showToast}
                                editingProduct={selectedProduct}
                            />
                        )}
                    </div>
                </main>
            </div>

            {/* --- MOBILE NAVIGATION --- */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50 pb-safe shadow-lg">
                <div className="flex justify-around items-center h-16">
                    <MobileNavBtn id="dashboard" icon={LayoutGrid} label="Home" active={activeView} set={handleViewChange} />
                    <MobileNavBtn id="requests" icon={ClipboardList} label="Ops" active={activeView} set={handleViewChange} />
                    <MobileNavBtn id="settings" icon={Package} label="Manage" active={activeView} set={handleViewChange} />
                    <MobileNavBtn id="profile" icon={UserCircle} label="Me" active={activeView} set={handleViewChange} />
                </div>
            </nav>
        </div>
    );
}