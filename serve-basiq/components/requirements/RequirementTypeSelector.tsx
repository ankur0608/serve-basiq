import { Box, Wrench } from 'lucide-react';
import clsx from 'clsx';

interface RequirementTypeSelectorProps {
    type: 'SERVICE' | 'PRODUCT';
    onChange: (type: 'SERVICE' | 'PRODUCT') => void;
}

export default function RequirementTypeSelector({ type, onChange }: RequirementTypeSelectorProps) {
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5 ml-1";

    return (
        <div>
            <label className={labelClass}>I am looking for...</label>
            <div className="grid grid-cols-2 gap-4">
                <div
                    onClick={() => onChange('PRODUCT')}
                    className={clsx(
                        "relative overflow-hidden p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center gap-3 group",
                        type === 'PRODUCT'
                            ? "border-blue-600 bg-blue-50/50"
                            : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                    )}
                >
                    <div className={clsx(
                        "p-3.5 rounded-full transition-colors",
                        type === 'PRODUCT' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-400 border border-slate-100"
                    )}>
                        <Box size={24} />
                    </div>
                    <span className={clsx("font-bold text-sm", type === 'PRODUCT' ? "text-blue-700" : "text-slate-500")}>Product / Material</span>
                    {type === 'PRODUCT' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                </div>

                <div
                    onClick={() => onChange('SERVICE')}
                    className={clsx(
                        "relative overflow-hidden p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center gap-3 group",
                        type === 'SERVICE'
                            ? "border-purple-600 bg-purple-50/50"
                            : "border-slate-100 hover:border-purple-200 hover:bg-slate-50"
                    )}
                >
                    <div className={clsx(
                        "p-3.5 rounded-full transition-colors",
                        type === 'SERVICE' ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-white text-slate-400 border border-slate-100"
                    )}>
                        <Wrench size={24} />
                    </div>
                    <span className={clsx("font-bold text-sm", type === 'SERVICE' ? "text-purple-700" : "text-slate-500")}>Service / Repair</span>
                    {type === 'SERVICE' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />}
                </div>
            </div>
        </div>
    );
}