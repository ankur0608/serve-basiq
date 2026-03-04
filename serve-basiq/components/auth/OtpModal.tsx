"use client";

import { useState, useEffect, useRef } from "react";
import { FaXmark, FaArrowLeft, FaSpinner } from "react-icons/fa6";
import { AlertCircle, ShieldAlert } from "lucide-react";
import clsx from "clsx";
import { useUIStore } from "@/lib/store";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // ✅ Added toast

interface OtpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OtpModal({ isOpen, onClose }: OtpModalProps) {
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false); // ✅ Resend loading state

    // Enhanced Error State
    const [errorMsg, setErrorMsg] = useState<{ 
        text: string, 
        type: 'RATE_LIMIT' | 'INVALID' | null,
        lockedUntil?: Date | null 
    }>({ text: "", type: null, lockedUntil: null });

    const [lockCountdown, setLockCountdown] = useState(0);
    const [resendCountdown, setResendCountdown] = useState(60); // ✅ 60-second timer

    const router = useRouter();

    // Store Data
    const mobileNumber = useUIStore((state) => state.mobileNumber);
    const devOtp = useUIStore((state) => state.devOtp);
    const loginIntent = useUIStore((state) => state.loginIntent);
    const isNewUser = useUIStore((state) => state.isNewUser);

    // Store Actions
    const onOpenLogin = useUIStore((state) => state.onOpenLogin);
    const onCloseOtp = useUIStore((state) => state.onCloseOtp);
    const onOpenName = useUIStore((state) => state.onOpenName);
    const setCurrentUser = useUIStore((state) => state.setCurrentUser);

    // OTP State
    const [otp, setOtp] = useState(["", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // ✅ Handle Resend Countdown Timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCountdown > 0 && isOpen) {
            timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCountdown, isOpen]);

    // Handle Lockout Countdown Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (errorMsg.type === 'RATE_LIMIT' && errorMsg.lockedUntil) {
            interval = setInterval(() => {
                const now = new Date().getTime();
                const unlockTime = new Date(errorMsg.lockedUntil!).getTime();
                const diff = unlockTime - now;

                if (diff <= 0) {
                    setErrorMsg({ text: "", type: null, lockedUntil: null });
                    setLockCountdown(0);
                    clearInterval(interval);
                    setTimeout(() => inputRefs.current[0]?.focus(), 100);
                } else {
                    setLockCountdown(Math.ceil(diff / 1000));
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [errorMsg]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
            setErrorMsg({ text: "", type: null, lockedUntil: null });
            setResendCountdown(60); // ✅ Reset timer on open
            document.body.style.overflow = "hidden";

            if (devOtp) {
                const otpString = String(devOtp);
                if (otpString.length === 4) {
                    setOtp(otpString.split(""));
                    setTimeout(() => inputRefs.current[3]?.focus(), 100);
                }
            } else {
                setOtp(["", "", "", ""]);
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            }
        } else {
            const timer = setTimeout(() => setShowModal(false), 300);
            document.body.style.overflow = "unset";
            setOtp(["", "", "", ""]);
            return () => clearTimeout(timer);
        }
    }, [isOpen, devOtp]);

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

    // ✅ Handle Resend OTP Logic
    const handleResendOtp = async () => {
        if (resendCountdown > 0 || isResending) return;

        setIsResending(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: mobileNumber }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to resend OTP");
                return;
            }

            setResendCountdown(60); // Restart 1-minute timer
            toast.success("OTP resent successfully!");
            setOtp(["", "", "", ""]);
            inputRefs.current[0]?.focus();

        } catch (error) {
            toast.error("Something went wrong. Try again.");
        } finally {
            setIsResending(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== 4) return;

        setIsLoading(true);
        setErrorMsg({ text: "", type: null, lockedUntil: null });

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: mobileNumber,
                    otp: code,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // ✅ Catch 409 Conflict (Already registered)
                if (res.status === 409) {
                    toast.error("This phone number is already registered to another account.");
                    setOtp(["", "", "", ""]);
                    inputRefs.current[0]?.focus();
                    setIsLoading(false);
                    return;
                }

                if (res.status === 429 || data.isLocked) {
                    setErrorMsg({ 
                        text: data.error || "Too many attempts. Please try again later.", 
                        type: 'RATE_LIMIT',
                        lockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : null
                    });
                    setOtp(["", "", "", ""]);
                    inputRefs.current[0]?.blur();
                    return;
                } else {
                    setErrorMsg({ 
                        text: data.error || `Invalid OTP. You have ${data.attemptsLeft} attempts left.`, 
                        type: 'INVALID' 
                    });
                    setOtp(["", "", "", ""]);
                    return;
                }
            }

            const signInResult = await signIn("credentials", {
                phone: mobileNumber,
                redirect: false,
            });

            if (signInResult?.error) throw new Error(signInResult.error);

            setCurrentUser(data);
            onCloseOtp();

            if (isNewUser) {
                onOpenName();
                return;
            }

            if (loginIntent === 'provider') {
                if (data.providerType) {
                    router.push('/provider/dashboard');
                } else {
                    router.push('/become-pro');
                }
            } else {
                router.refresh();
            }

        } catch (error: any) {
            console.error("Verification failed", error);
            setErrorMsg({ text: "Something went wrong on our end.", type: 'INVALID' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismissError = () => {
        const type = errorMsg.type;
        // Do not allow dismissing if it's a rate limit lock
        if (type === 'RATE_LIMIT') return; 

        setErrorMsg({ text: "", type: null, lockedUntil: null });
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    };

    if (!isOpen && !showModal) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose} />

                <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300 overflow-hidden", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

                    <button onClick={onOpenLogin} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors"><FaArrowLeft className="text-lg" /></button>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors"><FaXmark className="text-lg" /></button>

                    {/* Enhanced Error Modal Overlay */}
                    {errorMsg.type && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-white/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                            <div className={clsx(
                                "flex items-center justify-center w-20 h-20 rounded-full mb-6",
                                errorMsg.type === 'RATE_LIMIT' ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"
                            )}>
                                {errorMsg.type === 'RATE_LIMIT' ? <ShieldAlert size={40} /> : <AlertCircle size={40} />}
                            </div>

                            <h3 className="text-2xl font-extrabold text-slate-900 mb-2 text-center">
                                {errorMsg.type === 'RATE_LIMIT' ? "Rate Limited" : "Verification Failed"}
                            </h3>

                            <p className="text-gray-500 text-center mb-6 px-4">
                                {errorMsg.text}
                            </p>

                            {errorMsg.type === 'RATE_LIMIT' && lockCountdown > 0 && (
                                <div className="mb-8 bg-orange-50 border border-orange-200 text-orange-700 px-6 py-3 rounded-xl font-mono text-xl font-bold">
                                    {formatTime(lockCountdown)}
                                </div>
                            )}

                            <button
                                onClick={handleDismissError}
                                disabled={errorMsg.type === 'RATE_LIMIT'}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {errorMsg.type === 'RATE_LIMIT' ? "Please Wait" : "Try Again"}
                            </button>
                        </div>
                    )}

                    <div className="p-8">
                        <div className="text-center mb-8 mt-4">
                            <h2 className="text-2xl font-extrabold text-slate-900">Verify OTP</h2>
                            <p className="text-sm text-gray-500 mt-2">Code sent to <span className="font-bold text-slate-900">+91 {mobileNumber}</span></p>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-8">
                            <div className="flex justify-center gap-3 relative">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="tel"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        disabled={isLoading || errorMsg.type !== null}
                                        className={clsx(
                                            "w-14 h-16 rounded-xl border-2 text-center text-2xl font-bold outline-none transition-all",
                                            "border-gray-200 text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10",
                                            (isLoading || errorMsg.type !== null) && "opacity-50 cursor-not-allowed"
                                        )}
                                    />
                                ))}
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || errorMsg.type !== null || otp.join("").length !== 4}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <FaSpinner className="animate-spin" /> : "Verify & Login"}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-medium space-y-2">
                            {/* ✅ Updated Resend Button */}
                            <div>
                                Didn’t receive code?{" "}
                                <button 
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={errorMsg.type === 'RATE_LIMIT' || resendCountdown > 0 || isResending} 
                                    className={clsx(
                                        "font-bold transition-colors",
                                        (resendCountdown > 0 || errorMsg.type === 'RATE_LIMIT') ? "text-gray-400 cursor-not-allowed" : "text-slate-900 hover:underline"
                                    )}
                                >
                                    {isResending ? "Sending..." : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Now"}
                                </button>
                            </div>
                            {devOtp && <div className="text-xs text-green-600 bg-green-50 py-1 px-2 rounded inline-block border border-green-200 mt-4">Dev Mode OTP: <b>{devOtp}</b></div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { FaXmark, FaArrowLeft, FaSpinner, FaTriangleExclamation, FaClock } from "react-icons/fa6";
// import clsx from "clsx";
// import { useUIStore } from "@/lib/store";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast"; // ✅ Added for Toast notifications

// interface OtpModalProps {
//     isOpen: boolean;
//     onClose: () => void;
// }

// export default function OtpModal({ isOpen, onClose }: OtpModalProps) {
//     const [showModal, setShowModal] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [isResending, setIsResending] = useState(false); // ✅ Track resend loading state
//     const router = useRouter();

//     // Store Data
//     const mobileNumber = useUIStore((state) => state.mobileNumber);
//     const initialVerificationId = useUIStore((state) => state.verificationId);
//     const loginIntent = useUIStore((state) => state.loginIntent);
//     const isNewUser = useUIStore((state) => state.isNewUser);

//     // ✅ Local Verification ID (Updates when user clicks Resend)
//     const [activeVerificationId, setActiveVerificationId] = useState(initialVerificationId);

//     // Store Actions
//     const onOpenLogin = useUIStore((state) => state.onOpenLogin);
//     const onCloseOtp = useUIStore((state) => state.onCloseOtp);
//     const onOpenName = useUIStore((state) => state.onOpenName);
//     const setCurrentUser = useUIStore((state) => state.setCurrentUser);

//     // OTP & Error States
//     const [otp, setOtp] = useState(["", "", "", ""]);
//     const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//     const [errorState, setErrorState] = useState({
//         show: false,
//         title: "",
//         message: "",
//         isLocked: false,
//         lockedUntil: null as Date | null,
//     });

//     const [lockCountdown, setLockCountdown] = useState(0);
//     const [resendCountdown, setResendCountdown] = useState(60); // ✅ 1-Minute Resend Timer

//     // Handle Modal Mount/Unmount & Initialize Data
//     useEffect(() => {
//         if (isOpen) {
//             setShowModal(true);
//             setActiveVerificationId(initialVerificationId);
//             setResendCountdown(60); // Reset timer to 60s on open
//             document.body.style.overflow = "hidden";
//             setTimeout(() => inputRefs.current[0]?.focus(), 100);
//         } else {
//             const timer = setTimeout(() => setShowModal(false), 300);
//             document.body.style.overflow = "unset";
//             setOtp(["", "", "", ""]);
//             setErrorState({ show: false, title: "", message: "", isLocked: false, lockedUntil: null });
//             return () => clearTimeout(timer);
//         }
//     }, [isOpen, initialVerificationId]);

//     // ✅ Handle Resend Countdown Timer
//     useEffect(() => {
//         let timer: NodeJS.Timeout;
//         if (resendCountdown > 0 && isOpen) {
//             timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
//         }
//         return () => clearTimeout(timer);
//     }, [resendCountdown, isOpen]);

//     // Handle Lockout Countdown Timer
//     useEffect(() => {
//         let interval: NodeJS.Timeout;
//         if (errorState.isLocked && errorState.lockedUntil) {
//             interval = setInterval(() => {
//                 const now = new Date().getTime();
//                 const unlockTime = new Date(errorState.lockedUntil!).getTime();
//                 const diff = unlockTime - now;

//                 if (diff <= 0) {
//                     setErrorState({ show: false, title: "", message: "", isLocked: false, lockedUntil: null });
//                     setLockCountdown(0);
//                     clearInterval(interval);
//                 } else {
//                     setLockCountdown(Math.ceil(diff / 1000));
//                 }
//             }, 1000);
//         }
//         return () => clearInterval(interval);
//     }, [errorState.isLocked, errorState.lockedUntil]);

//     const formatTime = (seconds: number) => {
//         const m = Math.floor(seconds / 60);
//         const s = seconds % 60;
//         return `${m}:${s < 10 ? '0' : ''}${s}`;
//     };

//     const handleChange = (index: number, value: string) => {
//         if (isNaN(Number(value))) return;
//         const newOtp = [...otp];
//         newOtp[index] = value;
//         setOtp(newOtp);

//         // Auto-hide minor errors when user starts typing again
//         if (errorState.show && !errorState.isLocked) {
//             setErrorState(prev => ({ ...prev, show: false }));
//         }

//         if (value && index < 3) {
//             inputRefs.current[index + 1]?.focus();
//         }
//     };

//     const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
//         if (e.key === "Backspace" && !otp[index] && index > 0) {
//             inputRefs.current[index - 1]?.focus();
//         }
//     };

//     // ✅ Handle Resend OTP Action
//     const handleResendOtp = async () => {
//         if (resendCountdown > 0 || isResending) return;

//         setIsResending(true);
//         try {
//             const res = await fetch("/api/auth/send-otp", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ phone: mobileNumber }),
//             });

//             const data = await res.json();

//             if (!res.ok) {
//                 toast.error(data.error || "Failed to resend OTP");
//                 return;
//             }

//             // Update local verification ID with the new one from MessageCentral
//             setActiveVerificationId(data.verificationId);
//             setResendCountdown(60); // Restart 1-minute timer
//             toast.success("OTP sent successfully!");
//             setOtp(["", "", "", ""]);
//             inputRefs.current[0]?.focus();

//         } catch (error) {
//             toast.error("Something went wrong. Try again.");
//         } finally {
//             setIsResending(false);
//         }
//     };

//     const handleVerify = async (e: React.FormEvent) => {
//         e.preventDefault();
//         const code = otp.join("");
//         if (code.length !== 4) return;

//         if (!activeVerificationId) {
//             setErrorState({ show: true, title: "Session Expired", message: "Please request a new OTP.", isLocked: false, lockedUntil: null });
//             return;
//         }

//         setIsLoading(true);

//         try {
//             const res = await fetch("/api/auth/verify-otp", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     phone: mobileNumber,
//                     otp: code,
//                     verificationId: activeVerificationId // ✅ Use the active ID (handles resends)
//                 }),
//             });

//             const data = await res.json();

//             if (!res.ok) {
//                 // ✅ Handle Scenario A Conflict (Phone already registered to someone else)
//                 if (res.status === 409) {
//                     toast.error("This phone number is already registered to another account.");
//                     setOtp(["", "", "", ""]);
//                     inputRefs.current[0]?.focus();
//                     setIsLoading(false);
//                     return;
//                 }

//                 // Handle Rate Limit & Validation Errors
//                 if (res.status === 429 || data.isLocked) {
//                     setErrorState({
//                         show: true,
//                         title: "Temporarily Locked",
//                         message: "Too many failed attempts to protect your account.",
//                         isLocked: true,
//                         lockedUntil: new Date(data.lockedUntil)
//                     });
//                 } else {
//                     setErrorState({
//                         show: true,
//                         title: "Incorrect OTP",
//                         message: `The code is invalid. You have ${data.attemptsLeft} attempts left.`,
//                         isLocked: false,
//                         lockedUntil: null
//                     });
//                     setOtp(["", "", "", ""]);
//                     inputRefs.current[0]?.focus();
//                 }
//                 throw new Error(data.error || "Verification failed");
//             }

//             // Success Flow
//             const signInResult = await signIn("credentials", {
//                 phone: mobileNumber,
//                 redirect: false,
//             });

//             if (signInResult?.error) throw new Error(signInResult.error);

//             setCurrentUser(data);
//             onCloseOtp();

//             if (isNewUser) {
//                 onOpenName();
//                 return;
//             }

//             if (loginIntent === 'provider') {
//                 if (data.providerType) {
//                     router.push('/provider/dashboard');
//                 } else {
//                     router.push('/become-pro');
//                 }
//             } else {
//                 router.refresh();
//             }

//         } catch (error: any) {
//             console.error("Verification failed", error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (!isOpen && !showModal) return null;

//     return (
//         <div className="fixed inset-0 z-[100] overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4 text-center">
//                 <div className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose} />
//                 <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300 overflow-hidden", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

//                     <button onClick={onOpenLogin} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors"><FaArrowLeft className="text-lg" /></button>
//                     <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors"><FaXmark className="text-lg" /></button>

//                     <div className="p-8">
//                         <div className="text-center mb-8 mt-4">
//                             <h2 className="text-2xl font-extrabold text-slate-900">Verify OTP</h2>
//                             <p className="text-sm text-gray-500 mt-2">Code sent to <span className="font-bold text-slate-900">+91 {mobileNumber}</span></p>
//                         </div>

//                         {/* BEAUTIFUL ERROR NOTIFICATION */}
//                         <div className={clsx("transition-all duration-300 overflow-hidden rounded-xl mb-6", errorState.show ? "h-auto opacity-100" : "h-0 opacity-0")}>
//                             {errorState.show && (
//                                 <div className={clsx("p-4 flex items-start gap-3 border", errorState.isLocked ? "bg-red-50 border-red-200 text-red-800" : "bg-orange-50 border-orange-200 text-orange-800")}>
//                                     {errorState.isLocked ? <FaClock className="text-xl mt-0.5" /> : <FaTriangleExclamation className="text-xl mt-0.5" />}
//                                     <div className="flex-1">
//                                         <h4 className="font-bold text-sm">{errorState.title}</h4>
//                                         <p className="text-xs mt-1 opacity-90">{errorState.message}</p>
//                                         {errorState.isLocked && (
//                                             <div className="mt-3 bg-white/60 rounded px-3 py-2 inline-block font-mono font-bold text-red-600 text-lg border border-red-100">
//                                                 Try again in {formatTime(lockCountdown)}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         <form onSubmit={handleVerify} className="space-y-8">
//                             <div className="flex justify-center gap-3 relative">
//                                 {/* Disabled Overlay if Locked */}
//                                 {errorState.isLocked && <div className="absolute inset-0 z-10 bg-white/50 cursor-not-allowed"></div>}

//                                 {otp.map((digit, index) => (
//                                     <input
//                                         key={index}
//                                         ref={(el) => { inputRefs.current[index] = el; }}
//                                         type="tel"
//                                         maxLength={1}
//                                         value={digit}
//                                         onChange={(e) => handleChange(index, e.target.value)}
//                                         onKeyDown={(e) => handleKeyDown(index, e)}
//                                         className={clsx(
//                                             "w-14 h-16 rounded-xl border-2 text-center text-2xl font-bold outline-none transition-all",
//                                             errorState.show && !errorState.isLocked ? "border-orange-300 text-orange-900 focus:border-orange-500 focus:ring-orange-500/10" : "border-gray-200 text-slate-900 focus:border-blue-600 focus:ring-blue-600/10",
//                                             errorState.isLocked && "opacity-50"
//                                         )}
//                                         disabled={isLoading || errorState.isLocked}
//                                     />
//                                 ))}
//                             </div>

//                             <button
//                                 type="submit"
//                                 disabled={isLoading || errorState.isLocked || otp.join("").length !== 4}
//                                 className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 {isLoading ? <FaSpinner className="animate-spin" /> : "Verify & Login"}
//                             </button>
//                         </form>

//                         <div className="mt-8 text-center text-sm font-medium space-y-2">
//                             <div>
//                                 Didn’t receive code?{" "}
//                                 <button
//                                     onClick={handleResendOtp}
//                                     disabled={errorState.isLocked || resendCountdown > 0 || isResending}
//                                     className={clsx(
//                                         "font-bold transition-colors",
//                                         (resendCountdown > 0 || errorState.isLocked) ? "text-gray-400 cursor-not-allowed" : "text-slate-900 hover:underline"
//                                     )}
//                                 >
//                                     {isResending ? "Sending..." : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Now"}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }