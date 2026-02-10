'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { FaRotateRight, FaTriangleExclamation } from 'react-icons/fa6';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {

    useEffect(() => {
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white max-w-lg w-full rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-12 text-center animate-in slide-in-from-bottom-4 duration-500">

                {/* Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <FaTriangleExclamation className="text-red-500 text-2xl sm:text-3xl" />
                </div>

                {/* Heading */}
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight">
                    Something went wrong!
                </h2>

                {/* Message */}
                <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8 leading-relaxed">
                    We apologize for the inconvenience. An unexpected error has occurred. Our team has been notified.
                </p>

                {/* Error Code (Responsive Font Size) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 sm:mb-8 bg-red-50 p-3 sm:p-4 rounded-xl text-left overflow-auto max-h-32">
                        <p className="text-[10px] sm:text-xs font-mono text-red-700 break-all">
                            {error.message || "Unknown Error"}
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => reset()}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 sm:py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg active:scale-95 text-sm sm:text-base"
                    >
                        <FaRotateRight /> Try Again
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full py-3 sm:py-3.5 text-slate-500 font-bold text-sm hover:text-slate-800 transition"
                    >
                        Return to Homepage
                    </button>
                </div>

            </div>
        </div>
    );
}