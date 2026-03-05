'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Briefcase, ChevronRight, Loader2, Hammer, Truck, Box, ShieldCheck,
    Hourglass, Save, UploadCloud, Navigation, Trash2, Clock, Camera,
    Plus, Check, BadgeIndianRupee, PlayCircle, FileVideo, Globe, Info
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import AppImage from '@/components/ui/AppImage';

const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";
const sectionTitleClass = "text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider";
const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white";

const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|mkv)$/i);
};

export const StepOneDetails = ({
    form, handleChange, categories, loadingCats, activeSubCategories,
    setStep, listingType, onBack, handleGetLocation, gettingLoc, toggleDay
}: any) => {
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const PRICING_OPTIONS = listingType === 'RENTAL'
        ? ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']
        : ['FIXED', 'HOURLY', 'QUOTE'];

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
                            showSearch={true}
                            placeholder={loadingCats ? "Loading..." : "Select a Category..."}
                            className="bg-slate-50/50 cursor-pointer"
                            options={[
                                ...categories.map((c: any) => ({ label: c.name, value: c.id })),
                                { label: "Other (Please Specify)", value: "OTHER" }
                            ]}
                        />

                        {form.categoryId === 'OTHER' ? (
                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                <Input
                                    label={listingType === 'SERVICE' ? 'CUSTOM SERVICE TYPE' : 'CUSTOM ITEM TYPE'}
                                    placeholder="e.g. Specialized Cleaning"
                                    value={form.customCategoryName || ""}
                                    onChange={(e: any) => handleChange('customCategoryName', e.target.value)}
                                    className="bg-slate-50/50 border-blue-300 focus:border-blue-500"
                                />
                            </div>
                        ) : (
                            <Select
                                label={listingType === 'SERVICE' ? 'SUB-SERVICE' : 'SUB-ITEM TYPE'}
                                value={form.subCategoryIds[0] || ""}
                                disabled={!form.categoryId || activeSubCategories.length === 0}
                                showSearch={true}
                                placeholder={!form.categoryId ? "Select category first" : "Select specific type..."}
                                onChange={(e: any) => {
                                    const val = e.target.value;
                                    handleChange('subCategoryIds', val ? [val] : []);
                                }}
                                className={`cursor-pointer ${!form.categoryId ? 'opacity-50 bg-slate-100' : 'bg-slate-50/50'}`}
                                options={activeSubCategories.map((sub: any) => ({ label: sub.name, value: sub.id }))}
                            />
                        )}
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

                    {listingType === 'SERVICE' && (
                        <div className="mt-4 flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
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
                                    onChange={(e) => handleChange('isRemote', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    )}
                </div>
            </div>

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
                                { label: 'New', value: 'NEW' },
                                { label: 'Excellent', value: 'EXCELLENT' },
                                { label: 'Good', value: 'GOOD' },
                                { label: 'Used', value: 'USED' }
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
                        <div className="flex flex-wrap bg-white p-1 rounded-lg border border-slate-200 shadow-sm gap-1">
                            {PRICING_OPTIONS.map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => handleChange('priceType', t)}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${form.priceType === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {form.priceType !== 'QUOTE' ? (
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
                    ) : (
                        <div className="mt-4 p-4 bg-blue-50/80 border border-blue-100 rounded-xl flex items-start gap-3">
                            <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs font-medium text-blue-800 leading-relaxed">
                                Customers will need to contact you directly to get a custom price quote based on their specific needs for this service.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {!form.isRemote && (
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
                    </div>
                </div>
            )}
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
                                onChange={(e) => handleChange('is24x7', e.target.checked)}
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
                                    <label className={labelClass}>Opens At</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
                                        <input type="time" className={`${inputClass} pl-9`} value={form.openTime || ''} onChange={(e: any) => handleChange('openTime', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Closes At</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
                                        <input type="time" className={`${inputClass} pl-9`} value={form.closeTime || ''} onChange={(e: any) => handleChange('closeTime', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => setStep(2)}
                disabled={
                    !form.name ||
                    !form.categoryId ||
                    (form.categoryId === 'OTHER' && !form.customCategoryName) ||
                    (form.priceType !== 'QUOTE' && !form.price)
                }
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
                Continue to Media <ChevronRight size={18} />
            </button>
        </div>
    );
};
export const StepTwoMedia = ({
    form, setStep, handleImageUpload, uploadMultipleFiles, activeUploadField,
    removeGalleryImg, removeServiceImage, processingMsg, loading, serviceData, onComplete
}: any) => {

    const handleServiceImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const validFiles: File[] = [];
        const currentCount = form.serviceImages.length;

        for (const file of Array.from(files)) {
            if (currentCount + validFiles.length >= 5) {
                alert("Maximum 5 service angles allowed.");
                break;
            }
            if (file.type.startsWith('image/')) validFiles.push(file);
        }

        if (validFiles.length > 0) uploadMultipleFiles(validFiles, 'serviceImages');
        e.target.value = '';
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const currentVideos = form.gallery.filter(isVideo).length;
        const currentImages = form.gallery.length - currentVideos;

        let addedImages = 0;
        let addedVideos = 0;
        const validFiles: File[] = [];

        for (const file of Array.from(files)) {
            if (file.type.startsWith('image/')) {
                if (currentImages + addedImages >= 45) {
                    alert("Maximum 45 gallery images allowed.");
                    continue;
                }
                validFiles.push(file);
                addedImages++;
            } else if (file.type.startsWith('video/')) {
                if (currentVideos + addedVideos >= 5) {
                    alert("Maximum 5 gallery videos allowed.");
                    continue;
                }
                validFiles.push(file);
                addedVideos++;
            }
        }

        if (validFiles.length > 0) uploadMultipleFiles(validFiles, 'gallery');
        e.target.value = '';
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {/* 1. Main Image */}
            <div>
                <label className={labelClass}>Main Image <span className="text-red-500">*</span></label>
                <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mainimg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={!!processingMsg} />
                    {form.mainimg ? (
                        <>
                            <AppImage src={form.mainimg} alt="Main Service" type="card" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                                <p className="text-white text-xs font-bold flex items-center gap-2"><Camera size={16} /> Change Photo</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-400 group-hover:text-blue-500 transition-colors">
                            <UploadCloud className="mx-auto mb-2" size={32} />
                            <span className="text-xs font-bold uppercase tracking-wide">Click to Upload Cover</span>
                        </div>
                    )}
                    {activeUploadField === 'mainimg' && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Service Angles */}
            <div>
                <label className={labelClass}>Extra Angles (Max 5)</label>
                <div className="grid grid-cols-5 gap-2">
                    {form.serviceImages.map((url: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200">
                            <AppImage src={url} alt={`Angle ${i + 1}`} type="thumbnail" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeServiceImage(i)} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition z-10">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {form.serviceImages.length < 5 && (
                        <div className="relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer">
                            <input type="file" accept="image/*" multiple onChange={handleServiceImagesChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={!!processingMsg} />
                            {activeUploadField === 'serviceImages' ? (
                                <Loader2 className="animate-spin text-blue-400" size={20} />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <UploadCloud className="text-slate-400 mb-1" size={20} />
                                    <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">Add<br />Image</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Gallery Section */}
            <div>
                <label className={labelClass}>Gallery Media (Images: Max 45 | Videos: Max 5)</label>
                <div className="grid grid-cols-4 gap-3">
                    {form.gallery.map((url: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200 shadow-sm bg-black">
                            {isVideo(url) ? (
                                <>
                                    <video src={url} className="w-full h-full object-cover opacity-80" muted playsInline />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><PlayCircle size={24} className="text-white/90" fill="rgba(0,0,0,0.5)" /></div>
                                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-white font-bold flex items-center gap-1"><FileVideo size={10} /> VIDEO</div>
                                </>
                            ) : (
                                <AppImage src={url} alt={`Gallery ${i}`} type="thumbnail" className="w-full h-full object-cover bg-white" />
                            )}
                            <button type="button" onClick={() => removeGalleryImg(i)} className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shadow-sm z-10">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}

                    {form.gallery.length < 50 && (
                        <div className="relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer">
                            <input type="file" accept="image/*, video/mp4, video/webm" multiple onChange={handleGalleryChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={!!processingMsg} />
                            {activeUploadField === 'gallery' ? (
                                <div className="flex flex-col items-center justify-center px-1 text-center"><Loader2 className="animate-spin text-blue-500 mb-1" size={20} /><span className="text-[8px] font-bold text-blue-500 leading-tight">{processingMsg || "Uploading..."}</span></div>
                            ) : (
                                <div className="flex flex-col items-center"><Plus className="text-slate-400" size={24} /><span className="text-[10px] text-slate-400 font-bold mt-1">Add Media</span></div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                <button type="submit" disabled={!form.mainimg || !!processingMsg || loading} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {serviceData ? "Update Listing" : "Publish Listing"}
                </button>
            </div>
            <button type="button" onClick={onComplete} className="w-full py-3 text-xs font-bold text-slate-400 hover:text-red-500 transition mt-2 rounded-lg hover:bg-red-50">Cancel and Exit</button>
        </div>
    );
};