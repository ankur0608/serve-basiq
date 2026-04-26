"use client";

import React, { useState } from "react";
import { FaSpinner, FaLocationDot } from "react-icons/fa6";

interface ProductRequestFormProps {
    productId: string;
    productName: string;
    price: number;
    priceType?: string;
    unit: string;
    moq: number;
    userId: string;
    userAddresses: any[];
    userDetails: any;
    onSuccess: () => void;
    onRequestClose: () => void;
}

export default function ProductRequestForm({
    productId,
    productName,
    price,
    priceType,
    unit,
    moq,
    userId,
    userAddresses,
    onSuccess,
    onRequestClose,
}: ProductRequestFormProps) {
    // --- States ---
    const [quantity, setQuantity] = useState<number>(moq > 0 ? moq : 1);
    const [requirementDate, setRequirementDate] = useState("Immediate");
    const [notes, setNotes] = useState("");
    const [selectedAddressId, setSelectedAddressId] = useState(
        userAddresses?.length > 0 ? userAddresses[0].id : ""
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // ✅ FIX: Robust check to determine if it's a Custom Quote
    const isQuote = priceType?.toUpperCase() === 'QUOTE' || Number(price) === 0 || !price;

    // --- Handlers ---
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) {
            setQuantity(val);
        } else {
            setQuantity(moq > 0 ? moq : 1);
        }
    };

    const handleQuantityBlur = () => {
        if (quantity < (moq || 1)) {
            setQuantity(moq || 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!selectedAddressId && userAddresses?.length > 0) {
            setError("Please select a delivery address.");
            return;
        }

        if (quantity < (moq || 1)) {
            setError(`Minimum order quantity is ${moq || 1}.`);
            return;
        }

        setIsSubmitting(true);

        try {
            // Build the payload
            const payload = {
                productId,
                quantity,
                requirementDate,
                notes,
                addressId: selectedAddressId,
                isQuoteRequest: isQuote,
                totalEstimatedPrice: isQuote ? 0 : price * quantity,
            };

            // Call your API endpoint
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to submit request.");
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl">
            {/* 🟦 DARK HEADER SECTION */}
            <div className="bg-[#0B132B] text-white p-5 md:p-6 pb-6 rounded-t-3xl shrink-0">
                <div className="flex justify-between items-start gap-4 pr-6"> {/* Added pr-6 to leave room for the Wrapper's Close button */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-black mb-1">Configure Request</h2>
                        <p className="text-sm text-slate-300 font-medium line-clamp-1">
                            <span className="text-slate-400">Item:</span> {productName}
                        </p>
                    </div>

                    {/* ✅ FIX: Correctly displays "To be discussed" instead of ₹0 */}
                    <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Price</p>
                        {isQuote ? (
                            <span className="inline-block text-xs font-bold text-white bg-white/10 border border-white/20 px-2.5 py-1 rounded-md whitespace-nowrap">
                                To be discussed
                            </span>
                        ) : (
                            <p className="text-lg md:text-xl font-black text-white">
                                ₹{(price * quantity).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ⬜ FORM BODY SECTION */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
                <form id="product-request-form" onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Quantity & Unit Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-mono text-sm">#</span>
                                </div>
                                <input
                                    type="number"
                                    min={moq || 1}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    onBlur={handleQuantityBlur}
                                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                            {moq > 1 && (
                                <p className="text-[10px] text-slate-400 font-medium">Min order: {moq}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit</label>
                            <div className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 flex items-center select-none cursor-not-allowed">
                                {/* Simple cube icon matching your screenshot */}
                                <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                {unit || "Piece"}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">When do you need this?</label>
                        <select
                            value={requirementDate}
                            onChange={(e) => setRequirementDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat"
                        >
                            <option value="Immediate">Immediate</option>
                            <option value="Within 1 week">Within 1 week</option>
                            <option value="Within 15 days">Within 15 days</option>
                            <option value="Within 1 month">Within 1 month</option>
                            <option value="Flexible">Flexible</option>
                        </select>
                    </div>

                    {/* Address Selection */}
                    {userAddresses && userAddresses.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery Address</label>
                            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                {userAddresses.map((address) => (
                                    <label
                                        key={address.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                            selectedAddressId === address.id
                                                ? "bg-blue-50 border-blue-500 shadow-sm"
                                                : "bg-white border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="address"
                                            value={address.id}
                                            checked={selectedAddressId === address.id}
                                            onChange={(e) => setSelectedAddressId(e.target.value)}
                                            className="mt-0.5 text-blue-600 focus:ring-blue-500 border-slate-300"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800">{address.type || "Address"}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-snug mt-0.5">
                                                {address.line1}, {address.city}, {address.state} - {address.pincode}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex gap-1 items-center">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Additional Notes / Requirements
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Describe your requirement in detail (e.g., specific brand, packaging preference, delivery constraints)..."
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none h-24 custom-scrollbar"
                        ></textarea>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 text-center">
                            {error}
                        </div>
                    )}
                </form>
            </div>

            {/* ⬜ FOOTER SECTION */}
            <div className="p-4 md:p-5 border-t border-slate-100 bg-white shrink-0 rounded-b-3xl">
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onRequestClose}
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        form="product-request-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] py-3 px-4 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <>
                                <FaSpinner className="animate-spin" /> Processing...
                            </>
                        ) : isQuote ? (
                            'Confirm Request'
                        ) : (
                            'Confirm Order'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}