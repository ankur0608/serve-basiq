'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Briefcase, ChevronRight, Loader2, Phone, ChevronDown,
    Hammer, Truck, Box, ShieldCheck, Hourglass, ArrowLeft
} from 'lucide-react';
import { Category, SubCategory } from '../service-logic';

const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";
const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white";

export const StepOneBasic = ({
    form, handleChange, categories, loadingCats, activeSubCategories,
    toggleSubCategory, setStep, listingType, onBack
}: any) => {

    const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

            {/* Title & Change Type Option */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg">
                    {listingType === 'SERVICE' ? (
                        <> <Hammer size={16} className="text-blue-600" /> Regular Service </>
                    ) : (
                        <> <Truck size={16} className="text-orange-600" /> Rental Service </>
                    )}
                </div>

                {/* Only show 'Change' if we are in create mode (onBack exists) */}
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-xs font-bold text-blue-600 hover:underline"
                    >
                        Change Type
                    </button>
                )}
            </div>

            {/* Name & (Experience OR Stock) */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label className={labelClass}>
                        {listingType === 'SERVICE' ? 'Service Title' : 'Item Name'}
                    </label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            className={`${inputClass} pl-10`}
                            placeholder={listingType === 'SERVICE' ? "e.g. AC Repair" : "e.g. Generator 5KV"}
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                        />
                    </div>
                </div>

                {/* Experience vs Stock */}
                <div>
                    {listingType === 'SERVICE' ? (
                        <>
                            <label className={labelClass}>Exp (Yrs)</label>
                            <input
                                type="number"
                                className={inputClass}
                                placeholder="e.g. 5"
                                value={form.experience}
                                onChange={e => handleChange('experience', e.target.value)}
                            />
                        </>
                    ) : (
                        <>
                            <label className={labelClass}>Stock Qty</label>
                            <input
                                type="number"
                                className={inputClass}
                                placeholder="Total"
                                value={form.stock}
                                onChange={e => handleChange('stock', e.target.value)}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* --- CATEGORY DROPDOWN --- */}
            <div>
                <label className={labelClass}>
                    {listingType === 'SERVICE' ? 'Service Category' : 'Rental Category'}
                </label>
                <div className="relative">
                    <select
                        className={`${inputClass} appearance-none cursor-pointer`}
                        value={form.categoryId}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
                        disabled={loadingCats}
                    >
                        <option value="">
                            {loadingCats ? "Loading..." : "Select a Category..."}
                        </option>
                        {categories.map((c: Category) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                        {loadingCats ? <Loader2 className="animate-spin" size={16} /> : <ChevronDown size={16} />}
                    </div>
                </div>
            </div>

            {/* --- SUB-CATEGORY DROPDOWN --- */}
            <div className="relative">
                <label className={labelClass}>
                    {listingType === 'SERVICE' ? 'Sub-Service' : 'Sub-Item Type'}
                </label>
                <div className="relative">
                    <select
                        className={`${inputClass} appearance-none cursor-pointer ${!form.categoryId ? 'opacity-50 bg-slate-100' : ''}`}
                        value={form.subCategoryIds[0] || ""}
                        disabled={!form.categoryId || activeSubCategories.length === 0}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange('subCategoryIds', val ? [val] : []);
                        }}
                    >
                        <option value="">
                            {!form.categoryId
                                ? "Select a category first..."
                                : activeSubCategories.length === 0
                                    ? "No options available"
                                    : "Select a specific type..."
                            }
                        </option>
                        {activeSubCategories.map((sub: SubCategory) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                        {loadingCats ? <Loader2 className="animate-spin" size={16} /> : <ChevronDown size={16} />}
                    </div>
                </div>
            </div>

            {/* --- ✅ NEW RENTAL FIELDS --- */}
            {listingType === 'RENTAL' && (
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2">

                    {/* Row 1: Condition & Deposit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Item Condition</label>
                            <div className="relative">
                                <Box className="absolute left-3 top-3 text-slate-400" size={16} />
                                <select
                                    className={`${inputClass} pl-9 appearance-none`}
                                    value={form.itemCondition}
                                    onChange={e => handleChange('itemCondition', e.target.value)}
                                >
                                    <option value="New">New</option>
                                    <option value="Like New">Like New</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Security Deposit (₹)</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-3 text-slate-400" size={16} />
                                <input
                                    type="number"
                                    className={`${inputClass} pl-9`}
                                    placeholder="0"
                                    value={form.securityDeposit}
                                    onChange={e => handleChange('securityDeposit', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Durations */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Min Duration</label>
                            <div className="relative">
                                <Hourglass className="absolute left-3 top-3 text-slate-400" size={16} />
                                <select
                                    className={`${inputClass} pl-9 appearance-none`}
                                    value={form.minDuration}
                                    onChange={e => handleChange('minDuration', e.target.value)}
                                >
                                    <option value="1 Hour">1 Hour</option>
                                    <option value="1 Day">1 Day</option>
                                    <option value="1 Week">1 Week</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Max Duration</label>
                            <div className="relative">
                                <Hourglass className="absolute left-3 top-3 text-slate-400" size={16} />
                                <select
                                    className={`${inputClass} pl-9 appearance-none`}
                                    value={form.maxDuration}
                                    onChange={e => handleChange('maxDuration', e.target.value)}
                                >
                                    <option value="7 Days">7 Days</option>
                                    <option value="30 Days">30 Days</option>
                                    <option value="Unlimited">Unlimited</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Mode */}
                    <div>
                        <label className={labelClass}>Rental Mode</label>
                        <div className="flex gap-4 mt-2">
                            {['PICKUP', 'DELIVERY', 'BOTH'].map((mode) => (
                                <label key={mode} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.rentalMode === mode ? 'border-orange-500' : 'border-slate-300'}`}>
                                        {form.rentalMode === mode && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                                    </div>
                                    <span className={`text-xs font-bold ${form.rentalMode === mode ? 'text-orange-600' : 'text-slate-500'} group-hover:text-orange-500 capitalize`}>
                                        {mode.toLowerCase().replace('_', ' ')}
                                    </span>
                                    <input
                                        type="radio"
                                        name="rentalMode"
                                        value={mode}
                                        checked={form.rentalMode === mode}
                                        onChange={() => handleChange('rentalMode', mode)}
                                        className="hidden"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Description & Phone */}
            <div className="space-y-4 pt-2">
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        className={inputClass}
                        rows={3}
                        placeholder={listingType === 'SERVICE' ? "Describe your service..." : "Describe item features..."}
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
                disabled={!form.name || !form.categoryId}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                Next Step <ChevronRight size={18} />
            </button>
        </div>
    );
};