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
    // ✅ CHANGED: Split address lines
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
}

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: ProfileData;
    onSave: (data: ProfileData) => void;
    isEmailLocked?: boolean;
    isPhoneLocked?: boolean;
}

const DEFAULT_DATA: ProfileData = {
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
};

export default function ProfileEditModal({
    isOpen,
    onClose,
    initialData,
    onSave,
    isEmailLocked = false,
    isPhoneLocked = false
}: ProfileEditModalProps) {

    const [formData, setFormData] = useState<ProfileData>(initialData || DEFAULT_DATA);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen || initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                // ✅ CHANGED: Map both address lines
                addressLine1: initialData.addressLine1 || '',
                addressLine2: initialData.addressLine2 || '',
                city: initialData.city || '',
                state: initialData.state || '',
                pincode: initialData.pincode || ''
            });
            setErrors({});
        }

        if (isOpen) {
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
        if (formData.email && !emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

        if (!formData.phone?.trim()) {
            // Optional logic
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Mobile number must be 10 digits";
        }

        // ✅ CHANGED: Validate addressLine1
        if (!formData.addressLine1?.trim()) newErrors.addressLine1 = "Address is required";

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

    const handlePhoneChange = (val: string) => {
        const numericVal = val.replace(/\D/g, '');
        if (numericVal.length <= 10) setFormData({ ...formData, phone: numericVal });
    };

    const handlePincodeChange = (val: string) => {
        const numericVal = val.replace(/\D/g, '');
        if (numericVal.length <= 6) setFormData({ ...formData, pincode: numericVal });
    };

    if (!isOpen && !isAnimating) return null;
    if (!formData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
            <div className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose}></div>
            <div className={clsx("bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] transition-all duration-300 transform", isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95")}>

                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-20">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2>
                        <p className="text-sm text-gray-500">Update your contact & address info</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-red-500"><FaXmark className="text-xl" /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2"><FaUser /> Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <InputField
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(v) => setFormData({ ...formData, name: v })}
                                        error={errors.name}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <InputField
                                        label="Email Address"
                                        value={formData.email}
                                        onChange={(v) => setFormData({ ...formData, email: v })}
                                        error={errors.email}
                                        type="email"
                                        placeholder="name@example.com"
                                        locked={isEmailLocked}
                                        icon={<FaEnvelope />}
                                    />
                                    {isEmailLocked && <p className="text-[10px] text-gray-400 mt-1 ml-1">Verified via Google.</p>}
                                </div>
                                <div>
                                    <InputField
                                        label="Mobile Number"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        error={errors.phone}
                                        type="tel"
                                        placeholder="9876543210"
                                        locked={isPhoneLocked}
                                        icon={<FaPhone />}
                                        maxLength={10}
                                    />
                                    {isPhoneLocked && <p className="text-[10px] text-gray-400 mt-1 ml-1">Verified via OTP.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2"><FaMapLocation /> Default Address</h4>
                            <div className="grid grid-cols-2 gap-5">
                                {/* ✅ CHANGED: Address Line 1 */}
                                <div className="col-span-2">
                                    <InputField
                                        label="Address Line 1"
                                        value={formData.addressLine1}
                                        onChange={(v) => setFormData({ ...formData, addressLine1: v })}
                                        error={errors.addressLine1}
                                        placeholder="Flat / Building / Street"
                                        icon={<FaLocationDot />}
                                    />
                                </div>
                                {/* ✅ CHANGED: Address Line 2 */}
                                <div className="col-span-2">
                                    <InputField
                                        label="Address Line 2 (Optional)"
                                        value={formData.addressLine2}
                                        onChange={(v) => setFormData({ ...formData, addressLine2: v })}
                                        placeholder="Area, Landmark"
                                    />
                                </div>
                                <InputField label="City" value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} error={errors.city} placeholder="City Name" icon={<FaCity />} />
                                <InputField label="Pincode" value={formData.pincode} onChange={handlePincodeChange} error={errors.pincode} placeholder="123456" maxLength={6} />
                                <InputField label="State" value={formData.state} onChange={(v) => setFormData({ ...formData, state: v })} error={errors.state} placeholder="State" />
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

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    locked?: boolean;
    maxLength?: number;
}

function InputField({ label, value, onChange, error, type = "text", placeholder, icon, locked = false, maxLength }: InputFieldProps) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                {label} {locked && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-2">Verified</span>}
            </label>
            <div className="relative">
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => !locked && onChange(e.target.value)}
                    placeholder={placeholder}
                    readOnly={locked}
                    maxLength={maxLength}
                    className={clsx(
                        "w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition",
                        icon ? "pl-10" : "",
                        error ? "border-red-300 bg-red-50 focus:border-red-500" :
                            locked ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" : "border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    )}
                />
                {icon && <div className={clsx("absolute left-3.5 top-1/2 -translate-y-1/2", locked ? "text-gray-400" : "text-gray-400")}>{icon}</div>}
                {locked && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500"><FaCheck size={12} /></div>}
            </div>
            {error && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-pulse">{error}</p>}
        </div>
    );
}