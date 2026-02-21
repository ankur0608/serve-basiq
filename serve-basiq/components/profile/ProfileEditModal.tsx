"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
    FaUser,
    FaMapLocation,
    FaPhone,
    FaEnvelope,
    FaXmark,
    FaCheck,
    FaCity,
    FaLocationDot,
    FaSpinner,
    FaCalendarDays,
    FaLanguage,
    FaBuilding,
    FaCircleCheck
} from "react-icons/fa6";
import clsx from "clsx";
import AppImage from "@/components/ui/AppImage";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

// --- TYPES ---
export interface ProfileData {
    name: string;
    email: string;
    phone: string;
    image?: string | null;
    dateOfBirth: string;
    preferredLanguage: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
}

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: ProfileData;
    onSave: (data: ProfileData, file: File | null) => Promise<void>;
    isEmailLocked?: boolean;
    isPhoneLocked?: boolean;
    onAddPhoneClick?: () => void; // 👈 Triggers the parent component to open OTP modal
}

// --- HELPER: NORMALIZE DATA FOR COMPARISON ---
const normalize = (data: ProfileData) => {
    return {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        dateOfBirth: data.dateOfBirth || "",
        preferredLanguage: data.preferredLanguage || "English",
        addressLine1: data.addressLine1 || "",
        addressLine2: data.addressLine2 || "",
        landmark: data.landmark || "",
        city: data.city || "",
        district: data.district || "",
        state: data.state || "",
        pincode: data.pincode || "",
    };
};

export default function ProfileEditModal({
    isOpen,
    onClose,
    initialData,
    onSave,
    isEmailLocked,
    isPhoneLocked,
    onAddPhoneClick,
}: ProfileEditModalProps) {
    const [formData, setFormData] = useState<ProfileData>(initialData);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingPincode, setFetchingPincode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Reset form when Modal Opens
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
            setPreview(initialData.image || null);
            setFile(null);
        }
    }, [isOpen, initialData]);

    // 2. DIRTY CHECKING
    const hasChanges = useMemo(() => {
        if (file) return true;
        const current = normalize(formData);
        const initial = normalize(initialData);
        return JSON.stringify(current) !== JSON.stringify(initial);
    }, [formData, initialData, file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handlePincodeChange = async (value: string) => {
        const numericValue = value.replace(/\D/g, "");
        setFormData((prev) => ({ ...prev, pincode: numericValue }));

        if (numericValue.length === 6) {
            setFetchingPincode(true);
            try {
                const response = await fetch(
                    `https://api.postalpincode.in/pincode/${numericValue}`
                );
                const data = await response.json();

                if (data && data[0].Status === "Success") {
                    const details = data[0].PostOffice[0];
                    setFormData((prev) => ({
                        ...prev,
                        state: details.State,
                        district: details.District,
                        city: details.Block !== "NA" ? details.Block : details.District,
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch pincode details", error);
            } finally {
                setFetchingPincode(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges) {
            onClose();
            return;
        }
        setLoading(true);
        try {
            await onSave(formData, file);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[85dvh] sm:max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-5">
                            Edit Profile
                        </h2>
                        <p className="text-sm text-gray-500">Update personal details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"
                    >
                        <FaXmark className="text-lg" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Image Upload */}
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm relative bg-slate-100 flex items-center justify-center">
                                    {preview ? (
                                        <AppImage
                                            src={preview}
                                            alt="Preview"
                                            type="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold">
                                            {formData.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <p
                                className="text-xs text-blue-600 font-bold cursor-pointer hover:underline"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Change Photo
                            </p>
                        </div>

                        {/* Basic Info */}
                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FaUser /> Basic Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Input
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Date of Birth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        icon={<FaCalendarDays />}
                                    />
                                </div>
                                <div>
                                    <Select
                                        label="Preferred Language"
                                        value={formData.preferredLanguage}
                                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                                        options={["English", "Hindi", "Gujarati", "Marathi"]}
                                        icon={<FaLanguage />}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Input
                                        label="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        type="email"
                                        icon={<FaEnvelope />}
                                        disabled={isEmailLocked}
                                        placeholder="e.g. john@example.com"
                                    />
                                </div>

                                {/* ✅ Enhanced Phone Input with Verification Action */}
                                <div className="md:col-span-2">
                                    <Input
                                        label="Mobile Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        type="tel"
                                        icon={<FaPhone />}
                                        maxLength={10}
                                        disabled={isPhoneLocked}
                                        placeholder="e.g. 9876543210"
                                        rightElement={
                                            <div className="flex items-center gap-2">
                                                {/* Verified Badge */}
                                                {formData.phone && (
                                                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md font-bold">
                                                        <FaCircleCheck /> Verified
                                                    </span>
                                                )}
                                                {/* Add/Change Button */}
                                                {onAddPhoneClick && (
                                                    <button
                                                        type="button"
                                                        onClick={onAddPhoneClick}
                                                        className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                                                    >
                                                        {formData.phone ? "Change" : "Add Number"}
                                                    </button>
                                                )}
                                            </div>
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        {/* Address Details */}
                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FaMapLocation /> Address Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Input
                                        label="Address Line 1"
                                        value={formData.addressLine1}
                                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                                        icon={<FaLocationDot />}
                                        placeholder="House No., Building, Apartment"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        label="Address Line 2"
                                        value={formData.addressLine2}
                                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                                        placeholder="Area, Colony, Road, Sector"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        label="Landmark"
                                        value={formData.landmark}
                                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                        placeholder="e.g. Near City Mall"
                                    />
                                </div>

                                <Input
                                    label="Pincode"
                                    value={formData.pincode}
                                    onChange={(e) => handlePincodeChange(e.target.value)}
                                    maxLength={6}
                                    placeholder="e.g. 400001"
                                    rightElement={fetchingPincode && <FaSpinner className="animate-spin text-blue-600 text-xs" />}
                                />

                                <Input
                                    label="City"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    icon={<FaCity />}
                                    placeholder="e.g. Mumbai"
                                />

                                <Input
                                    label="District"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    icon={<FaBuilding />}
                                    placeholder="e.g. Thane"
                                />

                                <Input
                                    label="State"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="e.g. Maharashtra"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl border border-gray-300 font-bold hover:bg-white transition text-sm sm:text-base"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="profile-form"
                        disabled={loading || !hasChanges}
                        className={clsx(
                            "flex-2 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base",
                            loading || !hasChanges
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-slate-900 text-white hover:bg-black"
                        )}
                    >
                        {loading ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <>
                                <FaCheck /> {hasChanges ? "Save Changes" : "No Changes"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}