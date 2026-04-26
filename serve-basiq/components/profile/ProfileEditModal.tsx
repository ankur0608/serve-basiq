"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    FaUser, FaMapLocation, FaPhone, FaEnvelope, FaXmark,
    FaCheck, FaCity, FaLocationDot, FaSpinner,
    FaCalendarDays, FaLanguage, FaBuilding, FaCircleCheck
} from "react-icons/fa6";
import clsx from "clsx";
import AppImage from "@/components/ui/AppImage";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { uploadToBackend } from "@/lib/uploadToBackend"; // ✅ Import utility

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
    onSave: (data: ProfileData) => Promise<void>; // ✅ Removed 'file' parameter
    isEmailLocked?: boolean;
    isPhoneLocked?: boolean;
    onAddPhoneClick?: () => void;
}

const normalize = (data: ProfileData) => {
    return {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        image: data.image || "", // ✅ Include image in normalization for change detection
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
    const [loading, setLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false); // ✅ Track background upload
    const [fetchingPincode, setFetchingPincode] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
            setPreview(initialData.image || null);
        }
    }, [isOpen, initialData]);

    const hasChanges = useMemo(() => {
        const current = normalize(formData);
        const initial = normalize(initialData);
        return JSON.stringify(current) !== JSON.stringify(initial);
    }, [formData, initialData]);

    // ✅ Instant Upload Logic
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        
        const f = e.target.files[0];
        
        // 1. Show local preview instantly
        setPreview(URL.createObjectURL(f));
        setIsUploadingImage(true);

        try {
            // 2. Compress to WebP (Avatar optimized)
            const compressedBlob = await imageCompression(f, {
                maxSizeMB: 0.2, 
                maxWidthOrHeight: 800,
                useWebWorker: true,
                fileType: "image/webp",
            });
            
            const newFileName = f.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([compressedBlob], newFileName, { type: 'image/webp' });

            // 3. Upload instantly to R2
            const uploadedUrl = await uploadToBackend(webpFile, "users");
            
            // 4. Update the final form state
            setFormData(prev => ({ ...prev, image: uploadedUrl }));
            toast.success("Image uploaded!");
            
        } catch (error: any) {
            console.error("Instant upload failed:", error);
            toast.error(error.message || "Failed to upload image.");
            // Revert preview on failure
            setPreview(formData.image || null); 
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
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
        if (!hasChanges || isUploadingImage) return;

        setLoading(true);
        try {
            await onSave(formData); // ✅ Extremely fast payload now
            toast.success("Profile updated successfully!");
            onClose(); 
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" style={{ isolation: 'isolate' }}>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"></div>

            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[85dvh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-2">Edit Profile</h2>
                        <p className="text-sm text-gray-500">Update personal details</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                        <FaXmark className="text-lg" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Image Upload Area */}
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div
                                className={clsx("relative group cursor-pointer", isUploadingImage && "pointer-events-none")}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm relative bg-slate-100 flex items-center justify-center transition group-hover:border-blue-100">
                                    {preview ? (
                                        <AppImage
                                            src={preview}
                                            alt="Preview"
                                            type="avatar"
                                            className={clsx("w-full h-full object-cover transition", isUploadingImage && "opacity-50 blur-sm grayscale")}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold">
                                            {formData.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    
                                    {/* ✅ Spinner Overlay while uploading */}
                                    {isUploadingImage && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
                                            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={isUploadingImage}
                                />
                            </div>
                            <p
                                className={clsx("text-xs font-bold transition-colors", isUploadingImage ? "text-slate-400" : "text-blue-600 cursor-pointer hover:underline")}
                                onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                            >
                                {isUploadingImage ? "Uploading..." : "Change Photo"}
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
                                        onChange={(e) => setFormData({ ...formData, preferredLanguage: String(e.target.value) })}
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
                                                {formData.phone && (
                                                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md font-bold">
                                                        <FaCircleCheck /> Verified
                                                    </span>
                                                )}
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

                <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading || isUploadingImage}
                        className="flex-1 py-3 rounded-xl border border-gray-300 font-bold hover:bg-white transition text-sm sm:text-base"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="profile-form"
                        disabled={loading || !hasChanges || isUploadingImage}
                        className={clsx(
                            "flex-2 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base",
                            loading || !hasChanges || isUploadingImage
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
        </div>,
        document.body
    );
}