'use client';

import { useState } from 'react';
import Link from 'next/link';
import { orders, orderItems, products } from '@/lib/db';
import { FaBox, FaTruck, FaCircleCheck, FaChevronRight, FaFilter } from 'react-icons/fa6';
import clsx from 'clsx';

type StatusFilter = 'all' | 'active' | 'delivered' | 'cancelled';

const statusColors: Record<string, string> = {
    PLACED: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-orange-100 text-orange-700',
};

const statusIcons: Record<string, React.ReactNode> = {
    PLACED: <FaBox />,
    CONFIRMED: <FaBox />,
    SHIPPED: <FaTruck />,
    DELIVERED: <FaCircleCheck />,
};

export default function OrdersPage() {
    const [filter, setFilter] = useState<StatusFilter>('all');

    const filteredOrders = orders.filter((o) => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['PLACED', 'CONFIRMED', 'SHIPPED'].includes(o.status);
        if (filter === 'delivered') return o.status === 'DELIVERED';
        if (filter === 'cancelled') return ['CANCELLED', 'REFUNDED'].includes(o.status);
        return true;
    });

    const getOrderItems = (orderId: string) => {
        return orderItems.filter(oi => oi.orderId === orderId).map(oi => {
            const product = products.find(p => p.id === oi.productId);
            return { ...oi, product };
        });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">My Orders</h1>
                <p className="text-gray-500">Track your product orders</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {(['all', 'active', 'delivered', 'cancelled'] as StatusFilter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={clsx(
                            "px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition",
                            filter === f
                                ? "bg-commerce-600 text-white"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-commerce-500"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const items = getOrderItems(order.id);
                        return (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5"
                            >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={clsx(
                                                "text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5",
                                                statusColors[order.status]
                                            )}>
                                                {statusIcons[order.status]}
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Order #{order.id.slice(-8).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg text-slate-900">₹{order.totalAmount.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Item Preview */}
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {items.slice(0, 3).map((item, i) => (
                                            <div
                                                key={item.id}
                                                className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 overflow-hidden"
                                                style={{ zIndex: 3 - i }}
                                            >
                                                {item.product?.image && (
                                                    <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 text-sm text-gray-600">
                                        {items.length} item{items.length > 1 ? 's' : ''}
                                    </div>
                                    <FaChevronRight className="text-gray-300" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <FaBox className="text-4xl text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-slate-900 mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-6">
                        {filter === 'all'
                            ? "You haven't placed any orders yet"
                            : `No ${filter} orders`}
                    </p>
                    <Link
                        href="/b2b"
                        className="inline-flex items-center gap-2 bg-commerce-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-commerce-700 transition"
                    >
                        Browse Products
                    </Link>
                </div>
            )}
        </div>
    );
}
