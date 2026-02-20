// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import {
//     Briefcase, ChevronRight, Loader2, ChevronDown,
//     Hammer, Truck, Box, ShieldCheck, Hourglass, Save, UploadCloud, Navigation,
//     Trash2, Clock, Camera, Plus, Check, BadgeIndianRupee, XCircle
// } from 'lucide-react';
// import { Category, SubCategory } from '../service-logic';
// import { useImageUpload } from "@/app/hook/useImageUpload"; // ✅ Import the new hook

// const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";
// const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white";

// // --- STEP 1: Basic Info (UNCHANGED) ---
// export const StepOneBasic = ({
//     form, handleChange, categories, loadingCats, activeSubCategories,
//     toggleSubCategory, setStep, listingType, onBack
// }: any) => {

//     const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         function handleClickOutside(event: any) {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setIsSubDropdownOpen(false);
//             }
//         }
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, [dropdownRef]);

//     return (
//         <div className="space-y-6 animate-in slide-in-from-right duration-300">

//             {/* Title & Change Type Option */}
//             <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-2 text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg">
//                     {listingType === 'SERVICE' ? (
//                         <> <Hammer size={16} className="text-blue-600" /> Regular Service </>
//                     ) : (
//                         <> <Truck size={16} className="text-orange-600" /> Rental Service </>
//                     )}
//                 </div>

//                 {onBack && (
//                     <button
//                         type="button"
//                         onClick={onBack}
//                         className="text-xs font-bold text-blue-600 hover:underline"
//                     >
//                         Change Type
//                     </button>
//                 )}
//             </div>

//             {/* Name & (Experience OR Stock) */}
//             <div className="grid grid-cols-3 gap-4">
//                 <div className="col-span-2">
//                     <label className={labelClass}>
//                         {listingType === 'SERVICE' ? 'Service Title' : 'Item Name'}
//                     </label>
//                     <div className="relative">
//                         <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
//                         <input
//                             className={`${inputClass} pl-10`}
//                             placeholder={listingType === 'SERVICE' ? "e.g. AC Repair" : "e.g. Generator 5KV"}
//                             value={form.name}
//                             onChange={e => handleChange('name', e.target.value)}
//                         />
//                     </div>
//                 </div>

//                 {/* Experience vs Stock */}
//                 <div>
//                     {listingType === 'SERVICE' ? (
//                         <>
//                             <label className={labelClass}>Exp (Yrs)</label>
//                             <input
//                                 type="number"
//                                 className={inputClass}
//                                 placeholder="e.g. 5"
//                                 value={form.experience}
//                                 onChange={e => handleChange('experience', e.target.value)}
//                             />
//                         </>
//                     ) : (
//                         <>
//                             <label className={labelClass}>Stock Qty</label>
//                             <input
//                                 type="number"
//                                 className={inputClass}
//                                 placeholder="Total"
//                                 value={form.stock}
//                                 onChange={e => handleChange('stock', e.target.value)}
//                             />
//                         </>
//                     )}
//                 </div>
//             </div>

//             {/* --- CATEGORY DROPDOWN --- */}
//             <div>
//                 <label className={labelClass}>
//                     {listingType === 'SERVICE' ? 'Service Category' : 'Rental Category'}
//                 </label>
//                 <div className="relative">
//                     <select
//                         className={`${inputClass} appearance-none cursor-pointer`}
//                         value={form.categoryId}
//                         onChange={(e) => handleChange('categoryId', e.target.value)}
//                         disabled={loadingCats}
//                     >
//                         <option value="">
//                             {loadingCats ? "Loading..." : "Select a Category..."}
//                         </option>
//                         {categories.map((c: Category) => (
//                             <option key={c.id} value={c.id}>{c.name}</option>
//                         ))}
//                     </select>
//                     <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
//                         {loadingCats ? <Loader2 className="animate-spin" size={16} /> : <ChevronDown size={16} />}
//                     </div>
//                 </div>
//             </div>

