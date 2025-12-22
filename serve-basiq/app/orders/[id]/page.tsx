'use client';

import { use } from 'react';
import Link from 'next/link';
import { orders, orderItems, products, addresses } from '@/lib/db';
import {
    FaBox, FaTruck, FaCircleCheck, FaArrowLeft,
    FaMapPin, FaDownload
} from 'react-icons/fa6';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
    PLACED: 'bg-blue-100 text-blue-700 border-blue-200',
    CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-700 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-700 border-green-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    REFUNDED: 'bg-orange-100 text-orange-700 border-orange-200',
};

const statusSteps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const order = orders.find(o => o.id === id);
    const items = order ? orderItems.filter(oi => oi.orderId === order.id).map(oi => {
        const product = products.find(p => p.id === oi.productId);
        return { ...oi, product };
    }) : [];
    const address = order?.addressId ? addresses.find(a => a.id === order.addressId) : null;

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Order not found</h1>
                <Link href="/orders" className="text-commerce-600 font-bold hover:underline">
                    ← Back to orders
                </Link>
            </div>
        );
    }

    const currentStepIndex = statusSteps.indexOf(order.status);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
            {/* Back Button */}
            <Link
                href="/orders"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-slate-900 mb-6 transition"
            >
                <FaArrowLeft /> Back to orders
            </Link>

            {/* Order Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">Order #{order.id.slice(-8).toUpperCase()}</div>
                        <div className="text-sm text-gray-400">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </div>
                    </div>
                    <span className={clsx(
                        "text-sm font-bold px-3 py-1.5 rounded-lg border",
                        statusColors[order.status]
                    )}>
                        {order.status}
                    </span>
                </div>

                {/* Progress Steps */}
                {!['CANCELLED', 'REFUNDED'].includes(order.status) && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
                                <div
                                    className="h-full bg-commerce-600 transition-all"
                                    style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                                />
                            </div>

                            {statusSteps.map((step, i) => (
                                <div key={step} className="relative z-10 flex flex-col items-center">
                                    <div className={clsx(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                                        i <= currentStepIndex
                                            ? "bg-commerce-600 text-white"
                                            : "bg-gray-200 text-gray-400"
                                    )}>
                                        {i < currentStepIndex ? (
                                            <FaCircleCheck />
                                        ) : i === 0 ? (
                                            <FaBox className="text-xs" />
                                        ) : i === 2 ? (
                                            <FaTruck className="text-xs" />
                                        ) : i === 3 ? (
                                            <FaCircleCheck className="text-xs" />
                                        ) : (
                                            i + 1
                                        )}
                                    </div>
                                    <div className={clsx(
                                        "text-xs mt-2 font-medium",
                                        i <= currentStepIndex ? "text-commerce-600" : "text-gray-400"
                                    )}>
                                        {step}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                {item.product?.image && (
                                    <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-slate-900">{item.product?.name}</div>
                                <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                                <div className="text-sm text-gray-500">{item.product?.supplier}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</div>
                                <div className="text-xs text-gray-400">₹{item.price} each</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delivery Address */}
            {address && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <FaMapPin className="text-commerce-500" />
                        <h3 className="font-bold text-lg text-slate-900">Delivery Address</h3>
                    </div>
                    <div className="text-gray-600">
                        <div className="font-medium">{address.label}</div>
                        <div>{address.line1}</div>
                        {address.line2 && <div>{address.line2}</div>}
                        <div>{address.city}, {address.state} - {address.pincode}</div>
                    </div>
                </div>
            )}

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Payment Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-gray-100">
                        <span>Total</span>
                        <span>₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <FaDownload /> Download Invoice
                </button>
                <button className="flex-1 py-4 bg-commerce-600 text-white rounded-xl font-bold hover:bg-commerce-700 transition">
                    Reorder
                </button>
            </div>
        </div>
    );
}
