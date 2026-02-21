"use client";

import { useState, useEffect, useRef } from "react";
import { FaXmark, FaArrowLeft, FaSpinner } from "react-icons/fa6";
import { AlertCircle, ShieldAlert } from "lucide-react";
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

    // Error State
    const [errorMsg, setErrorMsg] = useState<{ text: string, type: 'RATE_LIMIT' | 'INVALID' | null }>({ text: "", type: null });

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

    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
            setErrorMsg({ text: "", type: null });
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

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== 4) return;

        setIsLoading(true);
        setErrorMsg({ text: "", type: null });

        try {
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

                if (res.status === 429) {
                    setErrorMsg({ text: errorData.error || "Too many attempts. Please try again later.", type: 'RATE_LIMIT' });
                    setOtp(["", "", "", ""]);
                    inputRefs.current[0]?.blur();
                    return;
                } else {
                    setErrorMsg({ text: errorData.error || "Invalid OTP. Please check and try again.", type: 'INVALID' });
                    setOtp(["", "", "", ""]);
                    // Focus is now handled by the error modal's close button
                    return;
                }
            }

            const user = await res.json();

            const signInResult = await signIn("credentials", {
                phone: mobileNumber,
                redirect: false,
            });

            if (signInResult?.error) throw new Error(signInResult.error);

            setCurrentUser(user);
            onCloseOtp();

            if (isNewUser) {
                onOpenName();
                return;
            }

            if (loginIntent === 'provider') {
                if (user.providerType) {
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

    // Handler for closing the error modal
    const handleDismissError = () => {
        const type = errorMsg.type;
        setErrorMsg({ text: "", type: null });

        // Only refocus the inputs if it wasn't a rate limit error
        if (type !== 'RATE_LIMIT') {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    };

    if (!isOpen && !showModal) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose} />

                {/* Added overflow-hidden so the error overlay doesn't break the rounded corners */}
                <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300 overflow-hidden", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

                    <button onClick={onOpenLogin} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors"><FaArrowLeft className="text-lg" /></button>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors"><FaXmark className="text-lg" /></button>

                    {/* NEW: Inner Error Modal Overlay */}
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
                            <p className="text-gray-500 text-center mb-8 px-4">
                                {errorMsg.text}
                            </p>
                            <button
                                onClick={handleDismissError}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-all"
                            >
                                {errorMsg.type === 'RATE_LIMIT' ? "Understood" : "Try Again"}
                            </button>
                        </div>
                    )}

                    <div className="p-8">
                        <div className="text-center mb-8 mt-4">
                            <h2 className="text-2xl font-extrabold text-slate-900">Verify OTP</h2>
                            <p className="text-sm text-gray-500 mt-2">Code sent to <span className="font-bold text-slate-900">+91 {mobileNumber}</span></p>
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
                                disabled={isLoading || errorMsg.type !== null}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <FaSpinner className="animate-spin" /> : "Verify & Login"}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-medium space-y-2">
                            <div>Didn’t receive code? <button className="text-slate-900 font-bold hover:underline">Resend in 30s</button></div>
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
// import { FaXmark, FaArrowLeft, FaSpinner } from "react-icons/fa6";
// import clsx from "clsx";
// import { useUIStore } from "@/lib/store";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";

// interface OtpModalProps {
//     isOpen: boolean;
//     onClose: () => void;
// }

// export default function OtpModal({ isOpen, onClose }: OtpModalProps) {
//     const [showModal, setShowModal] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const router = useRouter();

//     // Store Data
//     const mobileNumber = useUIStore((state) => state.mobileNumber);
//     const verificationId = useUIStore((state) => state.verificationId); // ✅ Get verificationId
//     const loginIntent = useUIStore((state) => state.loginIntent);
//     const isNewUser = useUIStore((state) => state.isNewUser);

//     // Store Actions
//     const onOpenLogin = useUIStore((state) => state.onOpenLogin);
//     const onCloseOtp = useUIStore((state) => state.onCloseOtp);
//     const onOpenName = useUIStore((state) => state.onOpenName);
//     const setCurrentUser = useUIStore((state) => state.setCurrentUser);

