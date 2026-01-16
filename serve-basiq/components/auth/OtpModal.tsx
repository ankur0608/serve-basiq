"use client";

import { useState, useEffect, useRef } from "react";
import { FaXmark, FaArrowLeft, FaSpinner } from "react-icons/fa6";
import clsx from "clsx";
import { useUIStore } from "@/lib/store";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface OtpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OtpModal({ isOpen, onClose }: OtpModalProps) {
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const mobileNumber = useUIStore((state) => state.mobileNumber);
    const devOtp = useUIStore((state) => state.devOtp);
    const onOpenLogin = useUIStore((state) => state.onOpenLogin);
    const onCloseOtp = useUIStore((state) => state.onCloseOtp);
    const setCurrentUser = useUIStore((state) => state.setCurrentUser);

    // OTP state
    const [otp, setOtp] = useState(["", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    /* ---------------- Modal animation & scroll lock ---------------- */
    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
            document.body.style.overflow = "hidden";
            if (!mobileNumber) {
                console.error("❌ Mobile number is missing in OtpModal!");
            }
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        } else {
            const timer = setTimeout(() => setShowModal(false), 300);
            document.body.style.overflow = "unset";
            setOtp(["", "", "", ""]);
            return () => clearTimeout(timer);
        }
    }, [isOpen, mobileNumber]);

    /* ---------------- DEV: Auto-fill OTP ---------------- */
    useEffect(() => {
        if (isOpen && devOtp && devOtp.length === 4) {
            setOtp(devOtp.split(""));
            setTimeout(() => inputRefs.current[3]?.focus(), 150);
        }
    }, [devOtp, isOpen]);

    /* ---------------- Input handlers ---------------- */
    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    /* ---------------- Verify OTP ---------------- */
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validation
        const code = otp.join("");
        if (code.length !== 4) return;
        if (!mobileNumber) {
            alert("Error: Mobile number not found. Please try logging in again.");
            onClose();
            return;
        }

        setIsLoading(true);

        try {
            // 2. ✅ UPDATED: Call the Login Verification API (No userId required)
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: mobileNumber,
                    otp: code,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Invalid OTP");
            }

            const user = await res.json();

            // 3. Create NextAuth Session
            const signInResult = await signIn("credentials", {
                phone: mobileNumber,
                redirect: false,
            });

            if (signInResult?.error) {
                throw new Error(signInResult.error);
            }

            // 4. Success State
            console.log("✅ Login Successful:", user);
            setCurrentUser(user);
            onCloseOtp();
            router.refresh();

        } catch (error: any) {
            console.error("Verification failed", error);
            alert(error.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen && !showModal) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div
                    className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")}
                    onClick={onClose}
                />

                <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

                    <button onClick={onOpenLogin} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10">
                        <FaArrowLeft className="text-lg" />
                    </button>

                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10">
                        <FaXmark className="text-lg" />
                    </button>

                    <div className="p-8">
                        <div className="text-center mb-8 mt-4">
                            <h2 className="text-2xl font-extrabold text-slate-900">Verify OTP</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Code sent to <span className="font-bold text-slate-900">+91 {mobileNumber}</span>
                            </p>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-8">
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="tel"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-14 h-16 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition flex items-center justify-center gap-2"
                            >
                                {isLoading ? <FaSpinner className="animate-spin" /> : "Verify & Continue"}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-medium">
                            Didn’t receive code? <button className="text-slate-900 font-bold hover:underline">Resend in 30s</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}