// "use client";

// import { useState, useEffect } from "react";
// import { FaXmark, FaGoogle, FaMobileScreen, FaUser, FaBriefcase, FaArrowLeft } from "react-icons/fa6";
// import clsx from "clsx";
// import { signIn } from "next-auth/react";
// import { useUIStore } from "@/lib/store";

// interface LoginModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// type ModalStep = "SELECT_ROLE" | "INPUT_DETAILS";

// export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
//   // UI States
//   const [showModal, setShowModal] = useState(false);
//   const [step, setStep] = useState<ModalStep>("SELECT_ROLE");

//   // Form Data (Removed Name, Only Phone)
//   const [phone, setPhone] = useState("");

//   // States
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false);

//   // Store actions
//   const onOpenOtp = useUIStore((state) => state.onOpenOtp);
//   const setLoginIntent = useUIStore((state) => state.setLoginIntent);
//   const loginIntent = useUIStore((state) => state.loginIntent);

//   // Note: We don't need setTempName anymore in this file

//   useEffect(() => {
//     if (isOpen) {
//       setShowModal(true);
//       setStep("SELECT_ROLE");
//       document.body.style.overflow = "hidden";
//       setError("");
//       setPhone("");
//     } else {
//       const timer = setTimeout(() => setShowModal(false), 300);
//       document.body.style.overflow = "unset";
//       return () => clearTimeout(timer);
//     }
//   }, [isOpen]);

//   const handleRoleSelect = (role: 'user' | 'provider') => {
//     setLoginIntent(role);
//     setStep("INPUT_DETAILS");
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isGoogleLoading) return;

//     if (!phone || phone.length < 10) {
//       setError("Enter a valid 10-digit mobile number");
//       return;
//     }

//     setIsLoading(true);
//     setError("");

//     try {
//       const res = await fetch("/api/auth/send-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Failed to send OTP");
//         return;
//       }

//       // ✅ Pass the isNewUser flag to the store/OTP modal
//       onOpenOtp(phone, data.otp, data.isNewUser);

//     } catch (err) {
//       setError("Something went wrong");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     if (isLoading) return;
//     setIsGoogleLoading(true);

//     if (typeof window !== "undefined") {
//       localStorage.setItem("loginIntent", loginIntent);
//     }

//     const callbackUrl = "/";

//     try {
//       await signIn("google", { callbackUrl });
//     } catch (error) {
//       console.error("Login Failed", error);
//     } finally {
//       setIsGoogleLoading(false);
//     }
//   };

//   if (!isOpen && !showModal) return null;

//   return (
//     <div className="fixed inset-0 z-[100] overflow-y-auto">
//       <div className="flex min-h-full items-center justify-center p-4 text-center">

//         <div
//           className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")}
//           onClick={onClose}
//         />

//         <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

//           <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors">
//             <FaXmark className="text-lg" />
//           </button>

//           {step === "INPUT_DETAILS" && (
//             <button onClick={() => setStep("SELECT_ROLE")} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors">
//               <FaArrowLeft className="text-lg" />
//             </button>
//           )}

//           <div className="p-8">
//             {step === "SELECT_ROLE" && (
//               <div className="animate-fade-in">
//                 <div className="text-center mb-8">
//                   <h2 className="text-2xl font-extrabold text-slate-900">Welcome</h2>
//                   <p className="text-sm text-gray-500 mt-2">How would you like to continue?</p>
//                 </div>
//                 <div className="space-y-4">
//                   <button onClick={() => handleRoleSelect('user')} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-slate-900 rounded-2xl transition-all group hover:bg-slate-50">
//                     <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><FaUser /></div>
//                     <div className="text-left">
//                       <h3 className="font-bold text-slate-900">Find Services</h3>
//                       <p className="text-xs text-gray-500">I want to hire professionals</p>
//                     </div>
//                   </button>

//                   <button onClick={() => handleRoleSelect('provider')} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-slate-900 rounded-2xl transition-all group hover:bg-slate-50">
//                     <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><FaBriefcase /></div>
//                     <div className="text-left">
//                       <h3 className="font-bold text-slate-900">Become a Provider</h3>
//                       <p className="text-xs text-gray-500">I want to offer my services</p>
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             )}

//             {step === "INPUT_DETAILS" && (
//               <div className="animate-fade-in">
//                 <div className="text-center mb-6">
//                   <h2 className="text-2xl font-extrabold text-slate-900">
//                     {loginIntent === 'provider' ? "Partner Login" : "User Login"}
//                   </h2>
//                   <p className="text-sm text-gray-500 mt-1">Enter your details to verify.</p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   {/* PHONE INPUT FIELD ONLY */}
//                   <div>
//                     <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Mobile Number</label>
//                     <div className="relative group flex items-center">
//                       <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center border-r border-gray-200 bg-gray-50 rounded-l-xl text-sm font-bold text-slate-600">
//                         +91
//                       </div>
//                       <FaMobileScreen className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
//                       <input
//                         type="tel"
//                         value={phone}
//                         onChange={(e) => {
//                           setPhone(e.target.value.replace(/\D/g, ''));
//                           if (error) setError("");
//                         }}
//                         placeholder="9876543210"
//                         maxLength={10}
//                         disabled={isLoading || isGoogleLoading}
//                         className={clsx(
//                           "w-full pl-16 pr-10 py-3.5 bg-white border rounded-xl outline-none font-bold text-lg text-slate-900 placeholder-gray-300 tracking-wide transition-all",
//                           error ? "border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-blue-600 focus:ring-blue-600/10"
//                         )}
//                       />
//                     </div>
//                     {error && (
//                       <p className="text-red-500 text-xs font-bold mt-2 ml-1 animate-fade-in">{error}</p>
//                     )}
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={isLoading || isGoogleLoading}
//                     className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 flex justify-center items-center gap-2"
//                   >
//                     {isLoading ? <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Get OTP"}
//                   </button>
//                 </form>

