'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronRight, ArrowLeft, PenLine, FileText, Zap, Calendar, CalendarClock } from 'lucide-react';
import clsx from 'clsx';
import Input from '@/components/ui/Input';
import LoginModal from '@/components/auth/LoginModal';
import toast from 'react-hot-toast';

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

    // Added errors state
    const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

    // Added validation function
    const validateForm = () => {
        const newErrors: { title?: string; description?: string } = {};
        
        if (!form.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (form.title.trim().length < 5) {
            newErrors.title = 'Title must be at least 5 characters long';
        }

        if (!form.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (form.description.trim().length < 15) {
            newErrors.description = 'Please provide more details (at least 15 characters)';
        }

        setErrors(newErrors);
        
        // Returns true if there are no errors
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Run validation before proceeding
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

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
                        {/* Title Input with Validation */}
                        <div>
                            <Input
                                label="TITLE"
                                icon={<PenLine size={16} />}
                                required
                                value={form.title}
                                onChange={e => {
                                    setForm({ ...form, title: e.target.value });
                                    if (errors.title) setErrors({ ...errors, title: undefined }); // Clear error on typing
                                }}
                                placeholder={form.type === 'PRODUCT' ? "e.g. 50 Bags of Cement" : "e.g. Kitchen Sink Repair"}
                                className={clsx("bg-slate-50/50", errors.title && "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500")}
                            />
                            {errors.title && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.title}</p>}
                        </div>

                        {/* Description Textarea with Validation */}
                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 ml-1">
                                Details <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FileText size={16} className={clsx("absolute left-3.5 top-3.5 pointer-events-none", errors.description ? "text-red-400" : "text-gray-400")} />
                                <textarea
                                    required
                                    rows={5}
                                    value={form.description}
                                    onChange={e => {
                                        setForm({ ...form, description: e.target.value });
                                        if (errors.description) setErrors({ ...errors, description: undefined }); // Clear error on typing
                                    }}
                                    className={clsx(
                                        "w-full border bg-slate-50/50 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none transition resize-none placeholder:text-gray-400",
                                        errors.description 
                                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10" 
                                            : "border-gray-200 focus:border-blue-500 focus:bg-white"
                                    )}
                                    placeholder="Describe exactly what you need..."
                                />
                            </div>
                            {errors.description && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{errors.description}</p>}
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