'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaXmark, FaMobileScreen, FaSpinner, FaArrowLeft } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MobileVerificationModal({ userId, isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');

  // ✅ CHANGED: OTP is now an array of 4 strings
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  // Focus first input when switching to OTP step
  useEffect(() => {
    if (step === 'OTP') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  if (!isOpen) return null;

  /* ---------------- Input Handlers (Split Inputs) ---------------- */
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Move focus to previous input on Backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* ---------------- Logic ---------------- */

  // 1. Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ 1. Log OTP
        console.log("🔔 DEV OTP:", data.otp);

        // ✅ 2. Auto-fill the inputs visually
        if (data.otp) {
          setOtp(data.otp.toString().split(""));
        }

        setStep('OTP');
      } else {
        alert(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Join array back to string
    const code = otp.join("");
    if (code.length !== 4) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: code, userId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Phone linked successfully!');
        await update({ isPhoneVerified: true, phone: phone });
        router.refresh();
        onSuccess();
      } else {
        alert(data.error || 'Invalid OTP');
      }
    } catch (error) {
      alert('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full z-10 transition">
          <FaXmark size={20} />
        </button>

        {/* Header */}
        <div className="pt-8 px-8 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-900">
            <FaMobileScreen size={26} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {step === 'PHONE' ? 'Add Phone Number' : 'Verify OTP'}
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            {step === 'PHONE'
              ? 'We need your phone number to update your profile.'
              : <>Code sent to <span className="font-bold text-slate-900">+91 {phone}</span></>
            }
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phone Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-600">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]*"
                    required
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none font-bold text-lg tracking-widest text-slate-900 placeholder-slate-300 transition-all"
                    placeholder="XXXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-slate-900 flex items-center justify-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in slide-in-from-right">

              {/* ✅ 4-DIGIT SPLIT INPUTS */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-14 h-16 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
                    disabled={loading}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length < 4}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Verify & Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('PHONE');
                  setOtp(["", "", "", ""]);
                }}
                className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 font-bold hover:text-slate-900 transition"
              >
                <FaArrowLeft /> Change Number
              </button>
            </form>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}