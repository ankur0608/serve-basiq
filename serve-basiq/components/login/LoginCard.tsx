'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaGoogle, FaMobileScreen, FaSpinner } from 'react-icons/fa6';
import clsx from 'clsx';
import { useUIStore } from "@/lib/store";

export default function LoginCard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [isPhoneLoading, setIsPhoneLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Global store to open OTP modal
    const onOpenOtp = useUIStore((state) => state.onOpenOtp);

    // --- Handlers ---

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numbers
        const value = e.target.value.replace(/\D/g, '');
        setPhone(value);
        if (phoneError) setPhoneError("");
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isGoogleLoading || isPhoneLoading) return;

        // Basic Validation
        if (!phone || phone.length < 10) {
            setPhoneError("Enter valid 10-digit number");
            return;
        }

        setIsPhoneLoading(true);
        setPhoneError("");

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });

            const data = await res.json();

            if (!res.ok) {
                setPhoneError(data.error || "Failed to send OTP");
                return;
            }

            // Success: Open OTP Modal
            onOpenOtp(phone, data.otp);

        } catch (err) {
            setPhoneError("Something went wrong. Please try again.");
        } finally {
            setIsPhoneLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (isPhoneLoading || isGoogleLoading) return;

        setIsGoogleLoading(true);
        try {
            await signIn("google", { callbackUrl });
        } catch (error) {
            console.error("Google Login Failed", error);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">

            <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
                <p className="text-sm text-gray-500 mt-2">Log in to continue your booking.</p>
            </div>

            {/* --- PHONE FORM --- */}
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">
                        Mobile Number
                    </label>
                    <div className="relative group flex items-center">
                        <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center border-r border-gray-200 bg-gray-50 rounded-l-xl text-sm font-bold text-slate-600">
                            +91
                        </div>
                        <FaMobileScreen className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="tel"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Your Number"
                            maxLength={10}
                            disabled={isGoogleLoading || isPhoneLoading}
                            className={clsx(
                                "w-full pl-16 pr-10 py-3.5 bg-white border rounded-xl outline-none font-bold text-lg text-slate-900 placeholder-gray-300 tracking-wide transition-all",
                                phoneError
                                    ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
                                    : "border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10",
                                (isGoogleLoading || isPhoneLoading) && "opacity-50 cursor-not-allowed bg-gray-50"
                            )}
                        />
                    </div>
                    {phoneError && (
                        <p className="text-red-500 text-xs font-bold mt-2 ml-1 animate-pulse">
                            {phoneError}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isGoogleLoading || isPhoneLoading}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                >
                    {isPhoneLoading ? <FaSpinner className="animate-spin" /> : "Get OTP"}
                </button>
            </form>

            {/* --- DIVIDER --- */}
            <div className="relative flex items-center justify-center py-6">
                <div className="border-t border-gray-100 w-full absolute" />
                <span className="bg-white px-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider relative z-10">
                    Or continue with
                </span>
            </div>

            {/* --- GOOGLE BUTTON --- */}
            <button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isPhoneLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-slate-700 transition-all active:scale-95 disabled:opacity-50"
            >
                {isGoogleLoading ? (
                    <FaSpinner className="animate-spin text-red-500" />
                ) : (
                    <FaGoogle className="text-xl text-red-500" />
                )}
                <span>Google</span>
            </button>
        </div>
    );
}