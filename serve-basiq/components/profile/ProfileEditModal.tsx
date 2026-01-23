'use client';

import { useState, useEffect } from 'react';
import {
    FaUser, FaMapLocation, FaPhone, FaEnvelope, FaXmark, FaCheck, FaCity, FaLocationDot, FaPlus, FaCalendarDays, FaLanguage
} from 'react-icons/fa6';
import clsx from 'clsx';

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;        // Added
    preferredLanguage: string;  // Added
    addressLine1: string;
    addressLine2: string;
    landmark: string;
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
    onAddPhoneClick?: () => void;
}

const DEFAULT_DATA: ProfileData = {
    name: '', email: '', phone: '', dateOfBirth: '', preferredLanguage: 'English', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: ''
};

export default function ProfileEditModal({
    isOpen, onClose, initialData, onSave, isEmailLocked = false, isPhoneLocked = false, onAddPhoneClick
}: ProfileEditModalProps) {

    const [formData, setFormData] = useState<ProfileData>(DEFAULT_DATA);

    // Sync state when modal opens or initialData changes
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                dateOfBirth: initialData.dateOfBirth || '',           // Sync DOB
                preferredLanguage: initialData.preferredLanguage || 'English', // Sync Language
                addressLine1: initialData.addressLine1 || '',
                addressLine2: initialData.addressLine2 || '',
                landmark: initialData.landmark || '',
                city: initialData.city || '',
                state: initialData.state || '',
                pincode: initialData.pincode || ''
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]">

                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2>
                        <p className="text-sm text-gray-500">Update your personal details & address</p>
                    </div>
                    <button onClick={onClose}><FaXmark className="text-xl" /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2"><FaUser /> Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <InputField label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="Enter your full name" />
                                </div>

                                {/* --- NEW FIELDS ADDED HERE --- */}
                                <div>
                                    <InputField
                                        label="Date of Birth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
                                        icon={<FaCalendarDays />}
                                    />
                                </div>
                                <div>
                                    <SelectField
                                        label="Preferred Language"
                                        value={formData.preferredLanguage}
                                        onChange={(v) => setFormData({ ...formData, preferredLanguage: v })}
                                        options={['English', 'Hindi', 'Local']}
                                        icon={<FaLanguage />}
                                    />
                                </div>
                                {/* ----------------------------- */}

                                <div>
                                    <InputField label="Email Address" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} type="email" locked={isEmailLocked} icon={<FaEnvelope />} lockedMessage="Verified via Google" />
                                </div>
                                <div>
                                    <InputField
                                        label="Mobile Number"
                                        value={formData.phone}
                                        onChange={(v) => setFormData({ ...formData, phone: v })}
                                        type="tel"
                                        locked={true}
                                        icon={<FaPhone />}
                                        actionButton={!formData.phone && onAddPhoneClick ? (
                                            <button type="button" onClick={onAddPhoneClick} className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-black transition flex items-center gap-1 z-20">
                                                <FaPlus size={10} /> Add
                                            </button>
                                        ) : null}
                                        lockedMessage={formData.phone ? "Verified" : ""}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2"><FaMapLocation /> Default Address</h4>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2"><InputField label="Address Line 1" value={formData.addressLine1} onChange={(v) => setFormData({ ...formData, addressLine1: v })} placeholder="Flat / Building / Street" icon={<FaLocationDot />} /></div>
                                <div className="col-span-2"><InputField label="Address Line 2" value={formData.addressLine2} onChange={(v) => setFormData({ ...formData, addressLine2: v })} placeholder="Area, Colony" /></div>
                                <div className="col-span-2"><InputField label="Landmark" value={formData.landmark} onChange={(v) => setFormData({ ...formData, landmark: v })} placeholder="Near City Hospital" /></div>
                                <InputField label="City" value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} icon={<FaCity />} placeholder="City" />
                                <InputField label="Pincode" value={formData.pincode} onChange={(v) => setFormData({ ...formData, pincode: v })} maxLength={6} placeholder="123456" />
                                <div className="col-span-2 md:col-span-1"><InputField label="State" value={formData.state} onChange={(v) => setFormData({ ...formData, state: v })} placeholder="State" /></div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-300 font-bold hover:bg-white transition">Cancel</button>
                    <button type="submit" form="profile-form" className="flex-2 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition flex items-center justify-center gap-2"><FaCheck /> Save Changes</button>
                </div>
            </div>
        </div>
    );
}

// --- REUSABLE INPUT COMPONENT ---
interface InputFieldProps {
    label: string; value: string; onChange: (value: string) => void; error?: string; type?: string; placeholder?: string; icon?: React.ReactNode; locked?: boolean; maxLength?: number; lockedMessage?: string;
    actionButton?: React.ReactNode;
}

function InputField({ label, value, onChange, error, type = "text", placeholder, icon, locked = false, maxLength, lockedMessage, actionButton }: InputFieldProps) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                {label} {locked && value && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-2">Verified</span>}
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
                        error ? "border-red-300 bg-red-50" : locked ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" : "border-gray-200 bg-white focus:border-blue-500"
                    )}
                />
                {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}

                {actionButton}
                {locked && !actionButton && value && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500"><FaCheck size={12} /></div>}
            </div>
            {locked && lockedMessage && <p className="text-[10px] text-gray-400 mt-1 ml-1">{lockedMessage}</p>}
        </div>
    );
}

// --- NEW REUSABLE SELECT COMPONENT ---
interface SelectFieldProps {
    label: string; value: string; onChange: (value: string) => void; options: string[]; icon?: React.ReactNode;
}

function SelectField({ label, value, onChange, options, icon }: SelectFieldProps) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={clsx(
                        "w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 appearance-none",
                        icon ? "pl-10" : ""
                    )}
                >
                    {options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}

                {/* Custom Arrow Icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
            </div>
        </div>
    );
}