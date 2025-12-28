'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, ListChecks, Save, Navigation, Loader2, AlertCircle } from 'lucide-react';

export function ServiceSettingsView({ userId, existingData, showToast }: any) {
    const [loading, setLoading] = useState(false);
    const [gettingLoc, setGettingLoc] = useState(false);
    const [errors, setErrors] = useState<any>({});

    // Initialize Form with Existing Data or Defaults
    const [form, setForm] = useState({
        categoryId: existingData?.categoryId || '',
        // Ensure subCategoryIds is initialized correctly
        subCategoryIds: existingData?.subCategoryIds || [],

        addressLine1: existingData?.addressLine1 || '',
        addressLine2: existingData?.addressLine2 || '',
        city: existingData?.city || '',
        state: existingData?.state || '',
        pincode: existingData?.pincode || '',

        latitude: existingData?.latitude || 0,
        longitude: existingData?.longitude || 0,
        radiusKm: existingData?.radiusKm || 10,

        workingDays: existingData?.workingDays || [],
        openTime: existingData?.openTime || '09:00',
        closeTime: existingData?.closeTime || '18:00'
    });

    // Constants
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const CATEGORIES = [
        { id: 'cat_cleaning', name: 'Cleaning' },
        { id: 'cat_repair', name: 'Repair' },
        { id: 'cat_plumbing', name: 'Plumbing' },
        { id: 'cat_electrical', name: 'Electrical' },
        { id: 'cat_painting', name: 'Painting' },
    ];

    // --- INPUT HANDLERS ---

    const handleNumberOnly = (field: string, value: string, maxLength: number) => {
        const cleanValue = value.replace(/[^0-9]/g, '').slice(0, maxLength);
        setForm(prev => ({ ...prev, [field]: cleanValue }));
        if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: null }));
    };

    const handleText = (field: string, value: string) => {
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
        if (errors.workingDays) setErrors((prev: any) => ({ ...prev, workingDays: null }));
    };

    // --- LOCATION HANDLER ---
    const handleGetLocation = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported");
        setGettingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }));
                setErrors((prev: any) => ({ ...prev, location: null })); // Clear location error
                setGettingLoc(false);
                showToast("Location captured successfully!", "success");
            },
            (err) => {
                console.error(err);
                setGettingLoc(false);
                showToast("Failed to get location. Please enable permissions.", "error");
            },
            { enableHighAccuracy: true }
        );
    };

    // --- VALIDATION ---
    const validate = () => {
        let newErrors: any = {};
        let isValid = true;

        if (!form.categoryId) newErrors.categoryId = "Please select a category";
        if (!form.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required";
        if (!form.city.trim()) newErrors.city = "City is required";
        if (!form.state.trim()) newErrors.state = "State is required";

        if (!form.pincode) newErrors.pincode = "Pincode is required";
        else if (form.pincode.length !== 6) newErrors.pincode = "Pincode must be 6 digits";

        if (!form.radiusKm) newErrors.radiusKm = "Service radius is required";

        // Geo Location Check
        if (form.latitude === 0 || form.longitude === 0) {
            newErrors.location = "Please click 'Get Current Location' to set your service area";
        }

        // Schedule Check
        if (form.workingDays.length === 0) newErrors.workingDays = "Select at least one working day";
        if (form.openTime >= form.closeTime) {
            newErrors.time = "Opening time must be before closing time";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast("Please fix the highlighted errors", "error");
        }

        return isValid;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            // Using update endpoint
            const res = await fetch('/api/services/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...form })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to update settings");

            showToast("Service settings updated successfully!", "success");
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // Helper for styles
    const getInputClass = (fieldName: string) => `w-full border rounded-lg px-4 py-2.5 bg-slate-50 outline-none focus:ring-2 transition ${errors[fieldName] ? 'border-red-500 ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`;
    const ErrorMsg = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1"><AlertCircle size={10} /> {errors[field]}</p> : null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Configuration</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Category Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
                        <ListChecks size={20} className="text-blue-600" /> Category & Skills
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Main Category</label>
                            <select
                                className={getInputClass('categoryId')}
                                value={form.categoryId}
                                onChange={e => handleText('categoryId', e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <ErrorMsg field="categoryId" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Service Radius (km)</label>
                            <input
                                type="text"
                                className={getInputClass('radiusKm')}
                                value={form.radiusKm}
                                onChange={e => handleNumberOnly('radiusKm', e.target.value, 3)}
                                placeholder="e.g. 10"
                            />
                            <ErrorMsg field="radiusKm" />
                        </div>
                    </div>
                </div>

                {/* 2. Address & Location */}
                <div className={`bg-white p-6 rounded-2xl shadow-sm border transition ${errors.location ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-100 pb-2">
                        <MapPin size={20} className="text-blue-600" /> Location Details
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address Line 1</label>
                            <input
                                className={getInputClass('addressLine1')}
                                placeholder="Shop No, Building Name"
                                value={form.addressLine1}
                                onChange={e => handleText('addressLine1', e.target.value)}
                            />
                            <ErrorMsg field="addressLine1" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address Line 2</label>
                            <input
                                className={getInputClass('addressLine2')}
                                placeholder="Area, Landmark (Optional)"
                                value={form.addressLine2}
                                onChange={e => handleText('addressLine2', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">City</label>
                            <input
                                className={getInputClass('city')}
                                value={form.city}
                                onChange={e => handleText('city', e.target.value)}
                            />
                            <ErrorMsg field="city" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pincode</label>
                            <input
                                className={getInputClass('pincode')}
                                value={form.pincode}
                                onChange={e => handleNumberOnly('pincode', e.target.value, 6)}
                                maxLength={6}
                                placeholder="XXXXXX"
                            />
                            <ErrorMsg field="pincode" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">State</label>
                            <input
                                className={getInputClass('state')}
                                value={form.state}
                                onChange={e => handleText('state', e.target.value)}
                            />
                            <ErrorMsg field="state" />
                        </div>
                    </div>

                    {/* Geo Location */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <label className="text-xs font-bold text-blue-800 uppercase block mb-2">GPS Coordinates (Required for Map)</label>
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                className="w-full md:w-auto px-6 py-2.5 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-sm shadow-md"
                            >
                                {gettingLoc ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
                                {form.latitude !== 0 ? "Update GPS Location" : "Get Current Location"}
                            </button>

                            {form.latitude !== 0 ? (
                                <div className="text-xs text-green-700 flex gap-4 font-mono bg-white px-3 py-2 rounded border border-green-200">
                                    <span>Lat: {form.latitude.toFixed(6)}</span>
                                    <span>Long: {form.longitude.toFixed(6)}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-slate-500 italic">Location not set</span>
                            )}
                        </div>
                        <ErrorMsg field="location" />
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
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Opening Time</label>
                            <input
                                type="time"
                                className={getInputClass('openTime')}
                                value={form.openTime}
                                onChange={e => setForm({ ...form, openTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Closing Time</label>
                            <input
                                type="time"
                                className={getInputClass('closeTime')}
                                value={form.closeTime}
                                onChange={e => setForm({ ...form, closeTime: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <ErrorMsg field="time" />
                        </div>
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Service Details</>}
                </button>
            </form>
        </div>
    );
}