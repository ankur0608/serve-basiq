'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProducts } from '@/app/hook/useProducts';
import AppImage from '@/components/ui/AppImage';
import {
    Package, BadgeIndianRupee, ChevronRight, Loader2, Save, UploadCloud,
    Trash2, X, LayoutGrid, Scale, Box, Truck, Plus
} from 'lucide-react';

// --- HELPER: Upload to Backend ---
async function uploadToBackend(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
}

// --- Interfaces ---
interface SubCategory { id: string; name: string; }
interface Category { id: string; name: string; children: SubCategory[]; }

interface AddProductProps {
    setActiveView: (view: string) => void;
    userId: string;
    showToast: (msg: string, type: 'success' | 'error') => void;
    editingProduct?: any;
}

export function AddProductView({ setActiveView, userId, showToast, editingProduct }: AddProductProps) {
    // loading state comes from useMutation (aliased as saving in your logic, or isSaving from hook)
    const { saveProduct, isSaving } = useProducts(userId);

    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<'main' | 'gallery' | null>(null);

    // Categories State
    const [categories, setCategories] = useState<Category[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loadingCats, setLoadingCats] = useState(true);

    const [form, setForm] = useState({
        name: editingProduct?.name || '',
        desc: editingProduct?.desc || '',

        categoryId: editingProduct?.categoryId || '',
        subCategoryIds: editingProduct?.subcategories
            ? editingProduct.subcategories.map((s: any) => s.id)
            : [] as string[],

        productImage: editingProduct?.productImage || editingProduct?.image || '',
        gallery: editingProduct?.gallery || [] as string[],

        price: editingProduct?.price ? String(editingProduct.price) : '',
        moq: editingProduct?.moq ? String(editingProduct.moq) : '1',
        stockStatus: editingProduct?.stockStatus || 'IN_STOCK',
        unit: editingProduct?.unit || 'PIECE',
        deliveryType: editingProduct?.deliveryType || 'DELIVERY'
    });

    // 1. Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories?type=PRODUCT');
                const data = await res.json();
                if (Array.isArray(data)) setCategories(data);
            } catch (error) {
                console.error("Failed to load categories");
                showToast("Failed to load categories", "error");
            } finally {
                setLoadingCats(false);
            }
        };
        fetchCategories();
    }, [showToast]);

    // Filter subcategories based on current categoryId
    const activeSubCategories = useMemo(() => {
        const selectedCat = categories.find(c => c.id === form.categoryId);
        return selectedCat ? selectedCat.children : [];
    }, [categories, form.categoryId]);

    const handleChange = useCallback((field: string, value: any) => {
        setForm(prev => {
            // Reset subcategories if parent category changes
            if (field === 'categoryId') {
                return { ...prev, [field]: value, subCategoryIds: [] };
            }
            return { ...prev, [field]: value };
        });
    }, []);

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'gallery') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setActiveUploadField(target);

        try {
            const url = await uploadToBackend(file);
            if (target === 'main') {
                setForm(prev => ({ ...prev, productImage: url }));
            } else {
                setForm(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
            }
            showToast("Image uploaded!", "success");
        } catch (e) {
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
            setActiveUploadField(null);
        }
    }, [showToast]);

    const removeGalleryImg = useCallback((index: number) => {
        setForm(prev => {
            const newGallery = [...prev.gallery];
            newGallery.splice(index, 1);
            return { ...prev, gallery: newGallery };
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.productImage) return showToast("Main product image is required", "error");

        const payload = {
            id: editingProduct?.id, // ID presence tells the hook to UPDATE instead of CREATE
            ...form,
            price: parseFloat(form.price),
            moq: parseInt(form.moq),
        };

        try {
            // ✅ FIX: Removed the second argument (!!editingProduct).
            // TanStack Query's mutateAsync only takes one argument (the payload).
            await saveProduct(payload);

            showToast(editingProduct ? "Product Updated!" : "Product Created!", "success");
            setActiveView('products');
        } catch (error: any) {
            // React Query throws on error, so we catch it here
            showToast(error.message || "Failed to save", "error");
        }
    };

    const closeForm = useCallback(() => setActiveView('products'), [setActiveView]);

    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";
    const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all bg-slate-50/50 focus:bg-white appearance-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full mx-auto relative flex flex-col max-h-[90vh]">

                <button onClick={closeForm} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition">
                    <X size={24} />
                </button>

                <div className="bg-slate-900 p-6 text-white relative shrink-0">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-xl font-bold">
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </h2>
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">
                            Step {step} of 4
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">

                    {/* --- STEP 1: INFO & CATEGORIES --- */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className={labelClass}>Product Name</label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <input className={`${inputClass} pl-10`} placeholder="e.g. Heavy Duty Drill" value={form.name} onChange={e => handleChange('name', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Unit Type</label>
                                    <div className="relative">
                                        <Scale className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <select className={`${inputClass} pl-10`} value={form.unit} onChange={e => handleChange('unit', e.target.value)}>
                                            {['PIECE', 'KG', 'BOX', 'LITER'].map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                        <ChevronRight size={16} className="absolute right-3 top-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* DROPDOWN CATEGORY SELECTOR */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Category</label>
                                    <div className="relative">
                                        <LayoutGrid className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <select
                                            className={`${inputClass} pl-10`}
                                            value={form.categoryId}
                                            onChange={e => handleChange('categoryId', e.target.value)}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronRight size={16} className="absolute right-3 top-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Sub-Category</label>
                                    <div className="relative">
                                        <Box className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <select
                                            className={`${inputClass} pl-10`}
                                            disabled={!form.categoryId}
                                            value={form.subCategoryIds[0] || ""}
                                            onChange={e => handleChange('subCategoryIds', [e.target.value])}
                                        >
                                            <option value="">{activeSubCategories.length === 0 ? "No Sub-categories" : "Select Sub-Category"}</option>
                                            {activeSubCategories.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <ChevronRight size={16} className="absolute right-3 top-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Describe product features..." value={form.desc} onChange={e => handleChange('desc', e.target.value)} />
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!form.categoryId || form.subCategoryIds.length === 0 || !form.name}
                                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* --- STEP 2: IMAGES --- */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div>
                                <label className={labelClass}>Main Product Image</label>
                                <div className="relative aspect-video rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group hover:border-blue-300 transition-colors">
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'main')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    {form.productImage ? (
                                        <AppImage
                                            src={form.productImage}
                                            alt="Product Preview"
                                            type="card"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <UploadCloud className="mx-auto mb-2" size={24} />
                                            <span className="text-xs font-bold">Click to Upload</span>
                                        </div>
                                    )}
                                    {uploading && activeUploadField === 'main' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Gallery (Optional)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {form.gallery.map((img: string, i: number) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100">
                                            <AppImage
                                                src={img}
                                                alt={`Gallery ${i}`}
                                                type="thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                            <button type="button" onClick={() => removeGalleryImg(i)} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition z-10"><Trash2 size={10} /></button>
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

                    {/* --- STEP 3: INVENTORY --- */}
                    {step === 3 && (
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
                    )}

                    {/* --- STEP 4: PRICING --- */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <label className={labelClass}>Selling Price per {form.unit.toLowerCase()}</label>
                                <div className="relative w-full max-w-50 mt-2">
                                    <BadgeIndianRupee className="absolute left-4 top-4 text-slate-400" size={24} />
                                    <input type="number" className="w-full pl-12 pr-4 py-3 text-2xl font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center" placeholder="0.00" value={form.price} onChange={e => handleChange('price', e.target.value)} />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Enter the final price including taxes.</p>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setStep(3)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Back</button>
                                <button type="submit" disabled={isSaving} className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200">
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
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