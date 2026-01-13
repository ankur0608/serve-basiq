'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useProviderDashboard } from '@/app/hook/useProviderDashboard';
import {
    LayoutGrid, ClipboardList, Package, Wallet, UserCircle,
    BellRing, ArrowLeft, Loader2, AlertTriangle, Hexagon, LogOut, Plus, ShieldCheck, CheckCircle2, X
} from 'lucide-react';
import clsx from 'clsx';

import { NavButton, MobileNavBtn } from '@/components/providers/DashboardComponents';
import {
    DashboardHomeView, LeadsView, EarningsView, ProfileView
} from '@/components/providers/GeneralViews';
import { ProductsView, AddProductView } from '@/components/providers/ProductViews';
import { ServiceSettingsView } from '@/components/providers/ServiceSettingsView';
import ProviderServiceList from '@/components/providers/ProviderServiceList';
import { VerificationView } from '@/components/providers/VerificationView';
import RequestsView from '@/components/providers/RequestsView';

export default function ProviderDashboard() {
    const { currentUser, setCurrentUser } = useUIStore();
    const router = useRouter();

    const { data: dashboardData, isLoading: loading, refetch, isError } = useProviderDashboard(currentUser?.id);

    const [activeView, setActiveView] = useState('dashboard');
    const [selectedServiceToEdit, setSelectedServiceToEdit] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isEditingService, setIsEditingService] = useState(false);
    const [isCreatingService, setIsCreatingService] = useState(false);
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);

    // State for the Welcome/Restriction Modal
    const [showRestrictionModal, setShowRestrictionModal] = useState(false);

    // ✅ EXTRACT BOOKINGS AND ORDERS
    const bookings = dashboardData?.bookings || [];
    const orders = dashboardData?.orders || []; // <--- ✅ ADDED THIS LINE

    // ✅ RE-ESTABLISH userData from dashboardData
    const userData = dashboardData?.user;

    // Derived State
    const services = useMemo(() => {
        const rawServices = dashboardData?.user?.services || dashboardData?.services || [];

        return rawServices.map((svc: any) => ({
            ...svc,
            img: svc.serviceimg || svc.mainimg || svc.img || ""
        }));
    }, [dashboardData]);

    // ✅ CONSOLIDATED DATA for VerificationView
    const extendedUserData = useMemo(() => {
        if (!dashboardData?.user) return null;
        return dashboardData.user;
    }, [dashboardData]);


    const isVerified = dashboardData?.isSetupComplete || false;

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (dashboardData && !dashboardData.isSetupComplete) {
            setShowRestrictionModal(true);
        }
    }, [dashboardData]);

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

    const safeStats = {
        stats: dashboardData?.stats || { revenue: 0, jobsCompleted: 0, rating: 5.0, pendingRequests: 0 },
        service: services.length > 0 ? services[0] : { name: displayName, img: displayImg }
    };

    const handleViewChange = (view: string) => {
        if (view === 'dashboard' || view === 'profile' || view === 'edit-profile') {
            setActiveView(view);
            setIsEditingService(false);
            setIsCreatingService(false);
            setSelectedServiceToEdit(null);
            return;
        }

        if (!isVerified) {
            setShowRestrictionModal(true);
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
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FC] text-[#0f172a] gap-3">
            <Loader2 className="animate-spin h-10 w-10" />
            <p className="font-bold text-sm animate-pulse">Loading ServeBasiq...</p>
        </div>
    );

    if (isError) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FC] text-red-600 gap-3">
            <AlertTriangle className="h-10 w-10" />
            <p className="font-bold text-sm">Failed to load dashboard data.</p>
            <button onClick={() => refetch()} className="text-[#0f172a] underline">Retry</button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8F9FC] font-sans text-slate-800 selection:bg-[#0f172a] selection:text-white relative">

            {/* --- "COMPLETE PROFILE" POPUP MODAL --- */}
            {showRestrictionModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowRestrictionModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
                            <X size={20} />
                        </button>
                        <div className="p-8 text-center">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-blue-50/50">
                                <ShieldCheck className="w-12 h-12 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Setup Your Profile</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                                To start receiving orders and managing your services, we need you to complete a quick verification. It only takes a minute!
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { setShowRestrictionModal(false); setActiveView('edit-profile'); }} className="w-full py-4 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                                    Complete Setup Now <CheckCircle2 size={18} />
                                </button>
                                <button onClick={() => setShowRestrictionModal(false)} className="w-full py-3.5 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm">
                                    I'll do this later
                                </button>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={clsx("fixed top-5 right-5 z-100 animate-in slide-in-from-right duration-300 flex items-center gap-3 p-4 rounded-xl shadow-xl border-l-4 min-w-75 bg-white", toast.type === 'success' ? "border-emerald-500 text-emerald-700" : toast.type === 'error' ? "border-red-500 text-red-700" : "border-blue-500 text-blue-700")}>
                    <span className="font-bold text-sm">{toast.msg}</span>
                </div>
            )}

            {/* --- SIDEBAR --- */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 z-50 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-3 h-20 px-8 border-b border-slate-100">
                    <div className="bg-blue-600 text-white p-2.5 rounded-xl"><Hexagon size={24} fill="currentColor" /></div>
                    <div>
                        <h1 className="text-black font-extrabold tracking-tight text-xl leading-tight">ServeBasiq</h1>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Admin Panel</p>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    <NavButton id="dashboard" icon={LayoutGrid} label="Dashboard" active={activeView} set={handleViewChange} />
                    <NavButton id="requests" icon={ClipboardList} label="Operations" active={activeView} set={handleViewChange} badge={safeStats.stats.pendingRequests} />
                    <NavButton id="settings" icon={Package} label="Management" active={activeView} set={handleViewChange} />
                    <NavButton id="earnings" icon={Wallet} label="Earnings" active={activeView} set={handleViewChange} />
                    <NavButton id="profile" icon={UserCircle} label="Profile" active={activeView} set={handleViewChange} />
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-200" onClick={() => setActiveView('profile')}>
                        <div className="relative">
                            <img src={displayImg} className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" alt="Profile" />
                            <div className={clsx("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white", isVerified ? "bg-emerald-500" : "bg-orange-500")}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                            <p className="text-xs text-slate-500 truncate">{isVerified ? "Verified Provider" : "Pending Verification"}</p>
                        </div>
                        <button className="text-slate-400 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="md:hidden"><span className="font-extrabold text-blue-900">ServeBasiq</span></div>
                        <div className="hidden md:block">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight capitalize">{activeView === 'settings' ? 'Management' : activeView.replace('-', ' ')}</h2>
                            <p className="text-xs text-slate-500 font-bold hidden sm:block">{currentDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button onClick={handleBackToHome} className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-white px-4 py-2.5 rounded-xl border border-slate-200 hover:shadow-sm transition-all group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Website
                        </button>
                        <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
                            <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
                            <BellRing size={20} />
                        </button>
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 cursor-pointer" onClick={() => setActiveView('profile')}>
                            <img src={displayImg} className="h-full w-full object-cover" alt="Profile" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-32 lg:pb-8 scroll-smooth">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeView === 'dashboard' && <DashboardHomeView stats={safeStats} setActiveView={handleViewChange} onBackToHome={handleBackToHome} isVerified={isVerified} />}

                        {/* 📋 REQUESTS VIEW (UPDATED) */}
                        {activeView === 'requests' && (
                            <RequestsView
                                bookings={bookings}
                                orders={orders} // <--- ✅ ADDED THIS PROP
                                showToast={showToast}
                                onRefresh={refetch}
                            />
                        )}

                        {activeView === 'leads' && <LeadsView />}
                        {activeView === 'earnings' && <EarningsView />}
                        {activeView === 'profile' && <ProfileView stats={safeStats} user={userData} onEdit={() => setActiveView('edit-profile')} />}

                        {activeView === 'settings' && (
                            <div className="space-y-6">
                                <div className="flex p-1.5 bg-white rounded-xl mb-6 max-w-md border border-slate-200 shadow-sm">
                                    <button onClick={() => setActiveView('settings')} className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-[#0f172a] text-white shadow-md transition-all">Services</button>
                                    <button onClick={() => setActiveView('products')} className="flex-1 py-2.5 text-sm font-bold rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">Products</button>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Package size={20} className="text-pink-500" /> My Services</h3>
                                        {!isEditingService && !isCreatingService && (
                                            <button onClick={() => setIsCreatingService(true)} className="flex items-center gap-2 bg-[#0f172a] text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg text-sm font-bold"><Plus size={16} /> Add Service</button>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        {isEditingService || isCreatingService ? (
                                            <ServiceSettingsView
                                                userId={currentUser?.id || ""}
                                                serviceData={isCreatingService ? null : selectedServiceToEdit}
                                                userData={userData}
                                                userAddress={userData?.addresses?.[0]}
                                                showToast={showToast}
                                                onComplete={() => { setIsEditingService(false); setIsCreatingService(false); setSelectedServiceToEdit(null); refetch(); }}
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2 mb-2">
                                                    <div className="col-span-1">ID</div>
                                                    <div className="col-span-4">Service Name</div>
                                                    <div className="col-span-2">Category</div>
                                                    <div className="col-span-2">Rate (INR)</div>
                                                    <div className="col-span-3 text-right">Status</div>
                                                </div>
                                                {services.map((svc: any) => (
                                                    <ProviderServiceList key={svc.id} service={svc} userId={currentUser?.id || ""} onEdit={() => { setSelectedServiceToEdit(svc); setIsEditingService(true); }} onCreate={() => setIsCreatingService(true)} />
                                                ))}
                                                {services.length === 0 && <div className="text-center py-10 text-slate-400">No services found. Click "Add Service" to create one.</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeView === 'products' && (
                            <div className="space-y-6">
                                <div className="flex p-1.5 bg-white rounded-xl mb-6 max-w-md border border-slate-200 shadow-sm">
                                    <button onClick={() => setActiveView('settings')} className="flex-1 py-2.5 text-sm font-bold rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">Services</button>
                                    <button onClick={() => setActiveView('products')} className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-[#0f172a] text-white shadow-md transition-all">Products</button>
                                </div>
                                <ProductsView setActiveView={handleViewChange} userId={currentUser?.id} setSelectedProduct={setSelectedProduct} showToast={showToast} />
                            </div>
                        )}

                        {activeView === 'edit-profile' && (
                            <VerificationView
                                userId={currentUser?.id || ""}
                                existingData={extendedUserData}
                                showToast={showToast}
                                onBack={() => {
                                    refetch();
                                    setActiveView('profile');
                                }}
                            />
                        )}
                        {activeView === 'add-product' && <AddProductView setActiveView={handleViewChange} userId={currentUser?.id} showToast={showToast} editingProduct={selectedProduct} />}
                    </div>
                </main>
            </div>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50 pb-safe shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.05)] transition-all">
                <div className="flex justify-around items-center h-16 px-1">
                    <MobileNavBtn id="dashboard" icon={LayoutGrid} label="Home" active={activeView} set={handleViewChange} />
                    <MobileNavBtn id="requests" icon={ClipboardList} label="Ops" active={activeView} set={handleViewChange} />
                    <MobileNavBtn id="settings" icon={Package} label="Manage" active={activeView} set={handleViewChange} />
                    <MobileNavBtn id="earnings" icon={Wallet} label="Earn" active={activeView} set={handleViewChange} />
                    <MobileNavBtn id="profile" icon={UserCircle} label="Profile" active={activeView} set={handleViewChange} />
                </div>
            </nav>
        </div>
    );
}