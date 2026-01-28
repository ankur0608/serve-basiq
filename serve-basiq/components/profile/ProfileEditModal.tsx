'use client';

import { useState, useEffect, useRef } from 'react';
import { FaUser, FaMapLocation, FaPhone, FaEnvelope, FaXmark, FaCheck, FaCity, FaLocationDot, FaSpinner, FaCalendarDays, FaLanguage } from 'react-icons/fa6';
import clsx from 'clsx';
import Image from 'next/image';

export interface ProfileData {
    name: string; email: string; phone: string; image?: string | null;
    dateOfBirth: string; preferredLanguage: string;
    addressLine1: string; addressLine2: string; landmark: string; city: string; state: string; pincode: string;
}

// 1. Updated Interface to include the new props
interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: ProfileData;
    onSave: (data: ProfileData, file: File | null) => Promise<void>;
    isEmailLocked?: boolean;        // Added
    isPhoneLocked?: boolean;        // Added
    onAddPhoneClick?: () => void;   // Added
}

const DEFAULT_DATA: ProfileData = {
    name: '', email: '', phone: '', dateOfBirth: '', preferredLanguage: 'English',
    addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '', image: ''
};

export default function ProfileEditModal({
    isOpen,
    onClose,
    initialData,
    onSave,
    isEmailLocked,      // Destructure new props
    isPhoneLocked,
    onAddPhoneClick
}: ProfileEditModalProps) {
    const [formData, setFormData] = useState<ProfileData>(DEFAULT_DATA);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({ ...DEFAULT_DATA, ...initialData, name: initialData.name || '', email: initialData.email || '', phone: initialData.phone || '' });
            setPreview(initialData.image || null);
        }
    }, [isOpen, initialData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try { await onSave(formData, file); onClose(); } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div><h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2><p className="text-sm text-gray-500">Update personal details</p></div>
                    <button onClick={onClose}><FaXmark className="text-xl" /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload */}
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm relative bg-slate-100">
                                    {preview ? <Image src={preview} alt="Preview" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold">{formData.name?.substring(0, 2).toUpperCase()}</div>}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                            <p className="text-xs text-blue-600 font-bold cursor-pointer" onClick={() => fileInputRef.current?.click()}>Change Photo</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2"><FaUser /> Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2"><InputField label="Full Name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} /></div>
                                <div><InputField label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(v: string) => setFormData({ ...formData, dateOfBirth: v })} icon={<FaCalendarDays />} /></div>
                                <div><SelectField label="Preferred Language" value={formData.preferredLanguage} onChange={(v: string) => setFormData({ ...formData, preferredLanguage: v })} options={['English', 'Hindi', 'Gujarati', 'Marathi']} icon={<FaLanguage />} /></div>

                                {/* 2. Updated Fields to support locking and actions */}
                                <div>
                                    <InputField
                                        label="Email Address"
                                        value={formData.email}
                                        onChange={(v: string) => setFormData({ ...formData, email: v })}
                                        type="email"
                                        icon={<FaEnvelope />}
                                        disabled={isEmailLocked} // Apply lock
                                    />
                                </div>
                                <div>
                                    <InputField
                                        label="Mobile Number"
                                        value={formData.phone}
                                        onChange={(v: string) => setFormData({ ...formData, phone: v })}
                                        type="tel"
                                        icon={<FaPhone />}
                                        disabled={isPhoneLocked} // Apply lock
                                        // 3. Add "Change" button if locked and callback provided
                                        rightElement={onAddPhoneClick && (
                                            <button
                                                type="button"
                                                onClick={onAddPhoneClick}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                                            >
                                                {formData.phone ? 'Change' : 'Add'}
                                            </button>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-100"></div>
                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2"><FaMapLocation /> Address Details</h4>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2"><InputField label="Address Line 1" value={formData.addressLine1} onChange={(v: string) => setFormData({ ...formData, addressLine1: v })} icon={<FaLocationDot />} /></div>
                                <div className="col-span-2"><InputField label="Address Line 2" value={formData.addressLine2} onChange={(v: string) => setFormData({ ...formData, addressLine2: v })} /></div>
                                <div className="col-span-2"><InputField label="Landmark" value={formData.landmark} onChange={(v: string) => setFormData({ ...formData, landmark: v })} /></div>
                                <InputField label="City" value={formData.city} onChange={(v: string) => setFormData({ ...formData, city: v })} icon={<FaCity />} />
                                <InputField label="Pincode" value={formData.pincode} onChange={(v: string) => setFormData({ ...formData, pincode: v })} maxLength={6} />
                                <div className="col-span-2 md:col-span-1"><InputField label="State" value={formData.state} onChange={(v: string) => setFormData({ ...formData, state: v })} /></div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-3.5 rounded-xl border border-gray-300 font-bold hover:bg-white transition">Cancel</button>
                    <button type="submit" form="profile-form" disabled={loading} className="flex-2 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition flex items-center justify-center gap-2">
                        {loading ? <FaSpinner className="animate-spin" /> : <><FaCheck /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// 4. Updated InputField to accept disabled and rightElement props
function InputField({ label, value, onChange, type = "text", placeholder, icon, maxLength, disabled, rightElement }: any) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-xs font-bold text-slate-700">{label}</label>
                {rightElement}
            </div>
            <div className="relative">
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled}
                    className={clsx(
                        "w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition border-gray-200 focus:border-blue-500",
                        icon ? "pl-10" : "",
                        disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
                    )}
                />
                {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
            </div>
        </div>
    );
}

function SelectField({ label, value, onChange, options, icon }: any) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">{label}</label>
            <div className="relative">
                <select value={value} onChange={(e) => onChange(e.target.value)} className={clsx("w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 appearance-none", icon ? "pl-10" : "")}>
                    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
            </div>
        </div>
    );
}