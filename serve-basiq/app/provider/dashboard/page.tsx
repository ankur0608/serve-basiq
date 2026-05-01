// app/provider/dashboard/page.tsx
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useProviderDashboard } from '@/app/hook/useProviderDashboard';
import {
    LayoutGrid, ClipboardList, Package, UserCircle,
    BellRing, ArrowLeft, Loader2, AlertTriangle, LogOut, Globe
} from 'lucide-react';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { fullLogout } from '@/lib/logout';
import ConfirmLogoutModal from '@/components/auth/ConfirmLogoutModal';

import { NavButton, MobileNavBtn } from '@/components/providers/DashboardComponents';
import { ProviderDashboardContent } from '@/components/providers/ProviderDashboardContent';

const EMPTY_ARRAY: any[] = [];

export default function ProviderDashboard() {
    const { currentUser, setCurrentUser } = useUIStore();
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const dashboardUserId = status === 'authenticated' ? session?.user?.id : undefined;

    const { data: dashboardData, isLoading: loading, refetch: refetchDashboard, isError } = useProviderDashboard(dashboardUserId);

    useEffect(() => {
        if (status === 'authenticated' && session?.user && !session.user.isWorker) {
            console.log("Session mismatch detected. Attempting silent refresh...");
            update();
        }
    }, [session, status, update]);

    useEffect(() => {
        if (
            status === 'authenticated' &&
            session?.user?.id &&
            dashboardData?.user?.id &&
            session.user.id !== dashboardData.user.id
        ) {
            console.log('Session user id is stale. Refreshing session to match resolved provider user.');
            update();
        }
    }, [dashboardData?.user?.id, session?.user?.id, status, update]);

    const [activeView, setActiveView] = useState('dashboard');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const userData = dashboardData?.user;
    const displayName = userData?.name || currentUser?.name || "Provider";

    const displayImg = useMemo(() => {
        return userData?.profileImage || userData?.image || userData?.img || "/placeholder-user.png";
    }, [userData]);

    const isVerified = dashboardData?.isSetupComplete || userData?.isFullProfile || false;

    // 🚀 PERFORMANCE FIX: Stable reference for stats
    const safeStats = useMemo(() => {
        return dashboardData?.stats || {
            revenue: 0, jobsCompleted: 0, pendingRequests: 0, rating: 0,
            service: { shopName: '' }
        };
    }, [dashboardData?.stats]);

    // 🚀 PERFORMANCE FIX: Use stable empty arrays to prevent cascade re-renders
    const recentBookings = dashboardData?.bookings || EMPTY_ARRAY;
    const recentOrders = dashboardData?.orders || EMPTY_ARRAY;
    const recentRentals = dashboardData?.rentals || EMPTY_ARRAY;

    // 🚀 PERFORMANCE FIX: Memoized functions
    const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const handleBackToHome = useCallback(async () => {
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
    }, [currentUser, router, setCurrentUser, showToast]);

    const handleViewChange = useCallback((view: string) => {
        setActiveView(view);
    }, []);

    const getActiveNavId = (view: string) => {
        if (['settings', 'products', 'add-product'].includes(view)) return 'settings';
        if (['profile', 'edit-profile'].includes(view)) return 'profile';
        if (['requests'].includes(view)) return 'requests';
        return 'dashboard';
    };

    const activeNavId = getActiveNavId(activeView);
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (status === 'loading' || loading) return (
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
            {toast && (
                <div className={clsx("fixed top-5 right-5 z-[110] animate-in slide-in-from-right duration-300 flex items-center gap-3 p-4 rounded-xl shadow-xl border-l-4 min-w-75 bg-white",
                    toast.type === 'success' ? "border-emerald-500 text-emerald-700" : "border-red-500 text-red-700")}>
                    <span className="font-bold text-sm">{toast.msg}</span>
                </div>
            )}

            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 z-50 shadow-sm">
                <div className="flex items-center gap-2 h-20 px-6 border-b border-slate-100">
                    <Image
                        src="/navbar.png"
                        alt="ServeBasiq Logo"
                        width={200}
                        height={96}
                        priority
                        className="h-24 w-auto object-contain"
                    />
                    <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-widest mt-1">Provider</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    <NavButton id="dashboard" icon={LayoutGrid} label="Dashboard" active={activeNavId} set={handleViewChange} />
                    <NavButton id="requests" icon={ClipboardList} label="Operations" active={activeNavId} set={handleViewChange} badge={safeStats.pendingRequests} />
                    <NavButton id="settings" icon={Package} label="Management" active={activeNavId} set={handleViewChange} />
                    <NavButton id="profile" icon={UserCircle} label="Account" active={activeNavId} set={handleViewChange} />
                </nav>

                <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex-1 min-w-0" onClick={() => handleViewChange('profile')}>
                        <Image
                            src={displayImg}
                            alt="User"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors shrink-0"
                        title="Log Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="md:hidden flex items-center h-full">
                            <Image
                                src="/navbar.png"
                                alt="ServeBasiq Logo"
                                width={200}
                                height={96}
                                priority
                                className="h-24 w-auto object-contain"
                            />
                        </div>
                        <div className="hidden md:block">
                            <h2 className="text-xl font-bold text-slate-900 capitalize">
                                {activeView === 'settings' ? 'Management' : activeView.replace('-', ' ')}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{currentDate}</p>
                        </div>
                    </div>

                    {/* 📱 OPTIMIZED RIGHT SIDE ACTIONS FOR MOBILE */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">

                        {/* 🎯 BIGGER & CLEARER WEBSITE BUTTON */}
                        <button
                            onClick={handleBackToHome}
                            className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-sm px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-blue-200 group transition-all shrink-0"
                            title="Exit to Website"
                        >
                            <Globe size={16} className="text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                            <span className="hidden sm:inline">Exit to Website</span>
                            <span className="sm:hidden">Website</span> {/* Short text visible on mobile! */}
                        </button>

                        <button className="relative p-2 sm:p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors hidden sm:block shrink-0">
                            <BellRing size={20} />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                        </button>

                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="lg:hidden relative p-2 rounded-xl text-slate-500 bg-white border border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shrink-0"
                            title="Log Out"
                        >
                            <LogOut size={16} />
                        </button>

                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border-2 border-slate-200 cursor-pointer shadow-sm shrink-0" onClick={() => handleViewChange('profile')}>
                            <Image
                                src={displayImg}
                                alt="Profile"
                                width={36}
                                height={36}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32 lg:pb-8 scroll-smooth">
                    <ProviderDashboardContent
                        activeView={activeView}
                        handleViewChange={handleViewChange}
                        handleBackToHome={handleBackToHome}
                        safeStats={safeStats}
                        isVerified={isVerified}
                        showToast={showToast}
                        userData={userData}
                        currentUser={currentUser}
                        refetchDashboard={refetchDashboard}
                        setSelectedProduct={setSelectedProduct}
                        selectedProduct={selectedProduct}
                        recentBookings={recentBookings}
                        recentOrders={recentOrders}
                        recentRentals={recentRentals}
                    />
                </main>
            </div>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50 pb-safe shadow-lg">
                <div className="flex justify-around items-center h-16">
                    <MobileNavBtn id="dashboard" icon={LayoutGrid} label="Home" active={activeNavId} set={handleViewChange} />
                    <MobileNavBtn id="requests" icon={ClipboardList} label="Ops" active={activeNavId} set={handleViewChange} />
                    <MobileNavBtn id="settings" icon={Package} label="Manage" active={activeNavId} set={handleViewChange} />
                    <MobileNavBtn id="profile" icon={UserCircle} label="Me" active={activeNavId} set={handleViewChange} />
                </div>
            </nav>

            <ConfirmLogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={fullLogout}
            />
        </div>
    );
}
