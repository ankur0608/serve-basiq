import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function ProfileCheckModal({ isOpen, onClose, onFix, action, missingSteps }: any) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                    <AlertTriangle size={24} />
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">Complete Profile Required</h2>
                <p className="text-slate-500 mb-6">
                    To <strong>{action}</strong>, you need to complete the following setup steps. This ensures trust and enables payments.
                </p>

                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Service Settings (Location & Category)</span>
                        {missingSteps?.service ? <XCircle size={18} className="text-red-500" /> : <CheckCircle2 size={18} className="text-green-500" />}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Verification (Bank & ID Proof)</span>
                        {missingSteps?.verification ? <XCircle size={18} className="text-red-500" /> : <CheckCircle2 size={18} className="text-green-500" />}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                        Later
                    </button>
                    <button onClick={onFix} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                        Complete Setup <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}