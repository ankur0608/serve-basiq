'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import StepOneProfile from './StepOneProfile';
import StepTwoBanking from './StepTwoBanking';
import StepThreeKYC from './StepThreeKYC';

interface Props {
    userId: string;
    existingData?: any;
    showToast: (msg: string, type: 'success' | 'error') => void;
    onBack: () => void;
}

export function VerificationView({ userId, existingData, showToast, onBack }: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        fullName: '', email: '', phone: '', gender: 'MALE', dob: '', preferredLanguage: 'English',
        addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '',
        shopName: '', bizAddressLine1: '', bizAddressLine2: '', bizCity: '', bizState: '', bizPincode: '',
        sameAsPersonal: false,
        bankAccountHolder: '', bankAccountNumber: '', bankIfsc: '', bankName: '', upiId: '', preferredPayoutMethod: 'BANK',
        idProofType: 'Aadhaar', idProofNumber: '', idProofFrontImg: '', idProofBackImg: '', businessProofImg: '',
        gstRegistered: false, gstNumber: '',
    });

    useEffect(() => {
        if (!existingData) return;

        const userData = existingData;
        const home = userData.addresses?.find((a: any) => a.type === 'Home');
        const work = userData.addresses?.find((a: any) => a.type === 'Work');
        const kyc = userData.kycDetails;     // 🔥 ONLY correct source

        console.log("🧾 Loaded KYC:", kyc);

        setForm(prev => ({
            ...prev,

            // Step 1
            fullName: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            gender: userData.gender || 'MALE',
            dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
            preferredLanguage: userData.preferredLanguage || 'English',
            shopName: userData.shopName || '',

            // Home
            addressLine1: home?.line1 || '',
            addressLine2: home?.line2 || '',
            landmark: home?.landmark || '',
            city: home?.city || '',
            state: home?.state || '',
            pincode: home?.pincode || '',

            // Work
            bizAddressLine1: work?.line1 || '',
            bizAddressLine2: work?.line2 || '',
            bizCity: work?.city || '',
            bizState: work?.state || '',
            bizPincode: work?.pincode || '',

            // Banking
            bankAccountHolder: userData.bankAccountHolder || '',
            bankAccountNumber: userData.bankAccountNumber || '',
            bankIfsc: userData.bankIfsc || '',
            bankName: userData.bankName || '',
            upiId: userData.upiId || '',
            preferredPayoutMethod: userData.preferredPayoutMethod || 'BANK',

            // 🔥 Step-3 (THIS WAS MISSING)
            idProofType: kyc?.idProofType || 'Aadhaar',
            idProofNumber: kyc?.idProofNumber || '',
            idProofFrontImg: kyc?.idProofFrontImg || '',
            idProofBackImg: kyc?.idProofBackImg || '',
            businessProofImg: kyc?.businessProofImg || '',
            gstRegistered: Boolean(kyc?.gstRegistered),
            gstNumber: kyc?.gstNumber || '',
        }));
    }, [existingData]);


    const getInputClass = (field: string) => clsx(
        'w-full border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all',
        errors[field] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
    );

    const updateField = useCallback((field: string, value: any) => {
        setErrors((e) => ({ ...e, [field]: '' }));
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (prev.sameAsPersonal) {
                if (field === 'addressLine1') next.bizAddressLine1 = value;
                if (field === 'city') next.bizCity = value;
                if (field === 'pincode') next.bizPincode = value;
            }
            return next;
        });
    }, []);

    const validateStep = () => {
        const e: Record<string, string> = {};
        if (step === 1) {
            if (!form.fullName) e.fullName = 'Required';
            if (!form.phone || form.phone.length < 10) e.phone = '10 digits required';
            if (!form.shopName) e.shopName = 'Required';
            if (!form.addressLine1) e.addressLine1 = 'Required';
        }
        if (step === 2) {
            if (!form.bankAccountNumber) e.bankAccountNumber = 'Required';
            if (!form.bankIfsc) e.bankIfsc = 'Required';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (!validateStep()) {
            showToast('Please complete required fields', 'error');
            return;
        }
        setStep((s) => (s + 1) as any);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.idProofFrontImg || !form.idProofBackImg) {
            showToast('Upload both sides of ID', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/provider/update-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...form }),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Verification submitted successfully', 'success');
                onBack();
            } else {
                showToast(data.error || 'Submission failed', 'error');
            }
        } catch {
            showToast('Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Stepper UI */}
            <div className="flex flex-col items-center">
                <div className="relative w-full max-w-sm mb-6 mt-4">
                    <div className="absolute top-1/2 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                    <div className="absolute top-1/2 h-1 bg-slate-900 transition-all duration-500 ease-out rounded-full" style={{ width: `${(step - 1) * 50}%` }} />
                    <div className="relative flex justify-between">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ring-4 ring-white z-10 transition-all duration-300",
                                step >= s ? "bg-[#0f172a] text-white" : "bg-white border border-slate-200 text-slate-400"
                            )}>
                                {step > s ? <Check size={18} /> : s}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {step === 1 ? "Profile Details" : step === 2 ? "Payout Info" : "Identity Documents"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {step === 1 ? "Verify your contact and business location" : step === 2 ? "Set up your bank account for payouts" : "Upload government-issued documents"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && <StepOneProfile form={form} setForm={setForm} updateField={updateField} errors={errors} getInputClass={getInputClass} />}
                {step === 2 && <StepTwoBanking form={form} updateField={updateField} errors={errors} getInputClass={getInputClass} />}
                {step === 3 && <StepThreeKYC form={form} updateField={updateField} showToast={showToast} errors={errors} getInputClass={getInputClass} />}

                <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                    <button type="button" onClick={() => step > 1 ? setStep((step - 1) as any) : onBack()} className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        {step === 1 ? 'Cancel' : <><ArrowLeft size={18} /> Back</>}
                    </button>
                    {step < 3 ? (
                        <button type="button" onClick={handleNext} className="px-8 py-3 bg-[#0f172a] text-white font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                            Next Step <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100 disabled:opacity-60">
                            {loading ? <Loader2 className="animate-spin" /> : <><Check size={18} /> Submit Verification</>}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}