import { Box, Truck, ChevronRight } from 'lucide-react';
import { ProductForm } from './AddProductView';

interface Step3Props {
    form: ProductForm;
    handleChange: (field: keyof ProductForm, value: any) => void;
    setStep: (step: number) => void;
}

export function Step3Inventory({ form, handleChange, setStep }: Step3Props) {
    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";
    const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white appearance-none";

    return (
        <div className="space-y-5 animate-in slide-in-from-right duration-300">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className={labelClass}>Inventory Settings</label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] text-slate-400 font-bold mb-1 block">Stock Status</label>
                        <div className="relative">
                            <Box className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <select className={`${inputClass} pl-10`} value={form.stockStatus} onChange={e => handleChange('stockStatus', e.target.value)}>
                                <option value="IN_STOCK">In Stock</option>
                                <option value="ON_DEMAND">On Demand</option>
                            </select>
                            <ChevronRight size={14} className="absolute right-3 top-4 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-bold mb-1 block">MOQ</label>
                        <input type="number" className={inputClass} placeholder="Min Qty" value={form.moq} onChange={e => handleChange('moq', e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className={labelClass}>Logistics</label>
                <div className="relative">
                    <Truck className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <select className={`${inputClass} pl-10`} value={form.deliveryType} onChange={e => handleChange('deliveryType', e.target.value)}>
                        <option value="DELIVERY">Delivery</option>
                        <option value="PICKUP">Pickup Only</option>
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                <button type="button" onClick={() => setStep(4)} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition">Next <ChevronRight size={18} /></button>
            </div>
        </div>
    );
}