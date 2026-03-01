import { useState } from 'react';
import { Package, Scale, ChevronRight, LayoutGrid, Box, AlertCircle, BadgeIndianRupee, Truck, Tag } from 'lucide-react';
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
    closeForm: () => void;
}

export function Step1Details({ form, categories, activeSubCategories, handleChange, setStep, closeForm }: Step1Props) {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) newErrors.name = "Required";
        if (!form.categoryId) newErrors.categoryId = "Required";
        if (!form.subCategoryId) newErrors.subCategoryId = "Required";
        if (!form.unit) newErrors.unit = "Required";
        if (!form.desc.trim()) newErrors.desc = "Required";
        if (!form.price || Number(form.price) <= 0) newErrors.price = "Valid price required";
        if (!form.moq || Number(form.moq) <= 0) newErrors.moq = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) setStep(2);
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
        <div className="space-y-5 animate-in slide-in-from-right duration-300 pb-4">

            {/* 1. Title / Name (Full Width) */}
            <div className="space-y-1">
                <Input
                    label="PRODUCT NAME"
                    icon={<Package size={18} className={errors.name ? "text-red-400" : "text-slate-400"} />}
                    placeholder="e.g. Heavy Duty Drill"
                    value={form.name}
                    onChange={e => onFieldChange('name', e.target.value)}
                    className={getErrorClass(!!errors.name)}
                />
            </div>

            {/* 2. Category & Sub-Category (2 in a row) */}
            <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div className="space-y-1">
                    <Select
                        label="SUB-CATEGORY"
                        icon={<Box size={18} className={errors.subCategoryId ? "text-red-400" : "text-slate-400"} />}
                        value={form.subCategoryId}
                        onChange={e => onFieldChange('subCategoryId', e.target.value)}
                        className={getErrorClass(!!errors.subCategoryId)}
                        disabled={!form.categoryId}
                        options={[
                            { label: activeSubCategories.length === 0 ? "No Sub-categories" : "Select", value: '' },
                            ...activeSubCategories.map(s => ({ label: s.name, value: s.id }))
                        ]}
                    />
                </div>
            </div>

            {/* 3. Unit Type (Full Width) */}
            <div className="space-y-1">
                <Select
                    label="UNIT TYPE"
                    icon={<Scale size={18} className={errors.unit ? "text-red-400" : "text-slate-400"} />}
                    value={form.unit}
                    onChange={e => onFieldChange('unit', e.target.value)}
                    className={getErrorClass(!!errors.unit)}
                    options={[
                        { label: 'Select Unit', value: '' },
                        ...['PIECE', 'KG', 'GRAM', 'LITER', 'ML', 'BOX', 'PACK', 'SET', 'METER', 'SQ_FT', 'TON'].map(u => ({ label: u, value: u }))
                    ]}
                />
            </div>

            {/* 4. Price & MOQ (2 in a row) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Input
                        label={`PRICE (${form.unit || 'UNIT'})`}
                        type="number"
                        icon={<BadgeIndianRupee size={18} className={errors.price ? "text-red-400" : "text-slate-400"} />}
                        placeholder="0.00"
                        value={form.price}
                        onChange={e => onFieldChange('price', e.target.value)}
                        className={getErrorClass(!!errors.price)}
                    />
                </div>
                <div className="space-y-1">
                    <Input
                        label="MIN ORDER (MOQ)"
                        type="number"
                        icon={<Package size={18} className={errors.moq ? "text-red-400" : "text-slate-400"} />}
                        placeholder="1"
                        value={form.moq}
                        onChange={e => onFieldChange('moq', e.target.value)}
                        className={getErrorClass(!!errors.moq)}
                    />
                </div>
            </div>

            {/* 5. Condition & Stock (2 in a row) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Select
                        label="CONDITION"
                        icon={<Tag size={18} className="text-slate-400" />}
                        value={form.condition}
                        onChange={e => onFieldChange('condition', e.target.value)}
                        className="bg-slate-50/50"
                        options={[
                            { label: 'New', value: 'NEW' },
                            { label: 'Used', value: 'USED' },
                            { label: 'Refurbished', value: 'REFURBISHED' }
                        ]}
                    />
                </div>
                <div className="space-y-1">
                    <Select
                        label="STOCK STATUS"
                        icon={<Box size={18} className="text-slate-400" />}
                        value={form.stockStatus}
                        onChange={e => onFieldChange('stockStatus', e.target.value)}
                        className="bg-slate-50/50"
                        options={[
                            { label: 'In Stock', value: 'IN_STOCK' },
                            { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
                            { label: 'On Demand', value: 'ON_DEMAND' },
                            { label: 'Made to Order', value: 'MADE_TO_ORDER' }
                        ]}
                    />
                </div>
            </div>

            {/* 6. Delivery Type (Full Width) */}
            <div className="space-y-1">
                <Select
                    label="DELIVERY TYPE"
                    icon={<Truck size={18} className="text-slate-400" />}
                    value={form.deliveryType}
                    onChange={e => onFieldChange('deliveryType', e.target.value)}
                    className="bg-slate-50/50"
                    options={[
                        { label: 'Pickup', value: 'PICKUP' },
                        { label: 'Delivery', value: 'DELIVERY' },
                        { label: 'Both', value: 'BOTH' }
                    ]}
                />
            </div>

            {/* 7. Description (Full Width) */}
            <div className="space-y-1 pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">DESCRIPTION</label>
                <textarea
                    className={clsx(
                        "w-full px-4 py-3 border rounded-xl outline-none text-sm font-medium transition-all resize-none",
                        errors.desc ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200 text-red-900" : "border-gray-200 bg-slate-50/50 focus:bg-white focus:border-blue-500"
                    )}
                    rows={4}
                    placeholder="Describe product features, specifications, and details..."
                    value={form.desc}
                    onChange={e => onFieldChange('desc', e.target.value)}
                />
            </div>

            {/* Global Error Notice if missing fields */}
            {Object.keys(errors).length > 0 && (
                <p className="text-xs text-red-500 font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100">
                    <AlertCircle size={14} className="inline mr-1 -mt-0.5" /> Please fill out all required fields properly.
                </p>
            )}

            {/* Actions */}
            <div className="pt-4 space-y-3">
                <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition active:scale-[0.99] shadow-lg shadow-slate-200"
                >
                    Next: Add Media <ChevronRight size={18} />
                </button>
                <button
                    type="button"
                    onClick={closeForm}
                    className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}