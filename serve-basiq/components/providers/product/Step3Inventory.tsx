import { Box, Truck, ChevronRight } from 'lucide-react';
import { ProductForm } from './AddProductView';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface Step3Props {
    form: ProductForm;
    handleChange: (field: keyof ProductForm, value: any) => void;
    setStep: (step: number) => void;
}

export function Step3Inventory({ form, handleChange, setStep }: Step3Props) {
    return (
        <div className="space-y-5 animate-in slide-in-from-right duration-300">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="block text-xs font-bold text-slate-500 uppercase mb-4">Inventory Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="STOCK STATUS"
                        icon={<Box size={18} className="text-slate-400" />}
                        value={form.stockStatus}
                        onChange={e => handleChange('stockStatus', e.target.value)}
                        className="bg-slate-50/50"
                        options={[
                            { label: 'In Stock', value: 'IN_STOCK' },
                            { label: 'On Demand', value: 'ON_DEMAND' }
                        ]}
                    />
                    <Input
                        label="MOQ"
                        type="number"
                        placeholder="Min Qty"
                        value={form.moq}
                        onChange={e => handleChange('moq', e.target.value)}
                        className="bg-slate-50/50"
                    />
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Select
                    label="LOGISTICS"
                    icon={<Truck size={18} className="text-slate-400" />}
                    value={form.deliveryType}
                    onChange={e => handleChange('deliveryType', e.target.value)}
                    className="bg-slate-50/50"
                    options={[
                        { label: 'Delivery', value: 'DELIVERY' },
                        { label: 'Pickup Only', value: 'PICKUP' }
                    ]}
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                <button type="button" onClick={() => setStep(4)} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition">Next <ChevronRight size={18} /></button>
            </div>
        </div>
    );
}