'use client';

import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface RestrictionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSetup: () => void;
}

export const RestrictionModal = ({ isOpen, onClose, onSetup }: RestrictionModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-blue-50/50">
                        <ShieldCheck className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Setup Your Profile</h3>
                    <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                        To start receiving orders and managing your services, we need you to complete a quick verification. It only takes a minute!
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={onSetup} 
                            className="w-full py-4 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Complete Setup Now <CheckCircle2 size={18} />
                        </button>
                        <button 
                            onClick={onClose} 
                            className="w-full py-3.5 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm"
                        >
                            I'll do this later
                        </button>
                    </div>
                </div>

                {/* Decorative Bottom Strip */}
                <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            </div>
        </div>
    );
};