'use client';

import { useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { FaArrowLeft, FaBagShopping, FaBoxOpen, FaMagnifyingGlass, FaXmark, FaFilter } from 'react-icons/fa6';
import Link from 'next/link';
import ActivityTabs from '@/components/profile/ActivityTabs';
import { useUserOrders } from '@/app/hook/useProfileQueries';

export default function MyOrdersPage() {
    const { currentUser } = useUIStore();
    const { data: orders = [], isLoading } = useUserOrders();

    // --- Filter & Search State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // --- Derived Data: Filtered Orders ---
    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter((order: any) => {
            // Match Search Term (Product Name or Order ID)
            const matchesSearch =
                order.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase());

            // Match Status
            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/profile"
                            className="p-2 -ml-2 hover:bg-slate-100/80 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            <FaArrowLeft />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">My Orders</h1>
                            {!isLoading && (
                                <p className="text-xs text-slate-500 font-medium">
                                    Track your purchases
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {isLoading ? (
                    <OrderSkeleton />
                ) : orders.length > 0 ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <FaBagShopping className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Total Orders Displayed</p>
                                    <h3 className="text-3xl font-bold">{filteredOrders.length} <span className="text-sm font-normal text-emerald-200">/ {orders.length}</span></h3>
                                </div>
                            </div>
                        </div>

                        {/* --- SEARCH & FILTER BAR --- */}
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaMagnifyingGlass className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by product name or Order ID..."
                                    className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <FaXmark size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Status Filter Dropdown */}
                            <div className="relative shrink-0">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaFilter className="text-slate-400" />
                                </div>
                                <select
                                    className="w-full md:w-48 pl-11 pr-8 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer shadow-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="REQUESTED">Requested</option>
                                    <option value="ACCEPTED">Accepted</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* --- CONTENT OR FILTER EMPTY STATE --- */}
                        {filteredOrders.length > 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <ActivityTabs data={filteredOrders} type="orders" />
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                                <FaMagnifyingGlass className="text-slate-300 text-4xl mx-auto mb-4" />
                                <h4 className="text-lg font-bold text-slate-800 mb-1">No matches found</h4>
                                <p className="text-slate-500 text-sm mb-4">We couldn't find any orders matching your criteria.</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                                    className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                    </div>
                ) : (
                    <EmptyState
                        title="No Orders Yet"
                        description="Looks like you haven't bought anything yet. Check out our store for great deals!"
                        actionLink="/products"
                        actionText="Start Shopping"
                    />
                )}
            </main>
        </div>
    );
}

function OrderSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="flex gap-3">
                <div className="h-12 flex-1 bg-slate-200 rounded-xl animate-pulse" />
                <div className="h-12 w-48 bg-slate-200 rounded-xl animate-pulse" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse items-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-100 rounded w-1/3" />
                            <div className="h-3 bg-slate-100 rounded w-1/4" />
                        </div>
                        <div className="w-20 h-8 bg-slate-100 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyState({ title, description, actionLink, actionText }: any) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <FaBoxOpen className="text-slate-300 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 max-w-xs mb-8 leading-relaxed">{description}</p>
            <Link
                href={actionLink}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black transition shadow-lg active:scale-95"
            >
                {actionText}
            </Link>
        </div>
    );
}