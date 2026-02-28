'use client';

import { useState, useEffect } from 'react';
import {
    Loader2, MapPin, Plus, Pencil, Clock,
    Package, Calculator, ArrowRight, CheckCircle2,
    StickyNote, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import toast from 'react-hot-toast'; // ✅ Imported toast
import AddressModal from '@/components/booking/AddressModal';

interface Props {
    productId: string;
    productName: string;
    price: number;
    unit: string;
    moq: number;
    userId?: string;
    userAddresses: any[];
    userDetails?: {
        name?: string;
        email?: string;
        phone?: string;
        dob?: string;
        preferredLanguage?: string;
    };
    onRequestClose: () => void;
    onSuccess?: () => void;
}

const TIMELINE_OPTIONS = [
    { label: 'Urgent (ASAP)', value: 'URGENT' },
    { label: 'Immediate', value: 'IMMEDIATE' },
    { label: 'Later', value: 'LATER' },
    { label: 'Flexible', value: 'FLEXIBLE' }
];

// 👇 UPDATED: Added all new units to match Prisma UnitType Enum
const UNIT_OPTIONS = [
    { label: 'Piece', value: 'PIECE' },
    { label: 'Kg', value: 'KG' },
    { label: 'Gram', value: 'GRAM' },
    { label: 'Liter', value: 'LITER' },
    { label: 'ML', value: 'ML' },
    { label: 'Box', value: 'BOX' },
    { label: 'Pack', value: 'PACK' },
    { label: 'Set', value: 'SET' },
    { label: 'Meter', value: 'METER' },
    { label: 'Sq Ft', value: 'SQ_FT' },
    { label: 'Ton', value: 'TON' }
];

export default function ProductRequestForm({
    productId, productName, price, unit, moq, userId, userAddresses, userDetails, onRequestClose, onSuccess
}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // --- Local State for Addresses ---
    const [addresses, setAddresses] = useState(userAddresses || []);

    // Sync if props change
    useEffect(() => {
        if (userAddresses && userAddresses.length > 0) {
            setAddresses(userAddresses);
        }
    }, [userAddresses]);

    // --- Form State ---
    const [quantity, setQuantity] = useState<number>(moq || 1);
    const [selectedUnit, setSelectedUnit] = useState(unit || 'PIECE');
    const [budget, setBudget] = useState('');

    const [addressId, setAddressId] = useState(addresses[0]?.id || '');
    const [notes, setNotes] = useState('');

    const [timeline, setTimeline] = useState('IMMEDIATE');

    const deliveryType = 'DELIVERY';
    const paymentMode = 'CASH';

    // --- Modal State ---
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    // --- Handlers ---
    const handleAddAddress = () => {
        setEditingAddress(null);
        setIsAddressModalOpen(true);
    };

    const handleEditAddress = (e: React.MouseEvent, addr: any) => {
        e.stopPropagation();
        setEditingAddress(addr);
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = async (data: any) => {
        const newAddress = {
            id: editingAddress?.id || `temp-${Date.now()}`,
            userId,
            line1: data.addressLine1,
            line2: data.addressLine2,
            landmark: data.landmark,
            city: data.city,
            district: data.district || '',
            state: data.state,
            pincode: data.pincode,
            type: "Home",
            country: "India"
        };

        let updatedList;
        if (editingAddress) {
            updatedList = addresses.map((a: any) => a.id === editingAddress.id ? newAddress : a);
        } else {
            updatedList = [...addresses, newAddress];
            setAddressId(newAddress.id);
        }

        setAddresses(updatedList);
        setIsAddressModalOpen(false);
        return Promise.resolve();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Replaced alerts
        if (quantity < 1) {
            toast.error("Please enter a valid quantity.");
            return;
        }

        if (!addressId) {
            toast.error("Please select a delivery address.");
            return;
        }

        setLoading(true);

        try {
            const selectedAddressObj = addresses.find((a: any) => a.id === addressId);

            let finalNotes = notes;
            if (budget) {
                finalNotes = `[Budget: ${budget}]\n${notes}`;
            }

            const payload: any = {
                userId,
                productId,
                quantity: Number(quantity),
                unit: selectedUnit,
                deliveryType,
                paymentMode,
                addressId,
                notes: finalNotes,
                timeline,
            };

            if (addressId.toString().startsWith('temp-') && selectedAddressObj) {
                payload.newAddress = {
                    line1: selectedAddressObj.line1,
                    line2: selectedAddressObj.line2,
                    landmark: selectedAddressObj.landmark,
                    city: selectedAddressObj.city,
                    district: selectedAddressObj.district,
                    state: selectedAddressObj.state,
                    pincode: selectedAddressObj.pincode,
                    type: (selectedAddressObj.type || "HOME").toUpperCase(),
                };
            }

            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success || res.ok) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    toast.success('Request Sent Successfully!');
                    onRequestClose();
                }
                router.refresh();
            } else {
                toast.error(data.message || 'Request failed.');
            }
        } catch (error) {
            console.error("Network Error:", error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getModalInitialData = () => {
        if (editingAddress) {
            return {
                addressLine1: editingAddress.line1 || "",
                addressLine2: editingAddress.line2 || "",
                landmark: editingAddress.landmark || "",
                city: editingAddress.city || "",
                district: editingAddress.district || "",
                state: editingAddress.state || "",
                pincode: editingAddress.pincode || ""
            };
        }
        return {
            addressLine1: "",
            addressLine2: "",
            landmark: "",
            city: "",
            district: "",
            state: "",
            pincode: ""
        };
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full mx-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

            {/* HEADER */}
            <div className="bg-slate-900 p-6 pb-8 text-white relative overflow-hidden shrink-0">
                <div className="relative z-10">
                    <h2 className="text-xl font-bold">Configure Request</h2>
                    <p className="text-slate-400 text-sm mt-1">Item: <span className="text-white font-medium">{productName}</span></p>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute top-10 -left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
            </div>

            {/* FORM BODY - ALL IN ONE PAGE */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 pb-8 space-y-8">

                {/* 1. QUANTITY & UNIT */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Quantity</label>
                        <div className="relative">
                            <Calculator className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="number"
                                min={moq || 1}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Unit</label>
                        <div className="relative">
                            <Package
                                className="absolute left-3 top-3.5 text-slate-400"
                                size={18}
                            />
                            <select
                                value={selectedUnit}
                                onChange={(e) => setSelectedUnit(e.target.value)}
                                disabled
                                className="w-full pl-10 pr-8 py-3 border border-slate-200 rounded-xl 
               bg-slate-100 text-slate-500 cursor-not-allowed 
               outline-none appearance-none font-medium"
                            >
                                {UNIT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronRight
                                className="absolute right-3 top-4 rotate-90 text-slate-400 pointer-events-none"
                                size={14}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. TIMELINE */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">When do you need this?</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <select
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            className="w-full pl-10 pr-8 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-900 appearance-none cursor-pointer"
                        >
                            {TIMELINE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-4 rotate-90 text-slate-400 pointer-events-none" size={14} />
                    </div>
                </div>

                {/* 3. NOTES */}
                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
                        <StickyNote size={14} /> Additional Notes / Requirements
                    </label>
                    <div className="relative">
                        <textarea
                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all placeholder:text-slate-400"
                            placeholder="Describe your requirement in detail (e.g., specific brand, packaging preference, delivery constraints)..."
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={500}
                        />
                        <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 bg-white/50 px-1 rounded">
                            {notes.length}/500
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* 4. ADDRESS SELECTION */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Select Delivery Address</label>
                        <button
                            type="button"
                            onClick={handleAddAddress}
                            className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                        >
                            <Plus size={12} /> Add New
                        </button>
                    </div>

                    {addresses.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {addresses.map((addr: any) => (
                                <div
                                    key={addr.id}
                                    onClick={() => setAddressId(addr.id)}
                                    className={clsx(
                                        "relative p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all",
                                        addressId === addr.id
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300'
                                    )}
                                >
                                    <MapPin className={clsx("mt-0.5 shrink-0", addressId === addr.id ? 'text-blue-600' : 'text-slate-400')} size={18} />
                                    <div className="flex-1 pr-8">
                                        <p className="text-sm font-bold text-slate-900">{addr.type || "Home"}</p>
                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{addr.line1}, {addr.city}</p>
                                        {addr.landmark && <p className="text-[10px] text-slate-400 mt-1">LM: {addr.landmark}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => handleEditAddress(e, addr)}
                                        className="absolute right-3 top-3 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAddAddress}
                            className="w-full p-6 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                            <Plus size={24} />
                            <span className="text-sm font-bold">Add Address</span>
                        </button>
                    )}
                </div>

            </form>

            {/* FOOTER ACTIONS */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
                <button
                    type="button"
                    onClick={onRequestClose}
                    className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-white transition"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !addressId}
                    className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirm Request'}
                </button>
            </div>

            {/* NESTED ADDRESS MODAL */}
            {isAddressModalOpen && (
                <AddressModal
                    isOpen={isAddressModalOpen}
                    onClose={() => setIsAddressModalOpen(false)}
                    initialData={getModalInitialData()}
                    onSave={handleSaveAddress}
                />
            )}
        </div>
    );
}