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
} from "react-icons/fa6";
import clsx from "clsx";
import AppImage from "@/components/ui/AppImage"; // Ensure this path is correct based on your project

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
    onAddPhoneClick?: () => void;
}

// --- HELPER: NORMALIZE DATA FOR COMPARISON ---
// (Converts nulls/undefined to empty strings to prevent false "changes")
const normalize = (data: ProfileData) => {
    return {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        // We don't compare 'image' string here, we check the 'file' object instead
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
            setFile(null); // Reset uploaded file
        }
    }, [isOpen, initialData]);

    // 2. DIRTY CHECKING: Has data changed?
    const hasChanges = useMemo(() => {
        if (file) return true; // New file uploaded = changed

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

        // Prevent API call if nothing changed
        if (!hasChanges) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            await onSave(formData, file);
            // Parent handles closing on success
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

            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] sm:max-h-[90vh]">
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

                {/* Scrollable Content */}
                <div className="p-5 overflow-y-auto custom-scrollbar">
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
                                className="text-xs text-blue-600 font-bold cursor-pointer"
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
                                    <InputField
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(v: string) =>
                                            setFormData({ ...formData, name: v })
                                        }
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <InputField
                                        label="Date of Birth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(v: string) =>
                                            setFormData({ ...formData, dateOfBirth: v })
                                        }
                                        icon={<FaCalendarDays />}
                                    />
                                </div>
                                <div>
                                    <SelectField
                                        label="Preferred Language"
                                        value={formData.preferredLanguage}
                                        onChange={(v: string) =>
                                            setFormData({ ...formData, preferredLanguage: v })
                                        }
                                        options={["English", "Hindi", "Gujarati", "Marathi"]}
                                        icon={<FaLanguage />}
                                    />
                                </div>

                                <div>
                                    <InputField
                                        label="Email Address"
                                        value={formData.email}
                                        onChange={(v: string) =>
                                            setFormData({ ...formData, email: v })
                                        }
                                        type="email"
                                        icon={<FaEnvelope />}
                                        disabled={isEmailLocked}
                                        placeholder="e.g. john@example.com"
                                    />
                                </div>
                                <div>
                                    <InputField
                                        label="Mobile Number"
                                        value={formData.phone}
                                        onChange={(v: string) =>
                                            setFormData({ ...formData, phone: v })
                                        }
                                        type="tel"
                                        icon={<FaPhone />}
                                        disabled={isPhoneLocked}
                                        placeholder="e.g. 9876543210"
                                        rightElement={
                                            onAddPhoneClick && (
                                                <button
                                                    type="button"
                                                    onClick={onAddPhoneClick}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                                                >
                                                    {formData.phone ? "Change" : "Add"}
                                                </button>
                                            )
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
                                    <InputField
                                        label="Address Line 1"
                                        value={formData.addressLine1}
                                        onChange={(v: string) =>
                                            setFormData({ ...formData, addressLine1: v })
                                        }
                                        icon={<FaLocationDot />}
                                        placeholder="House No., Building, Apartment"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <InputField
                                        label="Address Line 2"
                                        value={formData.addressLine2}
                                        onChange={(v: string) =>
                                            setFormData({ ...formData, addressLine2: v })
                                        }
                                        placeholder="Area, Colony, Road, Sector"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <InputField
                                        label="Landmark"
                                        value={formData.landmark}
                                        onChange={(v: string) =>
                                            setFormData({ ...formData, landmark: v })
                                        }
                                        placeholder="e.g. Near City Mall"
                                    />
                                </div>

                                <InputField
                                    label="Pincode"
                                    value={formData.pincode}
                                    onChange={handlePincodeChange}
                                    maxLength={6}
                                    placeholder="e.g. 400001"
                                    rightElement={
                                        fetchingPincode && (
                                            <FaSpinner className="animate-spin text-blue-600 text-xs" />
                                        )
                                    }
                                />

                                <InputField
                                    label="City"
                                    value={formData.city}
                                    onChange={(v: string) =>
                                        setFormData({ ...formData, city: v })
                                    }
                                    icon={<FaCity />}
                                    placeholder="e.g. Mumbai"
                                />

                                <InputField
                                    label="District"
                                    value={formData.district}
                                    onChange={(v: string) =>
                                        setFormData({ ...formData, district: v })
                                    }
                                    icon={<FaBuilding />}
                                    placeholder="e.g. Thane"
                                />

                                <InputField
                                    label="State"
                                    value={formData.state}
                                    onChange={(v: string) =>
                                        setFormData({ ...formData, state: v })
                                    }
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
                        disabled={loading || !hasChanges} // ✅ Disabled if no changes
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

// --- SUB COMPONENTS (Input & Select) ---

function InputField({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    icon,
    maxLength,
    disabled,
    rightElement,
}: any) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-xs font-bold text-slate-700">
                    {label}
                </label>
                {rightElement}
            </div>
            <div className="relative">
                <input
                    type={type}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled}
                    className={clsx(
                        "w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition border-gray-200 focus:border-blue-500 placeholder:text-gray-400",
                        icon ? "pl-10" : "",
                        disabled
                            ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                            : "bg-white"
                    )}
                />
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

function SelectField({ label, value, onChange, options, icon }: any) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={clsx(
                        "w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 appearance-none",
                        icon ? "pl-10" : ""
                    )}
                >
                    {options.map((opt: string) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                    ▼
                </div>
            </div>
        </div>
    );
}