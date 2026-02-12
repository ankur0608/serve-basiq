'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
    Loader2, CheckCircle2, ChevronRight, ArrowLeft,
    PenLine, FileText, Box, Wrench, Clock, Zap, Calendar, CalendarClock,
    ChevronDown // ✅ Added ChevronDown for the dropdown
} from 'lucide-react';
import clsx from 'clsx';

// ✅ Types
type TimelineType = 'URGENT' | 'IMMEDIATE' | 'LATER' | 'FLEXIBLE';

export default function PostRequirementPage() {
    const { currentUser } = useUIStore();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // ✅ Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Form State
    const [form, setForm] = useState({
        type: 'SERVICE' as 'SERVICE' | 'PRODUCT',
        title: '',
        description: '',
        timeline: 'URGENT' as TimelineType,
    });

    // ✅ Timeline Options Configuration
    const timelineOptions = [
        { value: 'URGENT', label: 'Urgent', icon: Zap, sub: 'ASAP' },
        { value: 'IMMEDIATE', label: 'Immediate', icon: Calendar, sub: 'Within 2 Days' },
        { value: 'FLEXIBLE', label: 'Flexible', icon: CalendarClock, sub: 'No Hurry' },
    ];

    // Get currently selected option object for display
    const selectedOption = timelineOptions.find(opt => opt.value === form.timeline) || timelineOptions[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) return alert("Please login first");

        setLoading(true);
        try {
            const payload = {
                userId: currentUser.id,
                ...form
            };

            const res = await fetch('/api/requirements/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success || res.ok) {
                setStep(3); // Show Success Screen
            } else {
                const errorMsg = data.errors?.timeline?._errors?.[0] || data.message || 'Failed to post requirement';
                alert(errorMsg);
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting form');
        } finally {
            setLoading(false);
        }
    };

    // --- STYLES ---
    const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400";
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5 ml-1";

    if (step === 3) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Request Posted!</h2>
                    <p className="text-slate-500 mt-2 mb-8 text-sm">
                        We have received your requirement. Providers will contact you shortly.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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

                <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-4xl shadow-sm border border-slate-200 space-y-8">

                    {/* Type Selection */}
                    <div>
                        <label className={labelClass}>I am looking for...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setForm({ ...form, type: 'PRODUCT' })}
                                className={clsx(
                                    "relative overflow-hidden p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center gap-3 group",
                                    form.type === 'PRODUCT'
                                        ? "border-blue-600 bg-blue-50/50"
                                        : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                                )}
                            >
                                <div className={clsx(
                                    "p-3.5 rounded-full transition-colors",
                                    form.type === 'PRODUCT' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-400 border border-slate-100"
                                )}>
                                    <Box size={24} />
                                </div>
                                <span className={clsx("font-bold text-sm", form.type === 'PRODUCT' ? "text-blue-700" : "text-slate-500")}>Product / Material</span>
                                {form.type === 'PRODUCT' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                            </div>

                            <div
                                onClick={() => setForm({ ...form, type: 'SERVICE' })}
                                className={clsx(
                                    "relative overflow-hidden p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center gap-3 group",
                                    form.type === 'SERVICE'
                                        ? "border-purple-600 bg-purple-50/50"
                                        : "border-slate-100 hover:border-purple-200 hover:bg-slate-50"
                                )}
                            >
                                <div className={clsx(
                                    "p-3.5 rounded-full transition-colors",
                                    form.type === 'SERVICE' ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-white text-slate-400 border border-slate-100"
                                )}>
                                    <Wrench size={24} />
                                </div>
                                <span className={clsx("font-bold text-sm", form.type === 'SERVICE' ? "text-purple-700" : "text-slate-500")}>Service / Repair</span>
                                {form.type === 'SERVICE' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>
                                <div className="flex items-center gap-2"><PenLine size={14} /> Title</div>
                            </label>
                            <input
                                required
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className={inputClass}
                                placeholder={form.type === 'PRODUCT' ? "e.g. 50 Bags of Cement" : "e.g. Kitchen Sink Repair"}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                <div className="flex items-center gap-2"><FileText size={14} /> Details</div>
                            </label>
                            <textarea
                                required
                                rows={5}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className={clsx(inputClass, "resize-none")}
                                placeholder="Describe exactly what you need..."
                            />
                        </div>

                        {/* ✅ FIXED: Custom Dropdown for Timeline */}
                        <div className="relative">
                            <label className={labelClass}>
                                <div className="flex items-center gap-2"><Clock size={14} /> When do you need this?</div>
                            </label>

                            {/* Dropdown Trigger */}
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={clsx(
                                    "cursor-pointer w-full flex items-center justify-between border rounded-xl px-4 py-3 transition-all",
                                    isDropdownOpen ? "border-slate-900 ring-2 ring-slate-900 bg-white" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "p-2 rounded-lg",
                                        isDropdownOpen ? "bg-slate-100 text-slate-900" : "bg-white text-slate-500 border border-slate-200"
                                    )}>
                                        <selectedOption.icon size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900">{selectedOption.label}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{selectedOption.sub}</p>
                                    </div>
                                </div>
                                <ChevronDown
                                    size={18}
                                    className={clsx("text-slate-400 transition-transform duration-200", isDropdownOpen && "rotate-180")}
                                />
                            </div>

                            {/* Dropdown Options List */}
                            {isDropdownOpen && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    {timelineOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            onClick={() => {
                                                setForm({ ...form, timeline: option.value as TimelineType });
                                                setIsDropdownOpen(false);
                                            }}
                                            className={clsx(
                                                "p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-50",
                                                form.timeline === option.value && "bg-slate-50"
                                            )}
                                        >
                                            <div className={clsx(
                                                "p-2 rounded-lg",
                                                form.timeline === option.value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                                            )}>
                                                <option.icon size={16} />
                                            </div>
                                            <div>
                                                <p className={clsx("text-sm font-bold", form.timeline === option.value ? "text-slate-900" : "text-slate-600")}>
                                                    {option.label}
                                                </p>
                                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                                                    {option.sub}
                                                </p>
                                            </div>
                                            {form.timeline === option.value && (
                                                <CheckCircle2 size={16} className="ml-auto text-emerald-500" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Backdrop to close when clicking outside */}
                            {isDropdownOpen && (
                                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-black hover:shadow-2xl hover:shadow-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98] relative z-0"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Post Requirement <ChevronRight className="group-hover:translate-x-1 transition" /></>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}