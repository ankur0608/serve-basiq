'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cart, products } from '@/lib/db';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaCartShopping } from 'react-icons/fa6';

export default function CartPage() {
    // Local state for cart items (in real app, this would be in global state/API)
    const [cartItems, setCartItems] = useState(
        cart.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return { ...item, product };
        })
    );

    const updateQuantity = (itemId: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (itemId: string) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
            {/* Back Button */}
            <Link
                href="/b2b"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-slate-900 mb-6 transition"
            >
                <FaArrowLeft /> Continue Shopping
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Shopping Cart</h1>
                <p className="text-gray-500">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</p>
            </div>

            {cartItems.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4"
                            >
                                <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                    {item.product?.image && (
                                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between gap-4 mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900">{item.product?.name}</h3>
                                            <p className="text-sm text-gray-500">{item.product?.supplier}</p>
                                            <p className="text-xs text-gray-400">MOQ: {item.product?.moq}</p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition h-fit"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition"
                                            >
                                                <FaMinus className="text-xs" />
                                            </button>
                                            <span className="w-12 text-center font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition"
                                            >
                                                <FaPlus className="text-xs" />
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-bold text-lg text-slate-900">
                                                ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                ₹{item.product?.price?.toLocaleString()} each
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
                            <h3 className="font-bold text-lg text-slate-900 mb-4">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (GST)</span>
                                    <span>Calculated at checkout</span>
                                </div>
                            </div>

                            <div className="flex justify-between font-bold text-xl text-slate-900 pt-4 border-t border-gray-100 mb-6">
                                <span>Total</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full bg-commerce-600 text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-commerce-700 transition"
                            >
                                Proceed to Checkout
                            </Link>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Secure checkout · Easy returns
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <FaCartShopping className="text-5xl text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-xl text-slate-900 mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 mb-6">
                        Browse our products and add items to your cart
                    </p>
                    <Link
                        href="/b2b"
                        className="inline-flex items-center gap-2 bg-commerce-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-commerce-700 transition"
                    >
                        Browse Products
                    </Link>
                </div>
            )}
        </div>
    );
}