//             {/* --- SUB-CATEGORY DROPDOWN --- */}
//             <div className="relative">
//                 <label className={labelClass}>
//                     {listingType === 'SERVICE' ? 'Sub-Service' : 'Sub-Item Type'}
//                 </label>
//                 <div className="relative">
//                     <select
//                         className={`${inputClass} appearance-none cursor-pointer ${!form.categoryId ? 'opacity-50 bg-slate-100' : ''}`}
//                         value={form.subCategoryIds[0] || ""}
//                         disabled={!form.categoryId || activeSubCategories.length === 0}
//                         onChange={(e) => {
//                             const val = e.target.value;
//                             handleChange('subCategoryIds', val ? [val] : []);
//                         }}
//                     >
//                         <option value="">
//                             {!form.categoryId
//                                 ? "Select a category first..."
//                                 : activeSubCategories.length === 0
//                                     ? "No options available"
//                                     : "Select a specific type..."
//                             }
//                         </option>
//                         {activeSubCategories.map((sub: SubCategory) => (
//                             <option key={sub.id} value={sub.id}>
//                                 {sub.name}
//                             </option>
//                         ))}
//                     </select>
//                     <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
//                         {loadingCats ? <Loader2 className="animate-spin" size={16} /> : <ChevronDown size={16} />}
//                     </div>
//                 </div>
//             </div>

//             {/* --- RENTAL FIELDS --- */}
//             {listingType === 'RENTAL' && (
//                 <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2">

//                     {/* Row 1: Condition & Deposit */}
//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <label className={labelClass}>Item Condition</label>
//                             <div className="relative">
//                                 <Box className="absolute left-3 top-3 text-slate-400" size={16} />
//                                 <select
//                                     className={`${inputClass} pl-9 appearance-none`}
//                                     value={form.itemCondition}
//                                     onChange={e => handleChange('itemCondition', e.target.value)}
//                                 >
//                                     <option value="New">New</option>
//                                     <option value="Like New">Like New</option>
//                                     <option value="Good">Good</option>
//                                     <option value="Fair">Fair</option>
//                                 </select>
//                             </div>
//                         </div>
//                         <div>
//                             <label className={labelClass}>Security Deposit (₹)</label>
//                             <div className="relative">
//                                 <ShieldCheck className="absolute left-3 top-3 text-slate-400" size={16} />
//                                 <input
//                                     type="number"
//                                     className={`${inputClass} pl-9`}
//                                     placeholder="0"
//                                     value={form.securityDeposit}
//                                     onChange={e => handleChange('securityDeposit', e.target.value)}
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Row 2: Min Duration Only */}
//                     <div>
//                         <label className={labelClass}>Min Rental Duration</label>
//                         <div className="relative">
//                             <Hourglass className="absolute left-3 top-3 text-slate-400" size={16} />
//                             <select
//                                 className={`${inputClass} pl-9 appearance-none`}
//                                 value={form.minDuration}
//                                 onChange={e => handleChange('minDuration', e.target.value)}
//                             >
//                                 <option value="1 Hour">1 Hour</option>
//                                 <option value="1 Day">1 Day</option>
//                                 <option value="1 Week">1 Week</option>
//                             </select>
//                         </div>
//                     </div>

