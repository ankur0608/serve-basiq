'use client';

import { useState, useEffect } from 'react';
import {
    UploadCloud, ArrowRight, ArrowLeft, Loader2,
    UserCircle, MapPin, CreditCard, FileText, Check, Copy, Eye, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

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

    if (data.key) {
        const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
        if (!urlEndpoint) return "";
        const cleanEndpoint = urlEndpoint.replace(/\/$/, "");
        return `${cleanEndpoint}/${data.key}`;
    }

    return data.url || "";
}

export function VerificationView({ userId, existingData, showToast, onBack }: any) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [uploadingId, setUploadingId] = useState(false);
    const [uploadingBiz, setUploadingBiz] = useState(false);
    const [sameAsPersonal, setSameAsPersonal] = useState(false);

    // Validation Errors State
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        // Personal
        fullName: existingData?.name || '',
        email: existingData?.email || '',
        phone: existingData?.phone || '',

        // Personal Address
        addressLine1: '',
        city: '',
        state: '',
        pincode: '',

        // Business
        shopName: existingData?.shopName || '',
        bizAddressLine1: '',
        bizCity: '',
        bizState: '',
        bizPincode: '',

        // Banking & KYC
        bankAccountHolder: existingData?.bankAccountHolder || '',
        bankAccountNumber: existingData?.bankAccountNumber || '',
        bankIfsc: existingData?.bankIfsc || '',
        bankName: existingData?.bankName || '',
        upiId: existingData?.upiId || '',
        idProofType: existingData?.idProofType || 'Aadhaar',
        idProofNumber: existingData?.idProofNumber || '',
        idProofImg: existingData?.idProofImg || '',
        businessProofImg: existingData?.businessProofImg || '',
    });

    // --- POPULATE DATA ON LOAD ---
    useEffect(() => {
        if (existingData) {
            const home = existingData.addresses?.find((a: any) => a.type === 'Home');
            const work = existingData.addresses?.find((a: any) => a.type === 'Work');

            setForm(prev => ({
                ...prev,
                addressLine1: home?.line1 || prev.addressLine1,
                city: home?.city || prev.city,
                state: home?.state || prev.state,
                pincode: home?.pincode || prev.pincode,
                bizAddressLine1: work?.line1 || prev.bizAddressLine1,
                bizCity: work?.city || prev.bizCity,
                bizState: work?.state || prev.bizState,
                bizPincode: work?.pincode || prev.bizPincode,
            }));
        }
    }, [existingData]);

    // --- HANDLERS ---

    const handleTextOnly = (field: string, value: string) => {
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        setForm(prev => {
            const newState = { ...prev, [field]: value };
            if (sameAsPersonal) {
                if (field === 'addressLine1') newState.bizAddressLine1 = value;
                if (field === 'city') newState.bizCity = value;
                if (field === 'state') newState.bizState = value;
                if (field === 'pincode') newState.bizPincode = value;
            }
            return newState;
        });
    };

    const toggleSameAddress = () => {
        setSameAsPersonal(prev => {
            const isNowChecked = !prev;
            if (isNowChecked) {
                setForm(current => ({
                    ...current,
                    bizAddressLine1: current.addressLine1,
                    bizCity: current.city,
                    bizState: current.state,
                    bizPincode: current.pincode
                }));
            }
            return isNowChecked;
        });
    };

    const handleFileUpload = async (e: any, field: string) => {
        const file = e.target.files[0];
        if (!file) return;

        if (field === 'idProofImg') setUploadingId(true);
        if (field === 'businessProofImg') setUploadingBiz(true);

        try {
            const url = await uploadToBackend(file);
            setForm(prev => ({ ...prev, [field]: url }));
            // Clear error if exists
            setErrors(prev => ({ ...prev, [field]: '' }));
            showToast("Document uploaded successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Upload failed", "error");
        } finally {
            setUploadingId(false);
            setUploadingBiz(false);
        }
    };

    // --- VALIDATION & NAVIGATION ---

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!form.email.trim()) newErrors.email = "Email is required";
        if (!form.phone.trim() || form.phone.length !== 10) newErrors.phone = "Valid 10-digit phone required";

        if (!form.addressLine1.trim()) newErrors.addressLine1 = "Home address is required";
        if (!form.city.trim()) newErrors.city = "City is required";
        if (!form.state.trim()) newErrors.state = "State is required";
        if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";

        if (!form.shopName.trim()) newErrors.shopName = "Business/Shop name is required";
        if (!form.bizAddressLine1.trim()) newErrors.bizAddressLine1 = "Business address is required";
        if (!form.bizCity.trim()) newErrors.bizCity = "City is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!form.bankAccountHolder.trim()) newErrors.bankAccountHolder = "Account holder name required";
        if (!form.bankAccountNumber.trim()) newErrors.bankAccountNumber = "Account number required";
        if (!form.bankIfsc.trim()) newErrors.bankIfsc = "IFSC code required";
        if (!form.bankName.trim()) newErrors.bankName = "Bank name required";

        if (!form.idProofNumber.trim()) newErrors.idProofNumber = "ID number required";
        if (!form.idProofImg) newErrors.idProofImg = "ID proof document required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = (e: React.MouseEvent) => {
        e.preventDefault(); // ✅ CRITICAL: Prevents form submission
        if (validateStep1()) {
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showToast("Please fill all required fields in Step 1", "error");
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep2()) {
            showToast("Please fill all required banking & KYC fields", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/provider/update-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...form })
            });
            const data = await res.json();

            if (data.success) {
                showToast("Profile Verification Submitted!", "success");
                setTimeout(() => onBack(), 1000);
            } else {
                showToast(data.message || "Update failed", "error");
            }
        } catch (error) {
            showToast("Server error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- UI HELPERS ---
    const getInputClass = (field: string, readOnly = false) => clsx(
        "w-full border rounded-xl px-4 py-3 bg-white focus:outline-none transition text-sm font-medium text-slate-900",
        errors[field] ? "border-red-500 ring-1 ring-red-500 bg-red-50" : "border-slate-200 focus:ring-2 focus:ring-[#0f172a] focus:border-transparent",
        readOnly && "bg-slate-50 text-slate-500 cursor-not-allowed"
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

            {/* Header */}
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative w-full max-w-sm mb-6">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 rounded-full -translate-y-1/2"></div>
                    <div className={clsx("absolute top-1/2 left-0 h-1 bg-[#0f172a] rounded-full -translate-y-1/2 transition-all duration-500", step === 1 ? "w-1/2" : "w-full")}></div>
                    <div className="relative flex justify-between w-full">
                        <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xl ring-4 ring-white z-10 transition-all", step === 1 ? "bg-[#0f172a] text-white" : "bg-emerald-600 text-white")}>
                            {step === 1 ? '1' : <Check size={16} />}
                        </div>
                        <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xl ring-4 ring-white z-10 transition-all", step === 2 ? "bg-[#0f172a] text-white" : "bg-white border-2 border-slate-200 text-slate-400")}>
                            2
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{step === 1 ? "Profile Setup" : "Final Steps"}</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">{step === 1 ? "Basic Information" : "Banking & Legal Documents"}</p>
                </div>
            </div>

            <form
                onSubmit={handleFinalSubmit}
                className="relative min-h-[400px]"
                // Prevent Enter key from submitting (except in textareas if any)
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            >

                {/* === STEP 1: PERSONAL & ADDRESS === */}
                <div className={clsx("space-y-6 transition-all duration-500 ease-in-out", step === 1 ? "opacity-100" : "opacity-0 hidden")}>

                    {/* Personal Details */}
                    <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><UserCircle size={20} /></div>
                            <div><h3 className="font-bold text-slate-900 text-lg">Personal Details</h3><p className="text-xs text-slate-500">Your basic contact info</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label><input value={form.fullName} onChange={e => handleTextOnly('fullName', e.target.value)} className={getInputClass('fullName')} placeholder="Alex Johnson" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label><input value={form.email} onChange={e => handleTextOnly('email', e.target.value)} className={getInputClass('email')} placeholder="alex@example.com" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mobile</label><input value={form.phone} onChange={e => handleTextOnly('phone', e.target.value)} className={getInputClass('phone')} placeholder="9876543210" maxLength={10} /></div>
                        </div>
                    </div>

                    {/* Home Address */}
                    <div className="bg-white rounded-2xl shadow-sm border-l-4 border-slate-500 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center"><MapPin size={20} /></div>
                            <div><h3 className="font-bold text-slate-900 text-lg">Home Address </h3><p className="text-xs text-slate-500">Your permanent residence</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address Line</label><input value={form.addressLine1} onChange={e => handleTextOnly('addressLine1', e.target.value)} className={getInputClass('addressLine1')} placeholder="House No, Street, Area" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label><input value={form.city} onChange={e => handleTextOnly('city', e.target.value)} className={getInputClass('city')} placeholder="City" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">State</label><input value={form.state} onChange={e => handleTextOnly('state', e.target.value)} className={getInputClass('state')} placeholder="State" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pincode</label><input value={form.pincode} onChange={e => handleTextOnly('pincode', e.target.value)} className={getInputClass('pincode')} placeholder="Pincode" maxLength={6} /></div>
                        </div>
                    </div>

                    {/* Business Location */}
                    <div className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-500 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><MapPin size={20} /></div>
                                <div><h3 className="font-bold text-slate-900 text-lg">Work Location</h3><p className="text-xs text-slate-500">Where you provide services</p></div>
                            </div>
                            <button type="button" onClick={toggleSameAddress} className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all active:scale-95", sameAsPersonal ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>
                                {sameAsPersonal ? <Check size={16} /> : <Copy size={16} />} Same as Home
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Shop/Business Name</label>
                                <input value={form.shopName} onChange={e => handleTextOnly('shopName', e.target.value)} className={getInputClass('shopName')} placeholder="E.g. Nexus Repairs" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Business Address</label>
                                <input value={form.bizAddressLine1} onChange={e => handleTextOnly('bizAddressLine1', e.target.value)} className={getInputClass('bizAddressLine1', sameAsPersonal)} placeholder="Shop No, Complex, Area" readOnly={sameAsPersonal} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label>
                                <input value={form.bizCity} onChange={e => handleTextOnly('bizCity', e.target.value)} className={getInputClass('bizCity', sameAsPersonal)} placeholder="City" readOnly={sameAsPersonal} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">State</label>
                                <input value={form.bizState} onChange={e => handleTextOnly('bizState', e.target.value)} className={getInputClass('bizState', sameAsPersonal)} placeholder="State" readOnly={sameAsPersonal} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pincode</label>
                                <input value={form.bizPincode} onChange={e => handleTextOnly('bizPincode', e.target.value)} className={getInputClass('bizPincode', sameAsPersonal)} placeholder="Pincode" readOnly={sameAsPersonal} maxLength={6} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* === STEP 2: BANKING & KYC === */}
                <div className={clsx("space-y-6 transition-all duration-500 ease-in-out", step === 2 ? "opacity-100" : "opacity-0 hidden")}>

                    {/* Banking Card */}
                    <div className="bg-white rounded-2xl shadow-sm border-l-4 border-emerald-500 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CreditCard size={20} /></div>
                            <div><h3 className="font-bold text-slate-900 text-lg">Banking Details</h3><p className="text-xs text-slate-500">For receiving payments</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Holder</label><input value={form.bankAccountHolder} onChange={e => handleTextOnly('bankAccountHolder', e.target.value)} className={getInputClass('bankAccountHolder')} placeholder="Name on Passbook" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Number</label><input value={form.bankAccountNumber} onChange={e => handleTextOnly('bankAccountNumber', e.target.value)} className={getInputClass('bankAccountNumber')} placeholder="XXXXXXXXXXXX" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">IFSC Code</label><input value={form.bankIfsc} onChange={e => handleTextOnly('bankIfsc', e.target.value)} className={getInputClass('bankIfsc')} placeholder="HDFC0001234" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bank Name</label><input value={form.bankName} onChange={e => handleTextOnly('bankName', e.target.value)} className={getInputClass('bankName')} placeholder="HDFC Bank" /></div>
                            <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">UPI ID (Optional)</label><input value={form.upiId} onChange={e => handleTextOnly('upiId', e.target.value)} className={getInputClass('upiId')} placeholder="username@oksbi" /></div>
                        </div>
                    </div>

                    {/* KYC Card */}
                    <div className="bg-white rounded-2xl shadow-sm border-l-4 border-purple-500 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><FileText size={20} /></div>
                            <div><h3 className="font-bold text-slate-900 text-lg">KYC Documents</h3><p className="text-xs text-slate-500">Identity Verification</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Document Type</label>
                                <select value={form.idProofType} onChange={e => handleTextOnly('idProofType', e.target.value)} className={getInputClass('idProofType')}>
                                    <option value="Aadhaar">Aadhaar Card</option>
                                    <option value="PAN">PAN Card</option>
                                    <option value="DL">Driving License</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ID Number</label>
                                <input value={form.idProofNumber} onChange={e => handleTextOnly('idProofNumber', e.target.value)} className={getInputClass('idProofNumber')} placeholder="Enter ID Number" />
                            </div>

                            {/* ID Proof Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload ID Proof</label>
                                <div className={clsx("border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors group relative", errors['idProofImg'] ? "border-red-500 bg-red-50" : (form.idProofImg ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"))}>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'idProofImg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    {uploadingId ? <Loader2 className="animate-spin mx-auto text-slate-400" /> : form.idProofImg ? (
                                        <div className="flex flex-col items-center">
                                            <Check className="text-emerald-600 mb-2" />
                                            <p className="text-emerald-600 font-bold text-sm">File Uploaded</p>
                                            <a href={form.idProofImg} target="_blank" className="text-xs text-emerald-500 hover:underline z-20 relative mt-1 flex items-center gap-1"><Eye size={12} /> View</a>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="mx-auto mb-2 text-slate-400 group-hover:scale-110 transition-transform" />
                                            <p className="text-sm text-slate-600 font-bold">Click to upload ID Proof</p>
                                        </>
                                    )}
                                </div>
                                {errors['idProofImg'] && <p className="text-xs text-red-500 mt-1 font-bold flex items-center gap-1"><AlertCircle size={12} /> ID Proof is required</p>}
                            </div>

                            {/* Business Proof Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Business Proof (Optional)</label>
                                <div className={clsx("border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors group relative", form.businessProofImg ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:bg-slate-50")}>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'businessProofImg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    {uploadingBiz ? <Loader2 className="animate-spin mx-auto text-slate-400" /> : form.businessProofImg ? (
                                        <div className="flex flex-col items-center">
                                            <Check className="text-emerald-600 mb-2" />
                                            <p className="text-emerald-600 font-bold text-sm">File Uploaded</p>
                                            <a href={form.businessProofImg} target="_blank" className="text-xs text-emerald-500 hover:underline z-20 relative mt-1 flex items-center gap-1"><Eye size={12} /> View</a>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="mx-auto mb-2 text-slate-400 group-hover:scale-110 transition-transform" />
                                            <p className="text-sm text-slate-600 font-bold">Click to upload Business Proof</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER ACTIONS --- */}
                <div className="mt-8 flex justify-end gap-4 pb-8">
                    {step === 1 ? (
                        <>
                            <button type="button" onClick={onBack} className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                            {/* ✅ CRITICAL FIX: onClick logic prevents default form submission */}
                            <button type="button" onClick={handleNextStep} className="px-8 py-3 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">Next Step <ArrowRight size={16} /></button>
                        </>
                    ) : (
                        <> 
                            <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                            <button type="submit" disabled={loading} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : <><Check size={16} /> Complete Profile</>}
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}