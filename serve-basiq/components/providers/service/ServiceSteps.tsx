// ServiceSteps.tsx
import { useState, useRef, useEffect } from 'react';
import {
    Briefcase, ChevronRight, Loader2, Save, UploadCloud, Navigation,
    Trash2, Phone, Clock, Camera, Plus, Check, ChevronDown, BadgeIndianRupee
} from 'lucide-react';
import { Category, SubCategory } from './service-logic';

const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";
const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white";

// --- STEP 1: Basic Info (Updated Dropdowns) ---
export const StepOneBasic = ({ form, handleChange, categories, loadingCats, activeSubCategories, toggleSubCategory, setStep }: any) => {

    // Local state for the custom sub-category dropdown
    const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown if clicking outside
    useEffect(() => {
        function handleClickOutside(event: any) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSubDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Name & Experience */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label className={labelClass}>Service Name</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            className={`${inputClass} pl-10`}
                            placeholder="e.g. AC Repair Expert"
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Experience (Yrs)</label>
                    <input
                        type="number"
                        className={inputClass}
                        placeholder="e.g. 5"
                        value={form.experience}
                        onChange={e => handleChange('experience', e.target.value)}
                    />
                </div>
            </div>

            {/* --- CATEGORY DROPDOWN --- */}
            <div>
                <label className={labelClass}>Service Category</label>
                <div className="relative">
                    <select
                        className={`${inputClass} appearance-none cursor-pointer`}
                        value={form.categoryId}
                        onChange={(e) => {
                            handleChange('categoryId', e.target.value);
                            setIsSubDropdownOpen(true); // Auto open sub-cats when cat changes
                        }}
                        disabled={loadingCats}
                    >
                        <option value="">Select a Category...</option>
                        {categories.map((c: Category) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                        {loadingCats ? <Loader2 className="animate-spin" size={16} /> : <ChevronDown size={16} />}
                    </div>
                </div>
            </div>

            {/* --- SUB-CATEGORY MULTI-SELECT DROPDOWN --- */}
            <div className="relative" ref={dropdownRef}>
                <label className={labelClass}>
                    Sub-Services
                    {form.subCategoryIds.length > 0 &&
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {form.subCategoryIds.length} Selected
                        </span>
                    }
                </label>

                {/* Dropdown Trigger Button */}
                <button
                    type="button"
                    onClick={() => {
                        if (form.categoryId) setIsSubDropdownOpen(!isSubDropdownOpen);
                    }}
                    disabled={!form.categoryId}
                    className={`w-full flex justify-between items-center text-left ${inputClass} ${!form.categoryId ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'cursor-pointer hover:border-blue-300'}`}
                >
                    <span className={form.subCategoryIds.length === 0 ? "text-slate-400" : "text-slate-900 font-semibold"}>
                        {!form.categoryId
                            ? "Select a category above first"
                            : form.subCategoryIds.length === 0
                                ? "Select Sub-Services..."
                                : `${form.subCategoryIds.length} services selected`
                        }
                    </span>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${isSubDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu (Absolute Positioned) */}
                {isSubDropdownOpen && form.categoryId && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-100">
                        {activeSubCategories.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">
                                No sub-services found for this category.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {activeSubCategories.map((sub: SubCategory) => {
                                    const isSelected = form.subCategoryIds.includes(sub.id);
                                    return (
                                        <div
                                            key={sub.id}
                                            onClick={() => toggleSubCategory(sub.id)}
                                            className={`cursor-pointer px-3 py-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-3 ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                {isSelected && <Check size={10} />}
                                            </div>
                                            <span>{sub.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Description & Phone */}
            <div className="space-y-4">
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        className={inputClass}
                        rows={2}
                        placeholder="Briefly describe your service..."
                        value={form.desc}
                        onChange={e => handleChange('desc', e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>Contact Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            className={`${inputClass} pl-10`}
                            placeholder="Public Phone Number"
                            value={form.altPhone}
                            onChange={e => handleChange('altPhone', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!form.categoryId || form.subCategoryIds.length === 0}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next Step <ChevronRight size={18} />
            </button>
        </div>
    );
};

// --- STEP 2: Visuals ---
export const StepTwoVisuals = ({ form, handleImageUpload, activeUploadField, removeGalleryImg, setStep }: any) => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div>
            <label className={labelClass}>Main Thumbnail</label>
            <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-300 transition-colors">
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mainimg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {form.mainimg ? <img src={form.mainimg} className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><UploadCloud className="mx-auto mb-2" size={24} /><span className="text-xs font-bold">Click to Upload</span></div>}
                {activeUploadField === 'mainimg' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
            </div>
        </div>
        <div>
            <label className={labelClass}>Cover Banner</label>
            <div className="relative h-24 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center">
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {form.coverImg ? <img src={form.coverImg} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" />}
                {activeUploadField === 'coverImg' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
            </div>
        </div>
        <div>
            <label className={labelClass}>Work Gallery</label>
            <div className="grid grid-cols-4 gap-2">
                {form.gallery.map((img: string, i: number) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeGalleryImg(i)} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition"><Trash2 size={10} /></button>
                    </div>
                ))}
                <div className="relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-blue-300 transition-colors cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'gallery')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {activeUploadField === 'gallery' ? <Loader2 className="animate-spin text-blue-400" size={16} /> : <Plus className="text-slate-400" size={20} />}
                </div>
            </div>
        </div>
        <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl">Back</button>
            <button type="button" onClick={() => setStep(3)} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">Next <ChevronRight size={18} /></button>
        </div>
    </div>
);

// --- STEP 3: Range & Schedule ---
export const StepThreeSchedule = ({ form, handleChange, handleGetLocation, gettingLoc, toggleDay, setStep, DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }: any) => (
    <div className="space-y-5 animate-in slide-in-from-right duration-300">
        {/* Radius & GPS */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <label className={labelClass}>Service Operation</label>
            <div className="space-y-4">
                <div>
                    <p className="text-xs text-slate-500 mb-1">Service Radius</p>
                    <div className="relative">
                        <input className={`${inputClass} pl-4`} placeholder="e.g. 10" type="number" value={form.radiusKm} onChange={e => handleChange('radiusKm', e.target.value)} />
                        <span className="absolute right-4 top-3 text-slate-400 text-sm font-bold">KM</span>
                    </div>
                </div>
                <button type="button" onClick={handleGetLocation} className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition border ${form.latitude ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                    {gettingLoc ? <Loader2 className="animate-spin" /> : <Navigation size={18} />}
                    {form.latitude ? "GPS Location Captured" : "Capture GPS Location"}
                </button>
            </div>
        </div>

        {/* Working Days */}
        <div>
            <label className={labelClass}>Working Days</label>
            <div className="flex flex-wrap gap-2">
                {DAYS.map((day: string) => (
                    <button key={day} type="button" onClick={() => toggleDay(day)} className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border ${form.workingDays.includes(day) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                        {day}
                    </button>
                ))}
            </div>
        </div>

        {/* Time */}
        <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Opens At</label><div className="relative"><Clock className="absolute left-3 top-3 text-slate-400" size={16} /><input type="time" className={`${inputClass} pl-9`} value={form.openTime} onChange={e => handleChange('openTime', e.target.value)} /></div></div>
            <div><label className={labelClass}>Closes At</label><div className="relative"><Clock className="absolute left-3 top-3 text-slate-400" size={16} /><input type="time" className={`${inputClass} pl-9`} value={form.closeTime} onChange={e => handleChange('closeTime', e.target.value)} /></div></div>
        </div>
        <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(2)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl">Back</button>
            <button type="button" onClick={() => setStep(4)} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">Next <ChevronRight size={18} /></button>
        </div>
    </div>
);

// --- STEP 4: Pricing ---
export const StepFourPricing = ({ form, handleChange, loading, setStep, onComplete, serviceData }: any) => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase">Pricing Model</label>
                <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                    {['FIXED', 'HOURLY'].map(t => (
                        <button key={t} type="button" onClick={() => handleChange('priceType', t)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${form.priceType === t ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>{t}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className={labelClass}>Base Price</label>
                <div className="relative">
                    <BadgeIndianRupee className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input type="number" className={`${inputClass} pl-10`} value={form.price} onChange={e => handleChange('price', e.target.value)} />
                </div>
            </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setStep(3)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl">Back</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {serviceData ? "Save Changes" : "Create Service"}
            </button>
        </div>
        <button type="button" onClick={onComplete} className="w-full text-xs font-bold text-slate-400 hover:text-red-500 transition mt-2">Cancel and Exit</button>
    </div>
);