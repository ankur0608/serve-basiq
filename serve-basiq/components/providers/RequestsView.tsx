'use client';

import { useState, useMemo } from 'react';
import {
    Loader2, CalendarClock, CheckCircle2, XCircle, Clock, Filter,
    Package, Truck, BoxSelect, Briefcase, ShoppingBag, ArrowRight,
    ClipboardList
} from 'lucide-react';
import { RequestCard } from './DashboardComponents';
import clsx from 'clsx';

interface RequestsViewProps {
    bookings?: any[];
    orders?: any[];
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    onRefresh?: () => void;
}

type TabType = 'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type ViewMode = 'SERVICES' | 'PRODUCTS';

export default function RequestsView({ bookings = [], orders = [], showToast, onRefresh }: RequestsViewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('SERVICES');
    const [activeTab, setActiveTab] = useState<TabType>('PENDING');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // --- 1. SELECT & NORMALIZE DATA BASED ON VIEW MODE ---
    const currentData = useMemo(() => {
        if (viewMode === 'SERVICES') {
            return bookings.map(b => ({
                ...b,
                type: 'BOOKING',
                date: b.bookingDate,
                displayStatus: b.status,
                title: b.service?.name,
                price: b.service?.price,
                img: b.user?.profileImage || b.user?.image
            }));
        } else {
            return orders.map(o => ({
                ...o,
                type: 'ORDER',
                date: o.createdAt,
                displayStatus: o.status,
                title: `${o.product?.name} (x${o.quantity})`,
                price: o.totalPrice,
                img: o.user?.profileImage || o.user?.image
            }));
        }
    }, [viewMode, bookings, orders]);

    // --- 2. SORT DATA (Newest First) ---
    const sortedData = useMemo(() => {
        return [...currentData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [currentData]);

    // --- 3. FILTER LOGIC (By Status) ---
    const filteredRequests = sortedData.filter((item) => {
        const s = item.displayStatus;
        if (activeTab === 'ALL') return true;
        if (activeTab === 'PENDING') return s === 'PENDING';
        if (activeTab === 'CANCELLED') return s === 'CANCELLED' || s === 'RETURNED';
        if (activeTab === 'COMPLETED') return s === 'COMPLETED' || s === 'DELIVERED';
        if (activeTab === 'ACTIVE') return ['CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(s);
        return false;
    });

    // --- 4. API ACTION HANDLER ---
    const updateStatus = async (id: string, newStatus: string) => {
        setProcessingId(id);
        const endpoint = viewMode === 'SERVICES' ? '/api/bookings/update-status' : '/api/orders/update-status';
        const bodyKey = viewMode === 'SERVICES' ? 'bookingId' : 'orderId';

        try {
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [bodyKey]: id, status: newStatus })
            });

            const data = await res.json();

            if (data.success) {
                showToast("Status Updated Successfully", "success");
                if (onRefresh) onRefresh();
            } else {
                showToast(data.message || "Failed to update", "error");
            }
        } catch (error) {
            showToast("Network error", "error");
        } finally {
            setProcessingId(null);
        }
    };

    // --- TABS CONFIG ---
    const statusTabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'PENDING', label: 'Pending', icon: Clock },
        { id: 'ACTIVE', label: 'Active', icon: Truck },
        { id: 'COMPLETED', label: 'Done', icon: CheckCircle2 },
        { id: 'CANCELLED', label: 'Rejected', icon: XCircle },
        { id: 'ALL', label: 'All', icon: Filter },
    ];

    return (
        <div className="space-y-6">

            {/* --- TOP TOGGLE: SERVICES vs PRODUCTS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="w-full md:w-auto">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Operation Type</label>
                    <div className="flex p-1.5 bg-white rounded-xl max-w-md border border-slate-200 shadow-sm w-full md:min-w-[300px]">
                        <button
                            onClick={() => { setViewMode('SERVICES'); setActiveTab('PENDING'); }}
                            className={clsx(
                                "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                viewMode === 'SERVICES' ? "bg-[#0f172a] text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <Briefcase size={16} /> Services
                        </button>
                        <button
                            onClick={() => { setViewMode('PRODUCTS'); setActiveTab('PENDING'); }}
                            className={clsx(
                                "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                viewMode === 'PRODUCTS' ? "bg-[#0f172a] text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <ShoppingBag size={16} /> Products
                        </button>
                    </div>
                </div>

                {/* Stats Badge */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
                    <ClipboardList size={16} className="text-blue-600" />
                    {filteredRequests.length} {viewMode === 'SERVICES' ? 'Bookings' : 'Orders'} Found
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">

                {/* Status Filter Bar */}
                <div className="px-4 py-4 border-b border-slate-100 bg-white overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 min-w-max">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
                                    activeTab === tab.id
                                        ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                <tab.icon size={14} className={activeTab === tab.id ? "text-blue-600" : ""} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Content */}
                <div className="p-4 sm:p-6 bg-slate-50/50 flex-1">
                    {filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                <CalendarClock size={32} className="text-slate-300" />
                            </div>
                            <h3 className="font-bold text-slate-700 text-lg">No {viewMode.toLowerCase()} found</h3>
                            <p className="text-sm mt-1 text-slate-500">
                                No {activeTab.toLowerCase()} {viewMode === 'SERVICES' ? 'bookings' : 'orders'} at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredRequests.map((req: any) => (
                                <div
                                    key={req.id}
                                    className="relative group bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-300 overflow-hidden"
                                >
                                    {/* LOADING OVERLAY */}
                                    {processingId === req.id && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center transition-opacity duration-200">
                                            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                                            <span className="text-xs font-bold text-blue-600 animate-pulse">Updating...</span>
                                        </div>
                                    )}

                                    {/* HEADER STRIP */}
                                    <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                        <div className="flex items-center gap-2">
                                            {viewMode === 'SERVICES' ? (
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                                    <Briefcase size={10} /> SERVICE
                                                </span>
                                            ) : (
                                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                                    <ShoppingBag size={10} /> ORDER
                                                </span>
                                            )}
                                            <span className="text-[10px] font-medium text-slate-400">#{req.id.slice(-6).toUpperCase()}</span>
                                        </div>

                                        {/* STATUS BADGE */}
                                        <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wide",
                                            req.displayStatus === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                ['CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(req.displayStatus) ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                    ['COMPLETED', 'DELIVERED'].includes(req.displayStatus) ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                        "bg-red-50 text-red-700 border-red-100"
                                        )}>
                                            <span className={clsx("w-1.5 h-1.5 rounded-full",
                                                req.displayStatus === 'PENDING' ? "bg-amber-500" :
                                                    ['CONFIRMED', 'SHIPPED'].includes(req.displayStatus) ? "bg-blue-500" :
                                                        ['COMPLETED', 'DELIVERED'].includes(req.displayStatus) ? "bg-emerald-500" : "bg-red-500"
                                            )}></span>
                                            {req.displayStatus.replace(/_/g, " ")}
                                        </span>
                                    </div>

                                    {/* MAIN CONTENT */}
                                    <div className="p-1">
                                        <RequestCard
                                            id={req.id}
                                            title={req.title}
                                            customer={req.user?.name || "Guest User"}
                                            location={req.address ? `${req.address.line1}, ${req.address.city}` : (req.deliveryType === 'PICKUP' ? "Self Pickup" : "No Address")}
                                            price={req.price}
                                            urgent={false}
                                            date={new Date(req.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            time={viewMode === 'SERVICES' ? req.timeSlot : (req.deliveryType === 'PICKUP' ? 'Pickup' : 'Delivery')}
                                            customerImg={req.img}
                                            onAccept={undefined} // Handled in footer
                                            onReject={undefined} // Handled in footer
                                        />
                                    </div>

                                    {/* ACTION FOOTER */}
                                    <div className="px-4 pb-4 pt-1">

                                        {/* PENDING STATE (Both Types) */}
                                        {req.displayStatus === 'PENDING' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => updateStatus(req.id, 'CANCELLED')}
                                                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(req.id, 'CONFIRMED')}
                                                    className="flex-1 py-2.5 bg-[#0f172a] text-white hover:bg-slate-800 text-xs font-bold rounded-lg transition-transform active:scale-95 shadow-md"
                                                >
                                                    Accept Request
                                                </button>
                                            </div>
                                        )}

                                        {/* SERVICES SPECIFIC ACTIONS */}
                                        {viewMode === 'SERVICES' && req.displayStatus === 'CONFIRMED' && (
                                            <button onClick={() => updateStatus(req.id, 'COMPLETED')} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2">
                                                <CheckCircle2 size={16} /> Mark Job Completed
                                            </button>
                                        )}

                                        {/* PRODUCTS SPECIFIC ACTIONS */}
                                        {viewMode === 'PRODUCTS' && (
                                            <>
                                                {req.displayStatus === 'CONFIRMED' && (
                                                    <button onClick={() => updateStatus(req.id, 'SHIPPED')} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2">
                                                        <Package size={16} /> Mark as Shipped <ArrowRight size={14} />
                                                    </button>
                                                )}
                                                {req.displayStatus === 'SHIPPED' && (
                                                    <button onClick={() => updateStatus(req.id, 'OUT_FOR_DELIVERY')} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2">
                                                        <Truck size={16} /> Out for Delivery <ArrowRight size={14} />
                                                    </button>
                                                )}
                                                {req.displayStatus === 'OUT_FOR_DELIVERY' && (
                                                    <button onClick={() => updateStatus(req.id, 'DELIVERED')} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2">
                                                        <BoxSelect size={16} /> Confirm Delivery
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}