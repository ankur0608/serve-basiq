import { useState } from 'react';
import { Clock, ChevronDown, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export type TimelineType = 'URGENT' | 'IMMEDIATE' | 'LATER' | 'FLEXIBLE';

interface TimelineOption {
    value: TimelineType;
    label: string;
    icon: React.ElementType;
    sub: string;
}

interface TimelineDropdownProps {
    value: TimelineType;
    onChange: (val: TimelineType) => void;
    options: TimelineOption[];
}

export default function TimelineDropdown({ value, onChange, options }: TimelineDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative">
            <div className="flex items-center gap-2 mb-2.5 ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    When do you need this?
                </label>
            </div>

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "cursor-pointer w-full flex items-center justify-between border rounded-xl px-4 py-3 transition-all",
                    isOpen ? "border-slate-900 ring-2 ring-slate-900 bg-white" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={clsx("p-2 rounded-lg", isOpen ? "bg-slate-100 text-slate-900" : "bg-white text-slate-500 border border-slate-200")}>
                        <selectedOption.icon size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">{selectedOption.label}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{selectedOption.sub}</p>
                    </div>
                </div>
                <ChevronDown
                    size={18}
                    className={clsx("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")}
                />
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={clsx(
                                "p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-50",
                                value === option.value && "bg-slate-50"
                            )}
                        >
                            <div className={clsx("p-2 rounded-lg", value === option.value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>
                                <option.icon size={16} />
                            </div>
                            <div>
                                <p className={clsx("text-sm font-bold", value === option.value ? "text-slate-900" : "text-slate-600")}>
                                    {option.label}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                                    {option.sub}
                                </p>
                            </div>
                            {value === option.value && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
                        </div>
                    ))}
                </div>
            )}

            {isOpen && <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />}
        </div>
    );
}