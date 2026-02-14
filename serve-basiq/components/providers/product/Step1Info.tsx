import { useState } from 'react';
import { Package, Scale, ChevronRight, LayoutGrid, Box, AlertCircle } from 'lucide-react';
import { ProductForm, Category, SubCategory } from './AddProductView';
import clsx from 'clsx';

interface Step1Props {
    form: ProductForm;
    categories: Category[];
    activeSubCategories: SubCategory[];
    handleChange: (field: keyof ProductForm, value: any) => void;
    setStep: (step: number) => void;
}

export function Step1Info({ form, categories, activeSubCategories, handleChange, setStep }: Step1Props) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";

    // Dynamic class generator for inputs
    const getInputClass = (hasError: boolean) => clsx(
        "w-full px-4 py-3 border rounded-xl outline-none text-sm font-medium transition-all appearance-none",
        hasError
            ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200 text-red-900 placeholder:text-red-300"
            : "border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500"
    );

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) newErrors.name = "Product name is required";
        else if (form.name.length < 3) newErrors.name = "Name must be at least 3 chars";

        if (!form.unit) newErrors.unit = "Unit is required";
        if (!form.categoryId) newErrors.categoryId = "Category is required";
        if (!form.subCategoryId) newErrors.subCategoryId = "Sub-category is required";

        if (!form.desc.trim()) newErrors.desc = "Description is required";
        else if (form.desc.length < 10) newErrors.desc = "Description should be detailed (min 10 chars)";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            setStep(2);
        }
    };

    // Clear error when user types
    const onFieldChange = (field: keyof ProductForm, value: any) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        handleChange(field, value);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="grid grid-cols-3 gap-4">
                {/* Product Name */}
                <div className="col-span-2 space-y-1">
                    <label className={labelClass}>Product Name</label>
                    <div className="relative">
                        <Package className={clsx("absolute left-3 top-3.5", errors.name ? "text-red-400" : "text-slate-400")} size={18} />
                        <input
                            className={`${getInputClass(!!errors.name)} pl-10`}
                            placeholder="e.g. Heavy Duty Drill"
                            value={form.name}
                            onChange={e => onFieldChange('name', e.target.value)}
                        />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
                </div>

                {/* Unit Type */}
                <div className="space-y-1">
                    <label className={labelClass}>Unit Type</label>
                    <div className="relative">
                        <Scale className={clsx("absolute left-3 top-3.5", errors.unit ? "text-red-400" : "text-slate-400")} size={18} />
                        <select
                            className={`${getInputClass(!!errors.unit)} pl-10`}
                            value={form.unit}
                            onChange={e => onFieldChange('unit', e.target.value)}
                        >
                            {['PIECE', 'KG', 'BOX', 'LITER'].map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronRight size={16} className="absolute right-3 top-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                    {errors.unit && <p className="text-xs text-red-500 font-medium">{errors.unit}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                    <label className={labelClass}>Category</label>
                    <div className="relative">
                        <LayoutGrid className={clsx("absolute left-3 top-3.5", errors.categoryId ? "text-red-400" : "text-slate-400")} size={18} />
                        <select
                            className={`${getInputClass(!!errors.categoryId)} pl-10`}
                            value={form.categoryId}
                            onChange={e => onFieldChange('categoryId', e.target.value)}
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronRight size={16} className="absolute right-3 top-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                    {errors.categoryId && <p className="text-xs text-red-500 font-medium">{errors.categoryId}</p>}
                </div>

                {/* Sub-Category */}
                <div className="space-y-1">
                    <label className={labelClass}>Sub-Category</label>
                    <div className="relative">
                        <Box className={clsx("absolute left-3 top-3.5", errors.subCategoryId ? "text-red-400" : "text-slate-400")} size={18} />
                        <select
                            className={`${getInputClass(!!errors.subCategoryId)} pl-10`}
                            disabled={!form.categoryId}
                            value={form.subCategoryId}
                            onChange={e => onFieldChange('subCategoryId', e.target.value)}
                        >
                            <option value="">{activeSubCategories.length === 0 ? "No Sub-categories" : "Select Sub-Category"}</option>
                            {activeSubCategories.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <ChevronRight size={16} className="absolute right-3 top-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                    {errors.subCategoryId && <p className="text-xs text-red-500 font-medium">{errors.subCategoryId}</p>}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label className={labelClass}>Description</label>
                <textarea
                    className={`${getInputClass(!!errors.desc)} resize-none`}
                    rows={2}
                    placeholder="Describe product features..."
                    value={form.desc}
                    onChange={e => onFieldChange('desc', e.target.value)}
                />
                {errors.desc && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle size={10} /> {errors.desc}</p>}
            </div>

            <button
                type="button"
                onClick={handleNext}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition mt-4 active:scale-[0.99]"
            >
                Next Step <ChevronRight size={18} />
            </button>
        </div>
    );
}