//                     {/* Row 3: Mode */}
//                     <div>
//                         <label className={labelClass}>Rental Mode</label>
//                         <div className="flex gap-4 mt-2">
//                             {['PICKUP', 'DELIVERY', 'BOTH'].map((mode) => (
//                                 <label key={mode} className="flex items-center gap-2 cursor-pointer group">
//                                     <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.rentalMode === mode ? 'border-orange-500' : 'border-slate-300'}`}>
//                                         {form.rentalMode === mode && <div className="w-2 h-2 rounded-full bg-orange-500" />}
//                                     </div>
//                                     <span className={`text-xs font-bold ${form.rentalMode === mode ? 'text-orange-600' : 'text-slate-500'} group-hover:text-orange-500 capitalize`}>
//                                         {mode.toLowerCase().replace('_', ' ')}
//                                     </span>
//                                     <input
//                                         type="radio"
//                                         name="rentalMode"
//                                         value={mode}
//                                         checked={form.rentalMode === mode}
//                                         onChange={() => handleChange('rentalMode', mode)}
//                                         className="hidden"
//                                     />
//                                 </label>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Description Only */}
//             <div className="pt-2">
//                 <div>
//                     <label className={labelClass}>Description</label>
//                     <textarea
//                         className={inputClass}
//                         rows={3}
//                         placeholder={listingType === 'SERVICE' ? "Describe your service..." : "Describe item features..."}
//                         value={form.desc}
//                         onChange={e => handleChange('desc', e.target.value)}
//                     />
//                 </div>
//             </div>

//             <button
//                 type="button"
//                 onClick={() => setStep(2)}
//                 disabled={!form.name || !form.categoryId}
//                 className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
//             >
//                 Next Step <ChevronRight size={18} />
//             </button>
//         </div>
//     );
// };

// // --- HELPER COMPONENT FOR IMAGE UPLOAD ---
// const SingleImageUploader = ({
//     label,
//     image,
//     onChange,
//     aspect = "video", // 'video' | 'banner'
//     required = false
// }: {
//     label: string,
//     image: string,
//     onChange: (key: string) => void,
//     aspect?: string,
//     required?: boolean
// }) => {

//     // ✅ Use the hook internally for this specific field
//     const { isUploading, handleImageUpload, uploadError } = useImageUpload({
//         onUploadSuccess: (key, url) => onChange(url) // Update parent form with new URL
//     });

//     const heightClass = aspect === 'banner' ? 'h-32' : 'aspect-video';

//     return (
//         <div>
//             <label className={labelClass}>
//                 {label} {required && <span className="text-red-500">*</span>}
//             </label>
//             <div className={`relative ${heightClass} rounded-xl bg-slate-50 border-2 border-dashed ${uploadError ? 'border-red-400 bg-red-50' : 'border-slate-300'} overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer`}>

//                 {/* File Input */}
//                 <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     disabled={isUploading}
//                     className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
//                 />

//                 {/* Loading State */}
//                 {isUploading && (
//                     <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
//                         <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
//                         <span className="text-xs font-bold text-blue-600">Uploading...</span>
//                     </div>
//                 )}

//                 {/* Preview or Placeholder */}
//                 {image ? (
//                     <>
//                         <img src={image} className="w-full h-full object-cover" alt="Uploaded content" />
//                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
//                             <p className="text-white text-xs font-bold flex items-center gap-2">
//                                 <Camera size={16} /> Change Photo
//                             </p>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="text-center text-slate-400 group-hover:text-blue-500 transition-colors">
//                         <UploadCloud className="mx-auto mb-2" size={32} />
//                         <span className="text-xs font-bold uppercase tracking-wide">
//                             {uploadError ? "Upload Failed" : "Click to Upload"}
//                         </span>
//                         {uploadError && <p className="text-[10px] text-red-500 mt-1">{uploadError}</p>}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// // --- STEP 2: Visuals ---
// // Note: Ensure handleImageUpload and activeUploadField are passed from the useServiceForm hook to this component
// export const StepTwoVisuals = ({
//     form,
//     setStep,
//     handleChange,
//     handleImageUpload, // ✅ Passed from hook
//     activeUploadField, // ✅ Passed from hook
//     removeGalleryImg   // ✅ Passed from hook
// }: any) => {

//     return (
//         <div className="space-y-6 animate-in slide-in-from-right duration-300">

//             {/* 1. Main Image */}
//             <div>
//                 <label className={labelClass}>
//                     Main Image <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
//                     <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => handleImageUpload(e, 'mainimg')}
//                         className="absolute inset-0 opacity-0 cursor-pointer z-10"
//                     />

