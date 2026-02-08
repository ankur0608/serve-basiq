'use client';

import { useState, useMemo } from 'react';
import {
    MapPin, Plus, Loader2, Pencil, CalendarDays, AlignLeft,
    Truck, PackageOpen, IndianRupee
} from 'lucide-react';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface RentalFormProps {
    rentalId: string;
    rentalName: string;
    pricePerDay: number;
    rentalImage?: string;
    ownerLocation?: string; // ✅ Added ownerLocation prop
    userId: string;
    userAddresses: any[];
    userDetails?: any;
    onRequestClose: () => void;
    onSuccess?: () => void;
}

export default function RentalBookingForm({
    rentalId,
    rentalName,
    pricePerDay,
    rentalImage,
    ownerLocation, // ✅ Receive it here
    userId,
    userAddresses: initialAddresses,
    userDetails,
    onRequestClose,
    onSuccess
}: RentalFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // --- Dates State ---
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0]);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    const [endDate, setEndDate] = useState(dayAfter.toISOString().split('T')[0]);

    // --- Delivery & Address State ---
    const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
    const [addresses, setAddresses] = useState(initialAddresses || []);
    const [addressId, setAddressId] = useState(addresses.length > 0 ? addresses[0].id : '');
    const [instructions, setInstructions] = useState('');

    // --- Address Modal State ---
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    // --- CALCULATION LOGIC ---
    const { totalDays, totalPrice } = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const diffTime = end.getTime() - start.getTime();
        let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (days < 1 || isNaN(days)) days = 1;

        return {
            totalDays: days,
            totalPrice: days * pricePerDay
        };
    }, [startDate, endDate, pricePerDay]);

    // --- HANDLERS ---
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (new Date(endDate) <= new Date(startDate)) {
            alert("End date must be after start date");
            return;
        }
        if (deliveryType === 'DELIVERY' && !addressId) {
            alert("Please select a delivery address");
            return;
        }

        setLoading(true);

        try {
            const selectedAddressObj = addresses.find((a: any) => a.id === addressId);

            const payload: any = {
                userId,
                rentalId,
                startDate,
                endDate,
                deliveryType,
                addressId: deliveryType === 'DELIVERY' ? addressId : null,
                notes: instructions,
            };

            if (deliveryType === 'DELIVERY' && addressId.toString().startsWith('temp-') && selectedAddressObj) {
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

            const res = await fetch('/api/rentals/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                if (onSuccess) onSuccess();
                else onRequestClose();
                router.refresh();
            } else {
                alert(data.message || 'Booking failed');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const getModalInitialData = () => {
        const baseData = {
            name: userDetails?.name || "",
            email: userDetails?.email || "",
            phone: userDetails?.phone || "",
            dateOfBirth: userDetails?.dob ? new Date(userDetails.dob).toISOString().split('T')[0] : "",
            preferredLanguage: userDetails?.preferredLanguage || "English",
            addressLine1: "",
            addressLine2: "",
            landmark: "",
            city: "",
            district: "",
            state: "",
            pincode: ""
        };

        if (editingAddress) {
            return {
                ...baseData,
                addressLine1: editingAddress.line1 || "",
                addressLine2: editingAddress.line2 || "",
                landmark: editingAddress.landmark || "",
                city: editingAddress.city || "",
                district: editingAddress.district || "",
                state: editingAddress.state || "",
                pincode: editingAddress.pincode || ""
            };
        }
        return baseData;
    };

    return (
        <div className="bg-white w-full h-full flex flex-col overflow-hidden relative">

            {/* --- HEADER --- */}
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center shrink-0 shadow-md z-10">
                <div className='flex flex-col justify-center gap-1'>
                    <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Requesting Rental</h2>
                    <p className="text-white font-bold text-lg leading-tight truncate max-w-50">{rentalName}</p>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-white tracking-tight flex items-center justify-end gap-0.5">
                        <IndianRupee size={16} strokeWidth={3} />{totalPrice}
                    </div>
                    <span className="block text-[10px] font-medium text-slate-400">
                        For {totalDays} Day{totalDays > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* --- BODY --- */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">

                {/* 1. Dates Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">From</label>
                        <div className="relative">
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">To</label>
                        <div className="relative">
                            <input
                                type="date"
                                min={startDate}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Delivery Mode Toggle */}
                <div className="p-1 bg-slate-100 rounded-xl flex">
                    <button
                        type="button"
                        onClick={() => setDeliveryType('PICKUP')}
                        className={clsx(
                            "flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all",
                            deliveryType === 'PICKUP' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <PackageOpen size={16} /> Self Pickup
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeliveryType('DELIVERY')}
                        className={clsx(
                            "flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all",
                            deliveryType === 'DELIVERY' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Truck size={16} /> Home Delivery
                    </button>
                </div>

                {/* 3. Address (Conditional) */}
                {deliveryType === 'DELIVERY' ? (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase">
                                Delivery Address
                            </label>
                            {addresses.length > 0 && (
                                <button type="button" onClick={handleAddAddress} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition">
                                    <Plus size={14} /> Add New
                                </button>
                            )}
                        </div>

                        {addresses.length > 0 ? (
                            <div className="space-y-3">
                                {addresses.map((addr: any) => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setAddressId(addr.id)}
                                        className={clsx(
                                            "relative p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all duration-200",
                                            addressId === addr.id
                                                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        )}
                                    >
                                        <div className={clsx(
                                            "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                                            addressId === addr.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                        )}>
                                            {addressId === addr.id && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={clsx("text-xs font-bold block", addressId === addr.id ? 'text-blue-700' : 'text-slate-900')}>
                                                {addr.type || "Home"}
                                            </span>
                                            <p className="text-xs text-slate-500 truncate">
                                                {addr.line1}, {addr.city}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleEditAddress(e, addr)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition"
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
                                className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                            >
                                <Plus size={20} className="p-1 bg-slate-100 rounded-full group-hover:bg-blue-100" />
                                <span className="text-xs font-bold">Add Delivery Address</span>
                            </button>
                        )}
                    </div>
                ) : (
                    // ✅ Pickup Info Box: Shows address OR fallback
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center animate-in fade-in zoom-in-95 duration-200">
                        <MapPin className="mx-auto text-slate-400 mb-2" size={24} />
                        <h4 className="text-sm font-bold text-slate-800">Owner Location</h4>

                        {ownerLocation ? (
                            <p className="text-sm text-slate-700 mt-1 font-medium px-4">
                                {ownerLocation}
                            </p>
                        ) : (
                            <p className="text-xs text-slate-500 mt-1">
                                You will receive the exact pickup address and contact details after the owner approves your request.
                            </p>
                        )}
                    </div>
                )}

                {/* 4. Instructions */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                        Notes for Owner
                    </label>
                    <div className="relative group">
                        <AlignLeft className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <textarea
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none font-medium text-slate-700 bg-slate-50 focus:bg-white transition-colors"
                            placeholder="E.g. I will come at 10 AM..."
                            rows={2}
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </div>
                </div>

            </form>

            {/* --- FOOTER --- */}
            <div className="p-4 px-6 bg-white border-t border-slate-100 shrink-0 flex gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-10">
                <button
                    type="button"
                    onClick={onRequestClose}
                    className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading || (deliveryType === 'DELIVERY' && !addressId) || new Date(endDate) <= new Date(startDate)}
                    className="flex-2 bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                        <>Confirm <span className="opacity-60 text-xs font-normal ml-0.5">(₹{totalPrice})</span></>
                    )}
                </button>
            </div>

            {/* Address Modal */}
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