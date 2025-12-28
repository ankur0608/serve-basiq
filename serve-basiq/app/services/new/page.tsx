'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
import {
    ArrowLeft, Camera, User, Mail, Phone, MapPin,
    Check, Loader2, AlertTriangle, UploadCloud
} from 'lucide-react';
import { onboardSchema } from "@/lib/validators";

// --- HELPER: ImageKit Upload ---
async function uploadToImageKit(file: File): Promise<string> {
    const authRes = await fetch("/api/imagekit/auth");
    if (!authRes.ok) throw new Error("Failed to get auth token");

    const auth = await authRes.json();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("publicKey", auth.publicKey);
    formData.append("signature", auth.signature);
    formData.append("expire", String(auth.expire));
    formData.append("token", auth.token);
    formData.append("useUniqueFileName", "true");
    formData.append("folder", "/services");

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Upload failed");
    return data.url;
}

export default function BecomeProPage() {
    const router = useRouter();
    const { currentUser, setCurrentUser } = useUIStore();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<any>({});

    // Form State
    const [form, setForm] = useState({
        fullName: currentUser?.name || "",
        email: currentUser?.email || "",
        altPhone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
    });

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadToImageKit(file);
            setImgPreview(url);
            // Clear specific error if it exists
            setErrors((prev: any) => ({ ...prev, img: null }));
        } catch (err) {
            alert("Image upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // Handle Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            router.push('/login');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // 1. Prepare Payload
            const payload = {
                ...form,
                img: imgPreview || ""
            };

            // 2. Validate with Zod (Frontend Check)
            // This throws an error if validation fails, catching in the catch block below
            onboardSchema.parse(payload);

            // 3. Submit to Backend
            const res = await fetch("/api/provider/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUser.id, ...payload }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            // 4. Success: Update Store & Redirect
            setCurrentUser({ ...currentUser, isWorker: true, isWebsite: false });

            // Redirect with 'new=true' to trigger the Welcome Toast on the dashboard
            router.push("/provider/dashboard?new=true");

        } catch (error: any) {
            if (error.issues) {
                // Handle Zod Validation Errors
                const formattedErrors: any = {};
                error.issues.forEach((issue: any) => {
                    formattedErrors[issue.path[0]] = issue.message;
                });
                setErrors(formattedErrors);

                // Scroll to top to see errors if needed
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Handle Generic API Errors
                alert(error.message || "Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper for Input Styling
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
                    <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col items-center ${errors.img ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
                        <div className="relative w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition group">
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />

                            {uploading ? (
                                <Loader2 className="animate-spin text-blue-500" />
                            ) : imgPreview ? (
                                <img src={imgPreview} className="w-full h-full object-cover" alt="Profile Preview" />
                            ) : (
                                <Camera className="text-slate-400 group-hover:text-blue-500 transition" size={32} />
                            )}
                        </div>
                        <p className={`text-xs font-bold uppercase mt-3 ${errors.img ? 'text-red-600' : 'text-slate-400'}`}>
                            {errors.img ? errors.img : "Upload Profile Photo"}
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

                    {/* 3. ADDRESS */}
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