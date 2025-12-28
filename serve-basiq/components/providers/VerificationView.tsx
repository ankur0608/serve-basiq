'use client';

import { useState } from 'react';
import { Save, UploadCloud, FileText, CreditCard, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

// --- ImageKit Upload Helper ---
async function uploadToImageKit(file: File, folder: string): Promise<string> {
    const authRes = await fetch("/api/imagekit/auth");
    const auth = await authRes.json();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("publicKey", auth.publicKey);
    formData.append("signature", auth.signature);
    formData.append("expire", String(auth.expire));
    formData.append("token", auth.token);
    formData.append("useUniqueFileName", "true");
    formData.append("folder", folder);

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error("Upload failed");
    return data.url;
}

export function VerificationView({ userId, existingData, showToast, onBack }: any) {
    const [loading, setLoading] = useState(false);
    const [uploadingId, setUploadingId] = useState(false);
    const [uploadingBiz, setUploadingBiz] = useState(false);

    // State for validation errors
    const [errors, setErrors] = useState<any>({});

    const [form, setForm] = useState({
        // Bank
        bankAccountHolder: existingData?.bankAccountHolder || '',
        bankAccountNumber: existingData?.bankAccountNumber || '',
        bankIfsc: existingData?.bankIfsc || '',
        bankName: existingData?.bankName || '',
        upiId: existingData?.upiId || '',

        // Docs
        idProofType: existingData?.idProofType || 'Aadhaar',
        idProofNumber: existingData?.idProofNumber || '',
        idProofImg: existingData?.idProofImg || '',
        businessProofImg: existingData?.businessProofImg || '',
    });

    // --- INPUT HANDLERS (STRICT FORMATTING) ---

    // 1. Only Letters & Spaces (Name, Bank Name)
    const handleTextOnly = (field: string, value: string) => {
        const cleanValue = value.replace(/[^a-zA-Z\s]/g, '');
        setForm(prev => ({ ...prev, [field]: cleanValue }));
        if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: null }));
    };

    // 2. Only Numbers (Account No, Aadhaar)
    const handleNumberOnly = (field: string, value: string) => {
        const cleanValue = value.replace(/[^0-9]/g, '');
        setForm(prev => ({ ...prev, [field]: cleanValue }));
        if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: null }));
    };

    // 3. Alphanumeric Uppercase (IFSC, PAN, ID)
    const handleAlphaNumeric = (field: string, value: string) => {
        const cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setForm(prev => ({ ...prev, [field]: cleanValue }));
        if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: null }));
    };

    // --- FILE UPLOAD ---
    const handleFileUpload = async (e: any, field: string) => {
        const file = e.target.files[0];
        if (!file) return;

        if (field === 'idProofImg') setUploadingId(true);
        if (field === 'businessProofImg') setUploadingBiz(true);

        try {
            const url = await uploadToImageKit(file, "/documents");
            setForm(prev => ({ ...prev, [field]: url }));
            setErrors((prev: any) => ({ ...prev, [field]: null })); // Clear error
            showToast("Document uploaded successfully", "success");
        } catch (error) {
            showToast("Upload failed", "error");
        } finally {
            setUploadingId(false);
            setUploadingBiz(false);
        }
    };

    // --- VALIDATION LOGIC ---
    const validate = () => {
        let newErrors: any = {};
        let isValid = true;

        // Bank Validations
        if (!form.bankAccountHolder.trim()) newErrors.bankAccountHolder = "Account holder name is required";
        if (form.bankAccountNumber.length < 9) newErrors.bankAccountNumber = "Invalid Account Number (min 9 digits)";
        if (!form.bankName.trim()) newErrors.bankName = "Bank name is required";

        // IFSC: Must be exactly 11 characters
        if (form.bankIfsc.length !== 11) newErrors.bankIfsc = "IFSC Code must be 11 characters";

        // ID Proof Validations
        if (form.idProofType === 'Aadhaar') {
            if (form.idProofNumber.length !== 12) newErrors.idProofNumber = "Aadhaar must be 12 digits";
        } else if (form.idProofType === 'PAN Card') {
            if (form.idProofNumber.length !== 10) newErrors.idProofNumber = "PAN must be 10 characters";
        } else {
            if (form.idProofNumber.length < 5) newErrors.idProofNumber = "Invalid ID Number";
        }

        if (!form.idProofImg) newErrors.idProofImg = "ID Document image is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
            // Scroll to top to show errors
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast("Please fix the highlighted errors", "error");
        }

        return isValid;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!validate()) return; // Stop if validation fails

        setLoading(true);

        try {
            const res = await fetch('/api/provider/update-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...form })
            });

            const data = await res.json();
            if (data.success) {
                showToast("Verification details submitted for review!", "success");
            } else {
                showToast("Failed to save details", "error");
            }
        } catch (error) {
            showToast("Server error", "error");
        } finally {
            setLoading(false);
        }
    };

    // Helper for input styles
    const getInputClass = (fieldName: string) => `w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition ${errors[fieldName] ? 'border-red-500 ring-red-100 bg-red-50' : 'border-slate-200 bg-slate-50 focus:ring-blue-500'}`;
    const ErrorMsg = ({ field }: { field: string }) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1"><AlertCircle size={10} /> {errors[field]}</p> : null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-10">

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Edit Profile & Verification</h2>
                    <p className="text-slate-500 text-sm">Securely update your banking and identity details.</p>
                </div>
            </div>

            {/* STATUS BANNER */}
            <div className="flex justify-end items-center mb-6">
                {existingData?.isVerified ? (
                    <span className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                        <CheckCircle size={16} /> Verified Account
                    </span>
                ) : (
                    <span className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-bold text-sm border border-amber-200">
                        <AlertCircle size={16} /> Status: {existingData?.verificationStatus || "Pending Submission"}
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* --- BANK DETAILS --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <CreditCard className="text-blue-600" size={20} />
                        <h3 className="font-bold text-slate-800">Banking Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Account Holder Name</label>
                            <input
                                value={form.bankAccountHolder}
                                onChange={e => handleTextOnly('bankAccountHolder', e.target.value)}
                                className={getInputClass('bankAccountHolder')}
                                placeholder="Name on Passbook"
                            />
                            <ErrorMsg field="bankAccountHolder" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Account Number</label>
                            <input
                                value={form.bankAccountNumber}
                                onChange={e => handleNumberOnly('bankAccountNumber', e.target.value)}
                                className={getInputClass('bankAccountNumber')}
                                placeholder="XXXXXXXXXXXX"
                                maxLength={18} // Standard max length
                            />
                            <ErrorMsg field="bankAccountNumber" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Bank Name</label>
                            <input
                                value={form.bankName}
                                onChange={e => handleTextOnly('bankName', e.target.value)}
                                className={getInputClass('bankName')}
                                placeholder="e.g. HDFC Bank"
                            />
                            <ErrorMsg field="bankName" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">IFSC Code</label>
                            <input
                                value={form.bankIfsc}
                                onChange={e => handleAlphaNumeric('bankIfsc', e.target.value)}
                                className={getInputClass('bankIfsc')}
                                placeholder="HDFC0001234"
                                maxLength={11}
                            />
                            <ErrorMsg field="bankIfsc" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">UPI ID (Optional)</label>
                            <input
                                value={form.upiId}
                                onChange={e => setForm({ ...form, upiId: e.target.value })}
                                className={getInputClass('upiId')}
                                placeholder="username@upi"
                            />
                        </div>
                    </div>
                </div>

                {/* --- DOCUMENTS --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <FileText className="text-blue-600" size={20} />
                        <h3 className="font-bold text-slate-800">KYC Documents</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ID PROOF */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-900">Identity Proof</label>
                            <select
                                value={form.idProofType}
                                onChange={e => {
                                    setForm({ ...form, idProofType: e.target.value, idProofNumber: '' });
                                    setErrors({ ...errors, idProofNumber: null });
                                }}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>Aadhaar Card</option>
                                <option>PAN Card</option>
                                <option>Driving License</option>
                            </select>

                            <input
                                placeholder={form.idProofType === 'Aadhaar Card' ? "12 Digit Aadhaar No" : "ID Number"}
                                value={form.idProofNumber}
                                onChange={e => {
                                    if (form.idProofType === 'Aadhaar Card') handleNumberOnly('idProofNumber', e.target.value);
                                    else handleAlphaNumeric('idProofNumber', e.target.value);
                                }}
                                className={getInputClass('idProofNumber')}
                                maxLength={form.idProofType === 'Aadhaar Card' ? 12 : 20}
                            />
                            <ErrorMsg field="idProofNumber" />

                            <div className={`relative border-2 border-dashed rounded-xl h-32 flex items-center justify-center transition overflow-hidden group ${errors.idProofImg ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-blue-50'}`}>
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'idProofImg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {uploadingId ? <Loader2 className="animate-spin text-blue-500" /> : form.idProofImg ? (
                                    <img src={form.idProofImg} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-400 group-hover:text-blue-500 transition">
                                        <UploadCloud className="mx-auto mb-1" />
                                        <span className="text-xs font-bold">Upload ID Front</span>
                                    </div>
                                )}
                            </div>
                            <ErrorMsg field="idProofImg" />
                        </div>

                        {/* BUSINESS PROOF */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-900">Business Proof (Optional)</label>
                            <p className="text-xs text-slate-500 mb-2">GST Certificate, Shop Act, or Udyog Aadhar.</p>

                            <div className="relative border-2 border-dashed border-slate-300 rounded-xl h-48 flex items-center justify-center bg-slate-50 hover:bg-blue-50 transition overflow-hidden mt-9 group">
                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'businessProofImg')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {uploadingBiz ? <Loader2 className="animate-spin text-blue-500" /> : form.businessProofImg ? (
                                    <img src={form.businessProofImg} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-400 group-hover:text-blue-500 transition">
                                        <UploadCloud className="mx-auto mb-1" />
                                        <span className="text-xs font-bold">Upload Document</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <button disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save & Submit Verification</>}
                </button>
            </form>
        </div>
    );
}