//                     {/* Loading Overlay */}
//                     {activeUploadField === 'mainimg' && (
//                         <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
//                             <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
//                             <span className="text-xs font-bold text-blue-600">Uploading...</span>
//                         </div>
//                     )}

//                     {/* Content */}
//                     {form.mainimg ? (
//                         <>
//                             <img src={form.mainimg} className="w-full h-full object-cover" alt="Main Service" />
//                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
//                                 <p className="text-white text-xs font-bold flex items-center gap-2">
//                                     <Camera size={16} /> Change Photo
//                                 </p>
//                             </div>
//                         </>
//                     ) : (
//                         <div className="text-center text-slate-400 group-hover:text-blue-500 transition-colors">
//                             <UploadCloud className="mx-auto mb-2" size={32} />
//                             <span className="text-xs font-bold uppercase tracking-wide">Click to Upload</span>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* 2. Cover Image */}
//             <div>
//                 <label className={labelClass}>
//                     Cover Banner (Optional)
//                 </label>
//                 <div className="relative h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
//                     <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => handleImageUpload(e, 'coverImg')}
//                         className="absolute inset-0 opacity-0 cursor-pointer z-10"
//                     />
//                     {activeUploadField === 'coverImg' && (
//                         <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
//                             <Loader2 className="animate-spin text-blue-600" size={24} />
//                         </div>
//                     )}
//                     {form.coverImg ? (
//                         <img src={form.coverImg} className="w-full h-full object-cover" alt="Cover" />
//                     ) : (
//                         <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-500">
//                             <Camera size={20} />
//                             <span className="text-xs font-bold">Upload Cover</span>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* 3. Gallery Section - MULTI UPLOAD ENABLED */}
//             <div>
//                 <label className={labelClass}>Gallery</label>
//                 <div className="grid grid-cols-4 gap-3">
//                     {/* Existing Images */}
//                     {form.gallery.map((img: string, i: number) => (
//                         <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200 shadow-sm bg-white">
//                             <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
//                             <button
//                                 type="button"
//                                 onClick={() => removeGalleryImg(i)}
//                                 className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shadow-sm z-10"
//                             >
//                                 <Trash2 size={12} />
//                             </button>
//                         </div>
//                     ))}

//                     {/* Upload Button */}
//                     <div className="relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
//                         <input
//                             type="file"
//                             accept="image/*"
//                             multiple // ✅ THIS ENABLES MULTIPLE SELECTION
//                             onChange={(e) => handleImageUpload(e, 'gallery')}
//                             disabled={activeUploadField === 'gallery'}
//                             className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
//                         />
//                         {activeUploadField === 'gallery' ? (
//                             <Loader2 className="animate-spin text-blue-500" size={20} />
//                         ) : (
//                             <Plus className="text-slate-400" size={24} />
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Navigation Buttons */}
//             <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
//                 <button
//                     type="button"
//                     onClick={() => setStep(1)}
//                     className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
//                 >
//                     Back
//                 </button>
//                 <button
//                     type="button"
//                     onClick={() => setStep(3)}
//                     disabled={!form.mainimg}
//                     className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                     Next <ChevronRight size={18} />
//                 </button>
//             </div>
//         </div>
//     );
// };

// // --- STEP 3: Schedule (UNCHANGED) ---
// export const StepThreeSchedule = ({ form, handleChange, handleGetLocation, gettingLoc, toggleDay, setStep, DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }: any) => (
//     <div className="space-y-5 animate-in slide-in-from-right duration-300">
//         <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
//             <label className={labelClass}>Service Area</label>
//             <div className="space-y-4">
//                 <div>
//                     <div className="flex justify-between items-center mb-1">
//                         <p className="text-xs font-bold text-slate-500">Service Radius</p>
//                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{form.radiusKm} KM</span>
//                     </div>
//                     <div className="relative">
//                         <input
//                             className={`${inputClass} pl-4`}
//                             placeholder="e.g. 10"
//                             type="number"
//                             value={form.radiusKm}
//                             onChange={e => handleChange('radiusKm', e.target.value)}
//                         />
//                         <span className="absolute right-4 top-3 text-slate-400 text-xs font-bold">KM</span>
//                     </div>
//                 </div>

