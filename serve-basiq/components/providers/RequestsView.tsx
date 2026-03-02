'use client';

import {
    Loader2, Calendar, Clock, MapPin,
    CheckCircle2, XCircle, Filter, Package,
    Briefcase, ShoppingBag, User as UserIcon,
    BoxSelect, KeyRound, AlertTriangle, Search, X, Phone, AlignLeft // ✅ Added Phone and AlignLeft
} from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/lib/store';
import { useRequestsLogic, STATUS_TABS } from '@/app/hook/useRequestsLogic';
import FilterModal from './FilterModal';

// --- Utility function ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);
};

// --- Sub-component: RequestCard ---
// --- Sub-component: RequestCard ---
const RequestCard = ({ data, onAction, isProcessing }: any) => {
    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            'REQUESTED': 'bg-amber-100 text-amber-700 border-amber-200',
            'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
            'ACCEPTED': 'bg-blue-100 text-blue-700 border-blue-200',
            'APPROVED': 'bg-blue-100 text-blue-700 border-blue-200',
            'IN_PROGRESS': 'bg-purple-100 text-purple-700 border-purple-200',
            'ACTIVE': 'bg-purple-100 text-purple-700 border-purple-200',
            'SHIPPED': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'DELIVERED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'COMPLETED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'CANCELLED': 'bg-red-50 text-red-600 border-red-100',
            'REJECTED': 'bg-red-50 text-red-600 border-red-100',
            'OVERDUE': 'bg-red-100 text-red-700 border-red-200',
            'RETURNED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
        return map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
    };

    // ✅ Read priceType from our newly mapped data
    const isQuote = data.priceType === 'QUOTE';

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full relative group">
            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                    <span className="text-xs font-bold text-blue-600">Updating...</span>
                </div>
            )}

            {/* Header info */}
            <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
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
                    <span className={clsx("px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border", getStatusColor(data.displayStatus))}>
                        {data.displayStatus.replace('_', ' ')}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    #{data.id.slice(-6).toUpperCase()}
                </div>
            </div>

            {/* Content body */}
            <div className="p-5 flex-1 flex flex-col">

                {/* 1. Customer Info */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                            {data.img ? <img src={data.img} alt="User" className="w-full h-full object-cover" /> : <UserIcon size={18} className="text-slate-400" />}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-tight">{data.user?.name || "Guest User"}</h4>
                            {data.user?.phone && (
                                <a href={`tel:${data.user.phone}`} className="flex items-center gap-1 mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                    <Phone size={10} /> {data.user.phone}
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        {/* ✅ Apply isQuote logic here */}
                        <div className="text-sm font-black text-slate-900">
                            {isQuote ? (
                                <span className="text-xs uppercase text-slate-500 tracking-wider">Quote Requested</span>
                            ) : (
                                formatCurrency(data.price)
                            )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1">
                            {isQuote ? 'To be discussed' : (data.paymentStatus === 'PAID' ? 'Paid' : 'COD / Pending')}
                        </div>
                    </div>
                </div>

                {/* 2. Service/Product Info */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            {data.type === 'BOOKING' ? <Briefcase size={16} className="text-blue-500" /> :
                                data.type === 'RENTAL' ? <KeyRound size={16} className="text-orange-500" /> :
                                    <Package size={16} className="text-purple-500" />}
                        </div>
                        <div className="flex-1">
                            <h5 className="text-sm font-bold text-slate-800 line-clamp-1">{data.title}</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    <Calendar size={10} />
                                    {new Date(data.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200">
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

                {/* 3. Address & Instructions */}
                <div className="space-y-2 mt-auto">
                    {data.address ? (
                        <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                            <div className="flex items-center gap-1.5 mb-1 text-blue-900 font-bold">
                                <MapPin size={12} className="text-red-500" />
                                {data.type === 'ORDER' && data.deliveryType === 'PICKUP' ? 'Pickup Location' : 'Service Address'}
                            </div>
                            <div className="pl-4 font-medium">
                                <p>{data.address.line1} {data.address.line2}</p>
                                <p>{data.address.city}, {data.address.state} - {data.address.pincode}</p>
                                {data.address.landmark && <p className="text-slate-400 mt-0.5">Landmark: {data.address.landmark}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-1.5 font-medium">
                            <MapPin size={12} />
                            {data.deliveryType === 'PICKUP' ? 'Self Pickup by Customer' : 'No Specific Location Provided'}
                        </div>
                    )}

                    {data.specialInstructions && (
                        <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50">
                            <div className="flex items-center gap-1.5 mb-1 text-amber-900 font-bold">
                                <AlignLeft size={12} /> Special Instructions
                            </div>
                            <p className="pl-4 italic text-slate-500">{data.specialInstructions}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions footer */}
            <div className="p-4 pt-3 mt-auto border-t border-slate-50">
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
                            onClick={() => onAction(data.id, 'ACCEPTED', data.type === 'RENTAL')}
                            disabled={isProcessing}
                            className="py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-md shadow-slate-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={14} /> Accept Request
                        </button>
                    </div>
                )}

                {(data.type === 'BOOKING' || data.type === 'RENTAL') && (
                    <>
                        {['ACCEPTED', 'APPROVED', 'IN_PROGRESS', 'ACTIVE'].includes(data.displayStatus) && (
                            <button
                                onClick={() => onAction(data.id, 'COMPLETED', data.type === 'RENTAL')}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition-all"
                            >
                                <CheckCircle2 size={16} />
                                {data.type === 'RENTAL' ? 'Mark Returned & Completed' : 'Mark Job Completed'}
                            </button>
                        )}

                        {data.displayStatus === 'OVERDUE' && (
                            <div className="w-full py-2.5 rounded-xl bg-red-100 text-red-700 font-bold text-xs border border-red-200 text-center flex items-center justify-center gap-2">
                                <AlertTriangle size={14} /> Overdue - Mark Completed when returned
                            </div>
                        )}
                    </>
                )}

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

                {['COMPLETED', 'DELIVERED', 'CANCELLED', 'REJECTED', 'RETURNED'].includes(data.displayStatus) && (
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
// --- Main Component ---
export default function RequestsView({ showToast, providerType }: { showToast: any, providerType: string }) {
    const { currentUser } = useUIStore();

    // Extracted logic entirely to Custom Hook
    const {
        viewMode, setViewMode,
        activeTab, setActiveTab,
        searchTerm, setSearchTerm,
        isFilterModalOpen, setIsFilterModalOpen,
        processingId, isLoading,
        currentData, filteredRequests, handleUpdateStatus
    } = useRequestsLogic(providerType, currentUser?.id, showToast);

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-sm font-medium">Loading requests...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">

            {/* Header Content */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                {providerType === 'BOTH' ? (
                    <div className="flex w-full md:w-auto bg-white rounded-xl mb-1 max-w-md border border-slate-200 shadow-sm mx-auto md:mx-0">
                        <button
                            onClick={() => { setViewMode('SERVICES'); setActiveTab('PENDING'); setSearchTerm(''); }}
                            className={clsx(
                                "flex-1 px-2 md:px-16 py-4 text-sm font-bold rounded-lg transition-all whitespace-nowrap",
                                viewMode === 'SERVICES' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            Services
                        </button>
                        <button
                            onClick={() => { setViewMode('PRODUCTS'); setActiveTab('PENDING'); setSearchTerm(''); }}
                            className={clsx(
                                "flex-1 px-2 md:px-16 py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap",
                                viewMode === 'PRODUCTS' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            Products
                        </button>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            {viewMode === 'SERVICES' ? <Briefcase className="text-blue-600" /> : <ShoppingBag className="text-purple-600" />}
                            {viewMode === 'SERVICES' ? 'Bookings & Rentals' : 'Product Orders'}
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Manage and track your incoming requests.</p>
                    </div>
                )}
            </div>

            {/* Search and Mobile Filter Row */}
            <div className="flex items-center gap-2 w-full">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by ID, Customer, or Item..."
                        className="w-full pl-10 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-red-500 transition-colors">
                            <X size={18} />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="md:hidden shrink-0 flex items-center justify-center w-[52px] h-[52px] bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm relative"
                >
                    <Filter size={20} />
                    {activeTab !== 'ALL' && <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white"></span>}
                </button>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:block border-b border-slate-200">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 w-full">
                    {STATUS_TABS.map((tab) => {
                        const count = currentData.filter((i: any) => {
                            const s = i.displayStatus;
                            if (tab.id === 'ALL') return true;
                            if (tab.id === 'PENDING') return ['PENDING', 'REQUESTED'].includes(s);
                            if (tab.id === 'CANCELLED') return ['CANCELLED', 'REJECTED', 'RETURNED'].includes(s);
                            if (tab.id === 'COMPLETED') return ['COMPLETED', 'DELIVERED', 'RETURNED'].includes(s);
                            if (tab.id === 'ACTIVE') return ['ACCEPTED', 'APPROVED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'IN_PROGRESS', 'ACTIVE', 'OVERDUE'].includes(s);
                            return false;
                        }).length;

                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={clsx("px-4 py-2.5 text-sm font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap flex-shrink-0", activeTab === tab.id ? "border-slate-900 text-slate-900 bg-slate-50/50 rounded-t-lg" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg")}>
                                <tab.icon size={16} className={activeTab === tab.id ? (viewMode === 'SERVICES' ? "text-blue-600" : "text-purple-600") : ""} />
                                {tab.label}
                                <span className={clsx("ml-1 px-1.5 py-0.5 rounded-full text-[10px]", activeTab === tab.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500")}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Separated Modal Component */}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                currentData={currentData}
            />

            {/* Content List */}
            <div className="min-h-100">
                {filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-80 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Filter size={32} className="text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-700 text-lg">No requests found</h3>
                        <p className="text-sm mt-1 text-slate-500">There are no {activeTab.toLowerCase()} requests matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
                        {filteredRequests.map((req: any) => (
                            <RequestCard key={req.id} data={req} onAction={handleUpdateStatus} isProcessing={processingId === req.id} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}