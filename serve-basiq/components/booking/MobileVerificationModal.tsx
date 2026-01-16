'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaXmark, FaMobileScreen, FaLock } from 'react-icons/fa6';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Import useSession to update client session

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MobileVerificationModal({ userId, isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession(); // Hook to update session on client side

  if (!isOpen) return null;

  // 1. Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }), // We just need phone to send OTP
      });

      const data = await res.json();
      if (res.ok) {
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

  // 2. Verify OTP & Link to Existing User
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ CHANGE: Use the specific "Update Phone" API endpoint
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ We pass userId so the backend knows EXACTLY who to update
        body: JSON.stringify({ phone, otp, userId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Phone linked successfully!');

        // ✅ Update the NextAuth session on the client without reloading
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

  // Render Portal
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-slate-900 p-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <FaXmark size={20} />
          </button>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
            <FaMobileScreen size={24} />
          </div>
          <h2 className="text-white text-lg font-bold">Mobile Verification</h2>
          <p className="text-slate-400 text-sm">Required to book services</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center justify-center bg-slate-100 border border-slate-200 rounded-xl px-3 font-bold text-slate-600">+91</span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg tracking-widest"
                    placeholder="XXXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in slide-in-from-right">
              <div className="text-center mb-2">
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">OTP Sent to {phone}</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enter OTP</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg tracking-widest"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Verify & Proceed'}
              </button>
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="w-full py-2 text-sm text-slate-500 font-bold hover:text-slate-800"
              >
                Change Number
              </button>
            </form>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}