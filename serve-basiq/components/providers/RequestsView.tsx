'use client';

import { useState, useMemo } from 'react';
import {
    Loader2, CalendarClock, CheckCircle2, XCircle, Clock, Filter,
    Package, Truck, BoxSelect, Briefcase, ShoppingBag, ArrowRight
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

export default function RequestsView({ bookings = [], orders = [], showToast, onRefresh }: RequestsViewProps) {
    const [activeTab, setActiveTab] = useState<TabType>('PENDING');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // --- 1. MERGE & NORMALIZE DATA ---
    const unifiedRequests = useMemo(() => {
        const bList = bookings.map(b => ({ ...b, type: 'BOOKING', date: b.bookingDate, displayStatus: b.status }));
        const oList = orders.map(o => ({ ...o, type: 'ORDER', date: o.createdAt, displayStatus: o.status }));
        return [...bList, ...oList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [bookings, orders]);

    // --- 2. FILTER LOGIC ---
    const filteredRequests = unifiedRequests.filter((item) => {
        const s = item.displayStatus;
        if (activeTab === 'ALL') return true;
        if (activeTab === 'PENDING') return s === 'PENDING';
        if (activeTab === 'CANCELLED') return s === 'CANCELLED' || s === 'RETURNED';
        if (activeTab === 'COMPLETED') return s === 'COMPLETED' || s === 'DELIVERED';
        if (activeTab === 'ACTIVE') return ['CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(s);
        return false;
    });

    // --- 3. API ACTION HANDLER ---
    const updateStatus = async (id: string, type: 'BOOKING' | 'ORDER', newStatus: string) => {
        setProcessingId(id);
        const endpoint = type === 'BOOKING' ? '/api/bookings/update-status' : '/api/orders/update-status';
        const bodyKey = type === 'BOOKING' ? 'bookingId' : 'orderId';

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

    // --- 4. TABS CONFIG ---
    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'PENDING', label: 'Pending', icon: Clock },
        { id: 'ACTIVE', label: 'Active', icon: Truck },
        { id: 'COMPLETED', label: 'Done', icon: CheckCircle2 },
        { id: 'CANCELLED', label: 'Rejected', icon: XCircle },
        { id: 'ALL', label: 'All', icon: Filter },
    ];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full min-h-[600px] animate-in fade-in duration-500">

            {/* --- HEADER --- */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
                <div className="px-6 py-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">
                            Operations
                        </h3>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold transition-all">
                            {filteredRequests.length} Tasks
                        </span>
                    </div>

                    {/* MODERN TABS (CSS Only) */}
                    <div className="flex p-1 bg-slate-50/80 rounded-xl overflow-x-auto no-scrollbar gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex-1 min-w-[80px] py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ease-out flex flex-col sm:flex-row items-center justify-center gap-1.5 select-none",
                                    activeTab === tab.id
                                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5 scale-100"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:scale-95"
                                )}
                            >
                                <tab.icon size={14} strokeWidth={2.5} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- LIST CONTENT --- */}
            <div className="p-4 sm:p-6 bg-slate-50/50 flex-1 overflow-y-auto space-y-4">

                {filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <CalendarClock size={32} className="text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-600">No requests found</p>
                        <p className="text-xs mt-1">Check back later or switch tabs</p>
                    </div>
                ) : (
                    filteredRequests.map((req: any) => (
                        <div
                            key={req.id}
                            // ✅ CSS Animation: Fade in and slide up slightly when rendered
                            className="relative group bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-2"
                        >
                            {/* LOADING OVERLAY */}
                            {processingId === req.id && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center transition-opacity duration-200">
                                    <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                                    <span className="text-xs font-bold text-blue-600 animate-pulse">Updating...</span>
                                </div>
                            )}

                            {/* HEADER STRIP */}
                            <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <div className="flex items-center gap-2">
                                    {req.type === 'BOOKING' ? (
                                        <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                                            <Briefcase size={10} /> SERVICE
                                        </span>
                                    ) : (
                                        <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                                            <ShoppingBag size={10} /> ORDER
                                        </span>
                                    )}
                                    <span className="text-[10px] font-medium text-slate-400">#{req.id.slice(-6).toUpperCase()}</span>
                                </div>

                                {/* STATUS BADGE */}
                                <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wide",
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

                            {/* MAIN CARD CONTENT */}
                            <div className="p-1">
                                <RequestCard
                                    id={req.id}
                                    title={req.type === 'BOOKING' ? req.service?.name : `${req.product?.name} (x${req.quantity})`}
                                    customer={req.user?.name || "Guest User"}
                                    location={req.address ? `${req.address.line1}, ${req.address.city}` : (req.deliveryType === 'PICKUP' ? "Self Pickup" : "No Address")}
                                    price={req.type === 'BOOKING' ? req.service?.price : req.totalPrice}
                                    urgent={false}
                                    date={new Date(req.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    time={req.type === 'BOOKING' ? req.timeSlot : (req.deliveryType === 'PICKUP' ? 'Pickup' : 'Delivery')}
                                    customerImg={req.user?.image || req.user?.profileImage}

                                    // Pass undefined so we handle buttons manually below
                                    onAccept={undefined}
                                    onReject={undefined}
                                />
                            </div>

                            {/* ACTION FOOTER */}
                            <div className="px-5 pb-5 pt-2 grid grid-cols-1 gap-3">
                                {/* PENDING ACTIONS */}
                                {req.displayStatus === 'PENDING' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => updateStatus(req.id, req.type, 'CANCELLED')}
                                            className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => updateStatus(req.id, req.type, 'CONFIRMED')}
                                            className="flex-1 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                                        >
                                            Accept Request
                                        </button>
                                    </div>
                                )}

                                {/* BOOKING COMPLETION */}
                                {req.type === 'BOOKING' && req.displayStatus === 'CONFIRMED' && (
                                    <button onClick={() => updateStatus(req.id, 'BOOKING', 'COMPLETED')} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-100 flex items-center justify-center gap-2">
                                        <CheckCircle2 size={16} /> Mark Job Completed
                                    </button>
                                )}

                                {/* ORDER PROGRESSION */}
                                {req.type === 'ORDER' && (
                                    <>
                                        {req.displayStatus === 'CONFIRMED' && (
                                            <button onClick={() => updateStatus(req.id, 'ORDER', 'SHIPPED')} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-100 flex items-center justify-center gap-2">
                                                <Package size={16} /> Mark as Shipped <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {req.displayStatus === 'SHIPPED' && (
                                            <button onClick={() => updateStatus(req.id, 'ORDER', 'OUT_FOR_DELIVERY')} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-orange-100 flex items-center justify-center gap-2">
                                                <Truck size={16} /> Out for Delivery <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {req.displayStatus === 'OUT_FOR_DELIVERY' && (
                                            <button onClick={() => updateStatus(req.id, 'ORDER', 'DELIVERED')} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-100 flex items-center justify-center gap-2">
                                                <BoxSelect size={16} /> Confirm Delivery
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}