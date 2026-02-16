'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

// ✅ Imports for the 4 individual steps
import StepOnePersonal from './StepOneProfile';
import StepSocial from './StepSocial'; // New Import
import StepTwoAddress from './StepTwoAddress';
import StepThreeKYC from './StepThreeKYC';

interface Props {
    userId: string;
    existingData?: any;
    showToast: (msg: string, type: 'success' | 'error') => void;
    onBack: () => void;
}

export function VerificationView({
    userId,
    existingData,
    showToast,
    onBack
}: Props) {
    // State to track 4 steps: 1=Personal, 2=Social, 3=Address, 4=KYC
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Central Form State
    const [form, setForm] = useState({
        // --- STEP 1: Personal ---
        fullName: '',
        email: '',
        phone: '',
        gender: 'MALE',
        dob: '',
        preferredLanguage: 'English',
        providerType: 'BOTH',

        // --- STEP 2: Social (Moved here) ---
        instagramUrl: '',
        facebookUrl: '',
        youtubeUrl: '',
        websiteUrl: '',

        // --- STEP 3: Address (Was Step 2) ---
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',

        // Business Address
        shopName: '',
        bizAddressLine1: '',
        bizAddressLine2: '',
        bizCity: '',
        bizState: '',
        bizPincode: '',
        sameAsPersonal: false,

        // --- STEP 4: KYC (Was Step 3) ---
        idProofType: 'Aadhaar',
        idProofNumber: '',
        idProofImg: '',
        gstRegistered: false,
        gstNumber: '',
    });

    // Populate form with existing user data on load
    useEffect(() => {
        if (!existingData) return;
        const kyc = existingData.kycDetails || {};
        const home = existingData.addresses?.find((a: any) => a.type === 'Home');
        const work = existingData.addresses?.find((a: any) => a.type === 'Work');

        setForm(prev => ({
            ...prev,
            fullName: existingData.name || '',
            email: existingData.email || '',
            phone: existingData.phone || '',
            gender: existingData.gender || 'MALE',
            providerType: existingData.providerType || 'BOTH',
            dob: existingData.dob ? new Date(existingData.dob).toISOString().split('T')[0] : '',
            preferredLanguage: existingData.preferredLanguage || 'English',

            instagramUrl: existingData.instagramUrl || '',
            facebookUrl: existingData.facebookUrl || '',
            youtubeUrl: existingData.youtubeUrl || '',
            websiteUrl: existingData.websiteUrl || '',

            addressLine1: home?.line1 || '',
            addressLine2: home?.line2 || '',
            landmark: home?.landmark || '',
            city: home?.city || '',
            state: home?.state || '',
            pincode: home?.pincode || '',

            shopName: existingData.shopName || '',
            bizAddressLine1: work?.line1 || '',
            bizAddressLine2: work?.line2 || '',
            bizCity: work?.city || '',
            bizState: work?.state || '',
            bizPincode: work?.pincode || '',

            idProofType: kyc.idProofType || 'Aadhaar',
            idProofNumber: kyc.idProofNumber || '',
            idProofImg: kyc.idProofFrontImg || '',
            gstRegistered: kyc.gstRegistered || false,
            gstNumber: kyc.gstNumber || '',
        }));
    }, [existingData]);

    const getInputClass = (field: string) =>
        clsx(
            'w-full border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all',
            errors[field] ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
        );

    const updateField = useCallback((field: string, value: any) => {
        setErrors(e => ({ ...e, [field]: '' }));
        setForm(prev => {
            const next = { ...prev, [field]: value };
            // Auto-sync business address logic
            if (prev.sameAsPersonal) {
                if (field === 'addressLine1') next.bizAddressLine1 = value;
                if (field === 'city') next.bizCity = value;
                if (field === 'pincode') next.bizPincode = value;
                if (field === 'state') next.bizState = value;
            }
            return next;
        });
    }, []);

    // Validation Logic
    const validateStep = () => {
        const e: Record<string, string> = {};

        if (step === 1) { // Personal
            if (!form.fullName) e.fullName = 'Required';
            if (!form.phone || form.phone.length < 10) e.phone = '10 digits required';
        }

        // Step 2 is Social (Optional) - No validation needed usually

        if (step === 3) { // Address (previously Step 2)
            if (!form.addressLine1) e.addressLine1 = 'Required';
            if (!form.shopName) e.shopName = 'Required';
            if (!form.bizAddressLine1) e.bizAddressLine1 = 'Required';
        }

        if (step === 4) { // KYC (previously Step 3)
            if (!form.idProofNumber) e.idProofNumber = 'Required';
            if (!form.idProofImg) e.idProofImg = 'Document required';
            if (form.gstRegistered && !form.gstNumber) e.gstNumber = 'Required';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.preventDefault();
        if (!validateStep()) {
            showToast('Please complete required fields', 'error');
            return;
        }
        if (step < 4) {
            setStep(s => (s + 1) as 1 | 2 | 3 | 4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBackStep = () => {
        if (step > 1) {
            setStep(s => (s - 1) as 1 | 2 | 3 | 4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            onBack();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (step !== 4) {
            handleNext();
            return;
        }

        if (!validateStep()) {
            showToast('Please complete KYC details', 'error');
            return;
        }

        setLoading(true);

        try {
            // Update Provider Status if needed
            if (form.providerType !== existingData?.providerType) {
                await fetch('/api/user/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, providerType: form.providerType })
                });
            }

            // Submit Data
            const res = await fetch('/api/provider/update-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...form }),
            });

            const data = await res.json();

            if (data.success) {
                showToast('Profile submitted for verification', 'success');
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

    const getHeaderInfo = () => {
        if (step === 1) return { title: 'Profile Details', sub: 'Basic contact information' };
        if (step === 2) return { title: 'Social Profiles', sub: 'Connect your online presence' }; // New Header
        if (step === 3) return { title: 'Business Address', sub: 'Location and shop details' };
        return { title: 'KYC Documents', sub: 'Upload identity proof' };
    };

    // Calculate progress percentage for 4 steps (0, 33, 66, 100)
    const progressPercent = step === 1 ? '0%' : step === 2 ? '33%' : step === 3 ? '66%' : '100%';

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* --- WIZARD STEPPER UI --- */}
            <div className="flex flex-col items-center">
                <div className="relative w-full max-w-sm mb-6 mt-4">
                    {/* Background Line */}
                    <div className="absolute top-1/2 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />

                    {/* Active Progress Line */}
                    <div
                        className="absolute top-1/2 h-1 bg-slate-900 transition-all duration-500 rounded-full"
                        style={{ width: progressPercent }}
                    />

                    {/* Step Circles */}
                    <div className="relative flex justify-between">
                        {[1, 2, 3, 4].map(s => (
                            <div
                                key={s}
                                className={clsx(
                                    'w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-white z-10 transition-colors duration-300',
                                    step >= s ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-300'
                                )}
                            >
                                {step > s ? <Check size={18} /> : s}
                            </div>
                        ))}
                    </div>
                </div>

                <h2 className="text-2xl font-black text-slate-900">{getHeaderInfo().title}</h2>
                <p className="text-slate-500 text-sm mt-1">{getHeaderInfo().sub}</p>
            </div>

            {/* --- FORM CONTENT --- */}
            <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                    // Prevent accidental submission on Steps 1, 2 & 3
                    if (e.key === 'Enter' && step !== 4) {
                        e.preventDefault();
                    }
                }}
                className="space-y-6"
            >
                {step === 1 && (
                    <StepOnePersonal
                        form={form}
                        updateField={updateField}
                        errors={errors}
                        getInputClass={getInputClass}
                    />
                )}

                {step === 2 && (
                    <StepSocial
                        form={form}
                        updateField={updateField}
                        getInputClass={getInputClass}
                    />
                )}

                {step === 3 && (
                    <StepTwoAddress
                        form={form}
                        updateField={updateField}
                        setForm={setForm}
                        getInputClass={getInputClass}
                    />
                )}

                {step === 4 && (
                    <StepThreeKYC
                        form={form}
                        updateField={updateField}
                        showToast={showToast}
                        errors={errors}
                        getInputClass={getInputClass}
                    />
                )}

                {/* --- NAVIGATION BUTTONS --- */}
                <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleBackStep}
                        className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                        {step === 1 ? 'Cancel' : <><ArrowLeft size={18} /> Back</>}
                    </button>

                    {step < 4 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                        >
                            Next Step <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-lg shadow-emerald-200"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Check size={18} /> Submit Verification</>}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}