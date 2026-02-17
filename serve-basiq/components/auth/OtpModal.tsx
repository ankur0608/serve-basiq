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
//     const devOtp = useUIStore((state) => state.devOtp);
//     const loginIntent = useUIStore((state) => state.loginIntent);
//     const isNewUser = useUIStore((state) => state.isNewUser);

//     // Store Actions
//     const onOpenLogin = useUIStore((state) => state.onOpenLogin);
//     const onCloseOtp = useUIStore((state) => state.onCloseOtp);
//     const onOpenName = useUIStore((state) => state.onOpenName); // ✅ Action to open Name Modal
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

//     // Auto-fill Dev OTP
//     useEffect(() => {
//         if (isOpen && devOtp) {
//             const otpString = devOtp.toString();
//             if (otpString.length === 4) {
//                 setOtp(otpString.split(""));
//             }
//         }
//     }, [devOtp, isOpen]);

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

//         setIsLoading(true);

//         try {
//             // 1. Verify OTP
//             const res = await fetch("/api/auth/verify-otp", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     phone: mobileNumber,
//                     otp: code,
//                     // No Name sent here anymore. User is created with default name.
//                 }),
//             });

//             if (!res.ok) {
//                 const errorData = await res.json();
//                 throw new Error(errorData.message || "Invalid OTP");
//             }

//             const user = await res.json();

//             // 2. Sign In (Create Session)
//             const signInResult = await signIn("credentials", {
//                 phone: mobileNumber,
//                 redirect: false,
//             });

//             if (signInResult?.error) throw new Error(signInResult.error);

//             setCurrentUser(user);
//             onCloseOtp(); // Close OTP Modal

//             // 3. LOGIC: If New User -> Open Name Modal
//             if (isNewUser) {
//                 onOpenName(); // ✅ OPEN THE NEXT MODAL
//                 return;
//             }

//             // 4. If Old User -> Redirect Immediately
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
//             alert(error.message || "Something went wrong.");
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
//                             {devOtp && <div className="text-xs text-green-600 bg-green-50 py-1 px-2 rounded inline-block border border-green-200">Dev Mode OTP: <b>{devOtp}</b></div>}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


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

    // Store Data
    const mobileNumber = useUIStore((state) => state.mobileNumber);
    const verificationId = useUIStore((state) => state.verificationId); // ✅ Get verificationId
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
            document.body.style.overflow = "hidden";
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } else {
            const timer = setTimeout(() => setShowModal(false), 300);
            document.body.style.overflow = "unset";
            setOtp(["", "", "", ""]);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

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

        if (!verificationId) {
            alert("Session expired. Please request OTP again.");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Verify OTP using MessageCentral flow
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: mobileNumber,
                    otp: code,
                    verificationId: verificationId // ✅ Send to backend
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Invalid OTP");
            }

            const user = await res.json();

            // 2. Create NextAuth Session
            const signInResult = await signIn("credentials", {
                phone: mobileNumber,
                redirect: false,
            });

            if (signInResult?.error) throw new Error(signInResult.error);

            setCurrentUser(user);
            onCloseOtp(); // Close OTP Modal

            // 3. Routing Logic
            if (isNewUser) {
                onOpenName(); // Open Name Modal for new users
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
            alert(error.message || "Verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen && !showModal) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose} />
                <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

                    <button onClick={onOpenLogin} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10"><FaArrowLeft className="text-lg" /></button>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10"><FaXmark className="text-lg" /></button>

                    <div className="p-8">
                        <div className="text-center mb-8 mt-4">
                            <h2 className="text-2xl font-extrabold text-slate-900">Verify OTP</h2>
                            <p className="text-sm text-gray-500 mt-2">Code sent to <span className="font-bold text-slate-900">+91 {mobileNumber}</span></p>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-8">
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <input key={index} ref={(el) => { inputRefs.current[index] = el; }} type="tel" maxLength={1} value={digit} onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className="w-14 h-16 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" disabled={isLoading} />
                                ))}
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition flex items-center justify-center gap-2">
                                {isLoading ? <FaSpinner className="animate-spin" /> : "Verify & Login"}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm font-medium space-y-2">
                            <div>Didn’t receive code? <button className="text-slate-900 font-bold hover:underline">Resend in 30s</button></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}