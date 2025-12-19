"use client";

import { useState, useEffect, useRef } from "react";
import { FaXmark, FaArrowLeft } from "react-icons/fa6";
import clsx from "clsx";
import { useUIStore } from "@/lib/store";

interface OtpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OtpModal({ isOpen, onClose }: OtpModalProps) {
    const [showModal, setShowModal] = useState(false);
    const mobileNumber = useUIStore((state) => state.mobileNumber);
    const onOpenLogin = useUIStore((state) => state.onOpenLogin);

    // OTP Logic
    const [otp, setOtp] = useState(["", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const onCloseOtp = useUIStore((state) => state.onCloseOtp);

    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
            document.body.style.overflow = "hidden";
            // Auto focus first input
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } else {
            const timer = setTimeout(() => setShowModal(false), 300);
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move to next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Backspace logic
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();

        // OPTIONAL: validate OTP length
        if (otp.some((d) => d === "")) return;

        // ✅ CLOSE OTP MODAL
        onCloseOtp();

        // OPTIONAL (later):
        // mark user logged in
    };

    if (!isOpen && !showModal) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose} />

                <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

                    <button onClick={onOpenLogin} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors">
                        <FaArrowLeft className="text-lg" />
                    </button>

                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors">
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
                                        ref={(el) => { inputRefs.current[index] = el }}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-14 h-16 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200">
                                Verify & Continue
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-medium">
                            Didn't receive code? <button className="text-slate-900 font-bold hover:underline">Resend in 30s</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}