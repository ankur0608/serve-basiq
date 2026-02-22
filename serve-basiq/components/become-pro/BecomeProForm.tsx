'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Check, Loader2, AlertTriangle, Smartphone } from 'lucide-react';
import { useProviderOnboarding } from "@/app/hook/useProviderOnboarding";
import MobileVerificationModal from "@/components/auth/MobileVerificationModal";

// Adjust these imports based on where you place this new file
import ProfileSection from "./ProfileSection";
import PersonalDetails from "./PersonalDetails";
import AddressDetails from "./AddressDetails";

export default function BecomeProForm() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isPhoneModalOpen, setPhoneModalOpen] = useState(false);

    const {
        form, loading, uploading, gettingLoc, imgPreview, errors,
        handleChange, handleGetLocation, handleImageUpload, handleSubmit
    } = useProviderOnboarding();

    useEffect(() => {
        if (!session?.user) return;

        if (session.user.email && !form.email) {
            handleChange('email', session.user.email);
        }
        if (session.user.name && !form.fullName) {
            handleChange('fullName', session.user.name);
        }
        if (session.user.phone && !form.altPhone) {
            handleChange('altPhone', session.user.phone);
        }
    }, [session, form.email, form.fullName, form.altPhone, handleChange]);

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isCurrentPhoneVerified = session?.user?.isPhoneVerified && (session.user.phone === form.altPhone);

        if (!isCurrentPhoneVerified) {
            setPhoneModalOpen(true);
            return;
        }
        handleSubmit(e);
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    const isReadyToSubmit = session?.user?.isPhoneVerified && (session.user.phone === form.altPhone);

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 animate-in fade-in duration-500">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Partner Registration</h1>
                        <p className="text-slate-500 text-sm">Fill in your details to start earning.</p>
                    </div>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                    <ProfileSection
                        imgPreview={imgPreview}
                        uploading={uploading}
                        error={errors.profileImage}
                        onUpload={handleImageUpload}
                    />

                    <PersonalDetails
                        form={form}
                        errors={errors}
                        onChange={handleChange}
                        session={session}
                        onVerifyStart={() => setPhoneModalOpen(true)}
                    />

                    <AddressDetails
                        form={form}
                        errors={errors}
                        onChange={handleChange}
                        onGetLocation={handleGetLocation}
                        gettingLoc={gettingLoc}
                    />
{/* 
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                            <AlertTriangle size={20} className="shrink-0" />
                            <span>Please fix the highlighted errors before submitting.</span>
                        </div>
                    )} */}

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                {isReadyToSubmit ? (
                                    <>Complete Registration <Check /></>
                                ) : (
                                    <>Verify Phone to Continue <Smartphone size={18} /></>
                                )}
                            </>
                        )}
                    </button>
                </form>
            </div>

            {session?.user?.id && (
                <MobileVerificationModal
                    userId={session.user.id}
                    isOpen={isPhoneModalOpen}
                    onClose={() => setPhoneModalOpen(false)}
                    onSuccess={() => {
                        setPhoneModalOpen(false);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}