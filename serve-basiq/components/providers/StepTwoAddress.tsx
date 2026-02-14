'use client';

import {
    MapPin,
    Building2,
    Copy,
    Check
} from 'lucide-react';
import clsx from 'clsx';

export default function StepTwoAddress({ form, updateField, setForm, getInputClass }: any) {

    const toggleSameAddress = () => {
        const isNowChecked = !form.sameAsPersonal;
        setForm((prev: any) => ({
            ...prev,
            sameAsPersonal: isNowChecked,
            ...(isNowChecked ? {
                bizAddressLine1: prev.addressLine1,
                bizCity: prev.city,
                bizPincode: prev.pincode,
                bizState: prev.state
            } : {})
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* 1. Home Address Section */}
            <section className="bg-white rounded-2xl shadow-sm border-l-4 border-slate-500 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Home Address</h3>
                        <p className="text-xs text-slate-500">Where you currently reside</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address Line 1</label>
                        <input className={getInputClass('addressLine1')} value={form.addressLine1} onChange={e => updateField('addressLine1', e.target.value)} placeholder="Flat, House no, Building" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address Line 2</label>
                        <input className={getInputClass('addressLine2')} value={form.addressLine2} onChange={e => updateField('addressLine2', e.target.value)} placeholder="Area, Colony" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Landmark</label>
                        <input className={getInputClass('landmark')} value={form.landmark} onChange={e => updateField('landmark', e.target.value)} placeholder="Near City Hospital" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label>
                            <input className={getInputClass('city')} value={form.city} onChange={e => updateField('city', e.target.value)} placeholder="City" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pincode</label>
                            <input className={getInputClass('pincode')} value={form.pincode} onChange={e => updateField('pincode', e.target.value)} placeholder="Pincode" maxLength={6} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Business Details Section */}
            <section className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-500 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Building2 size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">Business Details</h3>
                    </div>
                    <button
                        type="button"
                        onClick={toggleSameAddress}
                        className={clsx(
                            "text-xs font-bold flex items-center gap-2 border px-3 py-1.5 rounded-lg transition-all",
                            form.sameAsPersonal ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        {form.sameAsPersonal ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        {form.sameAsPersonal ? "Synced" : "Same Address"}
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Shop/Business Name</label>
                        <input className={getInputClass('shopName')} value={form.shopName} onChange={e => updateField('shopName', e.target.value)} placeholder="Shop Name" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Business Address</label>
                        <input
                            className={getInputClass('bizAddressLine1')}
                            value={form.bizAddressLine1}
                            onChange={e => updateField('bizAddressLine1', e.target.value)}
                            placeholder="Business Location"
                            disabled={form.sameAsPersonal}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label>
                            <input className={getInputClass('bizCity')} value={form.bizCity} onChange={e => updateField('bizCity', e.target.value)} placeholder="City" disabled={form.sameAsPersonal} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pincode</label>
                            <input className={getInputClass('bizPincode')} value={form.bizPincode} onChange={e => updateField('bizPincode', e.target.value)} placeholder="Pincode" maxLength={6} disabled={form.sameAsPersonal} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}