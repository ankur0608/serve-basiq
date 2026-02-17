import React, { forwardRef } from "react";
import clsx from "clsx";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    icon?: React.ReactNode;
    options: string[] | { label: string; value: string | number }[];
    containerClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, icon, options, className, containerClassName, ...props }, ref) => {
        return (
            <div className={containerClassName}>
                {label && (
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={clsx(
                            "w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition focus:border-blue-500 appearance-none",
                            icon ? "pl-10" : "",
                            className
                        )}
                        {...props}
                    >
                        {options.map((opt, idx) => {
                            const value = typeof opt === "string" ? opt : opt.value;
                            const label = typeof opt === "string" ? opt : opt.label;
                            return (
                                <option key={idx} value={value}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                    {icon && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                        ▼
                    </div>
                </div>
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;