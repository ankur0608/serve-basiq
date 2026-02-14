import { useState } from 'react';
import { BadgeIndianRupee, Loader2, Save, AlertCircle } from 'lucide-react';
import { ProductForm } from './AddProductView';
import clsx from 'clsx';

interface Step4Props {
    form: ProductForm;
    handleChange: (field: keyof ProductForm, value: any) => void;
    setStep: (step: number) => void;
    closeForm: () => void;
    isSaving: boolean;
    editingProduct?: any;
}

export function Step4Pricing({ form, handleChange, setStep, closeForm, isSaving, editingProduct }: Step4Props) {
    const [error, setError] = useState<string>('');
    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";

    const validate = () => {
        if (!form.price) {
            setError('Price is required');
            return false;
        }
        if (Number(form.price) <= 0) {
            setError('Price must be greater than 0');
            return false;
        }
        setError('');
        return true;
    };

    const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Run validation before allowing the 'submit' event to propagate to the parent form
        if (!validate()) {
            e.preventDefault();
        }
    };

    // Clear error on change
    const onPriceChange = (val: string) => {
        if (error) setError('');
        handleChange('price', val);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className={clsx(
                "p-6 rounded-xl border flex flex-col items-center justify-center text-center transition-colors",
                error ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"
            )}>
                <label className={clsx(labelClass, error ? "text-red-500" : "text-slate-500")}>
                    Selling Price per {form.unit.toLowerCase()}
                </label>

                <div className="relative w-full max-w-50 mt-2">
                    <BadgeIndianRupee
                        className={clsx("absolute left-4 top-4", error ? "text-red-400" : "text-slate-400")}
                        size={24}
                    />
                    <input
                        type="number"
                        className={clsx(
                            "w-full pl-12 pr-4 py-3 text-2xl font-bold rounded-xl outline-none text-center transition-all",
                            error
                                ? "bg-white border-2 border-red-500 text-red-900 focus:ring-4 focus:ring-red-200"
                                : "bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500"
                        )}
                        placeholder="0.00"
                        value={form.price}
                        onChange={e => onPriceChange(e.target.value)}
                        onBlur={validate} // Also validate when user leaves field
                    />
                </div>

                {error ? (
                    <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1 animate-in slide-in-from-top-1">
                        <AlertCircle size={12} /> {error}
                    </p>
                ) : (
                    <p className="text-xs text-slate-400 mt-2">Enter the final price including taxes.</p>
                )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                    Back
                </button>

                <button
                    type="submit"
                    onClick={handleSave} // Intercept click to validate
                    disabled={isSaving}
                    className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {editingProduct ? "Update Product" : "Save Product"}
                </button>
            </div>

            <button type="button" onClick={closeForm} className="w-full text-xs font-bold text-slate-400 hover:text-red-500 transition mt-2">
                Cancel and Exit
            </button>
        </div>
    );
}