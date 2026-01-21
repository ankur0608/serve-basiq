'use client';

import { useRouter } from "next/navigation";
import { memo } from "react";
import {
    ArrowLeft, Camera, User, Mail, Phone, MapPin,
    Check, Loader2, AlertTriangle, Navigation, Briefcase // ✅ Added Briefcase Icon
} from 'lucide-react';
import { useProviderOnboarding } from "@/app/hook/useProviderOnboarding";

// --- SUB-COMPONENT 1: Profile Image ---
const ProfileSection = memo(({
    imgPreview, uploading, error, onUpload
}: {
    imgPreview: string | null, uploading: boolean, error: string, onUpload: (e: any) => void
}) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col items-center ${error ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
        <div className="relative w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition group">
            <input
                type="file"
                accept="image/*"
                onChange={onUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                disabled={uploading}
            />
            {uploading ? (
                <Loader2 className="animate-spin text-blue-500" size={32} />
            ) : imgPreview ? (
                <img src={imgPreview} className="w-full h-full object-cover" alt="Profile Preview" loading="lazy" />
            ) : (
                <Camera className="text-slate-400 group-hover:text-blue-500 transition" size={32} />
            )}
        </div>
        <p className={`text-xs font-bold uppercase mt-3 ${error ? 'text-red-600' : 'text-slate-400'}`}>
            {uploading ? "Uploading..." : (error ? "Profile Image Required" : "Upload Profile Photo")}
        </p>
    </div>
));
ProfileSection.displayName = "ProfileSection";

// --- SUB-COMPONENT 2: Personal Details (UPDATED WITH DROPDOWN) ---
const PersonalDetails = memo(({ form, errors, onChange }: { form: any, errors: any, onChange: (field: string, val: any) => void }) => {
    const getInputClass = (fieldName: string) => `w-full bg-slate-50 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[fieldName] ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`;
    const ErrorMsg = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium">{errors[field]}</p> : null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                <User className="text-blue-600" size={20} /> <span className="font-bold text-slate-900">Personal Details</span>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                    <input
                        value={form.fullName}
                        onChange={e => onChange('fullName', e.target.value)}
                        className={getInputClass('fullName')}
                        placeholder="John Doe"
                    />
                    <ErrorMsg field="fullName" />
                </div>

                {/* ✅ NEW: Provider Type Dropdown */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">What do you want to offer?</label>
                    <div className="relative">
                        <Briefcase size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <select
                            value={form.providerType || 'BOTH'} // Default to BOTH
                            onChange={e => onChange('providerType', e.target.value)}
                            className={`${getInputClass('providerType')} pl-9 cursor-pointer appearance-none`}
                        >
                            <option value="BOTH">Both Services & Products</option>
                            <option value="SERVICE">Services Only (e.g. Plumber, Cleaner)</option>
                            <option value="PRODUCT">Products Only (e.g. Selling Goods)</option>
                        </select>
                        {/* Custom Arrow for styling (optional, relies on appearance-none) */}
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => onChange('email', e.target.value)}
                            className={`${getInputClass('email')} pl-9`}
                            placeholder="john@example.com"
                        />
                    </div>
                    <ErrorMsg field="email" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Alternate Phone Number</label>
                    <div className="relative">
                        <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            value={form.altPhone}
                            onChange={e => onChange('altPhone', e.target.value)}
                            className={`${getInputClass('altPhone')} pl-9`}
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>
                    <ErrorMsg field="altPhone" />
                </div>
            </div>
        </div>
    );
});
PersonalDetails.displayName = "PersonalDetails";

// --- SUB-COMPONENT 3: Address Details ---
const AddressDetails = memo(({
    form, errors, onChange, onGetLocation, gettingLoc
}: {
    form: any, errors: any, onChange: (field: string, val: any) => void, onGetLocation: () => void, gettingLoc: boolean
}) => {
    const getInputClass = (fieldName: string) => `w-full bg-slate-50 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[fieldName] ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`;
    const ErrorMsg = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium">{errors[field]}</p> : null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                <MapPin className="text-blue-600" size={20} /> <span className="font-bold text-slate-900">Permanent Address</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address Line 1</label>
                    <input
                        value={form.addressLine1}
                        onChange={e => onChange('addressLine1', e.target.value)}
                        className={getInputClass('addressLine1')}
                        placeholder="Flat, House No, Building"
                    />
                    <ErrorMsg field="addressLine1" />
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address Line 2 (Optional)</label>
                    <input
                        value={form.addressLine2}
                        onChange={e => onChange('addressLine2', e.target.value)}
                        className={getInputClass('addressLine2')}
                        placeholder="Area, Street, Sector"
                    />
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Landmark (Optional)</label>
                    <input
                        value={form.landmark}
                        onChange={e => onChange('landmark', e.target.value)}
                        className={getInputClass('landmark')}
                        placeholder="Near City Hospital"
                    />
                    <ErrorMsg field="landmark" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">City</label>
                    <input
                        value={form.city}
                        onChange={e => onChange('city', e.target.value)}
                        className={getInputClass('city')}
                    />
                    <ErrorMsg field="city" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pincode</label>
                    <input
                        value={form.pincode}
                        onChange={e => onChange('pincode', e.target.value)}
                        className={getInputClass('pincode')}
                        maxLength={6}
                    />
                    <ErrorMsg field="pincode" />
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">State</label>
                    <input
                        value={form.state}
                        onChange={e => onChange('state', e.target.value)}
                        className={getInputClass('state')}
                    />
                    <ErrorMsg field="state" />
                </div>

                <div className="col-span-2 pt-2">
                    <button
                        type="button"
                        onClick={onGetLocation}
                        disabled={gettingLoc}
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 py-3 rounded-lg font-bold transition disabled:opacity-70"
                    >
                        {gettingLoc ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                        {form.latitude !== 0 ? "Location Captured ✓" : "Get Current Location"}
                    </button>
                    {form.latitude !== 0 && (
                        <p className="text-xs text-center text-green-600 mt-2 font-mono">
                            Lat: {form.latitude.toFixed(5)}, Lng: {form.longitude.toFixed(5)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});
AddressDetails.displayName = "AddressDetails";

// --- MAIN PAGE COMPONENT ---
export default function BecomeProPage() {
    const router = useRouter();

    // ✅ Using the Hook
    const {
        form, loading, uploading, gettingLoc, imgPreview, errors,
        handleChange, handleGetLocation, handleImageUpload, handleSubmit
    } = useProviderOnboarding();

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 animate-in fade-in duration-500">
            <div className="max-w-xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Partner Registration</h1>
                        <p className="text-slate-500 text-sm">Fill in your details to start earning.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* 1. Profile Image Section */}
                    <ProfileSection
                        imgPreview={imgPreview}
                        uploading={uploading}
                        error={errors.profileImage}
                        onUpload={handleImageUpload}
                    />

                    {/* 2. Personal Details Section */}
                    <PersonalDetails
                        form={form}
                        errors={errors}
                        onChange={handleChange}
                    />

                    {/* 3. Address & Location Section */}
                    <AddressDetails
                        form={form}
                        errors={errors}
                        onChange={handleChange}
                        onGetLocation={handleGetLocation}
                        gettingLoc={gettingLoc}
                    />

                    {/* General Error Banner */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                            <AlertTriangle size={20} className="shrink-0" />
                            <span>Please fix the highlighted errors before submitting.</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>Complete Registration <Check /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}