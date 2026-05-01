'use client';

import { UserCircle } from 'lucide-react';

export default function StepOnePersonal({ form, updateField, errors, getInputClass }: any) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Personal Details */}
            <section className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <UserCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Personal Details</h3>
                        <p className="text-xs text-slate-500">Your basic contact info</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                        <input
                            className={getInputClass('fullName')}
                            value={form.fullName}
                            onChange={e => updateField('fullName', e.target.value)}
                            placeholder="Alex Johnson"
                        />
                        {/* 👉 Added Error Display */}
                        {errors.fullName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.fullName}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                        <input
                            type="email"
                            className={getInputClass('email')}
                            value={form.email}
                            onChange={e => updateField('email', e.target.value)}
                            placeholder="alex@example.com"
                        />
                        {/* 👉 Added Error Display */}
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mobile Number</label>
                        <input
                            type="tel"
                            className={getInputClass('phone')}
                            value={form.phone}
                            onChange={e => updateField('phone', e.target.value)}
                            placeholder="9876543210"
                            maxLength={10}
                        />
                        {/* 👉 Added Error Display */}
                        {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gender</label>
                        <select
                            value={form.gender}
                            onChange={e => updateField('gender', e.target.value)}
                            className={getInputClass('gender')}
                        >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date of Birth</label>
                        <input
                            type="date"
                            className={getInputClass('dob')}
                            value={form.dob}
                            onChange={e => updateField('dob', e.target.value)}
                        />
                        {errors.dob && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.dob}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Language</label>
                        <select
                            value={form.preferredLanguage}
                            onChange={e => updateField('preferredLanguage', e.target.value)}
                            className={getInputClass('preferredLanguage')}
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Gujarati">Gujarati</option>
                            <option value="Marathi">Marathi</option>
                        </select>
                    </div>
                </div>
            </section>
        </div>
    );
}