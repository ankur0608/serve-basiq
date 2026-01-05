"use client";

import { useState, useEffect } from "react";
import { FaXmark, FaGoogle, FaMobileScreen } from "react-icons/fa6";
import clsx from "clsx";
import { signIn } from "next-auth/react";
import { useUIStore } from "@/lib/store";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // UI States
  const [showModal, setShowModal] = useState(false);

  // Phone Auth State
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const onOpenOtp = useUIStore((state) => state.onOpenOtp);

  // Google Auth State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Animation + Scroll Lock
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      document.body.style.overflow = "hidden";
      setPhoneError("");
      setPhone("");
    } else {
      const timer = setTimeout(() => setShowModal(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- Logic 1: Handle Phone OTP Submit ---
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGoogleLoading) return; // Prevent if Google is loading

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
        setPhoneError("Failed to send OTP");
        return;
      }

      // ✅ Pass OTP in dev (working as per your code)
      onOpenOtp(phone, data.otp);
    } catch (err) {
      setPhoneError("Something went wrong");
    } finally {
      setIsPhoneLoading(false);
    }
  };

  // --- Logic 2: Handle Google Login ---
  const handleGoogleLogin = async () => {
    if (isPhoneLoading) return; // Prevent if Phone is loading

    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
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

        {/* Backdrop */}
        <div
          className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")}
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors">
            <FaXmark className="text-lg" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">Get Started</h2>
              <p className="text-sm text-gray-500 mt-2">Log in or sign up to continue.</p>
            </div>

            {/* --- PHONE FORM --- */}
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Mobile Number</label>
                <div className="relative group flex items-center">
                  <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center border-r border-gray-200 bg-gray-50 rounded-l-xl text-sm font-bold text-slate-600">
                    +91
                  </div>
                  <FaMobileScreen className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '')); // Only numbers
                      if (phoneError) setPhoneError("");
                    }}
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
                  <p className="text-red-500 text-xs font-bold mt-2 ml-1 animate-fade-in">
                    {phoneError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isGoogleLoading || isPhoneLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-slate-900 flex justify-center items-center gap-2"
              >
                {isPhoneLoading ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : "Get OTP"}
              </button>
            </form>

            {/* --- DIVIDER --- */}
            <div className="relative flex items-center justify-center py-6">
              <div className="border-t border-gray-100 w-full absolute" />
              <span className="bg-white px-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider relative z-10">Or continue with</span>
            </div>

            {/* --- GOOGLE BUTTON --- */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isPhoneLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-bold text-slate-700 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {isGoogleLoading ? (
                <span className="h-5 w-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></span>
              ) : (
                <FaGoogle className="text-xl text-red-500" />
              )}
              <span>Google</span>
            </button>

            {/* --- FOOTER --- */}
            <div className="mt-8 text-center text-xs text-gray-400 px-4 leading-relaxed">
              By continuing, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a> & <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}