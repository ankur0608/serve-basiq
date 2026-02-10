'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { FaArrowLeft, FaBagShopping, FaBoxOpen } from 'react-icons/fa6';
import Link from 'next/link';
import ActivityTabs from '@/components/profile/ActivityTabs';

export default function MyOrdersPage() {
    const { currentUser } = useUIStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`/api/user/orders`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Failed to load orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Glassmorphism Header */}
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
                            {!loading && (
                                <p className="text-xs text-slate-500 font-medium">
                                    Track your purchases
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {loading ? (
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
                                    <p className="text-emerald-100 text-sm font-medium">Total Orders Placed</p>
                                    <h3 className="text-3xl font-bold">{orders.length}</h3>
                                </div>
                            </div>
                        </div>

                        {/* List Container */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <ActivityTabs data={orders} type="orders" />
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        title="No Orders Yet"
                        description="Looks like you haven't bought anything yet. Check out our store for great deals!"
                        actionLink="/products" // Update to your shop link
                        actionText="Start Shopping"
                    />
                )}
            </main>
        </div>
    );
}

// Skeleton Loader
function OrderSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
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

// Empty State Component
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