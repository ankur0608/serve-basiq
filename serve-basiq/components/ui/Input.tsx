import React, { forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            icon,
            rightElement,
            className,
            containerClassName,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <div className={containerClassName}>
                {label && (
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                        <label className="block text-xs font-bold text-slate-700">
                            {label}
                        </label>
                        {rightElement}
                    </div>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        disabled={disabled}
                        className={clsx(
                            "w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition",
                            "border-gray-200 focus:border-blue-500 placeholder:text-gray-400",
                            icon ? "pl-10" : "",
                            disabled
                                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                                : "bg-white",
                            className
                        )}
                        {...props}
                    />
                    {icon && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {icon}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;