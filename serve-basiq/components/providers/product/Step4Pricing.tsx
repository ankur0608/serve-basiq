import { useState } from 'react';
import { BadgeIndianRupee, Loader2, Save, AlertCircle } from 'lucide-react';
import { ProductForm } from './AddProductView';
import Input from '@/components/ui/Input';
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
        if (!validate()) {
            e.preventDefault();
        }
    };

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
                <label className={clsx("block text-xs font-bold uppercase mb-2", error ? "text-red-500" : "text-slate-500")}>
                    Selling Price per {form.unit.toLowerCase() || 'unit'}
                </label>

                <div className="w-full max-w-xs mt-2">
                    <Input
                        type="number"
                        icon={<BadgeIndianRupee size={24} className={error ? "text-red-400" : "text-slate-400"} />}
                        placeholder="0.00"
                        value={form.price}
                        onChange={e => onPriceChange(e.target.value)}
                        onBlur={validate}
                        // Note: using !important to override the default text-sm and text-left from Input.tsx
                        className={clsx(
                            "!text-2xl !font-bold text-center !py-4",
                            error && "!border-red-500 text-red-900 bg-white"
                        )}
                    />
                </div>

                {error ? (
                    <p className="text-xs text-red-600 font-bold mt-3 flex items-center gap-1 animate-in slide-in-from-top-1">
                        <AlertCircle size={12} /> {error}
                    </p>
                ) : (
                    <p className="text-xs text-slate-400 mt-3">Enter the final price including taxes.</p>
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
                    onClick={handleSave}
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