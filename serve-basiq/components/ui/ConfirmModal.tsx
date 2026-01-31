'use client';

import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
    isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isLoading, variant = 'danger'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className={clsx(
                        "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
                        variant === 'danger' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                    )}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500 mt-2">{message}</p>
                </div>

                <div className="flex border-t border-slate-100">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={clsx(
                            "flex-1 px-4 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2",
                            variant === 'danger' ? "text-red-600 hover:bg-red-50" : "text-blue-600 hover:bg-blue-50",
                            isLoading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}