//                 <div className="relative flex items-center justify-center py-6">
//                   <div className="border-t border-gray-100 w-full absolute" />
//                   <span className="bg-white px-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider relative z-10">Or continue with</span>
//                 </div>

//                 <button
//                   onClick={handleGoogleLogin}
//                   disabled={isLoading || isGoogleLoading}
//                   className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-bold text-slate-700 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
//                 >
//                   {isGoogleLoading ? <span className="h-5 w-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></span> : <FaGoogle className="text-xl text-red-500" />}
//                   <span>Google</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { FaXmark, FaGoogle, FaMobileScreen, FaUser, FaBriefcase, FaArrowLeft } from "react-icons/fa6";
import clsx from "clsx";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useUIStore } from "@/lib/store";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: "SELECT_ROLE" | "INPUT_DETAILS";
  initialRole?: "user" | "provider";
}

type ModalStep = "SELECT_ROLE" | "INPUT_DETAILS";

export default function LoginModal({ isOpen, onClose, initialStep = "SELECT_ROLE", initialRole }: LoginModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<ModalStep>(initialStep);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onOpenOtp = useUIStore((state) => state.onOpenOtp);
  const setLoginIntent = useUIStore((state) => state.setLoginIntent);
  const loginIntent = useUIStore((state) => state.loginIntent);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setStep(initialStep);

      // If an initial role is provided, set it in the store immediately
      if (initialRole) {
        setLoginIntent(initialRole);
      }

      document.body.style.overflow = "hidden";
      setError("");
      setPhone("");
    } else {
      const timer = setTimeout(() => setShowModal(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialStep, initialRole, setLoginIntent]);

  const handleRoleSelect = (role: 'user' | 'provider') => {
    setLoginIntent(role);
    setStep("INPUT_DETAILS");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGoogleLoading) return;

    if (!phone || phone.length < 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      onOpenOtp(phone, data.verificationId, data.isNewUser);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsGoogleLoading(true);

    if (typeof window !== "undefined") {
      localStorage.setItem("loginIntent", loginIntent);
    }

    const callbackUrl = "/";

    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Login Failed", error);
    } finally {
      setIsGoogleLoading(false);
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
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors">
            <FaXmark className="text-lg" />
          </button>

          {/* Only show the back button if they didn't skip the role selection via props */}
          {step === "INPUT_DETAILS" && !initialRole && (
            <button onClick={() => setStep("SELECT_ROLE")} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors">
              <FaArrowLeft className="text-lg" />
            </button>
          )}

          <div className="p-8">
            {step === "SELECT_ROLE" && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-extrabold text-slate-900">Welcome</h2>
                  <p className="text-sm text-gray-500 mt-2">How would you like to continue?</p>
                </div>
                <div className="space-y-4">
                  <button onClick={() => handleRoleSelect('user')} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-slate-900 rounded-2xl transition-all group hover:bg-slate-50">
                    <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><FaUser /></div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900">Find Services</h3>
                      <p className="text-xs text-gray-500">I want to hire professionals</p>
                    </div>
                  </button>

                  <button onClick={() => handleRoleSelect('provider')} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-slate-900 rounded-2xl transition-all group hover:bg-slate-50">
                    <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><FaBriefcase /></div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900">Become a Provider</h3>
                      <p className="text-xs text-gray-500">I want to offer my services</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {step === "INPUT_DETAILS" && (
              <div className="animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {loginIntent === 'provider' ? "Partner Login" : "User Login"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Enter your details to verify.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Mobile Number</label>
                    <div className="relative group flex items-center">
                      <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center border-r border-gray-200 bg-gray-50 rounded-l-xl text-sm font-bold text-slate-600">
                        +91
                      </div>
                      <FaMobileScreen className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, ''));
                          if (error) setError("");
                        }}
                        placeholder="9876543210"
                        maxLength={10}
                        disabled={isLoading || isGoogleLoading}
                        className={clsx(
                          "w-full pl-16 pr-10 py-3.5 bg-white border rounded-xl outline-none font-bold text-lg text-slate-900 placeholder-gray-300 tracking-wide transition-all",
                          error ? "border-red-500 focus:ring-red-500/10" : "border-gray-200 focus:border-blue-600 focus:ring-blue-600/10"
                        )}
                      />
                    </div>
                    {error && (
                      <p className="text-red-500 text-xs font-bold mt-2 ml-1 animate-fade-in">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isLoading ? <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Get OTP"}
                  </button>
                </form>

                <div className="relative flex items-center justify-center py-6">
                  <div className="border-t border-gray-100 w-full absolute" />
                  <span className="bg-white px-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider relative z-10">Or continue with</span>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-bold text-slate-700 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                >
                  {isGoogleLoading ? <span className="h-5 w-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></span> : <FcGoogle size={25} />}
                  <span>Login with Google</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}