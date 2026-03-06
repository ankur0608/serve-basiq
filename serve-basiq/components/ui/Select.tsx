import React, { useState, useRef, useEffect, forwardRef } from "react";
import clsx from "clsx";
import { Search, ChevronDown } from "lucide-react";

interface SelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
    label?: string;
    icon?: React.ReactNode;
    options: (string | { label: string; value: string | number })[];
    containerClassName?: string;
    value?: string | number;
    onChange?: (e: { target: { value: string | number } }) => void;
    showSearch?: boolean;
    placeholder?: string;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
    ({ label, icon, options, className, containerClassName, value, onChange, disabled, showSearch, placeholder = "Select...", onClick, ...props }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState("");
        const wrapperRef = useRef<HTMLDivElement>(null);

        const normalizedOptions = options.map(opt =>
            typeof opt === "string" ? { label: opt, value: opt } : opt
        );

        const filteredOptions = normalizedOptions.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const handleSelect = (val: string | number) => {
            if (onChange) onChange({ target: { value: val } });
            setIsOpen(false);
            setSearchTerm("");
        };

        return (
            <div className={containerClassName} ref={wrapperRef}>
                {label && (
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <button
                        ref={ref} 
                        type="button"
                        disabled={disabled}
                        className={clsx(
                            "flex items-center justify-between w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500",
                            disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : "bg-white cursor-pointer",
                            icon ? "pl-10" : "",
                            className
                        )}
                        onClick={(e) => {
                            if (!disabled) setIsOpen(!isOpen);
                            if (onClick) onClick(e);
                        }}
                        {...props} 
                    >
                        <span className={clsx("truncate", !selectedOption && "text-gray-500")}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </button>

                    {icon && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown size={16} />
                    </div>

                    {isOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                            {showSearch && (
                                <div className="p-2 border-b border-gray-100 bg-slate-50/50 sticky top-0 z-10">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input
                                            type="text"
                                            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                            )}

                            <ul className="max-h-60 overflow-y-auto p-1">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((opt, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => handleSelect(opt.value)}
                                            className={clsx(
                                                "px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors",
                                                String(value) === String(opt.value)
                                                    ? "bg-blue-50 text-blue-700 font-bold"
                                                    : "text-slate-700 hover:bg-slate-100"
                                            )}
                                        >
                                            {opt.label}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-3 py-4 text-sm text-center text-slate-500">
                                        No options found
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;