//                 <button
//                     type="button"
//                     onClick={handleGetLocation}
//                     className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition border shadow-sm ${form.latitude ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
//                 >
//                     {gettingLoc ? <Loader2 className="animate-spin" size={18} /> : (form.latitude ? <Check size={18} /> : <Navigation size={18} />)}
//                     {form.latitude ? "GPS Location Captured" : "Use Current Location"}
//                 </button>
//             </div>
//         </div>

//         <div>
//             <label className={labelClass}>Working Days</label>
//             <div className="flex flex-wrap gap-2">
//                 {DAYS.map((day: string) => {
//                     const isSelected = form.workingDays.includes(day);
//                     return (
//                         <button
//                             key={day}
//                             type="button"
//                             onClick={() => toggleDay(day)}
//                             className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border shadow-sm ${isSelected ? 'bg-slate-900 text-white border-slate-900 transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
//                         >
//                             {day}
//                         </button>
//                     );
//                 })}
//             </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//             <div>
//                 <label className={labelClass}>Opens At</label>
//                 <div className="relative">
//                     <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
//                     <input type="time" className={`${inputClass} pl-9`} value={form.openTime} onChange={e => handleChange('openTime', e.target.value)} />
//                 </div>
//             </div>
//             <div>
//                 <label className={labelClass}>Closes At</label>
//                 <div className="relative">
//                     <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
//                     <input type="time" className={`${inputClass} pl-9`} value={form.closeTime} onChange={e => handleChange('closeTime', e.target.value)} />
//                 </div>
//             </div>
//         </div>

//         <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
//             <button type="button" onClick={() => setStep(2)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
//             <button type="button" onClick={() => setStep(4)} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition">Next <ChevronRight size={18} /></button>
//         </div>
//     </div>
// );

// // --- STEP 4: Pricing (UNCHANGED) ---
// export const StepFourPricing = ({ form, handleChange, loading, setStep, onComplete, serviceData, listingType }: any) => {

//     const PRICING_OPTIONS = listingType === 'RENTAL'
//         ? ['DAILY', 'MONTHLY', 'FIXED']
//         : ['FIXED', 'HOURLY'];

//     return (
//         <div className="space-y-6 animate-in slide-in-from-right duration-300">
//             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
//                 <div className="flex justify-between items-center mb-6">
//                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pricing Model</label>
//                     <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
//                         {PRICING_OPTIONS.map(t => (
//                             <button
//                                 key={t}
//                                 type="button"
//                                 onClick={() => handleChange('priceType', t)}
//                                 className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${form.priceType === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
//                             >
//                                 {t}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 <div>
//                     <label className={labelClass}>
//                         {listingType === 'RENTAL'
//                             ? `Rental Price (${form.priceType})`
//                             : `Service Price (${form.priceType})`
//                         } (INR)
//                     </label>
//                     <div className="relative group">
//                         <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
//                             <BadgeIndianRupee size={20} />
//                         </div>
//                         <input
//                             type="number"
//                             className={`${inputClass} pl-10 text-lg font-bold text-slate-800`}
//                             placeholder="0.00"
//                             value={form.price}
//                             onChange={e => handleChange('price', e.target.value)}
//                         />
//                     </div>
//                     <p className="text-[10px] text-slate-400 mt-2 font-medium">
//                         * This is the base price customers will see.
//                     </p>
//                 </div>
//             </div>

//             <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
//                 <button type="button" onClick={() => setStep(3)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
//                 <button
//                     type="submit"
//                     disabled={loading}
//                     className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
//                 >
//                     {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
//                     {serviceData ? "Update Listing" : "Publish Listing"}
//                 </button>
//             </div>

