'use client';

import { useRouter } from "next/navigation";
import { memo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, Camera, User, Mail, MapPin,
    Check, Loader2, AlertTriangle, Navigation, Briefcase,
    ShieldCheck, Smartphone, Pencil
} from 'lucide-react';
import { useProviderOnboarding } from "@/app/hook/useProviderOnboarding";
import AppImage from "@/components/ui/AppImage";
import MobileVerificationModal from "@/components/auth/MobileVerificationModal";

// --- INTERFACES ---
interface ProfileSectionProps {
    imgPreview: string | null;
    uploading: boolean;
    error?: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface PersonalDetailsProps {
    form: any;
    errors: Record<string, string>;
    onChange: (field: string, value: any) => void;
    session: any;
    onVerifyStart: () => void;
}

interface AddressDetailsProps {
    form: any;
    errors: Record<string, string>;
    onChange: (field: string, value: any) => void;
    onGetLocation: () => void;
    gettingLoc: boolean;
}

// --- SUB-COMPONENT 1: Profile Image (Unchanged) ---
const ProfileSection = memo(({ imgPreview, uploading, error, onUpload }: ProfileSectionProps) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col items-center transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
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
                <AppImage
                    src={imgPreview}
                    alt="Profile Preview"
                    type="avatar"
                    className="w-full h-full object-cover"
                />
            ) : (
                <Camera className="text-slate-400 group-hover:text-blue-500 transition" size={32} />
            )}
        </div>
        <p className={`text-xs font-bold uppercase mt-3 ${error ? 'text-red-600' : 'text-slate-400'}`}>
            {uploading ? "Compressing & Uploading..." : (error || "Upload Profile Photo")}
        </p>
    </div>
));
ProfileSection.displayName = "ProfileSection";

