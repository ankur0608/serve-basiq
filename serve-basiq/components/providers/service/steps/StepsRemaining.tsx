'use client';

import {
    ChevronRight, Loader2, Save, UploadCloud, Navigation,
    Trash2, Clock, Camera, Plus, Check, BadgeIndianRupee
} from 'lucide-react';

// Shared Styles (Duplicated for standalone capability)
const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";
const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white";

// --- STEP 2: Visuals ---
// --- STEP 2: Visuals ---
// Note: Ensure handleImageUpload and activeUploadField are passed from the useServiceForm hook to this component
export const StepTwoVisuals = ({
    form,
    setStep,
    handleChange,
    handleImageUpload, // ✅ Passed from hook
    activeUploadField, // ✅ Passed from hook
    removeGalleryImg   // ✅ Passed from hook
}: any) => {

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">

            {/* 1. Main Image */}
            <div>
                <label className={labelClass}>
                    Main Image <span className="text-red-500">*</span>
                </label>
                <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'mainimg')}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />

                    {/* Loading Overlay */}
                    {activeUploadField === 'mainimg' && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                            <span className="text-xs font-bold text-blue-600">Uploading...</span>
                        </div>
                    )}

                    {/* Content */}
                    {form.mainimg ? (
                        <>
                            <img src={form.mainimg} className="w-full h-full object-cover" alt="Main Service" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                                <p className="text-white text-xs font-bold flex items-center gap-2">
                                    <Camera size={16} /> Change Photo
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-400 group-hover:text-blue-500 transition-colors">
                            <UploadCloud className="mx-auto mb-2" size={32} />
                            <span className="text-xs font-bold uppercase tracking-wide">Click to Upload</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Cover Image */}
            <div>
                <label className={labelClass}>
                    Cover Banner (Optional)
                </label>
                <div className="relative h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'coverImg')}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {activeUploadField === 'coverImg' && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                            <Loader2 className="animate-spin text-blue-600" size={24} />
                        </div>
                    )}
                    {form.coverImg ? (
                        <img src={form.coverImg} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-500">
                            <Camera size={20} />
                            <span className="text-xs font-bold">Upload Cover</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Gallery Section - MULTI UPLOAD ENABLED */}
            <div>
                <label className={labelClass}>Gallery</label>
                <div className="grid grid-cols-4 gap-3">
                    {/* Existing Images */}
                    {form.gallery.map((img: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200 shadow-sm bg-white">
                            <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                            <button
                                type="button"
                                onClick={() => removeGalleryImg(i)}
                                className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shadow-sm z-10"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}

                    {/* Upload Button */}
                    <div className="relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            multiple // ✅ THIS ENABLES MULTIPLE SELECTION
                            onChange={(e) => handleImageUpload(e, 'gallery')}
                            disabled={activeUploadField === 'gallery'}
                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        {activeUploadField === 'gallery' ? (
                            <Loader2 className="animate-spin text-blue-500" size={20} />
                        ) : (
                            <Plus className="text-slate-400" size={24} />
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!form.mainimg}
                    className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

// --- STEP 3: Schedule ---
export const StepThreeSchedule = ({ form, handleChange, handleGetLocation, gettingLoc, toggleDay, setStep, DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }: any) => (
    <div className="space-y-5 animate-in slide-in-from-right duration-300">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
            <label className={labelClass}>Service Area</label>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold text-slate-500">Service Radius</p>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{form.radiusKm} KM</span>
                    </div>
                    <div className="relative">
                        <input
                            className={`${inputClass} pl-4`}
                            placeholder="e.g. 10"
                            type="number"
                            value={form.radiusKm}
                            onChange={e => handleChange('radiusKm', e.target.value)}
                        />
                        <span className="absolute right-4 top-3 text-slate-400 text-xs font-bold">KM</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGetLocation}
                    className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition border shadow-sm ${form.latitude ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
                >
                    {gettingLoc ? <Loader2 className="animate-spin" size={18} /> : (form.latitude ? <Check size={18} /> : <Navigation size={18} />)}
                    {form.latitude ? "GPS Location Captured" : "Use Current Location"}
                </button>
            </div>
        </div>

        <div>
            <label className={labelClass}>Working Days</label>
            <div className="flex flex-wrap gap-2">
                {DAYS.map((day: string) => {
                    const isSelected = form.workingDays.includes(day);
                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border shadow-sm ${isSelected ? 'bg-slate-900 text-white border-slate-900 transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className={labelClass}>Opens At</label>
                <div className="relative">
                    <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input type="time" className={`${inputClass} pl-9`} value={form.openTime} onChange={e => handleChange('openTime', e.target.value)} />
                </div>
            </div>
            <div>
                <label className={labelClass}>Closes At</label>
                <div className="relative">
                    <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input type="time" className={`${inputClass} pl-9`} value={form.closeTime} onChange={e => handleChange('closeTime', e.target.value)} />
                </div>
            </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
            <button type="button" onClick={() => setStep(2)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
            <button type="button" onClick={() => setStep(4)} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition">Next <ChevronRight size={18} /></button>
        </div>
    </div>
);

// --- STEP 4: Pricing ---
export const StepFourPricing = ({ form, handleChange, loading, setStep, onComplete, serviceData, listingType }: any) => {

    const PRICING_OPTIONS = listingType === 'RENTAL'
        ? ['DAILY', 'MONTHLY', 'FIXED']
        : ['FIXED', 'HOURLY'];

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pricing Model</label>
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        {PRICING_OPTIONS.map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => handleChange('priceType', t)}
                                className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${form.priceType === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>
                        {listingType === 'RENTAL'
                            ? `Rental Price (${form.priceType})`
                            : `Service Price (${form.priceType})`
                        } (INR)
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <BadgeIndianRupee size={20} />
                        </div>
                        <input
                            type="number"
                            className={`${inputClass} pl-10 text-lg font-bold text-slate-800`}
                            placeholder="0.00"
                            value={form.price}
                            onChange={e => handleChange('price', e.target.value)}
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        * This is the base price customers will see.
                    </p>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setStep(3)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {serviceData ? "Update Listing" : "Publish Listing"}
                </button>
            </div>

            <button
                type="button"
                onClick={onComplete}
                className="w-full py-3 text-xs font-bold text-slate-400 hover:text-red-500 transition mt-2 rounded-lg hover:bg-red-50"
            >
                Cancel and Exit
            </button>
        </div>
    );
};