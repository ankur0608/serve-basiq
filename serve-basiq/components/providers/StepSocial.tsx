'use client';

import {
    Instagram,
    Facebook,
    Youtube,
    Globe,
    Link as LinkIcon
} from 'lucide-react';

export default function StepSocial({ form, updateField, getInputClass }: any) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <section className="bg-white rounded-2xl shadow-sm border-l-4 border-pink-500 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                        <LinkIcon size={24} />
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