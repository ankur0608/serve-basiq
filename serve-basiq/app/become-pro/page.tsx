'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
import {
    ArrowLeft, Camera, User, Mail, Phone, MapPin,
    Check, Loader2, AlertTriangle, Navigation
} from 'lucide-react';
import { onboardSchema } from "@/lib/validators";

// --- HELPER: Upload to Backend ---
async function uploadToBackend(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Upload failed");
    }

    const data = await res.json();

    if (data.url) return data.url;
    if (data.key) {
        const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
        if (urlEndpoint) {
            const cleanEndpoint = urlEndpoint.replace(/\/$/, "");
            return `${cleanEndpoint}/${data.key}`;
        }
    }

    throw new Error("Upload successful but no valid URL returned");
}

export default function BecomeProPage() {
    const router = useRouter();
    const { currentUser, setCurrentUser } = useUIStore();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [gettingLoc, setGettingLoc] = useState(false);
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<any>({});

    // Initial Form State
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        altPhone: "",
        addressLine1: "",
        addressLine2: "",
        landmark: "", // ✅ ADDED: Missing field
        city: "",
        state: "",
        pincode: "",
        latitude: 0,
        longitude: 0,
    });

    // --- FETCH EXISTING DATA ---
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!currentUser?.id) return;

            try {
                const res = await fetch(`/api/user/profile?identifier=${currentUser.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const addr = data.addresses?.find((a: any) => a.type === 'Home') || data.addresses?.[0];

                    setForm(prev => ({
                        ...prev,
                        fullName: data.name || prev.fullName,
                        email: data.email || prev.email,
                        altPhone: data.phone || prev.altPhone,
                        addressLine1: addr?.line1 || prev.addressLine1,
                        addressLine2: addr?.line2 || prev.addressLine2,
                        landmark: addr?.landmark || prev.landmark, // ✅ Load landmark
                        city: addr?.city || prev.city,
                        state: addr?.state || prev.state,
                        pincode: addr?.pincode || prev.pincode,
                    }));

                    if (data.img || data.profileImage) setImgPreview(data.profileImage || data.img);
                }
            } catch (error) {
                console.error("Failed to load profile data:", error);
            }
        };

        fetchProfileData();
    }, [currentUser]);

    // --- GEOLOCATION HANDLER ---
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setGettingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setForm(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                setGettingLoc(false);
            },
            (error) => {
                console.error(error);
                alert("Unable to retrieve your location. Please allow GPS access.");
                setGettingLoc(false);
            },
            { enableHighAccuracy: true }
        );
    };

    // --- HANDLE IMAGE UPLOAD ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadToBackend(file);
            setImgPreview(url);
            setErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors.profileImage; // ✅ Clear correct error key
                return newErrors;
            });
        } catch (err: any) {
            console.error("Upload Error:", err);
            alert(err.message || "Image upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // --- HANDLE SUBMISSION ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            router.push('/login');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // ✅ CONSTRUCT PAYLOAD MATCHING SCHEMA
            // Mapping imgPreview -> profileImage
            // Mapping altPhone -> phone
            const payload = {
                ...form,
                profileImage: imgPreview || "", 
                phone: form.altPhone
            };

            // Zod Validation
            onboardSchema.parse(payload);

            // Submit to Backend
            const res = await fetch("/api/provider/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUser.id, ...payload }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            // Update local user state
            setCurrentUser({ ...currentUser, isWorker: true, isWebsite: false });
            router.push("/provider/dashboard?new=true");

        } catch (error: any) {
            console.error("Submission Error:", error);
            if (error.issues) {
                const formattedErrors: any = {};
                error.issues.forEach((issue: any) => {
                    formattedErrors[issue.path[0]] = issue.message;
                });
                setErrors(formattedErrors);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert(error.message || "Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    const getInputClass = (fieldName: string) => `w-full bg-slate-50 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[fieldName] ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`;
    const ErrorMsg = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium">{errors[field]}</p> : null;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
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

                    {/* 1. PROFILE IMAGE */}
                    <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col items-center ${errors.profileImage ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
                        <div className="relative w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                disabled={uploading}
                            />
                            {uploading ? (
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            ) : imgPreview ? (
                                <img src={imgPreview} className="w-full h-full object-cover" alt="Profile Preview" />
                            ) : (
                                <Camera className="text-slate-400 group-hover:text-blue-500 transition" size={32} />
                            )}
                        </div>
                        <p className={`text-xs font-bold uppercase mt-3 ${errors.profileImage ? 'text-red-600' : 'text-slate-400'}`}>
                            {uploading ? "Uploading..." : (errors.profileImage ? "Profile Image Required" : "Upload Profile Photo")}
                        </p>
                    </div>

                    {/* 2. PERSONAL DETAILS */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                            <User className="text-blue-600" size={20} /> <span className="font-bold text-slate-900">Personal Details</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                                <input
                                    value={form.fullName}
                                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                                    className={getInputClass('fullName')}
                                    placeholder="John Doe"
                                />
                                <ErrorMsg field="fullName" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
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
                                        onChange={e => setForm({ ...form, altPhone: e.target.value })}
                                        className={`${getInputClass('altPhone')} pl-9`}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <ErrorMsg field="altPhone" />
                            </div>
                        </div>
                    </div>

                    {/* 3. ADDRESS & LOCATION */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                            <MapPin className="text-blue-600" size={20} /> <span className="font-bold text-slate-900">Permanent Address</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address Line 1</label>
                                <input
                                    value={form.addressLine1}
                                    onChange={e => setForm({ ...form, addressLine1: e.target.value })}
                                    className={getInputClass('addressLine1')}
                                    placeholder="Flat, House No, Building"
                                />
                                <ErrorMsg field="addressLine1" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address Line 2 (Optional)</label>
                                <input
                                    value={form.addressLine2}
                                    onChange={e => setForm({ ...form, addressLine2: e.target.value })}
                                    className={getInputClass('addressLine2')}
                                    placeholder="Area, Street, Sector"
                                />
                            </div>
                            {/* ✅ NEW: Landmark Input */}
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Landmark (Optional)</label>
                                <input
                                    value={form.landmark}
                                    onChange={e => setForm({ ...form, landmark: e.target.value })}
                                    className={getInputClass('landmark')}
                                    placeholder="Near City Hospital"
                                />
                                <ErrorMsg field="landmark" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">City</label>
                                <input
                                    value={form.city}
                                    onChange={e => setForm({ ...form, city: e.target.value })}
                                    className={getInputClass('city')}
                                />
                                <ErrorMsg field="city" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pincode</label>
                                <input
                                    value={form.pincode}
                                    onChange={e => setForm({ ...form, pincode: e.target.value })}
                                    className={getInputClass('pincode')}
                                    maxLength={6}
                                />
                                <ErrorMsg field="pincode" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">State</label>
                                <input
                                    value={form.state}
                                    onChange={e => setForm({ ...form, state: e.target.value })}
                                    className={getInputClass('state')}
                                />
                                <ErrorMsg field="state" />
                            </div>

                            {/* GEO LOCATION BUTTON */}
                            <div className="col-span-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
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