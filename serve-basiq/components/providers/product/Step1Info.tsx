import { useState } from 'react';
import { Package, Scale, ChevronRight, LayoutGrid, Box, AlertCircle } from 'lucide-react';
import { ProductForm, Category, SubCategory } from './AddProductView';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
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

    const onFieldChange = (field: keyof ProductForm, value: any) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        handleChange(field, value);
    };

    const getErrorClass = (hasError: boolean) =>
        hasError ? "!border-red-500 bg-red-50 focus:!border-red-500 text-red-900 placeholder:text-red-300" : "bg-slate-50/50";

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="grid grid-cols-3 gap-4">
                {/* Product Name */}
                <div className="col-span-2 space-y-1">
                    <Input
                        label="PRODUCT NAME"
                        icon={<Package size={18} className={errors.name ? "text-red-400" : "text-slate-400"} />}
                        placeholder="e.g. Heavy Duty Drill"
                        value={form.name}
                        onChange={e => onFieldChange('name', e.target.value)}
                        className={getErrorClass(!!errors.name)}
                    />
                    {errors.name && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
                </div>

                {/* Unit Type */}
                <div className="space-y-1">
                    <Select
                        label="UNIT TYPE"
                        icon={<Scale size={18} className={errors.unit ? "text-red-400" : "text-slate-400"} />}
                        value={form.unit}
                        onChange={e => onFieldChange('unit', e.target.value)}
                        className={getErrorClass(!!errors.unit)}
                        options={[
                            { label: 'Select Unit', value: '' },
                            ...['PIECE', 'KG', 'BOX', 'LITER'].map(u => ({ label: u, value: u }))
                        ]}
                    />
                    {errors.unit && <p className="text-xs text-red-500 font-medium"><AlertCircle size={10} className="inline" /> {errors.unit}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                    <Select
                        label="CATEGORY"
                        icon={<LayoutGrid size={18} className={errors.categoryId ? "text-red-400" : "text-slate-400"} />}
                        value={form.categoryId}
                        onChange={e => onFieldChange('categoryId', e.target.value)}
                        className={getErrorClass(!!errors.categoryId)}
                        options={[
                            { label: 'Select Category', value: '' },
                            ...categories.map(c => ({ label: c.name, value: c.id }))
                        ]}
                    />
                    {errors.categoryId && <p className="text-xs text-red-500 font-medium"><AlertCircle size={10} className="inline" /> {errors.categoryId}</p>}
                </div>

                {/* Sub-Category */}
                <div className="space-y-1">
                    <Select
                        label="SUB-CATEGORY"
                        icon={<Box size={18} className={errors.subCategoryId ? "text-red-400" : "text-slate-400"} />}
                        value={form.subCategoryId}
                        onChange={e => onFieldChange('subCategoryId', e.target.value)}
                        className={getErrorClass(!!errors.subCategoryId)}
                        disabled={!form.categoryId}
                        options={[
                            { label: activeSubCategories.length === 0 ? "No Sub-categories" : "Select Sub-Category", value: '' },
                            ...activeSubCategories.map(s => ({ label: s.name, value: s.id }))
                        ]}
                    />
                    {errors.subCategoryId && <p className="text-xs text-red-500 font-medium"><AlertCircle size={10} className="inline" /> {errors.subCategoryId}</p>}
                </div>
            </div>

            {/* Description (Textarea remains native as Input.tsx is an <input>) */}
            <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">DESCRIPTION</label>
                <textarea
                    className={clsx(
                        "w-full px-4 py-3 border rounded-xl outline-none text-sm font-medium transition-all resize-none",
                        errors.desc
                            ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200 text-red-900 placeholder:text-red-300"
                            : "border-gray-200 bg-slate-50/50 focus:bg-white focus:border-blue-500"
                    )}
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