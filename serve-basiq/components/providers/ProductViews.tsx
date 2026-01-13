'use client';

import { useState, useEffect } from 'react';
import { useProducts } from '@/app/hook/useProducts'; // Ensure path is correct
import {
    Plus, Package, Image as ImageIcon, Loader2, Pencil, Trash2, ArrowLeft,
    Check, X, UploadCloud, Layers, AlertCircle
} from 'lucide-react';

// --- HELPER: Upload to Backend (R2) ---
async function uploadToBackend(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    // Call your centralized upload API (handles R2/S3)
    const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();

    // Return the URL provided by your backend
    return data.url;
}

// ==========================================
// 1. PRODUCTS LIST VIEW
// ==========================================
export function ProductsView({ setActiveView, userId, setSelectedProduct, showToast }: any) {
    const { products, loading, fetchProducts, deleteProduct } = useProducts(userId);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleEdit = (product: any) => {
        setSelectedProduct(product);
        setActiveView('add-product');
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const success = await deleteProduct(id);
        if (success) showToast("Product deleted successfully", "success");
        else showToast("Failed to delete", "error");
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">My Inventory</h2>
                    <p className="text-sm text-slate-500">Manage your stock, pricing, and galleries.</p>
                </div>
                <button
                    onClick={() => { setSelectedProduct(null); setActiveView('add-product'); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                    <Loader2 className="animate-spin" />
                    <span>Loading inventory...</span>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-slate-900 font-bold">No products yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Start selling your items today.</p>
                    <button onClick={() => setActiveView('add-product')} className="text-blue-600 font-bold text-sm hover:underline">Add your first product</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => (
                        <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 group hover:shadow-md transition relative overflow-hidden">
                            {/* Status Badge */}
                            <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-xl text-[10px] font-bold uppercase z-10 ${p.stockStatus === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                {p.stockStatus?.replace('_', ' ')}
                            </div>

                            <img src={p.productImage} className="w-24 h-24 rounded-lg object-cover bg-slate-100 border border-slate-100" />

                            <div className="flex-1 flex flex-col justify-between pt-4">
                                <div>
                                    <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                                    <div className="text-xs text-slate-500 mb-1">{p.category}</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-bold text-blue-600 text-lg">₹{p.price}</span>
                                        <span className="text-xs text-slate-400">/ {p.unit.toLowerCase()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(p)} className="p-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


// ==========================================
// 2. ADD / EDIT PRODUCT FORM
// ==========================================
export function AddProductView({ setActiveView, userId, showToast, editingProduct }: any) {
    const { saveProduct, loading: saving } = useProducts(userId);

    const [uploading, setUploading] = useState(false);
    const [uploadTarget, setUploadTarget] = useState<'main' | 'gallery' | null>(null);

    // Form State matching Prisma Model
    const [form, setForm] = useState({
        name: '',
        category: 'Spare Parts',
        desc: '',
        productImage: '',
        gallery: [] as string[],
        price: '',
        moq: '',
        stockStatus: 'IN_STOCK',
        unit: 'PIECE',
        deliveryType: 'DELIVERY'
    });

    useEffect(() => {
        if (editingProduct) {
            setForm({
                name: editingProduct.name || '',
                category: editingProduct.category || 'Spare Parts',
                desc: editingProduct.desc || '',
                productImage: editingProduct.productImage || '',
                gallery: editingProduct.gallery || [],
                price: editingProduct.price ? String(editingProduct.price) : '',
                moq: editingProduct.moq ? String(editingProduct.moq) : '',
                stockStatus: editingProduct.stockStatus || 'IN_STOCK',
                unit: editingProduct.unit || 'PIECE',
                deliveryType: editingProduct.deliveryType || 'DELIVERY'
            });
        }
    }, [editingProduct]);

    // Unified Image Upload Handler
    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'gallery') {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadTarget(target);

        try {
            const url = await uploadToBackend(file); // Uses the R2 API

            if (target === 'main') {
                setForm(prev => ({ ...prev, productImage: url }));
            } else {
                setForm(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
            }
            showToast("Image uploaded!", "success");
        } catch (e: any) {
            console.error(e);
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
            setUploadTarget(null);
        }
    }

    const removeGalleryImage = (index: number) => {
        setForm(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.productImage) return showToast("Main product image is required", "error");

        const payload = {
            id: editingProduct?.id, // Only needed for update
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
    }

    // Styles
    const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-sm font-medium";
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 top-0 bg-[#F8F9FC] z-10 py-4">
                <button onClick={() => setActiveView('products')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"><ArrowLeft size={20} /></button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                    <p className="text-xs text-slate-500">Fill in the details below to list your item.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COL: IMAGES */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Main Image */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <label className={labelClass}>Main Product Image</label>
                        <div className="relative aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 transition flex flex-col items-center justify-center overflow-hidden group">
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'main')} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer z-10" />

                            {uploading && uploadTarget === 'main' ? (
                                <Loader2 className="animate-spin text-blue-600" />
                            ) : form.productImage ? (
                                <img src={form.productImage} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <ImageIcon className="mx-auto mb-2" />
                                    <span className="text-xs font-bold">Upload Main Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <label className={labelClass}>Gallery (Optional)</label>
                        <div className="grid grid-cols-3 gap-2">
                            {form.gallery.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition">
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            <div className="relative aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 transition flex items-center justify-center cursor-pointer">
                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'gallery')} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                                {uploading && uploadTarget === 'gallery' ? <Loader2 className="animate-spin w-4 h-4 text-blue-600" /> : <Plus className="text-slate-400" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: DETAILS */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Info */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <Package className="text-blue-600" size={20} />
                            <h3 className="font-bold text-lg">Product Details</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <label className={labelClass}>Product Name</label>
                                <input required value={form.name} className={inputClass} placeholder="e.g. Heavy Duty Drill" onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>

                            <div className="col-span-2">
                                <label className={labelClass}>Description</label>
                                <textarea required rows={4} value={form.desc} className={inputClass} placeholder="Describe your product..." onChange={e => setForm({ ...form, desc: e.target.value })} />
                            </div>

                            <div>
                                <label className={labelClass}>Category</label>
                                <select value={form.category} className={inputClass} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    <option>Spare Parts</option>
                                    <option>Tools</option>
                                    <option>Materials</option>
                                    <option>Safety Gear</option>
                                    <option>Electronics</option>
                                    <option>Plumbing</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Stock Status</label>
                                <select value={form.stockStatus} className={inputClass} onChange={e => setForm({ ...form, stockStatus: e.target.value })}>
                                    <option value="IN_STOCK">In Stock</option>
                                    <option value="ON_DEMAND">On Demand</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Units */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <Layers className="text-blue-600" size={20} />
                            <h3 className="font-bold text-lg">Pricing & Units</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Price (₹)</label>
                                <input required type="number" value={form.price} className={inputClass} placeholder="0.00" onChange={e => setForm({ ...form, price: e.target.value })} />
                            </div>

                            <div>
                                <label className={labelClass}>Unit Type</label>
                                <select value={form.unit} className={inputClass} onChange={e => setForm({ ...form, unit: e.target.value })}>
                                    <option value="PIECE">Per Piece</option>
                                    <option value="KG">Per KG</option>
                                    <option value="BOX">Per Box</option>
                                    <option value="LITER">Per Liter</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Minimum Order Qty (MOQ)</label>
                                <input required type="number" value={form.moq} className={inputClass} placeholder="e.g. 1" onChange={e => setForm({ ...form, moq: e.target.value })} />
                            </div>

                            <div>
                                <label className={labelClass}>Delivery Mode</label>
                                <select value={form.deliveryType} className={inputClass} onChange={e => setForm({ ...form, deliveryType: e.target.value })}>
                                    <option value="DELIVERY">Delivery</option>
                                    <option value="PICKUP">Pickup Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4 sticky bottom-6 z-20">
                        <button type="button" onClick={() => setActiveView('products')} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || uploading} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-xl">
                            {saving ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                            {editingProduct ? "Update Product" : "Save Product"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}