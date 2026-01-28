'use client';

import { ShieldCheck, UploadCloud, Loader2, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import clsx from 'clsx';

export default function StepThreeKYC({
    form,
    updateField,
    showToast,
    errors,
    getInputClass
}: {
    form: any;
    updateField: (k: string, v: any) => void;
    showToast: (m: string, t: 'success' | 'error') => void;
    errors: Record<string, string>;
    getInputClass: (f: string) => string;
}) {
    const [uploading, setUploading] = useState<Record<string, boolean>>({});

    const handleUpload = useCallback(async (file: File, field: string) => {
        setUploading((p) => ({ ...p, [field]: true }));
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            updateField(field, data.url || data.key);
            showToast('Document uploaded successfully', 'success');
        } catch {
            showToast('Upload failed', 'error');
        } finally {
            setUploading((p) => ({ ...p, [field]: false }));
        }
    }, [updateField, showToast]);

    const FileUploadBox = ({ field, label }: { field: string; label: string }) => (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-500 uppercase">{label}</label>
            </div>

            <div
                className={clsx(
                    'relative border-2 border-dashed rounded-xl p-8 text-center transition-all group cursor-pointer',
                    form[field] ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50',
                    errors[field] && !form[field] && 'border-red-500 bg-red-50'
                )}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        handleUpload(file, field);
                        e.target.value = '';
                    }}
                />

                <div className="flex flex-col items-center gap-3">
                    {uploading[field] ? (
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    ) : form[field] ? (
                        <Check className="text-emerald-600" size={32} />
                    ) : (
                        <UploadCloud className="text-slate-400 group-hover:text-slate-600" size={32} />
                    )}
                    <div>
                        <p className="text-sm font-bold text-slate-700">
                            {form[field] ? 'Document Uploaded' : uploading[field] ? 'Uploading...' : 'Click to Upload Document'}
                        </p>
                        {!form[field] && !uploading[field] && (
                            <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-purple-500 p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">Identity Verification</h3>
                    <p className="text-xs text-slate-500">Upload proof of identity</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* ID Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ID Proof Type</label>
                        <select
                            value={form.idProofType}
                            onChange={(e) => updateField('idProofType', e.target.value)}
                            className={getInputClass('idProofType')}
                        >
                            <option value="Aadhaar">Aadhaar Card</option>
                            <option value="PAN">PAN Card</option>
                            <option value="DL">Driving License</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ID Number</label>
                        <input
                            value={form.idProofNumber}
                            onChange={(e) => updateField('idProofNumber', e.target.value)}
                            placeholder="Enter ID Number"
                            className={getInputClass('idProofNumber')}
                        />
                    </div>
                </div>

                {/* Single Image Picker */}
                <FileUploadBox field="idProofImg" label="Upload ID Document" />

                {/* GST Section */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 border border-slate-100">
                        <input
                            type="checkbox"
                            id="gst-check"
                            checked={form.gstRegistered}
                            onChange={(e) => updateField('gstRegistered', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="gst-check" className="text-sm font-bold text-slate-700 cursor-pointer">
                            I have a GST Number (Optional)
                        </label>
                    </div>

                    {form.gstRegistered && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">GSTIN</label>
                            <input
                                value={form.gstNumber}
                                onChange={(e) => updateField('gstNumber', e.target.value)}
                                placeholder="15-digit GST Number"
                                className={getInputClass('gstNumber')}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}