'use client';

import { useState } from 'react';
import { MapPin, Clock, ListChecks, Save, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { serviceSettingsSchema } from "@/lib/validators";

// Helper for Toast or Alert
const defaultToast = (msg: string, type: 'success' | 'error') => alert(`${type.toUpperCase()}: ${msg}`);

interface ServiceSettingsProps {
    userId: string;
    serviceData: any; // The 'Service' object from DB
    userAddress: any; // The 'Address' object from DB (from Onboarding)
    showToast?: (msg: string, type: 'success' | 'error') => void;
}

export function ServiceSettingsView({
    userId,
    serviceData,
    userAddress,
    showToast = defaultToast
}: ServiceSettingsProps) {

    const [loading, setLoading] = useState(false);
    const [gettingLoc, setGettingLoc] = useState(false);
    const [errors, setErrors] = useState<any>({});

    // --- SMART INITIALIZATION ---
    const [form, setForm] = useState({
        categoryId: serviceData?.categoryId || '',
        subCategoryIds: serviceData?.subCategoryIds || [],

        // ✅ Removed Address Line 2 from State
        addressLine1: serviceData?.addressLine1 || userAddress?.line1 || '',
        city: serviceData?.city || userAddress?.city || '',
        state: serviceData?.state || userAddress?.state || '',
        pincode: serviceData?.pincode || userAddress?.pincode || '',

        latitude: serviceData?.latitude || 0,
        longitude: serviceData?.longitude || 0,
        radiusKm: serviceData?.radiusKm || 10,

        workingDays: serviceData?.workingDays && serviceData.workingDays.length > 0
            ? serviceData.workingDays
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

        openTime: serviceData?.openTime || '09:00',
        closeTime: serviceData?.closeTime || '18:00'
    });

    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const CATEGORIES = [
        { id: 'cat_cleaning', name: 'Cleaning' },
        { id: 'cat_repair', name: 'Repair' },
        { id: 'cat_plumbing', name: 'Plumbing' },
        { id: 'cat_electrical', name: 'Electrical' },
        { id: 'cat_beauty', name: 'Beauty & Salon' },
    ];

    // --- HANDLERS ---

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
                setForm(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }));
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

    // --- SUBMIT ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            // 1. Prepare Payload
            const payload = {
                ...form,
                radiusKm: Number(form.radiusKm),
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
            };

            // 2. Validate
            // Note: Ensure your 'serviceSettingsSchema' doesn't require addressLine2
            serviceSettingsSchema.parse(payload);

            // 3. API Call
            const res = await fetch('/api/services/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...payload })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");

            showToast("Service settings saved successfully!", "success");

        } catch (error: any) {
            if (error.issues) {
                const formatted: any = {};
                error.issues.forEach((issue: any) => formatted[issue.path[0]] = issue.message);
                setErrors(formatted);
                showToast("Please fix the highlighted errors", "error");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showToast(error.message, "error");
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
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Service Configuration</h2>
                {!serviceData?.addressLine1 && userAddress?.line1 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        Pre-filled from Registration
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Category Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
                        <ListChecks size={20} className="text-blue-600" /> Category & Radius
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Category</label>
                            <select
                                className={getInputClass('categoryId')}
                                value={form.categoryId}
                                onChange={e => handleChange('categoryId', e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <ErrorMsg field="categoryId" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Radius (km)</label>
                            <input
                                type="number"
                                className={getInputClass('radiusKm')}
                                value={form.radiusKm}
                                onChange={e => handleChange('radiusKm', e.target.value)}
                                placeholder="10"
                            />
                            <ErrorMsg field="radiusKm" />
                        </div>
                    </div>
                </div>

                {/* 2. Address & Location */}
                <div className={`bg-white p-6 rounded-2xl shadow-sm border transition ${errors.latitude ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
                        <MapPin size={20} className="text-blue-600" /> Location Details
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address Line 1</label>
                            <input
                                className={getInputClass('addressLine1')}
                                value={form.addressLine1}
                                onChange={e => handleChange('addressLine1', e.target.value)}
                                placeholder="Shop No, Street"
                            />
                            <ErrorMsg field="addressLine1" />
                        </div>

                        {/* ✅ REMOVED ADDRESS LINE 2 INPUT FIELD */}

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">City</label>
                            <input
                                className={getInputClass('city')}
                                value={form.city}
                                onChange={e => handleChange('city', e.target.value)}
                            />
                            <ErrorMsg field="city" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pincode</label>
                            <input
                                className={getInputClass('pincode')}
                                value={form.pincode}
                                onChange={e => handleChange('pincode', e.target.value)}
                                maxLength={6}
                            />
                            <ErrorMsg field="pincode" />
                        </div>
                    </div>

                    {/* GPS Button */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <label className="text-xs font-bold text-blue-800 uppercase block mb-2">GPS Coordinates (Required)</label>
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                className="w-full md:w-auto px-6 py-2.5 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-sm shadow-md"
                            >
                                {gettingLoc ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
                                {form.latitude !== 0 ? "Update Location" : "Get Current Location"}
                            </button>

                            {form.latitude !== 0 ? (
                                <div className="text-xs text-green-700 font-mono bg-white px-3 py-2 rounded border border-green-200">
                                    Lat: {Number(form.latitude).toFixed(4)}, Lng: {Number(form.longitude).toFixed(4)}
                                </div>
                            ) : (
                                <span className="text-xs text-red-500 font-medium">* GPS Required for map visibility</span>
                            )}
                        </div>
                        <ErrorMsg field="latitude" />
                    </div>
                </div>

                {/* 3. Availability */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
                        <Clock size={20} className="text-blue-600" /> Availability
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Working Days</label>
                        <div className="flex gap-2 flex-wrap">
                            {DAYS.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDayToggle(day)}
                                    className={`w-10 h-10 rounded-full text-xs font-bold transition border ${form.workingDays.includes(day)
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        <ErrorMsg field="workingDays" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Open Time</label>
                            <input
                                type="time"
                                className={getInputClass('openTime')}
                                value={form.openTime}
                                onChange={e => handleChange('openTime', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Close Time</label>
                            <input
                                type="time"
                                className={getInputClass('closeTime')}
                                value={form.closeTime}
                                onChange={e => handleChange('closeTime', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
                </button>
            </form>
        </div>
    );
}