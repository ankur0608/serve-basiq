'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    MapPin, Plus, Loader2, Pencil, AlignLeft,
    Truck, PackageOpen, IndianRupee, CalendarIcon, CheckCircle2,
    Clock, Ban
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import AddressModal from '@/components/booking/AddressModal';

interface SlotOption {
    id: string;
    date: string;      // ISO
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    isBooked: boolean;
}

interface RentalFormProps {
    rentalId: string;
    rentalName: string;

    price: number;
    priceType?: string; // ✅ ADDED TO RECEIVE PROP
    hourlyPrice?: number;
    dailyPrice?: number;
    weeklyPrice?: number;
    monthlyPrice?: number;
    fixedPrice?: number;

    rentalImage?: string;
    ownerLocation?: string;
    isAvailable?: boolean;
    userId: string;
    userAddresses: any[];
    userDetails?: any;
    onRequestClose: () => void;
    onSuccess?: () => void;
}

export default function RentalBookingForm({
    rentalId,
    rentalName,
    hourlyPrice,
    price,
    priceType, // ✅ DESTRUCTURED
    dailyPrice,
    weeklyPrice,
    monthlyPrice,
    fixedPrice,
    rentalImage,
    ownerLocation,
    isAvailable = true,
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

    // --- Pricing Model State ---
    const availableModels = useMemo(() => {
        const models = [];
        if (priceType === 'QUOTE') {
            models.push({ id: 'QUOTE', label: 'Custom Quote', price: 0 });
            return models;
        }
        if (priceType === 'SLOT') {
            models.push({ id: 'SLOT', label: 'Per Slot', price: price || 0 });
            return models;
        }

        if (hourlyPrice && hourlyPrice > 0) models.push({ id: 'HOURLY', label: 'Hourly', price: hourlyPrice });
        if (dailyPrice && dailyPrice > 0) models.push({ id: 'DAILY', label: 'Daily', price: dailyPrice });

        if (models.length === 0) {
            models.push({
                id: 'DAILY',
                label: 'Standard Rate',
                price: price || 0
            });
        }
        if (weeklyPrice && weeklyPrice > 0) models.push({ id: 'WEEKLY', label: 'Weekly', price: weeklyPrice });
        if (monthlyPrice && monthlyPrice > 0) models.push({ id: 'MONTHLY', label: 'Monthly', price: monthlyPrice });
        if (fixedPrice && fixedPrice > 0) models.push({ id: 'FIXED', label: 'Fixed Price', price: fixedPrice });
        return models;
    }, [hourlyPrice, dailyPrice, weeklyPrice, monthlyPrice, fixedPrice, price, priceType]);

    const [pricingModel, setPricingModel] = useState<string>(
        (availableModels[0]?.id as any) || 'DAILY'
    );

    // --- Delivery & Address State ---
    const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
    const [addresses, setAddresses] = useState(initialAddresses || []);
    const [addressId, setAddressId] = useState(addresses.length > 0 ? addresses[0].id : '');
    const [instructions, setInstructions] = useState('');

    // --- Address Modal State ---
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    // --- Slot State ---
    const [slots, setSlots] = useState<SlotOption[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(true);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setSlotsLoading(true);
        (async () => {
            try {
                const res = await fetch(`/api/rentals/${rentalId}/slots?from=${startDate}`);
                const data = await res.json();
                if (!cancelled && data.success) setSlots(data.slots || []);
            } catch {
                if (!cancelled) setSlots([]);
            } finally {
                if (!cancelled) setSlotsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [rentalId, startDate]);

    const availableSlots = useMemo(
        () => slots.filter((s) => !s.isBooked),
        [slots]
    );
    const slotsByDate = useMemo(() => {
        const map = new Map<string, SlotOption[]>();
        for (const s of availableSlots) {
            const key = s.date.split('T')[0];
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(s);
        }
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [availableSlots]);

    // --- CALCULATION LOGIC ---
    const { totalDays, totalPrice, activePrice } = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (days < 1 || isNaN(days)) days = 1;

        const currentModel = availableModels.find(m => m.id === pricingModel);
        const unitPrice = currentModel ? currentModel.price : (price || 0);

        let calculatedPrice = 0;
        switch (pricingModel) {
            case 'HOURLY': calculatedPrice = (days * 24) * unitPrice; break;
            case 'DAILY': calculatedPrice = days * unitPrice; break;
            case 'WEEKLY': calculatedPrice = Math.max(1, Math.ceil(days / 7)) * unitPrice; break;
            case 'MONTHLY': calculatedPrice = Math.max(1, Math.ceil(days / 30)) * unitPrice; break;
            case 'FIXED': calculatedPrice = unitPrice; break;
            case 'QUOTE': calculatedPrice = 0; break;
            case 'SLOT': calculatedPrice = unitPrice; break; // price per slot
            default: calculatedPrice = days * unitPrice;
        }

        return { totalDays: days, totalPrice: calculatedPrice, activePrice: unitPrice };
    }, [startDate, endDate, pricingModel, price, availableModels]);

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

        if (!isAvailable) {
            toast.error("This rental is currently unavailable.");
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            toast.error("End date must be after start date");
            return;
        }
        if (deliveryType === 'DELIVERY' && !addressId) {
            toast.error("Please select a delivery address");
            return;
        }
        if (slotsByDate.length > 0 && !selectedSlotId) {
            toast.error("Please pick a time slot");
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
                pricingModel,
                addressId: deliveryType === 'DELIVERY' ? addressId : null,
                slotId: selectedSlotId || undefined,
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
                toast.error(data.message || 'Booking failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
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
            addressLine1: "", addressLine2: "", landmark: "", city: "", district: "", state: "", pincode: ""
        };
    };

    return (
        <div className="bg-white w-full h-full flex flex-col overflow-hidden relative sm:rounded-3xl sm:max-h-[85vh] shadow-2xl">

            {/* --- HEADER --- */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white flex justify-between items-center shrink-0 shadow-md z-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className='flex flex-col justify-center gap-1 relative z-10'>
                    <h2 className="text-[10px] mt-5 font-extrabold uppercase tracking-widest text-blue-400">Requesting Rental</h2>
                    <p className="text-white font-bold text-lg leading-tight truncate max-w-[200px] sm:max-w-[250px]">{rentalName}</p>
                </div>

                {/* ✅ DYNAMIC PRICING HEADER */}
                <div className="text-right relative z-10">
                    {priceType === 'QUOTE' ? (
                        <div className="text-lg mt-7 font-bold text-slate-200 tracking-tight flex items-center justify-end">
                            To be discussed
                        </div>
                    ) : (
                        <>
                            <div className="text-2xl mt-7 font-black text-white tracking-tight flex items-center justify-end">
                                <IndianRupee size={20} strokeWidth={3} className="mt-0.5" />{totalPrice}
                            </div>
                            <span className="block text-[11px] font-medium text-slate-300">
                                {pricingModel === 'FIXED' ? 'Fixed Price' :
                                    pricingModel === 'SLOT' ? 'Per Slot' :
                                        pricingModel === 'HOURLY' ? `${totalDays * 24} Hours` :
                                            pricingModel === 'WEEKLY' ? `${Math.max(1, Math.ceil(totalDays / 7))} Week(s)` :
                                                pricingModel === 'MONTHLY' ? `${Math.max(1, Math.ceil(totalDays / 30))} Month(s)` :
                                                    `${totalDays} Day${totalDays > 1 ? 's' : ''}`}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* --- BODY --- */}
            <form id="rental-booking-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar min-h-0 p-6 space-y-7">

                {/* Availability banner */}
                {!isAvailable && (
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800">
                        <Ban size={18} className="mt-0.5 shrink-0" />
                        <div className="text-xs">
                            <p className="font-extrabold uppercase tracking-wide mb-0.5">Currently unavailable</p>
                            <p className="text-red-700/90">
                                The owner has paused this rental. You can still browse other items.
                            </p>
                        </div>
                    </div>
                )}

                {/* 1. Dates Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">From</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-3.5 text-slate-400" size={16} />
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">To</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-3.5 text-slate-400" size={16} />
                            <input
                                type="date"
                                min={startDate}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 1b. Available Slots */}
                <div>
                    <label className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                        <span className="flex items-center gap-1.5">
                            <Clock size={13} /> Pick a Time Slot
                        </span>
                        <span className="font-medium normal-case text-[11px] text-slate-400">
                            {slotsLoading ? 'Loading…' : `${availableSlots.length} available`}
                        </span>
                    </label>

                    {slotsLoading ? (
                        <div className="h-16 rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />
                    ) : slotsByDate.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                The owner hasn't published specific slots yet. Your request will be reviewed
                                for the dates above.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                            {slotsByDate.map(([dateKey, daySlots]) => (
                                <div key={dateKey} className="rounded-xl border border-slate-200 bg-white p-3">
                                    <p className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                                        <CalendarIcon size={12} />
                                        {new Date(dateKey).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {daySlots.map((s) => {
                                            const selected = selectedSlotId === s.id;
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setSelectedSlotId(selected ? null : s.id)}
                                                    className={clsx(
                                                        'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5',
                                                        selected
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30'
                                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-700'
                                                    )}
                                                >
                                                    {selected && <CheckCircle2 size={12} />}
                                                    {s.startTime} – {s.endTime}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. PRICING MODEL SELECTOR (Hidden if QUOTE) */}
                {priceType !== 'QUOTE' && availableModels.length > 1 && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Select Rate Plan</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {availableModels.map((model) => (
                                <button
                                    key={model.id}
                                    type="button"
                                    onClick={() => setPricingModel(model.id as any)}
                                    className={clsx(
                                        "relative py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 overflow-hidden",
                                        pricingModel === model.id
                                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    {pricingModel === model.id && (
                                        <CheckCircle2 size={14} className="absolute top-1.5 right-1.5 text-blue-500" />
                                    )}
                                    <span className={clsx(pricingModel === model.id ? "text-blue-900" : "text-slate-500")}>{model.label}</span>
                                    <span className={clsx("text-sm", pricingModel === model.id ? "text-blue-700" : "text-slate-900")}>₹{model.price}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Delivery Mode Toggle */}
                <div className="p-1.5 bg-slate-100 rounded-xl flex shadow-inner">
                    <button
                        type="button"
                        onClick={() => setDeliveryType('PICKUP')}
                        className={clsx(
                            "flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200",
                            deliveryType === 'PICKUP' ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <PackageOpen size={16} className={deliveryType === 'PICKUP' ? "text-blue-600" : ""} /> Self Pickup
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeliveryType('DELIVERY')}
                        className={clsx(
                            "flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200",
                            deliveryType === 'DELIVERY' ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Truck size={16} className={deliveryType === 'DELIVERY' ? "text-blue-600" : ""} /> Home Delivery
                    </button>
                </div>

                {/* 4. Address or Pickup Info */}
                <div className="min-h-[120px]">
                    {deliveryType === 'DELIVERY' ? (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-center mb-3 ml-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase">
                                    Delivery Address
                                </label>
                                {addresses.length > 0 && (
                                    <button type="button" onClick={handleAddAddress} className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition">
                                        <Plus size={14} /> Add New
                                    </button>
                                )}
                            </div>

                            {addresses.length > 0 ? (
                                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    {addresses.map((addr: any) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => setAddressId(addr.id)}
                                            className={clsx(
                                                "relative p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all duration-200",
                                                addressId === addr.id
                                                    ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            )}
                                        >
                                            <div className={clsx(
                                                "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                                addressId === addr.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                            )}>
                                                {addressId === addr.id && <div className="h-2 w-2 bg-white rounded-full" />}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <span className={clsx("text-sm font-bold block mb-0.5", addressId === addr.id ? 'text-blue-900' : 'text-slate-900')}>
                                                    {addr.type || "Home"}
                                                </span>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {addr.line1}, {addr.city}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => handleEditAddress(e, addr)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition"
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
                                    className="w-full py-8 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all group bg-slate-50"
                                >
                                    <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                        <Plus size={20} className="text-blue-600" />
                                    </div>
                                    <span className="text-sm font-bold">Add Delivery Address</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center justify-center h-full">
                            <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                                <MapPin className="text-blue-500" size={24} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800">Owner Location</h4>
                            {ownerLocation ? (
                                <p className="text-sm text-slate-600 mt-1.5 font-medium px-4">{ownerLocation}</p>
                            ) : (
                                <p className="text-xs text-slate-500 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
                                    Full address details will be shared securely after approval.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* 5. Instructions */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Notes for Owner <span className="text-slate-400 font-normal capitalize">(Optional)</span></label>
                    <div className="relative group">
                        <AlignLeft className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                        <textarea
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-slate-700 bg-slate-50 focus:bg-white transition-colors"
                            placeholder="E.g. I will pick up at 10 AM..."
                            rows={2}
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </div>
                </div>

            </form>

            {/* --- FOOTER --- */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 shrink-0 flex gap-3 z-10 rounded-b-2xl">
                <button
                    type="button"
                    onClick={onRequestClose}
                    className="flex-1 py-3.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-white hover:border-slate-300 hover:text-slate-900 transition text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    form="rental-booking-form"
                    disabled={
                        loading
                        || !isAvailable
                        || (deliveryType === 'DELIVERY' && !addressId)
                        || new Date(endDate) <= new Date(startDate)
                        || (slotsByDate.length > 0 && !selectedSlotId)
                    }
                    className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                        priceType === 'QUOTE' ? (
                            "Request Quote"
                        ) : priceType === 'SLOT' ? (
                            <>Confirm Slot Booking <span className="opacity-80 text-xs font-medium ml-1 bg-black/10 px-1.5 py-0.5 rounded-md">₹{totalPrice}</span></>
                        ) : (
                            <>Confirm Request <span className="opacity-80 text-xs font-medium ml-1 bg-black/10 px-1.5 py-0.5 rounded-md">₹{totalPrice}</span></>
                        )
                    )}
                </button>
            </div>

            {/* Address Modal */}
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