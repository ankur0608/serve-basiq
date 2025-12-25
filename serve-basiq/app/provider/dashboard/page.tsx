'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
    LayoutGrid, BellRing, Search, Wallet, UserCircle,
    FileCheck, Settings, ShieldCheck, Check, Info, ArrowLeft,
    Package // ✅ Added Package Icon
} from 'lucide-react';
import clsx from 'clsx';

// Import Components and Views
import { NavButton, MobileNavBtn } from '@/components/providers/DashboardComponents';
import {
    DashboardHomeView, RequestsView, LeadsView, EarningsView, ProfileView,
    ProductsView, AddProductView // ✅ Added Product Views
} from '@/components/providers/DashboardViews';

export default function ProviderDashboard() {
    const { currentUser, setCurrentUser } = useUIStore();
    const router = useRouter();
    const [activeView, setActiveView] = useState('dashboard');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data on Mount
    useEffect(() => {
        if (!currentUser) return;

        async function fetchStats() {
            try {
                const res = await fetch('/api/provider/stats', {
                    method: 'POST',
                    body: JSON.stringify({ userId: currentUser?.id })
                });
                const data = await res.json();
                if (data.success) {
                    setStats(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [currentUser]);

    // Simple Toast Logic
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);
    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Handle Switch Back to Website Mode
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
            console.error("Failed to switch mode", error);
            showToast("Failed to switch mode", "error");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-blue-600 font-bold">Loading Dashboard...</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">

            {/* TOAST */}
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

            {/* SIDEBAR (Desktop) */}
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
                    <NavButton id="dashboard" icon={LayoutGrid} label="Dashboard" active={activeView} set={setActiveView} />
                    <NavButton id="requests" icon={BellRing} label="Requests" active={activeView} set={setActiveView} badge={stats?.stats.pendingRequests} />
                    <NavButton id="leads" icon={Search} label="Leads" active={activeView} set={setActiveView} />
                    <NavButton id="earnings" icon={Wallet} label="Earnings" active={activeView} set={setActiveView} />
                    {/* ✅ New Product Button */}
                    <NavButton id="products" icon={Package} label="Products" active={activeView} set={setActiveView} />
                    <NavButton id="profile" icon={UserCircle} label="Profile" active={activeView} set={setActiveView} />

                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System</p>
                        <NavButton id="documents" icon={FileCheck} label="Documents" active={activeView} set={setActiveView} />
                        <NavButton id="settings" icon={Settings} label="Settings" active={activeView} set={setActiveView} />
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition" onClick={() => setActiveView('profile')}>
                        <img src={stats?.service.img || "https://i.pravatar.cc/150"} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{stats?.service.name}</p>
                            <p className="text-xs text-slate-500 truncate">{stats?.service.cat}</p>
                        </div>
                        <span className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-xs font-bold shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                        </span>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
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
                        <img src={stats?.service.img || "https://i.pravatar.cc/150"} className="w-full h-full object-cover" />
                    </button>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {/* View Switcher Logic */}
                    {activeView === 'dashboard' && <DashboardHomeView stats={stats} setActiveView={setActiveView} onBackToHome={handleBackToHome} />}
                    {activeView === 'requests' && <RequestsView showToast={showToast} />}
                    {activeView === 'leads' && <LeadsView />}
                    {activeView === 'earnings' && <EarningsView />}
                    {activeView === 'profile' && <ProfileView stats={stats} />}

                    {/* ✅ New Product Views */}
                    {activeView === 'products' && <ProductsView setActiveView={setActiveView} userId={currentUser?.id} />}
                    {activeView === 'add-product' && <AddProductView setActiveView={setActiveView} userId={currentUser?.id} showToast={showToast} />}
                </div>
            </main>

            {/* MOBILE BOTTOM NAV */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-between px-6 py-2 z-40 pb-safe">
                <MobileNavBtn id="dashboard" icon={LayoutGrid} label="Home" active={activeView} set={setActiveView} />
                <MobileNavBtn id="requests" icon={BellRing} label="Requests" active={activeView} set={setActiveView} badge={true} />
                <MobileNavBtn id="products" icon={Package} label="Store" active={activeView} set={setActiveView} />
                <MobileNavBtn id="earnings" icon={Wallet} label="Earn" active={activeView} set={setActiveView} />
                <MobileNavBtn id="profile" icon={UserCircle} label="Profile" active={activeView} set={setActiveView} />
            </nav>
        </div>
    );
}