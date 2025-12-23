'use client';

import { useState, useEffect } from 'react';
import {
    FaUser, FaMapLocation, FaPhone, FaEnvelope, FaXmark, FaCheck, FaEarthAmericas, FaCity, FaLocationDot
} from 'react-icons/fa6';
import clsx from 'clsx';

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
}

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: ProfileData;
    onSave: (data: ProfileData) => void;
}

// Default state to prevent crashes if initialData is delayed
const DEFAULT_DATA: ProfileData = {
    name: '',
    email: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
};

export default function ProfileEditModal({ isOpen, onClose, initialData, onSave }: ProfileEditModalProps) {
    // ✅ FIX: Initialize with fallback to avoid 'undefined'
    const [formData, setFormData] = useState<ProfileData>(initialData || DEFAULT_DATA);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isAnimating, setIsAnimating] = useState(false);

    // ✅ FIX: Sync state safely when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || DEFAULT_DATA);
            setErrors({});
            setIsAnimating(true);
        } else {
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialData]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = "Full Name is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email?.trim()) newErrors.email = "Email is required";
        else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

        if (!formData.addressLine?.trim()) newErrors.addressLine = "Address Line is required";
        if (!formData.city?.trim()) newErrors.city = "City is required";
        if (!formData.state?.trim()) newErrors.state = "State is required";

        if (!formData.pincode?.trim()) newErrors.pincode = "Pincode is required";
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Must be 6 digits";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    if (!isOpen && !isAnimating) return null;

    // ✅ Guard Clause: Extra safety against rendering undefined state
    if (!formData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
            <div className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose}></div>
            <div className={clsx("bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] transition-all duration-300 transform", isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95")}>

                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-20">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2>
                        <p className="text-sm text-gray-500">Update your personal details & address</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500"><FaXmark className="text-xl" /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2"><FaUser /> Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Full Name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} error={errors.name} placeholder="Enter your full name" />
                                <InputField label="Email Address" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} error={errors.email} type="email" placeholder="name@example.com" />
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Mobile Number</label>
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 flex items-center gap-3 cursor-not-allowed">
                                        <FaPhone className="text-gray-400" /> {formData.phone}
                                        <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1"><FaCheck size={10} /> Verified</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Phone number cannot be changed.</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2"><FaMapLocation /> Default Address</h4>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <InputField label="Address Line" value={formData.addressLine} onChange={(v: string) => setFormData({ ...formData, addressLine: v })} error={errors.addressLine} placeholder="Flat / Building / Street" icon={<FaLocationDot />} />
                                </div>
                                <InputField label="City" value={formData.city} onChange={(v: string) => setFormData({ ...formData, city: v })} error={errors.city} placeholder="City Name" icon={<FaCity />} />
                                <InputField label="Pincode" value={formData.pincode} onChange={(v: string) => { if (/^\d*$/.test(v) && v.length <= 6) setFormData({ ...formData, pincode: v }); }} error={errors.pincode} placeholder="123456" />
                                <InputField label="State" value={formData.state} onChange={(v: string) => setFormData({ ...formData, state: v })} error={errors.state} placeholder="State" />
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Country</label>
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 flex items-center gap-2 cursor-not-allowed"><FaEarthAmericas /> India</div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-300 text-slate-700 font-bold hover:bg-white hover:border-gray-400 transition">Cancel</button>
                    <button type="submit" form="profile-form" className="flex-2 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black shadow-lg shadow-slate-900/20 transition flex items-center justify-center gap-2 active:scale-[0.98]"><FaCheck /> Save Changes</button>
                </div>
            </div>
        </div>
    );
}

// --- HELPER COMPONENT ---
interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    icon?: React.ReactNode;
}

function InputField({ label, value, onChange, error, type = "text", placeholder, icon }: InputFieldProps) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">{label} <span className="text-red-500">*</span></label>
            <div className="relative">
                <input
                    type={type}
                    value={value || ''} // ✅ Fix: Handle undefined values
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={clsx("w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition", icon ? "pl-10" : "", error ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20")}
                />
                {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
            </div>
            {error && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-pulse">{error}</p>}
        </div>
    );
}