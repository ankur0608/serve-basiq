import { memo, useState } from "react";
import { User, Mail, Briefcase, ShieldCheck, Smartphone, Pencil, AlertTriangle, Store } from 'lucide-react';
import Input from "@/components/ui/Input"; // Adjust path if needed
import Select from "@/components/ui/Select"; // Adjust path if needed

interface PersonalDetailsProps {
    form: any;
    errors: Record<string, string>;
    onChange: (field: string, value: any) => void;
    session: any;
    onVerifyStart: () => void;
}

const PROVIDER_OPTIONS = [
    { label: "Both Services & Products", value: "BOTH" },
    { label: "Services Only (e.g. Plumber, Cleaner)", value: "SERVICE" },
    { label: "Products Only (e.g. Selling Goods)", value: "PRODUCT" }
];

const PersonalDetails = memo(({ form, errors, onChange, session, onVerifyStart }: PersonalDetailsProps) => {
    const [isEditingPhone, setIsEditingPhone] = useState(false);

    const ErrorMsg = ({ field }: { field: string }) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors[field]}</p> : null;

    const sessionPhone = session?.user?.phone;
    const currentFormPhone = form.altPhone;
    const isCurrentNumberVerified = session?.user?.isPhoneVerified && (currentFormPhone === sessionPhone);
    const showInput = !isCurrentNumberVerified || isEditingPhone;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        onChange('altPhone', val);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                <User className="text-blue-600" size={20} /> <span className="font-bold text-slate-900">Personal Details</span>
            </div>

            <div className="space-y-4">
                <div>
                    <Input
                        label="FULL NAME"
                        value={form.fullName}
                        onChange={e => onChange('fullName', e.target.value)}
                        placeholder="John Doe"
                        className={errors.fullName ? "border-red-500 focus:border-red-500" : ""}
                    />
                    <ErrorMsg field="fullName" />
                </div>
                <div>
                    <Input
                        label="SHOP / BUSINESS NAME (OPTIONAL)"
                        value={form.shopName || ''}
                        onChange={e => onChange('shopName', e.target.value)}
                        placeholder="e.g. John's Plumbing Services"
                        icon={<Store size={16} className="text-slate-400" />}
                        className={errors.shopName ? "border-red-500 focus:border-red-500" : ""}
                    />
                    <ErrorMsg field="shopName" />
                </div>
                <div>
                    <Select
                        label="WHAT DO YOU WANT TO OFFER?"
                        icon={<Briefcase size={16} />}
                        value={form.providerType || 'BOTH'}
                        onChange={e => onChange('providerType', e.target.value)}
                        options={PROVIDER_OPTIONS}
                        className={errors.providerType ? "border-red-500 focus:border-red-500" : ""}
                    />
                    <ErrorMsg field="providerType" />
                </div>

                <div>
                    <Input
                        label="EMAIL"
                        type="email"
                        icon={<Mail size={16} />}
                        value={form.email}
                        onChange={e => onChange('email', e.target.value)}
                        placeholder="john@example.com"
                        readOnly={!!session?.user?.email}
                        className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                    />
                    <ErrorMsg field="email" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1 uppercase">Primary Phone Number</label>
                    {!showInput ? (
                        <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-1.5 rounded-full text-green-600">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-green-600 font-bold uppercase">Verified Number</p>
                                    <p className="text-slate-900 font-bold tracking-wider">+91 {currentFormPhone}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditingPhone(true)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-white p-2 rounded-full transition"
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-start">
                            <div className="flex-1">
                                <Input
                                    icon={<Smartphone size={16} />}
                                    value={form.altPhone || ''}
                                    onChange={handlePhoneChange}
                                    placeholder="Enter 10-digit number"
                                    maxLength={10}
                                    className={errors.altPhone ? "border-red-500 focus:border-red-500" : ""}
                                />
                                <ErrorMsg field="altPhone" />
                            </div>
                            <button
                                type="button"
                                onClick={onVerifyStart}
                                disabled={!!errors.altPhone || form.altPhone.length !== 10} // ✅ Prevents clicks if duplicate or incomplete
                                className="bg-slate-900 text-white text-xs py-3.5 px-4 font-bold rounded-xl hover:bg-black transition whitespace-nowrap shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Verify Now
                            </button>
                        </div>
                    )}

                    {!isCurrentNumberVerified && (
                        <p className="text-xs text-orange-500 mt-1.5 ml-1 font-medium flex items-center gap-1">
                            <AlertTriangle size={12} /> Mobile verification is required.
                        </p>
                    )}
                    {isEditingPhone && sessionPhone === currentFormPhone && (
                        <p className="text-xs text-slate-400 mt-1 ml-1">
                            Enter a new number to verify.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});

PersonalDetails.displayName = "PersonalDetails";
export default PersonalDetails;