'use client';

import { useEffect } from 'react';
import { useProducts } from '@/app/hook/useProducts';
import {
    Plus, Package, Loader2, Pencil, Trash2, Search,
    Filter, AlertCircle, Box, MoreVertical
} from 'lucide-react';

interface ProductsViewProps {
    setActiveView: (view: string) => void;
    userId: string;
    setSelectedProduct: (product: any) => void;
    showToast: (msg: string, type: 'success' | 'error') => void;
}

export function ProductsView({ setActiveView, userId, setSelectedProduct, showToast }: ProductsViewProps) {
    const { products, loading, fetchProducts, deleteProduct } = useProducts(userId);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

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

    const handleCreateNew = () => {
        setSelectedProduct(null); // Clear selection for new entry
        setActiveView('add-product');
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage stock, pricing and product details.</p>
                </div>

                <div className="flex gap-3">
                    {/* Search/Filter placeholder (Visual only for now) */}
                    <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
                        <Search className="text-slate-400" size={18} />
                        <input placeholder="Search products..." className="bg-transparent border-none outline-none text-sm ml-2 w-48" />
                    </div>

                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg shadow-slate-200 active:scale-95 transform duration-200"
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
                    <Loader2 className="animate-spin" size={40} />
                    <span className="font-medium text-sm">Loading inventory...</span>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Package className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg">No products found</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Your inventory is currently empty. Add your first item to start selling.</p>
                    <button
                        onClick={handleCreateNew}
                        className="text-blue-600 font-bold text-sm hover:underline bg-blue-50 px-4 py-2 rounded-lg"
                    >
                        Create first product
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((p: any) => (
                        <div
                            key={p.id}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group flex flex-col overflow-hidden relative"
                        >

                            {/* IMAGE AREA */}
                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                {/* Stock Badge */}
                                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide z-10 backdrop-blur-md shadow-sm ${p.stockStatus === 'IN_STOCK'
                                        ? 'bg-emerald-500/90 text-white'
                                        : 'bg-amber-500/90 text-white'
                                    }`}>
                                    {p.stockStatus?.replace('_', ' ') || 'IN STOCK'}
                                </div>

                                {p.productImage ? (
                                    <img
                                        src={p.productImage}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Package size={40} />
                                    </div>
                                )}

                                {/* Hover Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-110 transition-all"
                                        title="Edit Product"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 hover:text-red-600 hover:scale-110 transition-all"
                                        title="Delete Product"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* DETAILS AREA */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.category}</span>
                                        <h4 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1" title={p.name}>{p.name}</h4>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{p.desc}</p>

                                <div className="mt-auto pt-4 border-t border-slate-50 flex items-end justify-between">
                                    <div>
                                        <span className="text-xs text-slate-400 font-medium">Price</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-slate-900">₹{p.price}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">/ {p.unit}</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-xs text-slate-400 font-medium">MOQ</span>
                                        <p className="text-sm font-bold text-slate-700">{p.moq || 1} {p.unit.toLowerCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}