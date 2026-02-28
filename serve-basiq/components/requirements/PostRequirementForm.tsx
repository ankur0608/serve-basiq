'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, ArrowLeft, PenLine, FileText, Zap, Calendar, CalendarClock } from 'lucide-react';
import clsx from 'clsx';
import Input from '@/components/ui/Input';
import LoginModal from '@/components/auth/LoginModal';
import toast from 'react-hot-toast'; // ✅ Imported toast

import SuccessScreen from './SuccessScreen';
import RequirementTypeSelector from './RequirementTypeSelector';
import TimelineDropdown, { TimelineType } from './TimelineDropdown';

const TIMELINE_OPTIONS = [
    { value: 'URGENT' as TimelineType, label: 'Urgent', icon: Zap, sub: 'ASAP' },
    { value: 'IMMEDIATE' as TimelineType, label: 'Immediate', icon: Calendar, sub: 'Within 2 Days' },
    { value: 'FLEXIBLE' as TimelineType, label: 'Flexible', icon: CalendarClock, sub: 'No Hurry' },
];

export default function PostRequirementForm() {
    const { currentUser } = useUIStore();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [form, setForm] = useState({
        type: 'SERVICE' as 'SERVICE' | 'PRODUCT',
        title: '',
        description: '',
        timeline: 'URGENT' as TimelineType,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }
        setLoading(true);
        try {
            const payload = { userId: currentUser.id, ...form };

            const res = await fetch('/api/requirements/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success || res.ok) {
                setStep(3); // Show Success Screen
                // Optional: You can also add a success toast here if you want it alongside the SuccessScreen
                // toast.success('Requirement posted successfully!');
            } else {
                const errorMsg = data.errors?.timeline?._errors?.[0] || data.message || 'Failed to post requirement';
                toast.error(errorMsg); 
            }
        } catch (error) {
            console.error(error);
            toast.error('Error submitting form'); 
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) return <SuccessScreen />;

    return (
        <div className="min-h-screen bg-[#F8F9FC] py-8 px-4 flex items-center justify-center">
            <div className="max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} type="button" className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm group">
                        <ArrowLeft size={20} className="text-slate-600 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Post Requirement</h1>
                        <p className="text-slate-500 text-sm font-medium">Tell us what you need.</p>
                    </div>
                </div>

                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                />

                <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-4xl shadow-sm border border-slate-200 space-y-8">
                    <RequirementTypeSelector
                        type={form.type}
                        onChange={(val) => setForm({ ...form, type: val })}
                    />

                    <div className="space-y-6">
                        <Input
                            label="TITLE"
                            icon={<PenLine size={16} />}
                            required
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder={form.type === 'PRODUCT' ? "e.g. 50 Bags of Cement" : "e.g. Kitchen Sink Repair"}
                            className="bg-slate-50/50"
                        />

                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 ml-1">
                                Details
                            </label>
                            <div className="relative">
                                <FileText size={16} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                                <textarea
                                    required
                                    rows={5}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full border border-gray-200 bg-slate-50/50 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white resize-none placeholder:text-gray-400"
                                    placeholder="Describe exactly what you need..."
                                />
                            </div>
                        </div>

                        <TimelineDropdown
                            value={form.timeline}
                            onChange={(val) => setForm({ ...form, timeline: val })}
                            options={TIMELINE_OPTIONS}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-black hover:shadow-2xl hover:shadow-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Post Requirement <ChevronRight className="group-hover:translate-x-1 transition" /></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}