'use client';

import { useState } from 'react';
import {
    MapPin, Clock, ListChecks, Save, Navigation, Loader2,
    AlertCircle, Briefcase, BadgeIndianRupee, X, Plus
} from 'lucide-react';
import { serviceSettingsSchema } from "@/lib/validators";

const defaultToast = (msg: string, type: 'success' | 'error') => alert(`${type.toUpperCase()}: ${msg}`);

interface ServiceSettingsProps {
    userId: string;
    serviceData: any; // Can be null (Create Mode) or Object (Edit Mode)
    userData: any;    // To prefill Name/Phone
    userAddress: any; // To prefill Address
    onComplete: () => void;
    showToast?: (msg: string, type: 'success' | 'error') => void;
}

export function ServiceSettingsView({
    userId,
    serviceData,
    userData,
    userAddress,
    onComplete,
    showToast = defaultToast
}: ServiceSettingsProps) {

    const [loading, setLoading] = useState(false);
    const [gettingLoc, setGettingLoc] = useState(false);
    const [errors, setErrors] = useState<any>({});

    // Initialize Form:
    // If serviceData exists (Edit Mode), use it.
    // If not (Create Mode), try to fallback to User Profile data.
    const [form, setForm] = useState({
        name: serviceData?.name || userData?.name || '',
        desc: serviceData?.desc || '',
        price: serviceData?.price || '',
        altPhone: serviceData?.altPhone || userData?.phone || '',
        experience: serviceData?.experience || '',

        // Categories
        categoryId: serviceData?.categoryId || '',
        subCategoryIds: serviceData?.subCategoryIds || [],

        // Location
        addressLine1: serviceData?.addressLine1 || userAddress?.line1 || '',
        addressLine2: serviceData?.addressLine2 || userAddress?.line2 || '',
        city: serviceData?.city || userAddress?.city || '',
        state: serviceData?.state || userAddress?.state || '',
        pincode: serviceData?.pincode || userAddress?.pincode || '',

        latitude: serviceData?.latitude ? Number(serviceData.latitude) : 0,
        longitude: serviceData?.longitude ? Number(serviceData.longitude) : 0,
        radiusKm: serviceData?.radiusKm || 10,

        // Availability
        workingDays: serviceData?.workingDays && serviceData.workingDays.length > 0
            ? serviceData.workingDays
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        openTime: serviceData?.openTime || '09:00',
        closeTime: serviceData?.closeTime || '18:00'
    });

    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // You can fetch these from an API or keep them static
    const CATEGORIES = [
        { id: 'cleaning', name: 'Cleaning' },
        { id: 'repair', name: 'Repair' },
        { id: 'plumbing', name: 'Plumbing' },
        { id: 'electrical', name: 'Electrical' },
        { id: 'beauty', name: 'Beauty & Salon' },
        { id: 'painting', name: 'Painting' },
        { id: 'moving', name: 'Movers & Packers' },
    ];

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: null }));
    };

    const handleDayToggle = (day: string) => {
        setForm(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter((d: string) => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) return showToast("Geolocation not supported", "error");
        setGettingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                setErrors((prev: any) => ({ ...prev, latitude: null }));
                setGettingLoc(false);
                showToast("Location captured!", "success");
            },
            (err) => {
                console.error(err);
                setGettingLoc(false);
                showToast("Access denied. Please enable GPS.", "error");
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            // Prepare payload with correct types
            const payload = {
                ...form,
                price: Number(form.price) || 0,
                radiusKm: Number(form.radiusKm),
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
            };

            // Client-side Validation using Zod
            serviceSettingsSchema.parse(payload);

            // API Call
            const res = await fetch('/api/services/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    // ✅ CRITICAL: 
                    // If serviceData exists, we send its ID (Update Mode).
                    // If serviceData is null, we send undefined (Create Mode).
                    serviceId: serviceData?.id,
                    ...payload
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Operation failed");

            // Success handling
            showToast(serviceData ? "Service updated successfully!" : "New service created!", "success");
            if (onComplete) onComplete();

        } catch (error: any) {
            if (error.issues) {
                // Zod Validation Errors
                const formatted: any = {};
                error.issues.forEach((issue: any) => formatted[issue.path[0]] = issue.message);
                setErrors(formatted);
                showToast("Please fix the highlighted errors", "error");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // API Errors
                showToast(error.message || "Something went wrong", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const getInputClass = (fieldName: string) =>
        `w-full border rounded-lg px-4 py-2.5 bg-slate-50 outline-none focus:ring-2 transition ${errors[fieldName] ? 'border-red-500 ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`;

    const ErrorMsg = ({ field }: { field: string }) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1"><AlertCircle size={10} /> {errors[field]}</p> : null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Basic Info */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
                        <Briefcase size={20} className="text-blue-600" /> Basic Details
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Brand Name</label>
                            <input className={getInputClass('name')} value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Joe's Quick Plumbing" />
                            <ErrorMsg field="name" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                            <textarea className={getInputClass('desc')} value={form.desc} onChange={e => handleChange('desc', e.target.value)} rows={3} placeholder="Describe your service..." />
                            <ErrorMsg field="desc" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Price / Hour</label>
                            <div className="relative">
                                <BadgeIndianRupee size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input type="number" className={`${getInputClass('price')} pl-10`} value={form.price} onChange={e => handleChange('price', e.target.value)} />
                            </div>
                            <ErrorMsg field="price" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Experience (Years)</label>
                            <input className={getInputClass('experience')} value={form.experience} onChange={e => handleChange('experience', e.target.value)} placeholder="e.g. 5 Years" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Business Phone</label>
                            <input className={getInputClass('altPhone')} value={form.altPhone} onChange={e => handleChange('altPhone', e.target.value)} placeholder="e.g. +91 9876543210" />
                        </div>
                    </div>
                </div>

                {/* 2. Category */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
                        <ListChecks size={20} className="text-blue-600" /> Category & Reach
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Category</label>
                            <select className={getInputClass('categoryId')} value={form.categoryId} onChange={e => handleChange('categoryId', e.target.value)}>
                                <option value="">Select Category</option>
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <ErrorMsg field="categoryId" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Radius (KM)</label>
                            <input type="number" className={getInputClass('radiusKm')} value={form.radiusKm} onChange={e => handleChange('radiusKm', e.target.value)} />
                            <ErrorMsg field="radiusKm" />
                        </div>
                    </div>
                </div>

                {/* 3. Location */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
                        <MapPin size={20} className="text-blue-600" /> Location
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address Line 1</label>
                            <input className={getInputClass('addressLine1')} value={form.addressLine1} onChange={e => handleChange('addressLine1', e.target.value)} />
                            <ErrorMsg field="addressLine1" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">City</label>
                            <input className={getInputClass('city')} value={form.city} onChange={e => handleChange('city', e.target.value)} />
                            <ErrorMsg field="city" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">State</label>
                            <input className={getInputClass('state')} value={form.state} onChange={e => handleChange('state', e.target.value)} />
                            <ErrorMsg field="state" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pincode</label>
                            <input className={getInputClass('pincode')} value={form.pincode} onChange={e => handleChange('pincode', e.target.value)} maxLength={6} />
                            <ErrorMsg field="pincode" />
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm">GPS Coordinates</h4>
                                <p className="text-xs text-blue-600 mt-1">
                                    {form.latitude !== 0 ? `Lat: ${Number(form.latitude).toFixed(4)}, Lng: ${Number(form.longitude).toFixed(4)}` : "Location not set"}
                                </p>
                            </div>
                            <button type="button" onClick={handleGetLocation} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-blue-700 transition">
                                {gettingLoc ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
                                {form.latitude !== 0 ? "Update GPS" : "Get GPS"}
                            </button>
                        </div>
                        <ErrorMsg field="latitude" />
                    </div>
                </div>

                {/* 4. Availability */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
                        <Clock size={20} className="text-blue-600" /> Availability
                    </div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Working Days</label>
                    <div className="flex gap-2 flex-wrap mb-6">
                        {DAYS.map(day => (
                            <button key={day} type="button" onClick={() => handleDayToggle(day)} className={`w-10 h-10 rounded-full text-xs font-bold border transition ${form.workingDays.includes(day) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}>
                                {day}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Open Time</label>
                            <input type="time" className={getInputClass('openTime')} value={form.openTime} onChange={e => handleChange('openTime', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Close Time</label>
                            <input type="time" className={getInputClass('closeTime')} value={form.closeTime} onChange={e => handleChange('closeTime', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button type="button" onClick={onComplete} className="flex-1 bg-white border border-slate-300 text-slate-700 py-4 rounded-xl font-bold text-lg hover:bg-slate-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : (serviceData ? <Save size={20} /> : <Plus size={20} />)}
                        {serviceData ? "Save Changes" : "Create Service"}
                    </button>
                </div>
            </form>
        </div>
    );
}