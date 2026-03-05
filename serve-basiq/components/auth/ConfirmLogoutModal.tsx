'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaRightFromBracket, FaXmark } from 'react-icons/fa6';

interface ConfirmLogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmLogoutModal({ isOpen, onClose, onConfirm }: ConfirmLogoutModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center relative overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Background Decoration (Red for Destructive Action) */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-rose-600"></div>

                {/* Close Icon */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition"
                >
                    <FaXmark size={20} />
                </button>

                {/* Warning/Logout Icon */}
                <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300 delay-100">
                        <FaRightFromBracket className="text-red-600 text-2xl ml-1" />
                    </div>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                    Log Out
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    Are you sure you want to log out of your account? You will need to sign in again to access your profile.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 active:scale-[0.98] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 bg-red-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all"
                    >
                        Yes, Log Out
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}