//             <button
//                 type="button"
//                 onClick={onComplete}
//                 className="w-full py-3 text-xs font-bold text-slate-400 hover:text-red-500 transition mt-2 rounded-lg hover:bg-red-50"
//             >
//                 Cancel and Exit
//             </button>
//         </div>
//     );
// };
'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Briefcase, ChevronRight, Loader2, Hammer, Truck, Box, ShieldCheck,
    Hourglass, Save, UploadCloud, Navigation, Trash2, Clock, Camera,
    Plus, Check, BadgeIndianRupee, PlayCircle, FileVideo
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";
const sectionTitleClass = "text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider";
const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white";

const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|mkv)$/i);
};

// ==========================================
// STEP 1: Details, Schedule & Pricing
// ==========================================
export const StepOneDetails = ({
    form, handleChange, categories, loadingCats, activeSubCategories,
    setStep, listingType, onBack, handleGetLocation, gettingLoc, toggleDay
}: any) => {
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const PRICING_OPTIONS = listingType === 'RENTAL' ? ['DAILY', 'MONTHLY', 'FIXED'] : ['FIXED', 'HOURLY'];

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
            {/* Header / Change Type Option */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg">
                    {listingType === 'SERVICE' ? (
                        <> <Hammer size={16} className="text-blue-600" /> Regular Service </>
                    ) : (
                        <> <Truck size={16} className="text-orange-600" /> Rental Service </>
                    )}
                </div>
                {onBack && (
                    <button type="button" onClick={onBack} className="text-xs font-bold text-blue-600 hover:underline">
                        Change Type
                    </button>
                )}
            </div>

            {/* --- SECTION: BASIC INFO --- */}
            <div>
                <h3 className={sectionTitleClass}>Basic Information</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <Input
                                label={listingType === 'SERVICE' ? 'SERVICE TITLE' : 'ITEM NAME'}
                                icon={<Briefcase size={18} className="text-slate-400" />}
                                placeholder={listingType === 'SERVICE' ? "e.g. AC Repair" : "e.g. Generator 5KV"}
                                value={form.name}
                                onChange={(e: any) => handleChange('name', e.target.value)}
                                className="bg-slate-50/50"
                            />
                        </div>
                        <div>
                            {listingType === 'SERVICE' ? (
                                <Input
                                    label="EXP (YRS)"
                                    type="number"
                                    placeholder="e.g. 5"
                                    value={form.experience}
                                    onChange={(e: any) => handleChange('experience', e.target.value)}
                                    className="bg-slate-50/50"
                                />
                            ) : (
                                <Input
                                    label="STOCK QTY"
                                    type="number"
                                    placeholder="Total"
                                    value={form.stock}
                                    onChange={(e: any) => handleChange('stock', e.target.value)}
                                    className="bg-slate-50/50"
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label={listingType === 'SERVICE' ? 'SERVICE CATEGORY' : 'RENTAL CATEGORY'}
                            value={form.categoryId}
                            onChange={(e: any) => handleChange('categoryId', e.target.value)}
                            disabled={loadingCats}
                            className="bg-slate-50/50 cursor-pointer"
                            options={[
                                { label: loadingCats ? "Loading..." : "Select a Category...", value: "" },
                                ...categories.map((c: any) => ({ label: c.name, value: c.id }))
                            ]}
                        />
                        <Select
                            label={listingType === 'SERVICE' ? 'SUB-SERVICE' : 'SUB-ITEM TYPE'}
                            value={form.subCategoryIds[0] || ""}
                            disabled={!form.categoryId || activeSubCategories.length === 0}
                            onChange={(e: any) => {
                                const val = e.target.value;
                                handleChange('subCategoryIds', val ? [val] : []);
                            }}
                            className={`cursor-pointer ${!form.categoryId ? 'opacity-50 bg-slate-100' : 'bg-slate-50/50'}`}
                            options={[
                                {
                                    label: !form.categoryId ? "Select a category first..." : activeSubCategories.length === 0 ? "No options available" : "Select a specific type...",
                                    value: ""
                                },
                                ...activeSubCategories.map((sub: any) => ({ label: sub.name, value: sub.id }))
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1 uppercase">Description</label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white resize-none"
                            rows={3}
                            placeholder={listingType === 'SERVICE' ? "Describe your service..." : "Describe item features..."}
                            value={form.desc}
                            onChange={(e: any) => handleChange('desc', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* --- SECTION: RENTAL SPECIFICS (Only if Rental) --- */}
            {listingType === 'RENTAL' && (
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-4">
                    <h3 className="text-sm font-extrabold text-orange-800 mb-2 uppercase tracking-wider">Rental Specifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="ITEM CONDITION"
                            icon={<Box size={16} className="text-slate-400" />}
                            value={form.itemCondition}
                            onChange={(e: any) => handleChange('itemCondition', e.target.value)}
                            className="bg-white/50 cursor-pointer"
                            options={[
                                { label: 'New', value: 'New' }, { label: 'Like New', value: 'Like New' },
                                { label: 'Good', value: 'Good' }, { label: 'Fair', value: 'Fair' }
                            ]}
                        />
                        <Input
                            label="SECURITY DEPOSIT (₹)"
                            icon={<ShieldCheck size={16} className="text-slate-400" />}
                            type="number"
                            placeholder="0"
                            value={form.securityDeposit}
                            onChange={(e: any) => handleChange('securityDeposit', e.target.value)}
                            className="bg-white/50"
                        />
                    </div>
                    <div>
                        <Select
                            label="MIN RENTAL DURATION"
                            icon={<Hourglass size={16} className="text-slate-400" />}
                            value={form.minDuration}
                            onChange={(e: any) => handleChange('minDuration', e.target.value)}
                            className="bg-white/50 cursor-pointer"
                            options={['1 Hour', '1 Day', '1 Week']}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">RENTAL MODE</label>
                        <div className="flex gap-4 mt-2">
                            {['PICKUP', 'DELIVERY', 'BOTH'].map((mode) => (
                                <label key={mode} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.rentalMode === mode ? 'border-orange-500' : 'border-slate-300'}`}>
                                        {form.rentalMode === mode && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                                    </div>
                                    <span className={`text-xs font-bold ${form.rentalMode === mode ? 'text-orange-600' : 'text-slate-500'} group-hover:text-orange-500 capitalize`}>
                                        {mode.toLowerCase().replace('_', ' ')}
                                    </span>
                                    <input type="radio" name="rentalMode" value={mode} checked={form.rentalMode === mode} onChange={() => handleChange('rentalMode', mode)} className="hidden" />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- SECTION: PRICING --- */}
            <div>
                <h3 className={sectionTitleClass}>Pricing</h3>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Pricing Model</label>
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
                    <div className="relative group">
                        <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <BadgeIndianRupee size={20} />
                        </div>
                        <input
                            type="number"
                            className={`${inputClass} pl-10 text-lg font-bold text-slate-800`}
                            placeholder="0.00"
                            value={form.price}
                            onChange={(e: any) => handleChange('price', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* --- SECTION: SCHEDULE & LOCATION --- */}
            <div>
                <h3 className={sectionTitleClass}>Availability & Location</h3>
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="SERVICE RADIUS (KM)"
                                type="number"
                                placeholder="e.g. 10"
                                value={form.radiusKm}
                                onChange={(e: any) => handleChange('radiusKm', e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                className={`w-full py-3 h-[46px] rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition border shadow-sm ${form.latitude ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                            >
                                {gettingLoc ? <Loader2 className="animate-spin" size={18} /> : (form.latitude ? <Check size={18} /> : <Navigation size={18} />)}
                                {form.latitude ? "GPS Captured" : "Get Location"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Working Days</label>
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
                                <input type="time" className={`${inputClass} pl-9`} value={form.openTime} onChange={(e: any) => handleChange('openTime', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Closes At</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
                                <input type="time" className={`${inputClass} pl-9`} value={form.closeTime} onChange={(e: any) => handleChange('closeTime', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!form.name || !form.categoryId || !form.price}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                Continue to Media <ChevronRight size={18} />
            </button>
        </div>
    );
};

// ==========================================
// STEP 2: Media & Visuals (Images & Video)
// ==========================================
export const StepTwoMedia = ({
    form, setStep, handleImageUpload, activeUploadField, removeGalleryImg,
    processingMsg, loading, serviceData, onComplete
}: any) => {

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* 1. Main Image */}
            <div>
                <label className={labelClass}>
                    Main Image <span className="text-red-500">*</span>
                </label>
                <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mainimg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={!!processingMsg} />

                    {form.mainimg ? (
                        <>
                            <img src={form.mainimg} className="w-full h-full object-cover" alt="Main Service" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                                <p className="text-white text-xs font-bold flex items-center gap-2"><Camera size={16} /> Change Photo</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-400 group-hover:text-blue-500 transition-colors">
                            <UploadCloud className="mx-auto mb-2" size={32} />
                            <span className="text-xs font-bold uppercase tracking-wide">Click to Upload</span>
                        </div>
                    )}

                    {activeUploadField === 'mainimg' && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                            <span className="text-xs font-bold text-blue-600 animate-pulse">{processingMsg || "Uploading..."}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Cover Image */}
            <div>
                <label className={labelClass}>Cover Banner (Optional)</label>
                <div className="relative h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={!!processingMsg} />
                    {activeUploadField === 'coverImg' && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
                    )}
                    {form.coverImg ? (
                        <img src={form.coverImg} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-500">
                            <Camera size={20} /> <span className="text-xs font-bold">Upload Cover</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Gallery Section */}
            <div>
                <label className={labelClass}>Gallery (Images & Video)</label>
                <div className="grid grid-cols-4 gap-3">
                    {form.gallery.map((url: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200 shadow-sm bg-black">
                            {isVideo(url) ? (
                                <>
                                    <video src={url} className="w-full h-full object-cover opacity-80" muted playsInline />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <PlayCircle size={24} className="text-white/90" fill="rgba(0,0,0,0.5)" />
                                    </div>
                                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-white font-bold flex items-center gap-1">
                                        <FileVideo size={10} /> VIDEO
                                    </div>
                                </>
                            ) : (
                                <img src={url} className="w-full h-full object-cover bg-white" alt={`Gallery ${i}`} />
                            )}
                            <button type="button" onClick={() => removeGalleryImg(i)} className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shadow-sm z-10">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}

                    <div className="relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                        <input type="file" accept="image/*, video/mp4, video/webm" multiple onChange={(e) => handleImageUpload(e, 'gallery')} disabled={!!processingMsg} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                        {activeUploadField === 'gallery' ? (
                            <div className="flex flex-col items-center justify-center px-1 text-center">
                                <Loader2 className="animate-spin text-blue-500 mb-1" size={20} />
                                <span className="text-[8px] font-bold text-blue-500 leading-tight">{processingMsg || "Uploading..."}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Plus className="text-slate-400" size={24} />
                                <span className="text-[10px] text-slate-400 font-bold mt-1">Add Media</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Final Submission Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">
                    Back
                </button>
                <button
                    type="submit"
                    disabled={!form.mainimg || !!processingMsg || loading}
                    className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {serviceData ? "Update Listing" : "Publish Listing"}
                </button>
            </div>
            <button type="button" onClick={onComplete} className="w-full py-3 text-xs font-bold text-slate-400 hover:text-red-500 transition mt-2 rounded-lg hover:bg-red-50">
                Cancel and Exit
            </button>
        </div>
    );
};