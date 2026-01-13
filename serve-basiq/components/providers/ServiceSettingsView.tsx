'use client';

import { useState } from 'react';
import {
    MapPin, Save, Navigation, Loader2,
    Briefcase, BadgeIndianRupee, ImageIcon, Camera, UploadCloud,
    Instagram, Facebook, Youtube, Globe, Plus, Trash2,
    CalendarDays, Clock, Phone, MonitorPlay
} from 'lucide-react';

// --- HELPER: Upload to Backend ---
async function uploadToBackend(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();

    if (data.url) return data.url;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    return urlEndpoint ? `${urlEndpoint.replace(/\/$/, "")}/${data.key}` : "";
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
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<string | null>(null);
    const [gettingLoc, setGettingLoc] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const [form, setForm] = useState({
        // Basic Info
        name: serviceData?.name || userData?.name || '',
        desc: serviceData?.desc || '',
        experience: serviceData?.experience || '',
        categoryId: serviceData?.categoryId || '',
        subCategoryIds: serviceData?.subCategoryIds || [],
        altPhone: serviceData?.altPhone || userData?.phone || '',

        // Media
        mainimg: serviceData?.mainimg || serviceData?.serviceimg || '', // Map schema 'serviceimg' here
        coverImg: serviceData?.coverImg || '',
        gallery: serviceData?.gallery || [],

        // Pricing
        priceType: serviceData?.priceType || 'FIXED',
        price: serviceData?.price || '',

        // Address & Location
        addressLine1: serviceData?.addressLine1 || userAddress?.line1 || '',
        addressLine2: serviceData?.addressLine2 || userAddress?.line2 || '',
        city: serviceData?.city || userAddress?.city || '',
        state: serviceData?.state || userAddress?.state || '',
        pincode: serviceData?.pincode || userAddress?.pincode || '',
        latitude: serviceData?.latitude ? Number(serviceData.latitude) : 0,
        longitude: serviceData?.longitude ? Number(serviceData.longitude) : 0,
        radiusKm: serviceData?.radiusKm || 10,

        // Availability (New Fields)
        workingDays: serviceData?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        openTime: serviceData?.openTime || '09:00',
        closeTime: serviceData?.closeTime || '18:00',

        // Socials (Complete)
        instagramUrl: serviceData?.instagramUrl || '',
        facebookUrl: serviceData?.facebookUrl || '',
        youtubeUrl: serviceData?.youtubeUrl || '',
        websiteUrl: serviceData?.websiteUrl || '',
    });

    const CATEGORIES = [
        { id: 'cleaning', name: 'Cleaning' }, { id: 'repair', name: 'Repair' },
        { id: 'plumbing', name: 'Plumbing' }, { id: 'electrical', name: 'Electrical' },
        { id: 'beauty', name: 'Beauty & Salon' }, { id: 'painting', name: 'Painting' },
    ];

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    };

    // Toggle working days
    const toggleDay = (day: string) => {
        setForm(prev => {
            const days = prev.workingDays.includes(day)
                ? prev.workingDays.filter((d: string) => d !== day)
                : [...prev.workingDays, day];
            return { ...prev, workingDays: days };
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setActiveUploadField(field);
            const url = await uploadToBackend(file);

            if (field === 'gallery') {
                handleChange('gallery', [...form.gallery, url]);
            } else {
                handleChange(field, url);
            }
            showToast("Image uploaded!", "success");
        } catch (err: any) {
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
            setActiveUploadField(null);
        }
    };

    const removeGalleryImg = (index: number) => {
        const newGallery = [...form.gallery];
        newGallery.splice(index, 1);
        handleChange('gallery', newGallery);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) return showToast("Geolocation not supported", "error");
        setGettingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                setGettingLoc(false);
                showToast("GPS Captured!", "success");
            },
            () => {
                setGettingLoc(false);
                showToast("GPS Denied", "error");
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                price: Number(form.price),
                experience: Number(form.experience),
                radiusKm: Number(form.radiusKm),
                // IMPORTANT: Map mainimg back to serviceimg for Prisma
                serviceimg: form.mainimg,
            };

            const res = await fetch('/api/services/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, serviceId: serviceData?.id, ...payload })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Failed to save");

            showToast("Service Saved Successfully!", "success");
            onComplete();
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (err: boolean) => `w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 transition text-sm font-medium ${err ? 'border-red-500 ring-red-100' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-50'}`;
    const labelClass = "text-xs font-bold text-slate-500 uppercase block mb-2 tracking-wide";

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4">
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* --- 1. MEDIA SECTION --- */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6"><ImageIcon className="text-blue-600" size={20} /><h3 className="font-bold text-lg">Visuals</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Main Service Image</label>
                            <div className="relative aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group">
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mainimg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {form.mainimg ? <img src={form.mainimg} className="w-full h-full object-cover" /> : <UploadCloud className="text-slate-300" size={32} />}
                                {activeUploadField === 'mainimg' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Cover Banner</label>
                            <div className="relative aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center">
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {form.coverImg ? <img src={form.coverImg} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" size={32} />}
                                {activeUploadField === 'coverImg' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
                            </div>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="mt-6">
                        <label className={labelClass}>Work Gallery</label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {form.gallery.map((img: string, i: number) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeGalleryImg(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition"><Trash2 size={12} /></button>
                                </div>
                            ))}
                            <div className="relative aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center hover:bg-blue-50 transition cursor-pointer">
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'gallery')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                {activeUploadField === 'gallery' ? <Loader2 className="animate-spin text-blue-400" /> : <Plus className="text-slate-400" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 2. BASIC INFO --- */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4"><Briefcase className="text-blue-600" size={20} /><h3 className="font-bold text-lg">Service Details</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Display Name</label>
                            <input className={inputClass(false)} value={form.name} onChange={e => handleChange('name', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Description</label>
                            <textarea className={inputClass(false)} rows={3} value={form.desc} onChange={e => handleChange('desc', e.target.value)} />
                        </div>

                        <div>
                            <label className={labelClass}>Category</label>
                            <select className={inputClass(false)} value={form.categoryId} onChange={e => handleChange('categoryId', e.target.value)}>
                                <option value="">Select Category</option>
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Years Experience</label>
                            <input type="number" className={inputClass(false)} value={form.experience} onChange={e => handleChange('experience', e.target.value)} />
                        </div>

                        <div>
                            <label className={labelClass}>Phone (Public)</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input className={`${inputClass(false)} pl-10`} value={form.altPhone} onChange={e => handleChange('altPhone', e.target.value)} placeholder="Contact Number" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. AVAILABILITY (New) --- */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b pb-4"><CalendarDays className="text-blue-600" size={20} /><h3 className="font-bold text-lg">Availability</h3></div>

                    <div className="mb-6">
                        <label className={labelClass}>Working Days</label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${form.workingDays.includes(day)
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Opening Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input type="time" className={`${inputClass(false)} pl-10`} value={form.openTime} onChange={e => handleChange('openTime', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Closing Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input type="time" className={`${inputClass(false)} pl-10`} value={form.closeTime} onChange={e => handleChange('closeTime', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 4. PRICING & SOCIALS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pricing */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4"><BadgeIndianRupee className="text-blue-600" size={20} /><h3 className="font-bold">Pricing Strategy</h3></div>
                        <div className="space-y-4">
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['FIXED', 'HOURLY'].map(t => (
                                    <button key={t} type="button" onClick={() => handleChange('priceType', t)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${form.priceType === t ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>{t}</button>
                                ))}
                            </div>
                            <input type="number" className={inputClass(false)} placeholder="Amount (₹)" value={form.price} onChange={e => handleChange('price', e.target.value)} />
                        </div>
                    </div>

                    {/* Socials */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4"><Globe className="text-blue-600" size={20} /><h3 className="font-bold">Online Presence</h3></div>
                        <div className="space-y-3">
                            <div className="relative"><Instagram className="absolute left-3 top-3 text-pink-500" size={16} /><input className={`${inputClass(false)} pl-10 h-10`} placeholder="Instagram URL" value={form.instagramUrl} onChange={e => handleChange('instagramUrl', e.target.value)} /></div>
                            <div className="relative"><Facebook className="absolute left-3 top-3 text-blue-600" size={16} /><input className={`${inputClass(false)} pl-10 h-10`} placeholder="Facebook URL" value={form.facebookUrl} onChange={e => handleChange('facebookUrl', e.target.value)} /></div>
                            <div className="relative"><MonitorPlay className="absolute left-3 top-3 text-red-600" size={16} /><input className={`${inputClass(false)} pl-10 h-10`} placeholder="YouTube Channel" value={form.youtubeUrl} onChange={e => handleChange('youtubeUrl', e.target.value)} /></div>
                            <div className="relative"><Globe className="absolute left-3 top-3 text-slate-500" size={16} /><input className={`${inputClass(false)} pl-10 h-10`} placeholder="Website Link" value={form.websiteUrl} onChange={e => handleChange('websiteUrl', e.target.value)} /></div>
                        </div>
                    </div>
                </div>

                {/* --- 5. LOCATION & GPS --- */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6"><MapPin className="text-blue-600" size={20} /><h3 className="font-bold text-lg">Service Area</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <input className={inputClass(false)} placeholder="Street / Area" value={form.addressLine1} onChange={e => handleChange('addressLine1', e.target.value)} />
                        <input className={inputClass(false)} placeholder="Locality / Landmark" value={form.addressLine2} onChange={e => handleChange('addressLine2', e.target.value)} />
                        <input className={inputClass(false)} placeholder="City" value={form.city} onChange={e => handleChange('city', e.target.value)} />
                        <input className={inputClass(false)} placeholder="State" value={form.state} onChange={e => handleChange('state', e.target.value)} />
                        <input className={inputClass(false)} placeholder="Pincode" value={form.pincode} onChange={e => handleChange('pincode', e.target.value)} />
                        <div className="relative">
                            <input className={inputClass(false)} placeholder="Service Radius (KM)" type="number" value={form.radiusKm} onChange={e => handleChange('radiusKm', e.target.value)} />
                            <span className="absolute right-4 top-3 text-slate-400 text-sm font-bold">KM</span>
                        </div>
                    </div>
                    <button type="button" onClick={handleGetLocation} className="w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center gap-2 font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition">
                        {gettingLoc ? <Loader2 className="animate-spin" /> : <Navigation size={18} />}
                        {form.latitude ? `GPS Captured: ${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}` : "Capture Precise GPS Location"}
                    </button>
                </div>

                {/* --- FOOTER ACTION --- */}
                <div className="flex gap-4 sticky bottom-6 z-20">
                    <button type="button" onClick={onComplete} className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {serviceData ? "Save Changes" : "Create Service"}
                    </button>
                </div>
            </form>
        </div>
    );
}