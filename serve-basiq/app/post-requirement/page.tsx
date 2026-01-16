'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
    Loader2, CheckCircle2, ChevronRight, ArrowLeft,
    PenLine, FileText, Box, Wrench
} from 'lucide-react';
import clsx from 'clsx';

export default function PostRequirementPage() {
    const { currentUser } = useUIStore();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Form State
    const [form, setForm] = useState({
        type: 'SERVICE',       // Selectable (Product/Service)
        title: '',             // Input
        description: '',       // Input
        addressId: ''          // Hidden & Auto-filled
    });

    // Auto-select the user's first address (Hidden from UI)
    useEffect(() => {
        if (currentUser?.addresses && currentUser.addresses.length > 0) {
            setForm(prev => ({ ...prev, addressId: currentUser.addresses![0].id }));
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return alert("Please login first");

        // Safety check for address
        if (!form.addressId) {
            return alert("Please add an address to your profile before posting.");
        }

        setLoading(true);
        try {
            const payload = {
                userId: currentUser.id,
                ...form
            };

            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setStep(3); // Show Success Screen
            } else {
                alert(data.message || 'Failed to post requirement');
            }
        } catch (error) {
            alert('Error submitting form');
        } finally {
            setLoading(false);
        }
    };

    // --- STYLES ---
    const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400";
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5 ml-1";

    // --- SUCCESS VIEW ---
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
                        <button onClick={() => router.push('/dashboard')} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition">
                            Go to Dashboard
                        </button>
                        <button onClick={() => router.push('/')} className="w-full bg-white border border-slate-200 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition">
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

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm group">
                        <ArrowLeft size={20} className="text-slate-600 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Post Requirement</h1>
                        <p className="text-slate-500 text-sm font-medium">Tell us what you need.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-8">

                    {/* 1. TYPE SELECTION (Visual Cards) */}
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

                    {/* 2. TITLE & DESCRIPTION */}
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>
                                <div className="flex items-center gap-2">
                                    <PenLine size={14} /> Title
                                </div>
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
                                <div className="flex items-center gap-2">
                                    <FileText size={14} /> Details
                                </div>
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
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !form.addressId}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:bg-black hover:shadow-2xl hover:shadow-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Post Requirement <ChevronRight className="group-hover:translate-x-1 transition" /></>}
                        </button>

                        {/* Hidden Address Warning */}
                        {!form.addressId && currentUser && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center gap-2 text-red-600 text-xs font-bold animate-pulse">
                                <CheckCircle2 size={14} /> Please add an address to your profile first
                            </div>
                        )}
                    </div>

                </form>
            </div>
        </div>
    );
}