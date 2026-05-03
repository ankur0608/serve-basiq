'use client';

import { useState } from 'react';
import {
    Briefcase, ChevronRight, Loader2, Hammer, Truck, Box, ShieldCheck,
    Hourglass, Navigation, Clock, Camera, Check, BadgeIndianRupee, Globe, Info, Trash2
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import AppImage from '@/components/ui/AppImage';
import RentalSlotManager from '@/components/Rental/RentalSlotManager';

const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";
const sectionTitleClass = "text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider";
const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white";

const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|mkv)$/i);
};

export const StepOneDetails = ({
    form, handleChange, categories, loadingCats, activeSubCategories,
    setStep, listingType, onBack, handleGetLocation, gettingLoc, toggleDay, serviceId
}: any) => {
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const [errors, setErrors] = useState<Record<string, string>>({});

    const PRICING_OPTIONS = ['FIXED', 'HOURLY', 'QUOTE']; // SERVICE only; RENTAL uses Per dropdown

    const onFieldChange = (field: string, value: any) => {
        handleChange(field, value);
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleNextStep = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name) {
            newErrors.name = listingType === 'SERVICE' ? "Please enter a service title." : "Please enter an item name.";
        }
        if (!form.categoryId) {
            newErrors.categoryId = "Please select a category.";
        }

        const isOtherCategory = form.categoryId === 'OTHER';
        const isOtherSubCategory = form.subCategoryIds?.[0] === 'OTHER';

        if ((isOtherCategory || isOtherSubCategory) && !form.customCategoryName) {
            newErrors.customCategoryName = "Please specify your custom category.";
        }

        if (form.priceType !== 'QUOTE' && (!form.price || form.price <= 0)) {
            newErrors.price = "Please enter a valid price.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setStep(2);
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
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

            {/* ── BASIC INFO ── */}
            <div>
                <h3 className={sectionTitleClass}>Basic Information</h3>
                <div className="space-y-4">
                    {/* Name + Stock/Experience */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <Input
                                label={listingType === 'SERVICE' ? 'SERVICE TITLE' : 'ITEM TITLE'}
                                icon={<Briefcase size={18} className="text-slate-400" />}
                                placeholder={listingType === 'SERVICE' ? "e.g. AC Repair" : "e.g. LED Screen 10×6 ft"}
                                value={form.name}
                                onChange={(e: any) => onFieldChange('name', e.target.value)}
                                className={`bg-slate-50/50 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.name}</p>}
                        </div>
                        <div>
                            {listingType === 'SERVICE' ? (
                                <Input
                                    label="EXP (YRS)"
                                    type="number"
                                    placeholder="e.g. 5"
                                    value={form.experience}
                                    onChange={(e: any) => onFieldChange('experience', e.target.value)}
                                    className="bg-slate-50/50"
                                />
                            ) : (
                                <Input
                                    label="STOCK QTY"
                                    type="number"
                                    placeholder="Total"
                                    value={form.stock}
                                    onChange={(e: any) => onFieldChange('stock', e.target.value)}
                                    className="bg-slate-50/50"
                                />
                            )}
                        </div>
                    </div>

                    {/* Category + Sub-category — same 2-col layout for both types */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Select
                                label={listingType === 'SERVICE' ? 'SERVICE CATEGORY' : 'RENTAL CATEGORY'}
                                value={form.categoryId}
                                onChange={(e: any) => onFieldChange('categoryId', e.target.value)}
                                disabled={loadingCats}
                                showSearch={true}
                                placeholder={loadingCats ? "Loading..." : "Select a Category..."}
                                className={`bg-slate-50/50 cursor-pointer ${errors.categoryId ? 'border-red-500' : ''}`}
                                options={[
                                    ...categories.map((c: any) => ({ label: c.name, value: c.id })),
                                    { label: "Other (Please Specify)", value: "OTHER" }
                                ]}
                            />
                            {errors.categoryId && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.categoryId}</p>}
                        </div>

                        {form.categoryId === 'OTHER' ? (
                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                <Input
                                    label={listingType === 'SERVICE' ? 'CUSTOM SERVICE TYPE' : 'CUSTOM ITEM TYPE'}
                                    placeholder="e.g. Specialized Cleaning"
                                    value={form.customCategoryName || ""}
                                    onChange={(e: any) => onFieldChange('customCategoryName', e.target.value)}
                                    className={`bg-slate-50/50 ${errors.customCategoryName ? 'border-red-500 focus:border-red-500' : 'border-blue-300 focus:border-blue-500'}`}
                                />
                                {errors.customCategoryName && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.customCategoryName}</p>}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Select
                                    label={listingType === 'SERVICE' ? 'SUB-SERVICE' : 'SUB-ITEM TYPE'}
                                    value={form.subCategoryIds?.[0] || ""}
                                    disabled={!form.categoryId || activeSubCategories?.length === 0}
                                    showSearch={true}
                                    placeholder={!form.categoryId ? "Select category first" : "Select specific type..."}
                                    onChange={(e: any) => {
                                        const val = e.target.value;
                                        onFieldChange('subCategoryIds', val ? [val] : []);
                                    }}
                                    className={`cursor-pointer ${!form.categoryId ? 'opacity-50 bg-slate-100' : 'bg-slate-50/50'}`}
                                    options={[
                                        ...activeSubCategories?.map((sub: any) => ({ label: sub.name, value: sub.id })) || [],
                                        { label: "Other (Please Specify)", value: "OTHER" }
                                    ]}
                                />
                                {form.subCategoryIds?.[0] === 'OTHER' && (
                                    <div className="animate-in fade-in zoom-in-95 duration-200">
                                        <Input
                                            label={listingType === 'SERVICE' ? 'CUSTOM SUB-SERVICE' : 'CUSTOM SUB-ITEM'}
                                            placeholder="e.g. Specialized Cleaning"
                                            value={form.customCategoryName || ""}
                                            onChange={(e: any) => onFieldChange('customCategoryName', e.target.value)}
                                            className={`bg-slate-50/50 ${errors.customCategoryName ? 'border-red-500 focus:border-red-500' : 'border-blue-300 focus:border-blue-500'}`}
                                        />
                                        {errors.customCategoryName && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.customCategoryName}</p>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1 uppercase">Description</label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white resize-none"
                            rows={3}
                            placeholder={listingType === 'SERVICE' ? "Describe your service..." : "Specs, dimensions, what's included, delivery info..."}
                            value={form.desc}
                            onChange={(e: any) => onFieldChange('desc', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ── RENTAL SPECIFICATIONS ── */}
            {listingType === 'RENTAL' && (
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-4">
                    <h3 className="text-sm font-extrabold text-orange-800 mb-2 uppercase tracking-wider">Pricing & Duration</h3>

                    {/* Base price + Per unit — combined input row */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">BASE PRICE</label>
                        <div className={`flex items-stretch border rounded-xl overflow-hidden bg-white/80 focus-within:ring-2 focus-within:ring-orange-400 ${errors.price ? 'border-red-400' : 'border-slate-200'}`}>
                            <div className="flex items-center px-3 text-slate-400 border-r border-slate-200 bg-white/60 shrink-0">
                                <BadgeIndianRupee size={18} />
                            </div>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={form.price}
                                onChange={(e: any) => onFieldChange('price', e.target.value)}
                                className="flex-1 px-3 py-3 text-sm font-bold text-slate-800 bg-transparent outline-none min-w-0"
                            />
                            <select
                                value={form.priceType}
                                onChange={(e) => onFieldChange('priceType', e.target.value)}
                                className="px-3 py-3 text-xs font-bold bg-orange-50 border-l border-orange-200 text-orange-700 outline-none cursor-pointer shrink-0"
                            >
                                <option value="HOURLY">Per Hour</option>
                                <option value="SLOT">Per Slot</option>
                                <option value="DAILY">Per Day</option>
                                <option value="WEEKLY">Per Week</option>
                                <option value="MONTHLY">Per Month</option>
                                <option value="FIXED">Fixed Price</option>
                                <option value="QUOTE">Custom Quote</option>
                            </select>
                        </div>
                        {errors.price && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.price}</p>}
                    </div>

                    {/* Min + Max duration + Advance notice */}
                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="MIN DURATION (DAYS)"
                            icon={<Hourglass size={16} className="text-slate-400" />}
                            type="number"
                            placeholder="1"
                            min="1"
                            value={form.minDuration}
                            onChange={(e: any) => onFieldChange('minDuration', e.target.value)}
                            className="bg-white/50"
                        />
                        <Input
                            label="MAX DURATION (DAYS)"
                            type="number"
                            placeholder="No limit"
                            min="1"
                            value={form.maxDuration}
                            onChange={(e: any) => onFieldChange('maxDuration', e.target.value)}
                            className="bg-white/50"
                        />
                        <Input
                            label="ADVANCE NOTICE (DAYS)"
                            type="number"
                            placeholder="0"
                            min="0"
                            value={form.advanceNotice}
                            onChange={(e: any) => onFieldChange('advanceNotice', e.target.value)}
                            className="bg-white/50"
                        />
                    </div>

                    {/* Rental mode */}
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
                                    <input type="radio" name="rentalMode" value={mode} checked={form.rentalMode === mode} onChange={() => onFieldChange('rentalMode', mode)} className="hidden" />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Availability toggle */}
                    <div className="flex items-center justify-between bg-white/60 border border-orange-100 rounded-xl px-4 py-3">
                        <div>
                            <p className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">Availability</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                {form.isAvailable ? 'Renters can request this item.' : 'Hidden from new booking requests.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onFieldChange('isAvailable', !form.isAvailable)}
                            aria-label="Toggle availability"
                            className={`relative w-11 h-6 rounded-full transition-colors ${form.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Working Days */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Working Days</label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map((day: string) => {
                                const isSelected = form.workingDays?.includes(day);
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border shadow-sm ${isSelected ? 'bg-orange-500 text-white border-orange-500 scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Slot manager */}
                    <div className="bg-white/60 border border-orange-100 rounded-xl p-4">
                        <RentalSlotManager
                            value={form.slots || []}
                            onChange={(slots) => onFieldChange('slots', slots)}
                            workingDays={form.workingDays || []}
                            rentalId={serviceId || undefined}
                        />
                    </div>
                </div>
            )}

            {/* ── PRICING (SERVICE only — RENTAL has pricing inside the orange box) ── */}
            {listingType === 'SERVICE' && <div>
                <h3 className={sectionTitleClass}>Pricing</h3>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Pricing Model</label>
                        <div className="flex flex-wrap bg-white p-1 rounded-lg border border-slate-200 shadow-sm gap-1">
                            {PRICING_OPTIONS.map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => onFieldChange('priceType', t)}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${form.priceType === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {form.priceType !== 'QUOTE' ? (
                        <div>
                            <div className="relative group">
                                <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <BadgeIndianRupee size={20} />
                                </div>
                                <input
                                    type="number"
                                    className={`${inputClass} pl-10 text-lg font-bold text-slate-800 ${errors.price ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="0.00"
                                    value={form.price}
                                    onChange={(e: any) => onFieldChange('price', e.target.value)}
                                />
                            </div>
                            {errors.price && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.price}</p>}
                        </div>
                    ) : (
                        <div className="mt-4 p-4 bg-blue-50/80 border border-blue-100 rounded-xl flex items-start gap-3">
                            <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs font-medium text-blue-800 leading-relaxed">
                                Customers will need to contact you directly to get a custom price quote based on their specific needs for this service.
                            </p>
                        </div>
                    )}
                </div>
            </div>}

            {/* ── AVAILABILITY & LOCATION (SERVICE only) ── */}
            {listingType === 'SERVICE' && <div>
                <h3 className={sectionTitleClass}>Availability & Location</h3>

                {listingType === 'SERVICE' && (
                    <div className="mt-4 flex items-center justify-between bg-blue-50/50 p-4 mb-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                            <Globe size={20} className="text-blue-500" />
                            <div>
                                <h4 className="text-xs font-bold text-blue-900 uppercase">Remote / Online Service</h4>
                                <p className="text-[10px] text-blue-600/80 mt-0.5">I provide this service globally or remotely.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={form.isRemote || false}
                                onChange={(e) => onFieldChange('isRemote', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                )}

                {/* Radius + GPS — only for SERVICE */}
                {listingType === 'SERVICE' && !form.isRemote && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="SERVICE RADIUS (KM)"
                                    type="number"
                                    placeholder="e.g. 10"
                                    value={form.radiusKm}
                                    onChange={(e: any) => onFieldChange('radiusKm', e.target.value)}
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
                    </div>
                )}
            </div>}

            {/* 24x7 + Working Days — SERVICE only */}
            {listingType === 'SERVICE' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 uppercase">24x7 Availability</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">I am available all day, every day.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={form.is24x7 || false}
                                onChange={(e) => onFieldChange('is24x7', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {!form.is24x7 && (
                        <div className="space-y-4 pt-4 border-t border-slate-200 mt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Working Days</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map((day: string) => {
                                        const isSelected = form.workingDays?.includes(day);
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
                                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1 uppercase">Opens At</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
                                        <input type="time" className={`${inputClass} pl-9`} value={form.openTime || ''} onChange={(e: any) => onFieldChange('openTime', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1 uppercase">Closes At</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
                                        <input type="time" className={`${inputClass} pl-9`} value={form.closeTime || ''} onChange={(e: any) => onFieldChange('closeTime', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition mt-6 shadow-lg"
            >
                Continue to Media <ChevronRight size={18} />
            </button>
        </div>
    );
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export const StepTwoMedia = ({
    form, setStep, handleImageUpload, uploadMultipleFiles, activeUploadField,
    removeGalleryImg, removeServiceImage, processingMsg, loading, serviceData, onComplete
}: any) => {

    const [errors, setErrors] = useState<{ main?: string; angles?: string; gallery?: string }>({});

    const labelClass = "block text-sm font-bold text-slate-700 mb-2";

    const isVideo = (url: string) => url?.match(/\.(mp4|webm|ogg)$/i);

    const handleMainChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMAGE_SIZE) {
            setErrors(prev => ({ ...prev, main: "Image exceeds 5MB limit. Please select a smaller file." }));
            e.target.value = '';
            return;
        }

        setErrors(prev => ({ ...prev, main: undefined }));
        handleImageUpload(e, 'mainimg');
        e.target.value = '';
    };

    const handleServiceImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        let hasSizeError = false;
        setErrors(prev => ({ ...prev, angles: undefined }));

        const validFiles: File[] = [];
        const currentImages = (form.serviceImages || []).filter((u: string) => !isVideo(u)).length;
        const currentVideos = (form.serviceImages || []).filter((u: string) => isVideo(u)).length;
        let addedImages = 0;
        let addedVideos = 0;

        for (const file of Array.from(files)) {
            if (file.type.startsWith('image/')) {
                if (file.size > MAX_IMAGE_SIZE) { hasSizeError = true; continue; }
                if (currentImages + addedImages >= 25) continue;
                validFiles.push(file);
                addedImages++;
            } else if (file.type.startsWith('video/')) {
                if (file.size > MAX_VIDEO_SIZE) { hasSizeError = true; continue; }
                if (currentVideos + addedVideos >= 5) continue;
                validFiles.push(file);
                addedVideos++;
            }
        }

        if (hasSizeError) {
            setErrors(prev => ({ ...prev, angles: "Some files skipped — max 5MB per image, 50MB per video." }));
        }

        if (validFiles.length > 0) uploadMultipleFiles(validFiles, 'serviceImages');
        e.target.value = '';
    };

    const handleSaveValidation = (e: React.MouseEvent<HTMLButtonElement>) => {
        const newErrors: { main?: string; angles?: string; gallery?: string } = {};
        let hasError = false;

        if (!form.mainimg) {
            newErrors.main = "Main image is required.";
            hasError = true;
        }
        if (!form.serviceImages || form.serviceImages.length === 0) {
            newErrors.angles = "Please add at least one extra angle.";
            hasError = true;
        }

        if (hasError) {
            e.preventDefault();
            setErrors(newErrors);
        } else {
            setErrors({});
        }
    };

    const isSubmitDisabled = !!processingMsg || loading;

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* Main Image */}
            <div>
                <label className={labelClass}>Main Image (Max 5MB) <span className="text-red-500">*</span></label>
                <div className={`relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed overflow-hidden flex flex-col items-center justify-center group transition-all cursor-pointer ${errors.main ? 'border-red-400' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/30'}`}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainChangeWrapper}
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        disabled={!!processingMsg}
                    />
                    {form.mainimg ? (
                        <>
                            <AppImage src={form.mainimg} alt="Main Service" type="card" className="w-full h-full absolute inset-0" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
                                <p className="text-white text-xs font-bold flex items-center gap-2">Change Photo</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-400 group-hover:text-blue-500 transition-colors pointer-events-none">
                            <span className="text-xs font-bold uppercase tracking-wide">Click to Upload Cover</span>
                        </div>
                    )}
                </div>
                {errors.main && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.main}</p>}
            </div>

            {/* Detail Images */}
            <div>
                <label className={labelClass}>Detail images (Max 25 images + 5 videos | 5MB / 50MB each) <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-5 gap-2">
                    {(form.serviceImages || []).map((url: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200 bg-black">
                            {isVideo(url) ? (
                                <>
                                    <video src={url} className="w-full h-full object-cover opacity-80" muted playsInline />
                                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-white font-bold pointer-events-none">VIDEO</div>
                                </>
                            ) : (
                                <AppImage src={url} alt={`Image ${i + 1}`} type="thumbnail" className="w-full h-full absolute inset-0" />
                            )}
                            <button type="button" onClick={() => removeServiceImage(i)} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition z-30">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {(() => {
                        const imgCount = (form.serviceImages || []).filter((u: string) => !isVideo(u)).length;
                        const vidCount = (form.serviceImages || []).filter((u: string) => isVideo(u)).length;
                        return (imgCount < 25 || vidCount < 5) && (
                            <div className={`relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer ${errors.angles ? 'border-red-400' : 'border-slate-300 hover:border-blue-500'}`}>
                                <input type="file" accept="image/*, video/mp4, video/webm" multiple onChange={handleServiceImagesChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" disabled={!!processingMsg} />
                                {activeUploadField === 'serviceImages' ? (
                                    <span className="text-xs text-blue-400">Loading...</span>
                                ) : (
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">Add<br />Media</span>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
                {errors.angles && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.angles}</p>}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                <button
                    type="submit"
                    onClick={handleSaveValidation}
                    disabled={isSubmitDisabled}
                    className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                    {serviceData ? "Update Listing" : "Publish Listing"}
                </button>
            </div>
            <button type="button" onClick={onComplete} className="w-full py-3 text-xs font-bold text-slate-400 hover:text-red-500 transition mt-2 rounded-lg hover:bg-red-50">Cancel and Exit</button>
        </div>
    );
};
