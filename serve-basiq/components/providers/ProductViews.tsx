'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Package, Image as ImageIcon, Loader2, Pencil, Trash2, ArrowLeft
} from 'lucide-react';

// ==========================================
// 1. PRODUCTS LIST VIEW
// ==========================================
export function ProductsView({ setActiveView, userId, setSelectedProduct, showToast }: any) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        if (!userId) return;
        try {
            const res = await fetch('/api/provider/products', {
                method: 'POST',
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (data.success) setProducts(data.products);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, [userId]);

    const handleEdit = (product: any) => {
        setSelectedProduct(product);
        setActiveView('add-product');
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Product deleted successfully", "success");
                setProducts(products.filter(p => p.id !== id));
            } else {
                showToast("Failed to delete", "error");
            }
        } catch (error) {
            showToast("Error deleting product", "error");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">My Products</h2>
                <button
                    onClick={() => { setSelectedProduct(null); setActiveView('add-product'); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading products...</div>
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
                        <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 group hover:shadow-md transition">
                            <img src={p.img} className="w-20 h-20 rounded-lg object-cover bg-slate-100" />
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                                    <div className="text-xs text-slate-500 mb-1">{p.cat} • MOQ: {p.moq}</div>
                                    <div className="font-bold text-blue-600">₹{p.price}</div>
                                </div>
                                <div className="flex gap-2 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
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
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [image, setImage] = useState<string | null>(null);

    // Initial State
    const [form, setForm] = useState({
        name: '', cat: 'Spare Parts', price: '', moq: '', desc: '',
        // Banking fields (Note: These won't be saved unless schema is updated)
        bank_account_holder_name: '', bank_account_number: '', ifsc_code: '', upi_id: '',
        payout_method: 'Bank Transfer', id_proof_type: 'Aadhaar', id_proof_number: '',
        business_proof_type: 'GST', gst_number: ''
    });

    // ✅ CORRECTLY POPULATE DATA FOR EDITING
    useEffect(() => {
        if (editingProduct) {
            console.log("Populating Form with:", editingProduct);
            setForm({
                name: editingProduct.name || '',
                cat: editingProduct.cat || 'Spare Parts',
                price: editingProduct.price ? String(editingProduct.price) : '',
                moq: editingProduct.moq || '',
                desc: editingProduct.desc || '',
                // Keep default or empty for banking if not available in product data
                bank_account_holder_name: '', bank_account_number: '',
                ifsc_code: '', upi_id: '', payout_method: 'Bank Transfer',
                id_proof_type: 'Aadhaar', id_proof_number: '',
                business_proof_type: 'GST', gst_number: ''
            });
            setImage(editingProduct.img);
        }
    }, [editingProduct]);

    async function handleImageUpload(e: any) {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);

        try {
            const authRes = await fetch("/api/imagekit/auth");
            const auth = await authRes.json();
            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileName", file.name);
            formData.append("publicKey", auth.publicKey);
            formData.append("signature", auth.signature);
            formData.append("expire", String(auth.expire));
            formData.append("token", auth.token);
            formData.append("useUniqueFileName", "true");
            formData.append("folder", "/products");

            const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.url) setImage(data.url);
            else throw new Error("Upload failed");
        } catch (e) {
            alert("Image Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    }

    async function handleSubmit(e: any) {
        e.preventDefault();
        if (!image) return alert("Product image required");
        setLoading(true);

        // Prepare Payload
        const payload = {
            userId,
            name: form.name,
            cat: form.cat,
            price: parseFloat(form.price),
            moq: form.moq,
            desc: form.desc,
            img: image
            // We intentionally do NOT send bank details here because the backend 
            // product table doesn't have them. 
        };

        try {
            let res;
            if (editingProduct) {
                // UPDATE
                res = await fetch(`/api/products/${editingProduct.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // CREATE
                res = await fetch('/api/products/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error("Failed");

            showToast(editingProduct ? "Product Updated!" : "Product Created!", "success");
            setActiveView('products');
        } catch (error) {
            console.error(error);
            showToast("Operation failed", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setActiveView('products')} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ArrowLeft size={20} /></button>
                <h2 className="text-2xl font-bold text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">

                {/* Image Upload */}
                <div className="flex justify-center">
                    <div className="relative w-full h-48 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition overflow-hidden">
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        {uploading ? <Loader2 className="animate-spin text-blue-500" /> : image ? <img src={image} className="w-full h-full object-cover" /> : (
                            <div className="text-center text-slate-400">
                                <ImageIcon className="mx-auto mb-2" />
                                <span className="text-sm font-bold">Upload Product Image</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-5">
                    <div className="col-span-2 text-sm font-bold text-slate-900">Product Details</div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Product Name</label>
                        <input required value={form.name} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="e.g. Heavy Duty Drill" onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Price (₹)</label>
                        <input required type="number" value={form.price} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="0.00" onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">MOQ</label>
                        <input required value={form.moq} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="e.g. 5 Units" onChange={e => setForm({ ...form, moq: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Category</label>
                        <select value={form.cat} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" onChange={e => setForm({ ...form, cat: e.target.value })}>
                            <option>Spare Parts</option>
                            <option>Tools</option>
                            <option>Materials</option>
                            <option>Safety Gear</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                        <textarea required rows={3} value={form.desc} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 outline-none focus:border-blue-500" placeholder="Product details..." onChange={e => setForm({ ...form, desc: e.target.value })} />
                    </div>
                </div>

                {/* Banking Info (Visual Only for now) */}
                {/* <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-5 opacity-50 pointer-events-none">
                    <div className="col-span-2 text-sm font-bold text-slate-900">Banking Information (Coming Soon)</div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Account Holder Name</label>
                        <input disabled value={form.bank_account_holder_name} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50" />
                    </div>
                </div> */}

                <button disabled={loading || uploading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : (editingProduct ? "Update Product" : "Save Product")}
                </button>
            </form>
        </div>
    );
}