// --- SUB-COMPONENT 2: Personal Details (UPDATED) ---
const PersonalDetails = memo(({ form, errors, onChange, session, onVerifyStart }: PersonalDetailsProps) => {
    const [isEditingPhone, setIsEditingPhone] = useState(false);

    const getInputClass = (fieldName: string) => `w-full bg-slate-50 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[fieldName] ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`;
    const ErrorMsg = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium">{errors[field]}</p> : null;

    // Logic: It is verified ONLY if session says so AND the form value matches the session value
    const sessionPhone = session?.user?.phone;
    const currentFormPhone = form.altPhone; // Using altPhone as the form field name

    // Check if the number currently in the box matches the verified number in the database
    const isCurrentNumberVerified = session?.user?.isPhoneVerified && (currentFormPhone === sessionPhone);

    // Show input if: Not verified OR user explicitly clicked edit
    const showInput = !isCurrentNumberVerified || isEditingPhone;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow digits only
        const val = e.target.value.replace(/\D/g, '');
        onChange('altPhone', val);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                <User className="text-blue-600" size={20} /> <span className="font-bold text-slate-900">Personal Details</span>
            </div>
            <div className="space-y-4">
                {/* Full Name */}
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

                {/* Provider Type */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">What do you want to offer?</label>
                    <div className="relative">
                        <Briefcase size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <select
                            value={form.providerType || 'BOTH'}
                            onChange={e => onChange('providerType', e.target.value)}
                            className={`${getInputClass('providerType')} pl-9 cursor-pointer appearance-none`}
                        >
                            <option value="BOTH">Both Services & Products</option>
                            <option value="SERVICE">Services Only (e.g. Plumber, Cleaner)</option>
                            <option value="PRODUCT">Products Only (e.g. Selling Goods)</option>
                        </select>
                    </div>
                </div>

                {/* Email (Read-Only) */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => onChange('email', e.target.value)}
                            className={`${getInputClass('email')} pl-9 ${session?.user?.email ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`}
                            placeholder="john@example.com"
                            readOnly={!!session?.user?.email}
                        />
                    </div>
                    <ErrorMsg field="email" />
                </div>

                {/* Phone Verification (UPDATED LOGIC) */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Primary Phone Number</label>

                    {!showInput ? (
                        // ✅ VIEW MODE: Verified & Locked
                        <div className="w-full bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-1.5 rounded-full text-green-600">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-green-600 font-bold uppercase">Verified Number</p>
                                    <p className="text-slate-900 font-bold tracking-wider">
                                        +91 {currentFormPhone}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditingPhone(true)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-white p-2 rounded-full transition"
                                title="Change Phone Number"
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                    ) : (
                        // ✏️ EDIT MODE: Input Field
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Smartphone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    value={form.altPhone || ''}
                                    onChange={handlePhoneChange}
                                    placeholder="Enter 10-digit number"
                                    maxLength={10}
                                    className={`${getInputClass('altPhone')} pl-9`}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={onVerifyStart}
                                className="bg-slate-900 text-white text-xs font-bold px-4 rounded-lg hover:bg-black transition whitespace-nowrap shadow-sm hover:shadow-md"
                            >
                                Verify Now
                            </button>
                        </div>
                    )}

                    {!isCurrentNumberVerified && (
                        <p className="text-xs text-orange-500 mt-1.5 font-medium flex items-center gap-1">
                            <AlertTriangle size={12} /> Mobile verification is required.
                        </p>
                    )}

                    {/* Show simple message if editing a previously verified number */}
                    {isEditingPhone && sessionPhone === currentFormPhone && (
                        <p className="text-xs text-slate-400 mt-1 ml-1">
                            Enter a new number to verify.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});
PersonalDetails.displayName = "PersonalDetails";

// --- SUB-COMPONENT 3: Address Details (Unchanged) ---
const AddressDetails = memo(({ form, errors, onChange, onGetLocation, gettingLoc }: AddressDetailsProps) => {
    const [fetchingPincode, setFetchingPincode] = useState(false);

    useEffect(() => {
        const fetchPincodeDetails = async () => {
            if (form.pincode && form.pincode.length === 6) {
                setFetchingPincode(true);
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`);
                    const data = await response.json();
                    if (data && data[0].Status === 'Success') {
                        const details = data[0].PostOffice[0];
                        onChange('state', details.State);
                        onChange('district', details.District);
                        const cityVal = details.Block !== "NA" ? details.Block : details.Name;
                        onChange('city', cityVal);
                    }
                } catch (error) {
                    console.error("Error fetching pincode details:", error);
                } finally {
                    setFetchingPincode(false);
                }
            }
        };
        const timer = setTimeout(fetchPincodeDetails, 400);
        return () => clearTimeout(timer);
    }, [form.pincode, onChange]);

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
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pincode</label>
                    <div className="relative">
                        <input
                            value={form.pincode}
                            onChange={e => onChange('pincode', e.target.value.replace(/\D/g, ''))}
                            className={getInputClass('pincode')}
                            placeholder="174862"
                            maxLength={6}
                        />
                        {fetchingPincode && (
                            <div className="absolute right-3 top-2.5">
                                <Loader2 className="animate-spin text-blue-500" size={16} />
                            </div>
                        )}
                    </div>
                    <ErrorMsg field="pincode" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">City</label>
                    <input
                        value={form.city}
                        onChange={e => onChange('city', e.target.value)}
                        className={getInputClass('city')}
                        placeholder="City"
                    />
                    <ErrorMsg field="city" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">District</label>
                    <input
                        value={form.district || ''}
                        onChange={e => onChange('district', e.target.value)}
                        className={getInputClass('district')}
                        placeholder="District"
                    />
                    <ErrorMsg field="district" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">State</label>
                    <input
                        value={form.state}
                        onChange={e => onChange('state', e.target.value)}
                        className={getInputClass('state')}
                        placeholder="State"
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
    const { data: session, status } = useSession();
    const [isPhoneModalOpen, setPhoneModalOpen] = useState(false);

    const {
        form, loading, uploading, gettingLoc, imgPreview, errors,
        handleChange, handleGetLocation, handleImageUpload, handleSubmit
    } = useProviderOnboarding();

    // Sync Session Data (Email & Phone) to Form State
    useEffect(() => {
        if (!session?.user) return;

        if (session.user.email && !form.email) {
            handleChange('email', session.user.email);
        }
        if (session.user.name && !form.fullName) {
            handleChange('fullName', session.user.name);
        }
        // Sync Phone if form is empty
        if (session.user.phone && !form.altPhone) {
            handleChange('altPhone', session.user.phone);
        }
    }, [session, form.email, form.fullName, form.altPhone, handleChange]);

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Phone verification check
        // Check if session verified matches CURRENT form phone
        const isCurrentPhoneVerified = session?.user?.isPhoneVerified && (session.user.phone === form.altPhone);

        if (!isCurrentPhoneVerified) {
            setPhoneModalOpen(true);
            return;
        }
        handleSubmit(e);
    };

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;
    }

    // Derived state for submit button
    const isReadyToSubmit = session?.user?.isPhoneVerified && (session.user.phone === form.altPhone);

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 animate-in fade-in duration-500">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Partner Registration</h1>
                        <p className="text-slate-500 text-sm">Fill in your details to start earning.</p>
                    </div>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                    <ProfileSection
                        imgPreview={imgPreview}
                        uploading={uploading}
                        error={errors.profileImage}
                        onUpload={handleImageUpload}
                    />
                    <PersonalDetails
                        form={form}
                        errors={errors}
                        onChange={handleChange}
                        session={session}
                        onVerifyStart={() => setPhoneModalOpen(true)}
                    />
                    <AddressDetails
                        form={form}
                        errors={errors}
                        onChange={handleChange}
                        onGetLocation={handleGetLocation}
                        gettingLoc={gettingLoc}
                    />

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
                            <>
                                {isReadyToSubmit ? (
                                    <>Complete Registration <Check /></>
                                ) : (
                                    <>Verify Phone to Continue <Smartphone size={18} /></>
                                )}
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Verification Modal */}
            {session?.user?.id && (
                <MobileVerificationModal
                    userId={session.user.id}
                    isOpen={isPhoneModalOpen}
                    onClose={() => setPhoneModalOpen(false)}
                    onSuccess={() => {
                        setPhoneModalOpen(false);
                        window.location.reload(); // Reload to sync new phone to session
                    }}
                />
            )}
        </div>
    );
}