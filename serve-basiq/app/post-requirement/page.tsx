'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import {
    Box, Wrench, MapPin, CreditCard, Banknote, Loader2,
    CheckCircle2, ChevronRight, User, Phone, Mail, ArrowLeft
} from 'lucide-react';

export default function PostRequirementPage() {
    const { currentUser } = useUIStore();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Form State
    const [form, setForm] = useState({
        type: 'PRODUCT', // PRODUCT or SERVICE
        category: 'General',
        title: '',
        quantity: '',
        unit: 'PIECE',
        budget: '',
        description: '',
        addressId: '',
        paymentMode: 'CASH'
    });

    // Load user address by default (Fixed TS Errors here)
    useEffect(() => {
        // safely check if addresses exist and have items
        if (currentUser?.addresses && currentUser.addresses.length > 0) {
            setForm(prev => ({ ...prev, addressId: currentUser.addresses![0].id }));
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return alert("Please login first");

        setLoading(true);
        try {
            const payload = {
                userId: currentUser.id,
                ...form,
                // Convert quantity to number only if type is product
                quantity: form.type === 'PRODUCT' ? Number(form.quantity) : undefined,
                unit: form.type === 'PRODUCT' ? form.unit : undefined,
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

    // --- REUSED STYLES ---
    const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-sm font-medium";
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2";

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
                        We have sent your request to verified suppliers. You will receive quotes or calls shortly.
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
        <div className="min-h-screen bg-[#F8F9FC] py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Post New Requirement</h1>
                        <p className="text-slate-500 text-sm">Get the best quotes from verified sellers & providers.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN - MAIN FORM */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. TYPE SELECTION */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <label className={labelClass}>I am looking for...</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setForm({ ...form, type: 'PRODUCT' })}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${form.type === 'PRODUCT' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className={`p-3 rounded-full ${form.type === 'PRODUCT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Box size={24} />
                                    </div>
                                    <span className={`font-bold ${form.type === 'PRODUCT' ? 'text-blue-700' : 'text-slate-500'}`}>Product / Material</span>
                                </div>

                                <div
                                    onClick={() => setForm({ ...form, type: 'SERVICE' })}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${form.type === 'SERVICE' ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className={`p-3 rounded-full ${form.type === 'SERVICE' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Wrench size={24} />
                                    </div>
                                    <span className={`font-bold ${form.type === 'SERVICE' ? 'text-purple-700' : 'text-slate-500'}`}>Service / Repair</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. DETAILS FORM */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                                <Box className="text-blue-600" size={20} />
                                <h3 className="font-bold text-lg text-slate-900">Requirement Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className={labelClass}>Title / Name</label>
                                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder={form.type === 'PRODUCT' ? "e.g. 50 Bags of Cement" : "e.g. Full Home Plumbing"} />
                                </div>

                                <div>
                                    <label className={labelClass}>Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
                                        <option>General</option>
                                        <option>Construction</option>
                                        <option>Electronics</option>
                                        <option>Furniture</option>
                                        <option>Plumbing</option>
                                        <option>Electrical</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Budget Range (Optional)</label>
                                    <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className={inputClass} placeholder="e.g. ₹500 - ₹2000" />
                                </div>

                                {/* PRODUCT ONLY FIELDS */}
                                {form.type === 'PRODUCT' && (
                                    <>
                                        <div>
                                            <label className={labelClass}>Quantity</label>
                                            <input type="number" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className={inputClass} placeholder="0" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Unit</label>
                                            <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className={inputClass}>
                                                <option value="PIECE">Pieces</option>
                                                <option value="KG">Kilograms (KG)</option>
                                                <option value="BOX">Boxes</option>
                                                <option value="LITER">Liters</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="col-span-2">
                                    <label className={labelClass}>Description</label>
                                    <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="Describe your requirement in detail..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - USER & LOCATION */}
                    <div className="space-y-6">

                        {/* 3. USER DETAILS (Read Only) */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                                <User className="text-blue-600" size={20} />
                                <h3 className="font-bold text-lg text-slate-900">Contact Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <User size={18} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Name</p>
                                        <p className="font-medium text-slate-900">{currentUser?.name || "Guest"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Phone size={18} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
                                        <p className="font-medium text-slate-900">{currentUser?.phone || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Mail size={18} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                                        <p className="font-medium text-slate-900 truncate max-w-[180px]">{currentUser?.email || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. LOCATION SELECTION */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                                <MapPin className="text-blue-600" size={20} />
                                <h3 className="font-bold text-lg text-slate-900">Delivery Location</h3>
                            </div>

                            {/* ✅ Safe Check: (currentUser?.addresses?.length ?? 0) > 0 */}
                            {(currentUser?.addresses?.length ?? 0) > 0 ? (
                                <div className="space-y-3">
                                    {/* ✅ Safe Access: currentUser?.addresses?.map */}
                                    {currentUser?.addresses?.map((addr: any) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => setForm({ ...form, addressId: addr.id })}
                                            className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${form.addressId === addr.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-100 hover:border-slate-300'}`}
                                        >
                                            <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.addressId === addr.id ? 'border-blue-500' : 'border-slate-300'}`}>
                                                {form.addressId === addr.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{addr.type}</p>
                                                <p className="text-xs text-slate-500 line-clamp-1">{addr.line1}, {addr.city}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                                    <p className="text-sm text-slate-500 mb-2">No saved addresses.</p>
                                    <button onClick={() => router.push('/profile')} className="text-blue-600 font-bold text-sm hover:underline">Add Address</button>
                                </div>
                            )}
                        </div>

                        {/* 5. PAYMENT MODE */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                                <CreditCard className="text-blue-600" size={20} />
                                <h3 className="font-bold text-lg text-slate-900">Payment Preference</h3>
                            </div>
                            <div className="space-y-3">
                                <div onClick={() => setForm({ ...form, paymentMode: 'CASH' })} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${form.paymentMode === 'CASH' ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-100 hover:border-slate-300'}`}>
                                    <Banknote size={24} className="text-emerald-600" />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-900">Cash / Pay Later</p>
                                        <p className="text-xs text-slate-500">Pay directly to vendor</p>
                                    </div>
                                    {form.paymentMode === 'CASH' && <CheckCircle2 size={18} className="text-emerald-600" />}
                                </div>
                                <div onClick={() => setForm({ ...form, paymentMode: 'ONLINE' })} className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${form.paymentMode === 'ONLINE' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-100 hover:border-slate-300'}`}>
                                    <CreditCard size={24} className="text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-slate-900">Online Payment</p>
                                        <p className="text-xs text-slate-500">UPI, Card, Netbanking</p>
                                    </div>
                                    {form.paymentMode === 'ONLINE' && <CheckCircle2 size={18} className="text-blue-600" />}
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !form.addressId}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Post Requirement <ChevronRight className="group-hover:translate-x-1 transition" /></>}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
}