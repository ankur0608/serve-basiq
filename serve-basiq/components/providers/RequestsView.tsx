'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    Loader2, Calendar, Clock, MapPin,
    CheckCircle2, XCircle, Filter, Package,
    Truck, Briefcase, ShoppingBag, ArrowRight,
    User as UserIcon, BoxSelect, KeyRound
} from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/lib/store';
import { useProviderRequests } from '@/app/hook/useProviderRequests';

// --- Types ---
interface RequestsViewProps {
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    providerType: string;
}

type TabType = 'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type ViewMode = 'SERVICES' | 'PRODUCTS';

// --- Helper: Currency Formatter ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// --- SUB-COMPONENT: Request Card ---
const RequestCard = ({
    data,
    onAction,
    isProcessing
}: {
    data: any;
    onAction: (id: string, status: string, isRental: boolean) => void;
    isProcessing: boolean;
}) => {

    // Status Color Logic
    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            'REQUESTED': 'bg-amber-100 text-amber-700 border-amber-200',
            'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
            'ACCEPTED': 'bg-blue-100 text-blue-700 border-blue-200',
            'APPROVED': 'bg-blue-100 text-blue-700 border-blue-200',
            'CONFIRMED': 'bg-blue-100 text-blue-700 border-blue-200',
            'IN_PROGRESS': 'bg-purple-100 text-purple-700 border-purple-200',
            'ACTIVE': 'bg-purple-100 text-purple-700 border-purple-200',
            'SHIPPED': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'DELIVERED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'COMPLETED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'CANCELLED': 'bg-red-50 text-red-600 border-red-100',
            'REJECTED': 'bg-red-50 text-red-600 border-red-100',
        };
        return map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full relative group">

            {/* Loading Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                    <span className="text-xs font-bold text-blue-600">Updating...</span>
                </div>
            )}

            {/* --- Header: Status, Type & ID --- */}
            <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">

                    {/* ✅ TYPE BADGE: Distinguish Rental vs Service */}
                    {data.type === 'RENTAL' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1">
                            <KeyRound size={10} /> RENTAL
                        </span>
                    ) : data.type === 'BOOKING' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Briefcase size={10} /> SERVICE
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                            <Package size={10} /> ORDER
                        </span>
                    )}
  
                    {/* Status Badge */}
                    <span className={clsx("px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border", getStatusColor(data.displayStatus))}>
                        {data.displayStatus.replace('_', ' ')}
                    </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    #{data.id.slice(-6).toUpperCase()}
                </div>
            </div>

            {/* --- Body: Content --- */}
            <div className="p-5 flex-1">
                {/* User Info Row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            {data.img ? (
                                <img src={data.img} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={18} className="text-slate-400" />
                            )}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-tight">{data.user?.name || "Guest User"}</h4>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                                <MapPin size={10} />
                                <span className="truncate max-w-30">
                                    {data.address ? `${data.address.city}` : (data.deliveryType === 'PICKUP' ? 'Self Pickup' : 'No Location')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{formatCurrency(data.price)}</div>
                        <div className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1">
                            {data.paymentStatus === 'PAID' ? 'Paid' : 'COD / Pending'}
                        </div>
                    </div>
                </div>

                {/* Item Details */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                    <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            {data.type === 'BOOKING' ? <Briefcase size={20} className="text-blue-500" /> :
                                data.type === 'RENTAL' ? <KeyRound size={20} className="text-orange-500" /> :
                                    <Package size={20} className="text-purple-500" />}
                        </div>
                        <div className="flex-1">
                            <h5 className="text-sm font-bold text-slate-800 line-clamp-1">{data.title}</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <p className="text-xs text-slate-500 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    <Calendar size={10} />
                                    {new Date(data.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    {data.type === 'BOOKING' || data.type === 'RENTAL' ? (
                                        <><Clock size={10} /> {data.timeSlot}</>
                                    ) : (
                                        <><ShoppingBag size={10} /> {data.deliveryType}</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Footer: Actions --- */}
            <div className="p-4 pt-0 mt-auto">
                {/* PENDING ACTIONS */}
                {['REQUESTED', 'PENDING'].includes(data.displayStatus) && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onAction(data.id, 'CANCELLED', data.type === 'RENTAL')}
                            disabled={isProcessing}
                            className="py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => onAction(data.id, data.type === 'RENTAL' ? 'APPROVED' : 'ACCEPTED', data.type === 'RENTAL')}
                            disabled={isProcessing}
                            className="py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-md shadow-slate-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={14} /> Accept Request
                        </button>
                    </div>
                )}

                {/* SERVICE & RENTAL WORKFLOW */}
                {(data.type === 'BOOKING' || data.type === 'RENTAL') && (
                    <>
                        {(data.displayStatus === 'ACCEPTED' || data.displayStatus === 'APPROVED') && (
                            <button
                                onClick={() => onAction(data.id, data.type === 'RENTAL' ? 'ACTIVE' : 'IN_PROGRESS', data.type === 'RENTAL')}
                                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-100 flex items-center justify-center gap-2 transition-all"
                            >
                                <Truck size={16} /> {data.type === 'RENTAL' ? 'Mark Picked Up / Active' : 'Start Job / On Way'}
                            </button>
                        )}
                        {(data.displayStatus === 'IN_PROGRESS' || data.displayStatus === 'ACTIVE') && (
                            <button
                                onClick={() => onAction(data.id, 'COMPLETED', data.type === 'RENTAL')}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition-all"
                            >
                                <CheckCircle2 size={16} /> {data.type === 'RENTAL' ? 'Mark Returned / Completed' : 'Mark Completed'}
                            </button>
                        )}
                    </>
                )}

                {/* PRODUCT WORKFLOW */}
                {data.type === 'ORDER' && (
                    <>
                        {data.displayStatus === 'ACCEPTED' && (
                            <button
                                onClick={() => onAction(data.id, 'SHIPPED', false)}
                                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all"
                            >
                                <Package size={16} /> Mark Shipped
                            </button>
                        )}
                        {data.displayStatus === 'SHIPPED' && (
                            <button
                                onClick={() => onAction(data.id, 'DELIVERED', false)}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition-all"
                            >
                                <BoxSelect size={16} /> Confirm Delivery
                            </button>
                        )}
                    </>
                )}

                {/* COMPLETED / CANCELLED STATE */}
                {['COMPLETED', 'DELIVERED', 'CANCELLED', 'REJECTED'].includes(data.displayStatus) && (
                    <div className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-400 font-bold text-xs border border-slate-100 text-center flex items-center justify-center gap-2 cursor-not-allowed">
                        {['CANCELLED', 'REJECTED'].includes(data.displayStatus) ? (
                            <><XCircle size={14} /> Request Closed</>
                        ) : (
                            <><CheckCircle2 size={14} /> Successfully Finished</>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function RequestsView({
    showToast,
    providerType
}: RequestsViewProps) {

    const { currentUser } = useUIStore();

    // Initialize View Mode
    const [viewMode, setViewMode] = useState<ViewMode>(
        providerType === 'PRODUCT' ? 'PRODUCTS' : 'SERVICES'
    );

    // Fetch Data
    const { data, isLoading, refetch } = useProviderRequests(currentUser?.id, providerType);

    const bookings = data?.bookings || [];
    const orders = data?.orders || [];

    const [activeTab, setActiveTab] = useState<TabType>('PENDING');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Sync viewMode
    useEffect(() => {
        if (providerType === 'PRODUCT') setViewMode('PRODUCTS');
        else if (providerType === 'SERVICE') setViewMode('SERVICES');
    }, [providerType]);

    // 1. SELECT & NORMALIZE DATA
    const currentData = useMemo(() => {
        if (viewMode === 'SERVICES') {
            return bookings.map((b: any) => {
                const isRental = !!b.rental;

                return {
                    ...b,
                    type: isRental ? 'RENTAL' : 'BOOKING',
                    date: b.createdAt || b.bookingDate,
                    displayStatus: b.status,
                    title: isRental ? b.rental?.name : (b.service?.name || "Unknown Service"),
                    price: isRental ? b.totalPrice : (b.service?.price || 0),
                    img: b.user?.profileImage || b.user?.image || "",
                    timeSlot: isRental
                        ? `${b.totalDays} Day(s) • ${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}`
                        : (b.openTime ? `${b.openTime} - ${b.closeTime}` : "Scheduled"),
                    paymentStatus: 'PENDING'
                };
            });
        } else {
            return orders.map((o: any) => ({
                ...o,
                type: 'ORDER',
                date: o.createdAt,
                displayStatus: o.status,
                title: o.product ? `${o.product.name} (x${o.quantity})` : "Unknown Product",
                price: o.totalPrice || 0,
                img: o.user?.profileImage || o.user?.image || "",
                deliveryType: o.product?.deliveryType || 'DELIVERY',
                paymentStatus: o.paymentStatus
            }));
        }
    }, [viewMode, bookings, orders]);

    // 2. FILTER & SORT
    const filteredRequests = useMemo(() => {
        const sorted = [...currentData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return sorted.filter((i: any) => {
            const s = i.displayStatus;
            if (activeTab === 'ALL') return true;
            if (activeTab === 'PENDING') return s === 'PENDING' || s === 'REQUESTED';
            if (activeTab === 'CANCELLED') return s === 'CANCELLED' || s === 'RETURNED' || s === 'REJECTED';
            if (activeTab === 'COMPLETED') return s === 'COMPLETED' || s === 'DELIVERED';
            if (activeTab === 'ACTIVE') return ['ACCEPTED', 'APPROVED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'IN_PROGRESS', 'ACTIVE'].includes(s);
            return false;
        });
    }, [currentData, activeTab]);

    // 3. API ACTION HANDLER
    const handleUpdateStatus = async (id: string, newStatus: string, isRental: boolean) => {
        setProcessingId(id);

        // Choose endpoint
        let endpoint = '';
        let bodyKey = '';

        if (viewMode === 'SERVICES') {
            if (isRental) {
                // Ensure this route exists or map it correctly
                endpoint = '/api/rentals/update-status';
                bodyKey = 'bookingId';
            } else {
                endpoint = '/api/bookings/update-status';
                bodyKey = 'bookingId';
            }
        } else {
            endpoint = '/api/orders/update-status';
            bodyKey = 'orderId';
        }

        try {
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [bodyKey]: id, status: newStatus })
            });

            const data = await res.json();

            if (data.success) {
                showToast(`Status updated`, "success");
                refetch();
            } else {
                showToast(data.message || "Failed", "error");
            }
        } catch (error) {
            showToast("Network error", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const statusTabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'PENDING', label: 'Pending', icon: Clock },
        { id: 'ACTIVE', label: 'Active', icon: Truck },
        { id: 'COMPLETED', label: 'Done', icon: CheckCircle2 },
        { id: 'CANCELLED', label: 'Rejected', icon: XCircle },
        { id: 'ALL', label: 'All', icon: Filter },
    ];

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-sm font-medium">Loading requests...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* --- TOP HEADER & TOGGLE --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                {providerType === 'BOTH' ? (
                    <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full md:w-auto">
                        <button
                            onClick={() => { setViewMode('SERVICES'); setActiveTab('PENDING'); }}
                            className={clsx(
                                "flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                viewMode === 'SERVICES' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Briefcase size={16} className={viewMode === 'SERVICES' ? "text-blue-600" : ""} /> Services
                        </button>
                        <button
                            onClick={() => { setViewMode('PRODUCTS'); setActiveTab('PENDING'); }}
                            className={clsx(
                                "flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                viewMode === 'PRODUCTS' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <ShoppingBag size={16} className={viewMode === 'PRODUCTS' ? "text-purple-600" : ""} /> Products
                        </button>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            {viewMode === 'SERVICES' ? <Briefcase className="text-blue-600" /> : <ShoppingBag className="text-purple-600" />}
                            {viewMode === 'SERVICES' ? 'Service Bookings' : 'Product Orders'}
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage and track your incoming requests.</p>
                    </div>
                )}
            </div>

            {/* --- TAB BAR --- */}
            <div className="border-b border-slate-200">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "px-4 py-2.5 text-sm font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap",
                                activeTab === tab.id
                                    ? "border-slate-900 text-slate-900 bg-slate-50/50 rounded-t-lg"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg"
                            )}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? (viewMode === 'SERVICES' ? "text-blue-600" : "text-purple-600") : ""} />
                            {tab.label}
                            <span className={clsx("ml-1 px-1.5 py-0.5 rounded-full text-[10px]", activeTab === tab.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500")}>
                                {currentData.filter((i: any) => {
                                    if (tab.id === 'ALL') return true;
                                    if (tab.id === 'PENDING') return ['PENDING', 'REQUESTED'].includes(i.displayStatus);
                                    if (tab.id === 'CANCELLED') return ['CANCELLED', 'REJECTED', 'RETURNED'].includes(i.displayStatus);
                                    if (tab.id === 'COMPLETED') return ['COMPLETED', 'DELIVERED'].includes(i.displayStatus);
                                    if (tab.id === 'ACTIVE') return ['ACCEPTED', 'APPROVED', 'CONFIRMED', 'SHIPPED', 'IN_PROGRESS', 'ACTIVE'].includes(i.displayStatus);
                                    return false;
                                }).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CONTENT GRID --- */}
            <div className="min-h-100">
                {filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-80 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Filter size={32} className="text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-700 text-lg">No requests found</h3>
                        <p className="text-sm mt-1 text-slate-500">
                            There are no {activeTab.toLowerCase()} requests at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredRequests.map((req: any) => (
                            <RequestCard
                                key={req.id}
                                data={req}
                                onAction={handleUpdateStatus}
                                isProcessing={processingId === req.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}