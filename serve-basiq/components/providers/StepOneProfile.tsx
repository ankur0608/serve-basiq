'use client';

import {
    UserCircle,
    Instagram,
    Facebook,
    Youtube,
    Globe,
    Hexagon
} from 'lucide-react';

export default function StepOnePersonal({ form, updateField, errors, getInputClass }: any) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* 1. Account Mode */}
            <section className="bg-white rounded-2xl shadow-sm border-l-4 border-indigo-500 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Hexagon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Account Mode</h3>
                        <p className="text-xs text-slate-500">Select how you want to operate</p>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Provider Type</label>
                    <select
                        value={form.providerType}
                        onChange={e => updateField('providerType', e.target.value)}
                        className={getInputClass('providerType')}
                    >
                        <option value="BOTH">Hybrid (Services & Products)</option>
                        <option value="SERVICE">Service Provider Only</option>
                        <option value="PRODUCT">Product Seller Only</option>
                    </select>
                </div>
            </section>

            {/* 2. Personal Details */}
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
                        <input className={getInputClass('fullName')} value={form.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="Alex Johnson" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                        <input className={getInputClass('email')} value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="alex@example.com" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mobile Number</label>
                        <input className={getInputClass('phone')} value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="9876543210" maxLength={10} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gender</label>
                        <select value={form.gender} onChange={e => updateField('gender', e.target.value)} className={getInputClass('gender')}>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date of Birth</label>
                        <input type="date" className={getInputClass('dob')} value={form.dob} onChange={e => updateField('dob', e.target.value)} />
                        {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Language</label>
                        <select value={form.preferredLanguage} onChange={e => updateField('preferredLanguage', e.target.value)} className={getInputClass('preferredLanguage')}>
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Gujarati">Gujarati</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* 3. Social Presence */}
            <section className="bg-white rounded-2xl shadow-sm border-l-4 border-pink-500 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                        <Instagram size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Social Presence <span className="text-xs font-normal text-slate-400 ml-1">(Optional)</span></h3>
                        <p className="text-xs text-slate-500">Link your social media profiles</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <Instagram size={14} className="text-pink-500" /> Instagram
                        </label>
                        <input
                            className={getInputClass('instagramUrl')}
                            value={form.instagramUrl}
                            onChange={e => updateField('instagramUrl', e.target.value)}
                            placeholder="https://instagram.com/username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <Facebook size={14} className="text-blue-600" /> Facebook
                        </label>
                        <input
                            className={getInputClass('facebookUrl')}
                            value={form.facebookUrl}
                            onChange={e => updateField('facebookUrl', e.target.value)}
                            placeholder="https://facebook.com/username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <Youtube size={14} className="text-red-600" /> YouTube
                        </label>
                        <input
                            className={getInputClass('youtubeUrl')}
                            value={form.youtubeUrl}
                            onChange={e => updateField('youtubeUrl', e.target.value)}
                            placeholder="https://youtube.com/@channel"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <Globe size={14} className="text-blue-400" /> Website
                        </label>
                        <input
                            className={getInputClass('websiteUrl')}
                            value={form.websiteUrl}
                            onChange={e => updateField('websiteUrl', e.target.value)}
                            placeholder="https://yourwebsite.com"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}