'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaCheck, FaXmark } from 'react-icons/fa6';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

export default function SuccessModal({
    isOpen,
    onClose,
    title = "Success!",
    message = "Your request has been processed successfully.",
    buttonText = "Continue",
    onButtonClick
}: SuccessModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center relative overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition"
                >
                    <FaXmark size={20} />
                </button>

                <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300 delay-100">
                        <FaCheck className="text-green-600 text-3xl" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-2">
                    {title}
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    {message}
                </p>

                <button
                    onClick={() => {
                        if (onButtonClick) onButtonClick();
                        onClose();
                    }}
                    className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    {buttonText}
                </button>

            </div>
        </div>,
        document.body
    );
}