//     // OTP State
//     const [otp, setOtp] = useState(["", "", "", ""]);
//     const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//     useEffect(() => {
//         if (isOpen) {
//             setShowModal(true);
//             document.body.style.overflow = "hidden";
//             setTimeout(() => inputRefs.current[0]?.focus(), 100);
//         } else {
//             const timer = setTimeout(() => setShowModal(false), 300);
//             document.body.style.overflow = "unset";
//             setOtp(["", "", "", ""]);
//             return () => clearTimeout(timer);
//         }
//     }, [isOpen]);

//     const handleChange = (index: number, value: string) => {
//         if (isNaN(Number(value))) return;
//         const newOtp = [...otp];
//         newOtp[index] = value;
//         setOtp(newOtp);
//         if (value && index < 3) {
//             inputRefs.current[index + 1]?.focus();
//         }
//     };

//     const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
//         if (e.key === "Backspace" && !otp[index] && index > 0) {
//             inputRefs.current[index - 1]?.focus();
//         }
//     };

//     const handleVerify = async (e: React.FormEvent) => {
//         e.preventDefault();
//         const code = otp.join("");
//         if (code.length !== 4) return;

//         if (!verificationId) {
//             alert("Session expired. Please request OTP again.");
//             return;
//         }

//         setIsLoading(true);

//         try {
//             // 1. Verify OTP using MessageCentral flow
//             const res = await fetch("/api/auth/verify-otp", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     phone: mobileNumber,
//                     otp: code,
//                     verificationId: verificationId // ✅ Send to backend
//                 }),
//             });

//             if (!res.ok) {
//                 const errorData = await res.json();
//                 throw new Error(errorData.error || "Invalid OTP");
//             }

//             const user = await res.json();

//             // 2. Create NextAuth Session
//             const signInResult = await signIn("credentials", {
//                 phone: mobileNumber,
//                 redirect: false,
//             });

//             if (signInResult?.error) throw new Error(signInResult.error);

//             setCurrentUser(user);
//             onCloseOtp(); // Close OTP Modal

//             // 3. Routing Logic
//             if (isNewUser) {
//                 onOpenName(); // Open Name Modal for new users
//                 return;
//             }

//             if (loginIntent === 'provider') {
//                 if (user.providerType) {
//                     router.push('/provider/dashboard');
//                 } else {
//                     router.push('/become-pro');
//                 }
//             } else {
//                 router.refresh();
//             }

//         } catch (error: any) {
//             console.error("Verification failed", error);
//             alert(error.message || "Verification failed. Please try again.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (!isOpen && !showModal) return null;

//     return (
//         <div className="fixed inset-0 z-[100] overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4 text-center">
//                 <div className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose} />
//                 <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

//                     <button onClick={onOpenLogin} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10"><FaArrowLeft className="text-lg" /></button>
//                     <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10"><FaXmark className="text-lg" /></button>

//                     <div className="p-8">
//                         <div className="text-center mb-8 mt-4">
//                             <h2 className="text-2xl font-extrabold text-slate-900">Verify OTP</h2>
//                             <p className="text-sm text-gray-500 mt-2">Code sent to <span className="font-bold text-slate-900">+91 {mobileNumber}</span></p>
//                         </div>

//                         <form onSubmit={handleVerify} className="space-y-8">
//                             <div className="flex justify-center gap-3">
//                                 {otp.map((digit, index) => (
//                                     <input key={index} ref={(el) => { inputRefs.current[index] = el; }} type="tel" maxLength={1} value={digit} onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className="w-14 h-16 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" disabled={isLoading} />
//                                 ))}
//                             </div>
//                             <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition flex items-center justify-center gap-2">
//                                 {isLoading ? <FaSpinner className="animate-spin" /> : "Verify & Login"}
//                             </button>
//                         </form>

//                         <div className="mt-8 text-center text-sm font-medium space-y-2">
//                             <div>Didn’t receive code? <button className="text-slate-900 font-bold hover:underline">Resend in 30s</button></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }