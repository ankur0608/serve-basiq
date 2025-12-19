"use client";

import { useState, useEffect } from "react";
import { FaXmark, FaGoogle, FaApple, FaMobileScreen } from "react-icons/fa6";
import clsx from "clsx";
import { useUIStore } from "@/lib/store";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("");
  const onOpenOtp = useUIStore((state) => state.onOpenOtp);

  // Animation + Scroll Lock
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setShowModal(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length > 9) {
      onOpenOtp(phone); // Trigger OTP Modal
    }
  };

  if (!isOpen && !showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose} />

        <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition-colors">
            <FaXmark className="text-lg" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">Get Started</h2>
              <p className="text-sm text-gray-500 mt-2">Enter your mobile number to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Mobile Input */}
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
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Only numbers
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full pl-16 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none font-bold text-lg text-slate-900 placeholder-gray-300 tracking-wide transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all duration-200">
                Get OTP
              </button>
            </form>

            {/* Divider */}
            {/* <div className="relative flex items-center justify-center py-6">
              <div className="border-t border-gray-100 w-full absolute" />
              <span className="bg-white px-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider relative z-10">Or continue with</span>
            </div> */}

            {/* Socials */}
            {/* <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-sm text-slate-700 transition-colors">
                <FaGoogle className="text-red-500" /> Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-sm text-slate-700 transition-colors">
                <FaApple className="text-slate-900" /> Apple
              </button>
            </div> */}

            <div className="mt-8 text-center text-xs text-gray-400 px-4 leading-relaxed">
              By continuing, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a> & <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}