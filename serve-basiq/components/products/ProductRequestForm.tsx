'use client';

import { useState } from 'react';
import { Minus, Plus, MapPin, ChevronRight, Loader2, Truck, Store } from 'lucide-react';

interface Props {
    productId: string;
    productName: string;
    price: number;
    unit: string;
    moq: number;
    userId: string;
    userAddresses: any[];
    onRequestClose: () => void;
}

export default function ProductRequestForm({
    productId, productName, price, unit, moq, userId, userAddresses, onRequestClose
}: Props) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [quantity, setQuantity] = useState(moq || 1);
    const [deliveryType, setDeliveryType] = useState('DELIVERY'); // 'DELIVERY' or 'PICKUP'
    const [addressId, setAddressId] = useState(userAddresses[0]?.id || '');
    const [paymentMode, setPaymentMode] = useState('CASH');
    const [notes, setNotes] = useState('');

    // Calculations
    const totalEstimate = quantity * price;

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'inc') setQuantity(prev => prev + 1);
        if (type === 'dec' && quantity > moq) setQuantity(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    productId,
                    quantity,
                    // ✅ FIXED: Explicitly sending deliveryType
                    deliveryType: deliveryType,
                    // ✅ FIXED: Logic for addressId
                    addressId: deliveryType === 'DELIVERY' ? addressId : null,
                    paymentMode,
                    // ✅ FIXED: Sending 'notes' as expected by the Order API
                    notes: notes
                }),
            });

            const data = await res.json();

            if (data.success || res.ok) {
                // Success feedback
                alert('Order Placed Successfully!');
                onRequestClose();
            } else {
                console.error("Server Error:", data);
                alert(data.message || 'Order failed. Please check your inputs.');
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full mx-auto animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="bg-slate-900 p-6 text-white">
                <h2 className="text-xl font-bold">Request Product</h2>
                <p className="text-slate-400 text-sm mt-1">Item: <span className="text-white font-medium">{productName}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* STEP 1: Quantity & Mode */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">

                        {/* Quantity Counter */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Quantity ({unit})</label>
                            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2">
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange('dec')}
                                    disabled={quantity <= moq}
                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 disabled:opacity-50 hover:bg-slate-100"
                                >
                                    <Minus size={16} />
                                </button>
                                <div className="text-center">
                                    <span className="text-xl font-bold text-slate-900">{quantity}</span>
                                    <span className="text-xs text-slate-500 block">Min Order: {moq}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange('inc')}
                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-100"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Delivery Method Toggle */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Delivery Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeliveryType('DELIVERY')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${deliveryType === 'DELIVERY'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <Truck size={20} />
                                    <span className="text-xs font-bold">Home Delivery</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeliveryType('PICKUP')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${deliveryType === 'PICKUP'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <Store size={20} />
                                    <span className="text-xs font-bold">Self Pickup</span>
                                </button>
                            </div>
                        </div>

                        {/* Estimated Price */}
                        <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100">
                            <span className="text-slate-500 text-sm font-medium">Estimated Total</span>
                            <span className="text-xl font-black text-slate-900">₹{totalEstimate}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition"
                        >
                            Next Step <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* STEP 2: Address & Payment */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">

                        {/* Address Selection (Only if Delivery) */}
                        {deliveryType === 'DELIVERY' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Delivery Address</label>
                                {userAddresses.length > 0 ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                        {userAddresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => setAddressId(addr.id)}
                                                className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${addressId === addr.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <MapPin className={`mt-0.5 ${addressId === addr.id ? 'text-blue-600' : 'text-slate-400'}`} size={16} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{addr.type}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1">{addr.line1}, {addr.city}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed border-red-300 bg-red-50 rounded-xl text-center text-xs text-red-500 font-medium">
                                        No addresses found. Please add one in profile.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notes (Optional)</label>
                            <textarea
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Specific requirements..."
                                rows={2}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Payment Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Payment Preference</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMode('CASH')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${paymentMode === 'CASH' ? 'bg-green-50 border-green-500 text-green-700' : 'border-slate-200'
                                        }`}
                                >
                                    Cash
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMode('ONLINE')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${paymentMode === 'ONLINE' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200'
                                        }`}
                                >
                                    Online
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (deliveryType === 'DELIVERY' && !addressId)}
                                className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}