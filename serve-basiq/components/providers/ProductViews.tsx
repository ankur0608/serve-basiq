'use client';

import { useState, useEffect } from 'react';
import { useProducts } from '@/app/hook/useProducts';
import {
    Package, ImageIcon, BadgeIndianRupee,
    ChevronRight, Loader2, Save, UploadCloud,
    Trash2, X, Tag, Layers, Truck, Box, Plus, Camera
} from 'lucide-react';

// --- HELPER: Upload to Backend ---
async function uploadToBackend(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
}

interface AddProductProps {
    setActiveView: (view: string) => void;
    userId: string;
    showToast: (msg: string, type: 'success' | 'error') => void;
    editingProduct?: any;
}

export function AddProductView({ setActiveView, userId, showToast, editingProduct }: AddProductProps) {
    const { saveProduct, loading: saving } = useProducts(userId);

    // UI State
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<'main' | 'gallery' | null>(null);

    // Form State
    const [form, setForm] = useState({
        name: '',
        category: 'Spare Parts',
        desc: '',
        productImage: '',
        gallery: [] as string[],
        price: '',
        moq: '1',
        stockStatus: 'IN_STOCK',
        unit: 'PIECE',
        deliveryType: 'DELIVERY'
    });

    // Load Data if Editing
    useEffect(() => {
        if (editingProduct) {
            setForm({
                name: editingProduct.name || '',
                category: editingProduct.category || 'Spare Parts',
                desc: editingProduct.desc || '',
                productImage: editingProduct.productImage || '',
                gallery: editingProduct.gallery || [],
                price: editingProduct.price ? String(editingProduct.price) : '',
                moq: editingProduct.moq ? String(editingProduct.moq) : '1',
                stockStatus: editingProduct.stockStatus || 'IN_STOCK',
                unit: editingProduct.unit || 'PIECE',
                deliveryType: editingProduct.deliveryType || 'DELIVERY'
            });
        }
    }, [editingProduct]);

    // --- Handlers ---

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'gallery') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setActiveUploadField(target);

        try {
            const url = await uploadToBackend(file);
            if (target === 'main') {
                handleChange('productImage', url);
            } else {
                handleChange('gallery', [...form.gallery, url]);
            }
            showToast("Image uploaded!", "success");
        } catch (e) {
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
            setActiveUploadField(null);
        }
    };

    const removeGalleryImg = (index: number) => {
        const newGallery = [...form.gallery];
        newGallery.splice(index, 1);
        handleChange('gallery', newGallery);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.productImage) return showToast("Main product image is required", "error");

        const payload = {
            id: editingProduct?.id,
            ...form,
            price: parseFloat(form.price),
            moq: parseInt(form.moq),
        };

        const result = await saveProduct(payload, !!editingProduct);

        if (result.success) {
            showToast(editingProduct ? "Product Updated!" : "Product Created!", "success");
            setActiveView('products');
        } else {
            showToast(result.error || "Failed to save", "error");
        }
    };

    const closeForm = () => setActiveView('products');

    // Styles matching ServiceSettingsView
    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";
    const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white";

    return (
        // 🟢 MODAL WRAPPER
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full mx-auto relative flex flex-col max-h-[90vh]">

                {/* Close Button */}
                <button onClick={closeForm} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition">
                    <X size={24} />
                </button>

                {/* --- HEADER --- */}
                <div className="bg-slate-900 p-6 text-white relative shrink-0">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-xl font-bold">
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </h2>
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">
                            Step {step} of 4
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm">
                        {step === 1 && "Product Details"}
                        {step === 2 && "Product Images"}
                        {step === 3 && "Inventory & Shipping"}
                        {step === 4 && "Pricing Finalization"}
                    </p>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                {/* SCROLLABLE FORM AREA */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">

                    {/* --- STEP 1: BASIC INFO --- */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in slide-in-from-right duration-300">

                            {/* Name */}
                            <div>
                                <label className={labelClass}>Product Name</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        className={`${inputClass} pl-10`}
                                        placeholder="e.g. Heavy Duty Drill"
                                        value={form.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className={labelClass}>Category</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <select className={`${inputClass} pl-10`} value={form.category} onChange={e => handleChange('category', e.target.value)}>
                                        <option>Spare Parts</option>
                                        <option>Tools</option>
                                        <option>Materials</option>
                                        <option>Safety Gear</option>
                                        <option>Electronics</option>
                                        <option>Plumbing</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea
                                    className={inputClass}
                                    rows={4}
                                    placeholder="Describe your product features..."
                                    value={form.desc}
                                    onChange={e => handleChange('desc', e.target.value)}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition mt-4"
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* --- STEP 2: VISUALS --- */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">

                            {/* Main Image */}
                            <div>
                                <label className={labelClass}>Main Product Image</label>
                                <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-300 transition-colors">
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'main')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    {form.productImage ? (
                                        <img src={form.productImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <UploadCloud className="mx-auto mb-2" size={24} />
                                            <span className="text-xs font-bold">Click to Upload</span>
                                        </div>
                                    )}
                                    {uploading && activeUploadField === 'main' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
                                </div>
                            </div>

                            {/* Gallery */}
                            <div>
                                <label className={labelClass}>Gallery (Optional)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {form.gallery.map((img: string, i: number) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeGalleryImg(i)} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition"><Trash2 size={10} /></button>
                                        </div>
                                    ))}
                                    <div className="relative aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-blue-300 transition-colors cursor-pointer">
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'gallery')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        {uploading && activeUploadField === 'gallery' ? <Loader2 className="animate-spin text-blue-400" size={16} /> : <Plus className="text-slate-400" size={20} />}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                                <button type="button" onClick={() => setStep(3)} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition">Next <ChevronRight size={18} /></button>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 3: INVENTORY & LOGISTICS --- */}
                    {step === 3 && (
                        <div className="space-y-5 animate-in slide-in-from-right duration-300">

                            {/* Stock & Unit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Stock Status</label>
                                    <div className="relative">
                                        <Box className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <select className={`${inputClass} pl-10`} value={form.stockStatus} onChange={e => handleChange('stockStatus', e.target.value)}>
                                            <option value="IN_STOCK">In Stock</option>
                                            <option value="ON_DEMAND">On Demand</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Unit Type</label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <select className={`${inputClass} pl-10`} value={form.unit} onChange={e => handleChange('unit', e.target.value)}>
                                            <option value="PIECE">Piece</option>
                                            <option value="KG">Kg</option>
                                            <option value="BOX">Box</option>
                                            <option value="LITER">Liter</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery & MOQ */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Delivery Mode</label>
                                    <div className="relative">
                                        <Truck className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <select className={`${inputClass} pl-10`} value={form.deliveryType} onChange={e => handleChange('deliveryType', e.target.value)}>
                                            <option value="DELIVERY">Delivery</option>
                                            <option value="PICKUP">Pickup Only</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>MOQ</label>
                                    <input
                                        type="number"
                                        className={inputClass}
                                        placeholder="Min Qty"
                                        value={form.moq}
                                        onChange={e => handleChange('moq', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                                <button type="button" onClick={() => setStep(4)} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition">Next <ChevronRight size={18} /></button>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 4: PRICING --- */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">

                            {/* Price */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <label className={labelClass}>Selling Price per {form.unit.toLowerCase()}</label>
                                <div className="relative w-full max-w-[200px] mt-2">
                                    <BadgeIndianRupee className="absolute left-4 top-4 text-slate-400" size={24} />
                                    <input
                                        type="number"
                                        className="w-full pl-12 pr-4 py-3 text-2xl font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                        placeholder="0.00"
                                        value={form.price}
                                        onChange={e => handleChange('price', e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Enter the final price including taxes if applicable.</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setStep(3)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                                <button type="submit" disabled={saving} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200">
                                    {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                    {editingProduct ? "Update Product" : "Save Product"}
                                </button>
                            </div>

                            <button type="button" onClick={closeForm} className="w-full text-xs font-bold text-slate-400 hover:text-red-500 transition mt-2">Cancel and Exit</button>
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
}