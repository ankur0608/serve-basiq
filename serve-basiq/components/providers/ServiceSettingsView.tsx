'use client';

import { useState } from 'react';
import {
    MapPin, Save, Navigation, Loader2,
    AlertCircle, Briefcase, BadgeIndianRupee,
    ImageIcon, Camera, UploadCloud,
    CalendarDays, Clock, Check
} from 'lucide-react';

// --- HELPER: Upload to Backend (Matches VerificationView) ---
async function uploadToBackend(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    // 🔍 Console log to debug client-side
    console.log("📤 Client: Starting upload for", file.name);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ Client: Upload API Error", errorData);
        throw new Error(errorData.message || "Upload failed");
    }

    const data = await res.json();

    if (data.url) return data.url;
    if (!data.key) throw new Error("Upload successful but no key returned");

    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    if (!urlEndpoint) return "";

    const cleanEndpoint = urlEndpoint.replace(/\/$/, "");
    return `${cleanEndpoint}/${data.key}`;
}

const defaultToast = (msg: string, type: 'success' | 'error') => alert(`${type.toUpperCase()}: ${msg}`);

interface ServiceSettingsProps {
    userId: string;
    serviceData: any;
    userData: any;
    userAddress: any;
    onComplete: () => void;
    showToast?: (msg: string, type: 'success' | 'error') => void;
}

