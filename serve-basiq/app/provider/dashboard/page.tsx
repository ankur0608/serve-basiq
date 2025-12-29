'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
    LayoutGrid, BellRing, Search, Wallet, UserCircle,
    Settings, ShieldCheck, Check, Info, ArrowLeft,
    Package, AlertTriangle, Plus, Loader2
} from 'lucide-react';
import clsx from 'clsx';

import { NavButton, MobileNavBtn } from '@/components/providers/DashboardComponents';
import {
    DashboardHomeView, RequestsView, LeadsView, EarningsView, ProfileView
} from '@/components/providers/GeneralViews';
import { ProductsView, AddProductView } from '@/components/providers/ProductViews';
import { VerificationView } from '@/components/providers/VerificationView';
import ProfileCheckModal from '@/components/ProfileCheckModal';
import { ServiceSettingsView } from '@/components/providers/ServiceSettingsView';
import ProviderServiceList from '@/components/providers/ProviderServiceList';

export default function ProviderDashboard() {
    const { currentUser, setCurrentUser } = useUIStore();
    const router = useRouter();

    const [activeView, setActiveView] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // State for Multiple Services
    const [services, setServices] = useState<any[]>([]);
    const [selectedServiceToEdit, setSelectedServiceToEdit] = useState<any>(null);

    // State for Views
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isEditingService, setIsEditingService] = useState(false);
    const [isCreatingService, setIsCreatingService] = useState(false);

    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [blockedAction, setBlockedAction] = useState("");

    const fetchDashboardData = useCallback(async () => {
        if (!currentUser) return;
        try {
            const res = await fetch('/api/services/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser?.id })
            });
            const data = await res.json();
            if (data.success) {
                setDashboardData(data);
                const processedServices = (data.services || []).map((svc: any) => ({
                    ...svc,
                    img: (svc.img && svc.img !== "") ? svc.img : (data.user?.img || "https://i.pravatar.cc/150")
                }));
                setServices(processedServices);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to load dashboard data", "error");
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

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

    const userData = dashboardData?.user;
    const displayName = userData?.name || currentUser?.name || "Provider";
    const displayImg = userData?.img || "https://i.pravatar.cc/150";
    const isSetupComplete = services.length > 0;

    const safeStats = {
        stats: dashboardData?.stats || { revenue: 0, jobsCompleted: 0, rating: 5.0, pendingRequests: 0 },
        service: services.length > 0 ? services[0] : { name: displayName, img: displayImg }
    };

    const handleViewChange = (view: string) => {
        if (!isSetupComplete && (view === 'products' || view === 'add-product' || view === 'leads' || view === 'requests')) {
            let actionName = "use this feature";
            if (view === 'products' || view === 'add-product') actionName = "add products & services";
            if (view === 'leads') actionName = "view leads";
            if (view === 'requests') actionName = "accept jobs";

            setBlockedAction(actionName);
            setShowProfileModal(true);
            return;
        }
        setActiveView(view);
        if (view !== 'settings') {
            setIsEditingService(false);
            setIsCreatingService(false);
            setSelectedServiceToEdit(null);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-blue-600 gap-3">
            <Loader2 className="animate-spin h-10 w-10" />
            <p className="font-bold text-sm animate-pulse">Loading ProviderOne...</p>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
            <ProfileCheckModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onGoToProfile={() => {
                    setShowProfileModal(false);
                    setActiveView('settings');
                    setIsCreatingService(true);
                }}
                action={blockedAction}
            />

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

            {/* --- SIDEBAR --- */}
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
                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System</p>
                        <NavButton id="settings" icon={Settings} label="Service" active={activeView} set={handleViewChange} />
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition" onClick={() => setActiveView('profile')}>
                        <img
                            src={displayImg}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            alt="Profile"
                            onError={(e) => e.currentTarget.src = "https://i.pravatar.cc/150"}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                            <p className="text-xs text-slate-500 truncate">{services.length > 0 ? `${services.length} Services` : "New Member"}</p>
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

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 h-full overflow-y-auto bg-slate-50/50 relative w-full pb-20 md:pb-0">
                <header className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={handleBackToHome} className="p-2 -ml-2 text-slate-500 hover:text-blue-600">
                            <ArrowLeft size={20} />
                        </button>
                        <span className="font-bold text-lg">ProviderOne</span>
                    </div>
                    <button onClick={() => setActiveView('profile')} className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                        <img
                            src={displayImg}
                            className="w-full h-full object-cover"
                            onError={(e) => e.currentTarget.src = "https://i.pravatar.cc/150"}
                        />
                    </button>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {activeView === 'dashboard' && <DashboardHomeView stats={safeStats} setActiveView={handleViewChange} onBackToHome={handleBackToHome} />}
                    {activeView === 'requests' && <RequestsView showToast={showToast} />}
                    {activeView === 'leads' && <LeadsView />}
                    {activeView === 'earnings' && <EarningsView />}
                    {activeView === 'profile' && <ProfileView stats={safeStats} onEdit={() => setActiveView('edit-profile')} />}

                    {activeView === 'settings' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {isCreatingService ? 'Create New Service' : (isEditingService ? 'Edit Service Details' : 'My Services')}
                                </h2>

                                {(isEditingService || isCreatingService) && (
                                    <button
                                        onClick={() => {
                                            setIsEditingService(false);
                                            setIsCreatingService(false);
                                            setSelectedServiceToEdit(null);
                                        }}
                                        className="text-sm font-bold text-slate-500 hover:text-slate-800 underline"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            {/* Service Form vs Service List */}
                            {isEditingService || isCreatingService ? (
                                <ServiceSettingsView
                                    userId={currentUser?.id || ""}
                                    serviceData={isCreatingService ? null : selectedServiceToEdit}
                                    userData={userData}
                                    userAddress={userData?.addresses?.[0]}
                                    showToast={showToast}
                                    onComplete={() => {
                                        setIsEditingService(false);
                                        setIsCreatingService(false);
                                        setSelectedServiceToEdit(null);
                                        fetchDashboardData();
                                    }}
                                />
                            ) : (
                                <div className="space-y-4">
                                    {/* Show Add Button ONLY if services exist */}
                                    {services.length > 0 && (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => setIsCreatingService(true)}
                                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg"
                                            >
                                                <Plus size={18} /> Add Another Service
                                            </button>
                                        </div>
                                    )}

                                    {/* Render List or Empty State */}
                                    {services.length > 0 ? (
                                        services.map((svc) => (
                                            <ProviderServiceList
                                                key={svc.id}
                                                service={svc}
                                                userId={currentUser?.id || ""}
                                                onEdit={() => {
                                                    setSelectedServiceToEdit(svc);
                                                    setIsEditingService(true);
                                                }}
                                                onCreate={() => setIsCreatingService(true)}
                                            />
                                        ))
                                    ) : (
                                        // Empty State Component
                                        <ProviderServiceList
                                            service={null}
                                            userId={currentUser?.id || ""}
                                            onEdit={() => { }}
                                            onCreate={() => setIsCreatingService(true)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'edit-profile' && (
                        <VerificationView
                            userId={currentUser?.id}
                            existingData={userData}
                            showToast={showToast}
                            onBack={() => {
                                fetchDashboardData();
                                setActiveView('profile');
                            }}
                        />
                    )}

                    {activeView === 'products' && <ProductsView setActiveView={handleViewChange} userId={currentUser?.id} setSelectedProduct={setSelectedProduct} showToast={showToast} />}
                    {activeView === 'add-product' && <AddProductView setActiveView={handleViewChange} userId={currentUser?.id} showToast={showToast} editingProduct={selectedProduct} />}
                </div>
            </main>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-between px-6 py-3 z-40 pb-safe shadow-t-xl">
                <MobileNavBtn id="dashboard" icon={LayoutGrid} label="Home" active={activeView} set={handleViewChange} />
                <MobileNavBtn id="requests" icon={BellRing} label="Requests" active={activeView} set={handleViewChange} badge={true} />
                <MobileNavBtn id="products" icon={Package} label="Store" active={activeView} set={handleViewChange} />
                <MobileNavBtn id="earnings" icon={Wallet} label="Earn" active={activeView} set={handleViewChange} />
                <MobileNavBtn id="profile" icon={UserCircle} label="Profile" active={activeView} set={handleViewChange} />
            </nav>
        </div>
    );
}