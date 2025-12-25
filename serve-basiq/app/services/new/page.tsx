'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import {
    FaArrowLeft, FaCamera, FaImages, FaLocationDot, FaTag,
    FaIndianRupeeSign, FaCheck, FaSpinner
} from 'react-icons/fa6';
import clsx from 'clsx';

/* ---------------- 1. ImageKit Logic ---------------- */
async function uploadToImageKit(file: File): Promise<string> {
    const authRes = await fetch("/api/imagekit/auth");
    const auth = await authRes.json();

    const formData = new FormData();
    formData.append("file", file);                    // REQUIRED
    formData.append("fileName", file.name);           // REQUIRED
    formData.append("publicKey", auth.publicKey);     // REQUIRED
    formData.append("signature", auth.signature);     // REQUIRED
    formData.append("expire", String(auth.expire));   // MUST be string
    formData.append("token", auth.token);             // REQUIRED
    formData.append("useUniqueFileName", "true");     // MUST be "true"
    formData.append("folder", "/services");           // ✅ IMPORTANT

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
        console.error("ImageKit upload failed:", data);
        throw new Error(data?.message || "Upload failed");
    }

    return data.url;
}

export default function CreateServicePage() {
    const router = useRouter();
    const { currentUser, setCurrentUser } = useUIStore();

    // States
    const [loading, setLoading] = useState(false); // For form submission
    const [uploading, setUploading] = useState(false); // For image uploading status

    // ✅ Removed social fields from state
    const [formData, setFormData] = useState({
        name: '',
        cat: '',
        price: '',
        loc: '',
        desc: ''
    });

    const [coverImg, setCoverImg] = useState<string | null>(null);
    const [gallery, setGallery] = useState<string[]>([]);

    const CATEGORIES = ["Cleaning", "Plumbing", "Electrical", "Carpentry", "Beauty", "Repairs", "Movers"];

    /* ---------------- 2. Handlers ---------------- */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Cover Image Upload (Real Upload)
    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadToImageKit(file);
            setCoverImg(url);
        } catch (err) {
            alert('Cover upload failed');
        } finally {
            setUploading(false);
        }
    };

    // Handle Gallery Upload (Real Upload)
    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || gallery.length >= 4) return;

        try {
            setUploading(true);
            const url = await uploadToImageKit(file);
            setGallery((prev) => [...prev, url]);
        } catch {
            alert('Gallery upload failed');
        } finally {
            setUploading(false);
        }
    };

    // Handle Final Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return alert("Please login first");
        if (!coverImg) return alert("Please upload a cover image");

        setLoading(true);

        try {
            const payload = {
                userId: currentUser.id,
                name: formData.name,
                cat: formData.cat,
                price: parseFloat(formData.price),
                loc: formData.loc,
                desc: formData.desc,
                img: coverImg,
                gallery: gallery,
                social: {} // ✅ Sending empty object since UI inputs are removed
            };

            const res = await fetch('/api/services/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to create service");

            // Update Local State
            setCurrentUser({ ...currentUser, isWorker: true });

            alert("🎉 Congratulations! You are now a Service Provider.");
            router.push('/provider/dashboard');
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- 3. UI ---------------- */
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-white hover:bg-gray-50 rounded-full shadow-sm text-slate-500 transition">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Become a Pro</h1>
                        <p className="text-slate-500">Create your service profile to start earning.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* 1. Details Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
                        <h2 className="font-bold text-lg mb-6 text-slate-900">Service Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Service Name</label>
                                <input required name="name" onChange={handleInputChange} placeholder="e.g. Expert Home Cleaning" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Category</label>
                                <div className="relative">
                                    <select required name="cat" onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 appearance-none outline-none focus:border-blue-500 transition">
                                        <option value="">Select...</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <FaTag className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Starting Price</label>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-slate-200 text-slate-400"><FaIndianRupeeSign /></div>
                                    <input required type="number" name="price" onChange={handleInputChange} placeholder="0.00" className="w-full pl-16 bg-slate-50 border border-slate-200 rounded-xl pr-4 py-3 font-bold text-slate-900 outline-none focus:border-blue-500 transition" />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Location</label>
                                <div className="relative">
                                    <input required name="loc" onChange={handleInputChange} placeholder="e.g. Mumbai, Maharashtra" className="w-full pl-10 bg-slate-50 border border-slate-200 rounded-xl pr-4 py-3 font-bold text-slate-900 outline-none focus:border-blue-500 transition" />
                                    <FaLocationDot className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Description</label>
                                <textarea required name="desc" rows={4} onChange={handleInputChange} placeholder="Describe your service..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 outline-none focus:border-blue-500 transition" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Images Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
                        <h2 className="font-bold text-lg mb-6 text-slate-900">Portfolio & Cover</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Cover Image Upload */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Cover Image</label>
                                <div className={clsx("relative w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition", coverImg ? "border-blue-500" : "border-slate-300")}>
                                    <input disabled={uploading} type="file" accept="image/*" onChange={handleCoverUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />

                                    {uploading && !coverImg ? (
                                        <div className="flex flex-col items-center text-blue-500 animate-pulse">
                                            <FaSpinner className="animate-spin text-2xl mb-2" />
                                            <span className="text-xs font-bold">Uploading...</span>
                                        </div>
                                    ) : coverImg ? (
                                        <img src={coverImg} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <FaCamera className="mx-auto mb-2 text-xl" />
                                            <span className="text-xs font-bold">Upload Cover</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Upload */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Gallery (Add up to 4)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {gallery.map((img, i) => (
                                        <img key={i} src={img} className="w-full aspect-square object-cover rounded-lg border border-slate-200" />
                                    ))}

                                    {gallery.length < 4 && (
                                        <div className="relative w-full aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition">
                                            <input disabled={uploading} type="file" accept="image/*" onChange={handleGalleryUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                            {uploading && gallery.length < 4 ? (
                                                <FaSpinner className="animate-spin text-blue-500 text-xl" />
                                            ) : (
                                                <FaImages className="text-slate-400 text-xl" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading || uploading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                {uploading ? "Uploading Images..." : "Creating Profile..."}
                            </>
                        ) : (
                            <><FaCheck /> Create Professional Profile</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}