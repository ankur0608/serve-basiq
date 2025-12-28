'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
    LayoutGrid, BellRing, Search, Wallet, UserCircle,
    Settings, ShieldCheck, Check, Info, ArrowLeft,
    Package, AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';

// --- COMPONENT IMPORTS ---
import { NavButton, MobileNavBtn } from '@/components/providers/DashboardComponents';
import {
    DashboardHomeView, RequestsView, LeadsView, EarningsView, ProfileView
} from '@/components/providers/GeneralViews';
import { ProductsView, AddProductView } from '@/components/providers/ProductViews';
import { ServiceSettingsView } from '@/components/providers/ServiceSettingsView'; // ✅ Fixed Import
import { VerificationView } from '@/components/providers/VerificationView';
import ProfileCheckModal from '@/components/ProfileCheckModal';

export default function ProviderDashboard() {
    const { currentUser, setCurrentUser } = useUIStore();
    const router = useRouter();

    // --- STATE MANAGEMENT ---
    const [activeView, setActiveView] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Toast State
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);

    // Modal State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [blockedAction, setBlockedAction] = useState("");

    // --- FETCH DATA ON MOUNT ---
    useEffect(() => {
        if (!currentUser) return;

        async function fetchData() {
            try {
                const res = await fetch('/api/provider/stats', {
                    method: 'POST',
                    body: JSON.stringify({ userId: currentUser?.id })
                });
                const data = await res.json();

                if (data.success) {
                    setDashboardData(data);

                    // 🚨 TOAST ON ENTRY: If profile is missing, warn the user immediately
                    if (!data.service) {
                        showToast("⚠️ Action Required: Complete your profile to verify your account.", "error");
                    }
                }
            } catch (err) {
                console.error(err);
                showToast("Failed to load dashboard data", "error");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [currentUser]);

    // --- HELPERS ---
    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

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

    // --- DISPLAY DATA PREPARATION ---
    const serviceData = dashboardData?.service;
    const userData = dashboardData?.user;
    const isSetupComplete = !!serviceData; // Boolean: true if service exists

    const displayName = serviceData?.name || userData?.name || currentUser?.name || "Provider";
    const displayImg = serviceData?.img || userData?.img || "https://i.pravatar.cc/150";
    const displayCategory = serviceData?.cat || "New Member";
    const displayDesc = serviceData?.desc || "Welcome to your dashboard.";

    // Safe Stats Object
    const safeStats = {
        stats: dashboardData?.stats || { revenue: 0, jobsCompleted: 0, rating: 5.0, pendingRequests: 0 },
        service: {
            name: displayName,
            img: displayImg,
            cat: displayCategory,
            desc: displayDesc,
            ...serviceData
        }
    };

    // --- NAVIGATION INTERCEPTOR ---
    const handleViewChange = (view: string) => {
        // 🔒 BLOCKING LOGIC
        // If profile is NOT complete AND user tries to access these features
        if (!isSetupComplete && (view === 'products' || view === 'add-product' || view === 'leads' || view === 'requests')) {
            let actionName = "use this feature";
            if (view === 'products' || view === 'add-product') actionName = "add products & services";
            if (view === 'leads') actionName = "view leads";
            if (view === 'requests') actionName = "accept jobs";

            setBlockedAction(actionName);
            setShowProfileModal(true);
            return;
        }

        // Allow navigation
        setActiveView(view);
    };

    // --- RENDER ---
    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-blue-600 font-bold animate-pulse">Loading ProviderOne...</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">

            {/* --- 1. PROFILE CHECK MODAL --- */}
            <ProfileCheckModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onGoToProfile={() => {
                    setShowProfileModal(false);
                    // Redirect to Settings
                    setActiveView('settings');
                }}
                action={blockedAction}
            />

            {/* --- 2. TOAST NOTIFICATION --- */}
            {toast && (
                <div className="fixed top-5 right-5 z-[100] animate-in slide-in-from-right duration-300">
                    <div className={clsx(
                        "flex items-center gap-3 p-4 rounded-lg border-l-4 shadow-xl bg-white min-w-[300px]",
                        toast.type === 'success' ? "border-green-500 text-green-700" :
                            toast.type === 'error' ? "border-red-500 text-red-700" : "border-blue-500 text-blue-700"
                    )}>
                        {toast.type === 'success' ? <Check size={20} /> : <Info size={20} />}
                        <span className="font-semibold text-sm">{toast.msg}</span>
                    </div>
                </div>
            )}

            {/* --- 3. SIDEBAR (DESKTOP) --- */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-full shadow-sm z-20">
                <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-slate-900">ProviderOne</h1>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <NavButton id="dashboard" icon={LayoutGrid} label="Dashboard" active={activeView} set={handleViewChange} />
                    <NavButton id="requests" icon={BellRing} label="Requests" active={activeView} set={handleViewChange} badge={safeStats.stats.pendingRequests} />
                    <NavButton id="leads" icon={Search} label="Leads" active={activeView} set={handleViewChange} />
                    <NavButton id="earnings" icon={Wallet} label="Earnings" active={activeView} set={handleViewChange} />
                    <NavButton id="products" icon={Package} label="Products" active={activeView} set={handleViewChange} />
                    <NavButton id="profile" icon={UserCircle} label="Profile" active={activeView} set={handleViewChange} />

                    {/* ✅ System Section for Settings */}
                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System</p>
                        <NavButton id="settings" icon={Settings} label="Service" active={activeView} set={handleViewChange} />
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition" onClick={() => setActiveView('profile')}>
                        <img src={displayImg} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="Profile" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                            <p className="text-xs text-slate-500 truncate">{displayCategory}</p>
                        </div>
                        {isSetupComplete ? (
                            <span className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-xs font-bold shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-green-50 animate-pulse"></span> Online
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-full text-xs font-bold shadow-sm">
                                <AlertTriangle size={10} /> Incomplete
                            </span>
                        )}
                    </div>
                </div>
            </aside>

            {/* --- 4. MAIN CONTENT --- */}
            <main className="flex-1 h-full overflow-y-auto bg-slate-50/50 relative w-full pb-20 md:pb-0">

                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={handleBackToHome} className="p-2 -ml-2 text-slate-500 hover:text-blue-600">
                            <ArrowLeft size={20} />
                        </button>
                        <span className="font-bold text-lg">ProviderOne</span>
                    </div>
                    <button onClick={() => setActiveView('profile')} className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                        <img src={displayImg} className="w-full h-full object-cover" />
                    </button>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">

                    {/* View Rendering */}
                    {activeView === 'dashboard' && (
                        <DashboardHomeView
                            stats={safeStats}
                            setActiveView={handleViewChange}
                            onBackToHome={handleBackToHome}
                        />
                    )}

                    {activeView === 'requests' && <RequestsView showToast={showToast} />}
                    {activeView === 'leads' && <LeadsView />}
                    {activeView === 'earnings' && <EarningsView />}

                    {activeView === 'profile' && (
                        <ProfileView
                            stats={safeStats}
                            onEdit={() => setActiveView('edit-profile')}
                        />
                    )}

                    {/* ✅ Settings View */}
                    {activeView === 'settings' && (
                        <ServiceSettingsView
                            userId={currentUser?.id || ""}
                            serviceData={serviceData}
                            userAddress={userData?.addresses?.[0]}
                            showToast={showToast}
                        />
                    )}
                    {/* Hidden Edit Profile View */}
                    {activeView === 'edit-profile' && (
                        <VerificationView
                            userId={currentUser?.id}
                            // 👇 CHANGE THIS: Pass userData instead of serviceData
                            existingData={userData}
                            showToast={showToast}
                            onBack={() => {
                                // Optional: Refresh data here if you want immediate updates without refresh
                                setActiveView('profile');
                            }}
                        />
                    )}
                    {activeView === 'products' && (
                        <ProductsView
                            setActiveView={handleViewChange}
                            userId={currentUser?.id}
                            setSelectedProduct={setSelectedProduct}
                            showToast={showToast}
                        />
                    )}

                    {activeView === 'add-product' && (
                        <AddProductView
                            setActiveView={handleViewChange}
                            userId={currentUser?.id}
                            showToast={showToast}
                            editingProduct={selectedProduct}
                        />
                    )}
                </div>
            </main>

            {/* --- 5. MOBILE BOTTOM NAV --- */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-between px-6 py-2 z-40 pb-safe">
                <MobileNavBtn id="dashboard" icon={LayoutGrid} label="Home" active={activeView} set={handleViewChange} />
                <MobileNavBtn id="requests" icon={BellRing} label="Requests" active={activeView} set={handleViewChange} badge={true} />
                <MobileNavBtn id="products" icon={Package} label="Store" active={activeView} set={handleViewChange} />
                <MobileNavBtn id="earnings" icon={Wallet} label="Earn" active={activeView} set={handleViewChange} />
                <MobileNavBtn id="profile" icon={UserCircle} label="Profile" active={activeView} set={handleViewChange} />
            </nav>
        </div>
    );
}