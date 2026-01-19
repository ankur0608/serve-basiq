'use client';

import { useState } from 'react';
import { MapPin, Plus, Loader2, Pencil, Clock, ChevronRight } from 'lucide-react';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import { useRouter } from 'next/navigation';

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

// ✅ Timeline Options Constant
const TIMELINE_OPTIONS = [
    { label: 'Immediate', value: 'IMMEDIATE' },
    { label: 'In 2 Days', value: 'IN_2_DAYS' },
    { label: '2 to 5 Days', value: 'TWO_TO_FIVE_DAYS' }
];

export default function ProductRequestForm({
    productId, productName, price, unit, moq, userId, userAddresses: initialAddresses, onRequestClose
}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // --- Local State for Addresses ---
    const [addresses, setAddresses] = useState(initialAddresses);

    // --- Form State ---
    const quantity = 1;
    const deliveryType = 'DELIVERY';
    const paymentMode = 'CASH';

    const [addressId, setAddressId] = useState(addresses[0]?.id || '');
    const [notes, setNotes] = useState('');
    const [timeline, setTimeline] = useState('IMMEDIATE'); // ✅ Added Timeline State

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
            state: data.state,
            pincode: data.pincode,
            type: "Home",
            country: "India"
        };

        let updatedList;
        if (editingAddress) {
            updatedList = addresses.map(a => a.id === editingAddress.id ? newAddress : a);
        } else {
            updatedList = [...addresses, newAddress];
            setAddressId(newAddress.id);
        }

        setAddresses(updatedList);
        setIsAddressModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!addressId) {
            alert("Please select a delivery address.");
            return;
        }

        setLoading(true);

        try {
            const selectedAddressObj = addresses.find(a => a.id === addressId);

            const payload: any = {
                userId,
                productId,
                quantity,
                deliveryType,
                paymentMode,
                addressId,
                notes,
                timeline, // ✅ Sending Timeline to API
            };

            if (addressId.toString().startsWith('temp-') && selectedAddressObj) {
                payload.newAddress = {
                    line1: selectedAddressObj.line1,
                    line2: selectedAddressObj.line2,
                    landmark: selectedAddressObj.landmark,
                    city: selectedAddressObj.city,
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
                alert('Request Sent Successfully!');
                router.refresh();
                onRequestClose();
            } else {
                console.error("Server Error:", data);
                alert(data.message || 'Request failed.');
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getModalInitialData = () => {
        if (editingAddress) {
            return {
                name: "", email: "", phone: "",
                addressLine1: editingAddress.line1 || "",
                addressLine2: editingAddress.line2 || "",
                landmark: editingAddress.landmark || "",
                city: editingAddress.city || "",
                state: editingAddress.state || "",
                pincode: editingAddress.pincode || ""
            };
        }
        return {
            name: "", email: "", phone: "",
            addressLine1: "", addressLine2: "", landmark: "", city: "", state: "", pincode: ""
        };
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full mx-auto animate-in fade-in zoom-in-95 duration-200">

            <div className="bg-slate-900 p-6 text-white">
                <h2 className="text-xl font-bold">Request Product</h2>
                <p className="text-slate-400 text-sm mt-1">Item: <span className="text-white font-medium">{productName}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* ✅ 1. TIMELINE DROPDOWN */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        When do you need this?
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <select
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-900 appearance-none cursor-pointer"
                        >
                            {TIMELINE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none">
                            <ChevronRight className="rotate-90 text-slate-400" size={14} />
                        </div>
                    </div>
                </div>

                {/* 2. ADDRESS SECTION */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Delivery Address</label>
                        {addresses.length > 0 && (
                            <button
                                type="button"
                                onClick={handleAddAddress}
                                className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                            >
                                <Plus size={12} /> Add New
                            </button>
                        )}
                    </div>

                    {addresses.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {addresses.map((addr) => (
                                <div
                                    key={addr.id}
                                    onClick={() => setAddressId(addr.id)}
                                    className={`relative p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all group ${addressId === addr.id
                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <MapPin className={`mt-0.5 flex-shrink-0 ${addressId === addr.id ? 'text-blue-600' : 'text-slate-400'}`} size={16} />
                                    <div className="flex-1 pr-6">
                                        <p className="text-sm font-bold text-slate-900">{addr.type || "Home"}</p>
                                        <p className="text-xs text-slate-500 line-clamp-1">{addr.line1}, {addr.city}</p>
                                        {addr.landmark && <p className="text-[10px] text-slate-400 mt-0.5">LM: {addr.landmark}</p>}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => handleEditAddress(e, addr)}
                                        className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                        title="Edit Address"
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
                            className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                            <Plus size={20} />
                            <span className="text-sm font-bold">Add Address</span>
                        </button>
                    )}
                </div>

                {/* 3. DESCRIPTION / NOTES */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description / Notes</label>
                    <textarea
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Add details about your request..."
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onRequestClose}
                        className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !addressId}
                        className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Confirm Request'}
                    </button>
                </div>

            </form>

            {isAddressModalOpen && (
                <ProfileEditModal
                    isOpen={isAddressModalOpen}
                    onClose={() => setIsAddressModalOpen(false)}
                    initialData={getModalInitialData()}
                    onSave={handleSaveAddress}
                    isEmailLocked={true}
                    isPhoneLocked={true}
                />
            )}
        </div>
    );
}