export function ServiceSettingsView({
    userId, serviceData, userData, userAddress, onComplete, showToast = defaultToast
}: ServiceSettingsProps) {

    const [loading, setLoading] = useState(false);

    // Upload States
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<string | null>(null);

    const [gettingLoc, setGettingLoc] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const [form, setForm] = useState({
        name: serviceData?.name || userData?.name || '',
        desc: serviceData?.desc || '',

        // Media
        mainimg: serviceData?.mainimg || serviceData?.img || '',
        coverImg: serviceData?.coverImg || '',

        priceType: serviceData?.priceType || 'FIXED',
        price: serviceData?.price || '',
        experience: serviceData?.experience || '',
        altPhone: serviceData?.altPhone || userData?.phone || '',
        categoryId: serviceData?.categoryId || '',
        subCategoryIds: serviceData?.subCategoryIds || [],
        addressLine1: serviceData?.addressLine1 || userAddress?.line1 || '',
        addressLine2: serviceData?.addressLine2 || userAddress?.line2 || '',
        city: serviceData?.city || userAddress?.city || '',
        state: serviceData?.state || userAddress?.state || '',
        pincode: serviceData?.pincode || userAddress?.pincode || '',
        latitude: serviceData?.latitude ? Number(serviceData.latitude) : 0,
        longitude: serviceData?.longitude ? Number(serviceData.longitude) : 0,
        radiusKm: serviceData?.radiusKm || 10,
        workingDays: serviceData?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        openTime: serviceData?.openTime || '09:00',
        closeTime: serviceData?.closeTime || '18:00'
    });

    const CATEGORIES = [
        { id: 'cleaning', name: 'Cleaning' }, { id: 'repair', name: 'Repair' },
        { id: 'plumbing', name: 'Plumbing' }, { id: 'electrical', name: 'Electrical' },
        { id: 'beauty', name: 'Beauty & Salon' }, { id: 'painting', name: 'Painting' },
    ];

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const handleDayToggle = (day: string) => {
        setForm(prev => {
            const currentDays = prev.workingDays;
            if (currentDays.includes(day)) {
                return { ...prev, workingDays: currentDays.filter((d: string) => d !== day) };
            } else {
                return { ...prev, workingDays: [...currentDays, day] };
            }
        });
    };

    // ✅ Matches Logic from VerificationView
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setActiveUploadField(field);

            const url = await uploadToBackend(file);

            if (url) {
                handleChange(field, url);
                showToast("Image uploaded successfully!", "success");
            } else {
                showToast("Failed to upload image.", "error");
            }
        } catch (err: any) {
            console.error("Upload Error:", err);
            showToast(err.message || "Upload failed", "error");
        } finally {
            setUploading(false);
            setActiveUploadField(null);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) return showToast("Geolocation not supported", "error");
        setGettingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                setGettingLoc(false);
                showToast("Location captured successfully!", "success");
            },
            (err) => {
                setGettingLoc(false);
                showToast("Access denied. Please enable GPS.", "error");
            },
            { enableHighAccuracy: true }
        );
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = "Service name is required";
        if (!form.desc.trim()) newErrors.desc = "Description is required";
        if (!form.price || Number(form.price) < 0) newErrors.price = "Valid price is required";
        if (!form.experience) newErrors.experience = "Experience is required";
        if (!form.categoryId) newErrors.categoryId = "Category is required";
        if (!form.addressLine1) newErrors.addressLine1 = "Address is required";
        if (form.workingDays.length === 0) newErrors.workingDays = "Select at least one working day";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return showToast("Please fix the errors in the form", "error");

        setLoading(true);
        try {
            const payload = {
                ...form,
                price: Number(form.price),
                experience: Number(form.experience),
                radiusKm: Number(form.radiusKm),
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                img: form.mainimg,
            };

            const res = await fetch('/api/services/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, serviceId: serviceData?.id, ...payload })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Operation failed");

            showToast(serviceData ? "Service updated!" : "Service created!", "success");
            if (onComplete) onComplete();
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (err: boolean) => `w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 transition text-sm font-medium text-slate-900 ${err ? 'border-red-500 ring-red-100' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-50'}`;
    const labelClass = "text-xs font-bold text-slate-500 uppercase block mb-2 tracking-wide";
    const ErrorMsg = ({ txt }: { txt?: string }) => txt ? <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1"><AlertCircle size={10} /> {txt}</p> : null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* --- SECTION 1: MEDIA --- */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <ImageIcon size={20} className="text-blue-600" />
                        <h3 className="text-slate-900 font-bold text-lg">Service Imagery</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* MAIN IMAGE */}
                        <div>
                            <label className={labelClass}>Main Thumbnail</label>
                            <div className="relative w-full aspect-square md:aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center overflow-hidden group cursor-pointer">
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mainimg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={uploading} />
                                {activeUploadField === 'mainimg' ? (
                                    <div className="flex flex-col items-center gap-2 text-blue-600 animate-pulse"><Loader2 className="animate-spin" size={32} /><span className="text-xs font-bold">Uploading...</span></div>
                                ) : form.mainimg ? (
                                    <><img src={form.mainimg} alt="Main" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-sm z-0 pointer-events-none">Change Image</div></>
                                ) : (
                                    <><div className="bg-white p-3 rounded-full shadow-sm mb-3"><Camera className="text-slate-400" size={24} /></div><p className="text-sm font-bold text-slate-500">Upload Thumbnail</p></>
                                )}
                            </div>
                        </div>

                        {/* COVER IMAGE */}
                        <div>
                            <label className={labelClass}>Cover Banner</label>
                            <div className="relative w-full aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center overflow-hidden group cursor-pointer">
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={uploading} />
                                {activeUploadField === 'coverImg' ? (
                                    <div className="flex flex-col items-center gap-2 text-blue-600 animate-pulse"><Loader2 className="animate-spin" size={32} /><span className="text-xs font-bold">Uploading...</span></div>
                                ) : form.coverImg ? (
                                    <><img src={form.coverImg} alt="Cover" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-sm z-0 pointer-events-none">Change Cover</div></>
                                ) : (
                                    <><div className="bg-white p-3 rounded-full shadow-sm mb-3"><UploadCloud className="text-slate-400" size={24} /></div><p className="text-sm font-bold text-slate-500">Upload Cover</p></>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SECTION 2: DETAILS --- */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4"><Briefcase size={20} className="text-blue-600" /><h3 className="text-slate-900 font-bold text-lg">Basic Details</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2"><label className={labelClass}>Service Brand Name</label><input className={inputClass(!!errors.name)} value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Joe's Quick Plumbing" /><ErrorMsg txt={errors.name} /></div>
                        <div className="col-span-2"><label className={labelClass}>Description</label><textarea className={inputClass(!!errors.desc)} value={form.desc} onChange={e => handleChange('desc', e.target.value)} rows={4} placeholder="Describe your services..." /><ErrorMsg txt={errors.desc} /></div>
                        <div><label className={labelClass}>Business Phone</label><input className={inputClass(!!errors.altPhone)} value={form.altPhone} onChange={e => handleChange('altPhone', e.target.value)} placeholder="+91 99999..." /></div>
                        <div><label className={labelClass}>Category</label><select className={inputClass(!!errors.categoryId)} value={form.categoryId} onChange={e => handleChange('categoryId', e.target.value)}><option value="">Select Category</option>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><ErrorMsg txt={errors.categoryId} /></div>
                    </div>
                </div>

                {/* --- SECTION 3: PRICING --- */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4"><BadgeIndianRupee size={20} className="text-blue-600" /><h3 className="text-slate-900 font-bold text-lg">Pricing & Experience</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div><label className={labelClass}>Price Model</label><div className="flex bg-slate-100 p-1 rounded-xl">{['FIXED', 'HOURLY'].map((type) => (<button key={type} type="button" onClick={() => handleChange('priceType', type)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${form.priceType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{type}</button>))}</div></div>
                        <div><label className={labelClass}>{form.priceType === 'HOURLY' ? 'Price Per Hour' : 'Fixed Base Price'}</label><div className="relative"><BadgeIndianRupee size={16} className="absolute left-4 top-3.5 text-slate-400" /><input type="number" className={`${inputClass(!!errors.price)} pl-10`} value={form.price} onChange={e => handleChange('price', e.target.value)} placeholder="0.00" /></div><ErrorMsg txt={errors.price} /></div>
                        <div><label className={labelClass}>Experience (Years)</label><input type="number" className={inputClass(!!errors.experience)} value={form.experience} onChange={e => handleChange('experience', e.target.value)} placeholder="e.g. 5" /><ErrorMsg txt={errors.experience} /></div>
                    </div>
                </div>

                {/* --- SECTION 4: LOCATION --- */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4"><MapPin size={20} className="text-blue-600" /><h3 className="text-slate-900 font-bold text-lg">Service Location</h3></div>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="col-span-2"><label className={labelClass}>Address Line 1</label><input className={inputClass(!!errors.addressLine1)} value={form.addressLine1} onChange={e => handleChange('addressLine1', e.target.value)} /><ErrorMsg txt={errors.addressLine1} /></div>
                        <div><label className={labelClass}>City</label><input className={inputClass(false)} value={form.city} onChange={e => handleChange('city', e.target.value)} /></div>
                        <div><label className={labelClass}>Pincode</label><input className={inputClass(false)} value={form.pincode} onChange={e => handleChange('pincode', e.target.value)} maxLength={6} /></div>
                        <div><label className={labelClass}>Radius (KM)</label><input type="number" className={inputClass(false)} value={form.radiusKm} onChange={e => handleChange('radiusKm', e.target.value)} /></div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-3 items-center"><div className="bg-white p-2.5 rounded-full shadow-sm text-blue-600"><Navigation size={20} /></div><div><h4 className="font-bold text-slate-900 text-sm">GPS Coordinates</h4><p className="text-xs text-slate-500 font-medium mt-0.5">{form.latitude !== 0 ? `${Number(form.latitude).toFixed(6)}, ${Number(form.longitude).toFixed(6)}` : "Precise location helps customers find you."}</p></div></div>
                        <button type="button" onClick={handleGetLocation} disabled={gettingLoc} className="w-full md:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-lg flex justify-center items-center gap-2 text-sm font-bold transition shadow-sm">{gettingLoc ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}{form.latitude !== 0 ? "Update GPS" : "Detect GPS"}</button>
                    </div>
                </div>

                {/* --- SECTION 5: AVAILABILITY --- */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4"><CalendarDays size={20} className="text-blue-600" /><h3 className="text-slate-900 font-bold text-lg">Availability</h3></div>
                    <div className="mb-6"><label className={labelClass}>Working Days</label><div className="flex flex-wrap gap-2">{DAYS.map((day) => { const isSelected = form.workingDays.includes(day); return (<button key={day} type="button" onClick={() => handleDayToggle(day)} className={`w-12 h-10 rounded-lg text-sm font-bold transition-all border ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>{day}</button>); })}</div><ErrorMsg txt={errors.workingDays} /></div>
                    <div className="grid grid-cols-2 gap-6">
                        <div><label className={labelClass}>Opening Time</label><div className="relative"><Clock size={16} className="absolute left-4 top-3.5 text-slate-400" /><input type="time" className={`${inputClass(false)} pl-10`} value={form.openTime} onChange={e => handleChange('openTime', e.target.value)} /></div></div>
                        <div><label className={labelClass}>Closing Time</label><div className="relative"><Clock size={16} className="absolute left-4 top-3.5 text-slate-400" /><input type="time" className={`${inputClass(false)} pl-10`} value={form.closeTime} onChange={e => handleChange('closeTime', e.target.value)} /></div></div>
                    </div>
                </div>

                {/* --- FOOTER ACTIONS --- */}
                <div className="bg-white p-6 md:p-8 rounded-2xlshadow-sm">
                    <div className="flex gap-4 w-full max-w-4xl">
                        <button type="button" onClick={onComplete} className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition">Cancel</button>
                        <button type="submit" disabled={loading || uploading} className="flex-[2] bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">{loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}{serviceData ? "Save Changes" : "Create Service"}</button>
                    </div>
                </div>
            </form>
        </div>
    );
}