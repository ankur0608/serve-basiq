'use client';

import { useCallback, memo } from 'react';
import { useProducts } from '@/app/hook/useProducts';
import { Plus, Package, Loader2, Pencil, Trash2 } from 'lucide-react';

interface ProductsViewProps {
    setActiveView: (view: string) => void;
    userId: string;
    setSelectedProduct: (product: any) => void;
    showToast: (msg: string, type: 'success' | 'error') => void;
    providerType?: string;
}

const ProductTableRow = memo(({ p, index, onEdit, onDelete }: { p: any, index: number, onEdit: (p: any) => void, onDelete: (id: string) => void }) => {
    const isInStock = p.stockStatus === 'IN_STOCK';

    return (
        <tr className="group border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
            <td className="py-4 pl-6 align-middle">
                <span className="text-sm font-bold text-slate-500">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
            </td>
            <td className="py-4 align-middle">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {p.productImage ? (
                            <img src={p.productImage} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                            <Package size={16} className="text-slate-300 m-auto" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{p.desc || 'No description'}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 align-middle">
                {/* ✅ FIX 1: Access category safely (it might be a string from your hook or an object) */}
                <span className="text-[10px] font-bold uppercase bg-purple-50 text-purple-600 px-2 py-1 rounded">
                    {typeof p.category === 'object' ? p.category?.name : (p.category || 'General')}
                </span>
            </td>
            <td className="py-4 align-middle">
                {/* ✅ FIX 2: Render SINGLE subcategory object, not map() */}
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {p.subcategory ? (
                        <span className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {p.subcategory.name}
                        </span>
                    ) : (
                        <span className="text-[10px] text-slate-400">---</span>
                    )}
                </div>
            </td>
            <td className="py-4 align-middle font-bold text-slate-700 text-sm">₹{p.price}</td>
            <td className="py-4 align-middle">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isInStock ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {p.stockStatus?.replace('_', ' ') || 'Active'}
                </span>
            </td>
            <td className="py-4 pr-6 align-middle text-right flex justify-end gap-2">
                <button onClick={() => onEdit(p)} className="p-2 border rounded-lg hover:bg-blue-50 text-slate-500 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => onDelete(p.id)} className="p-2 border rounded-lg hover:bg-red-50 text-slate-500 transition-colors"><Trash2 size={14} /></button>
            </td>
        </tr>
    );
});
ProductTableRow.displayName = "ProductTableRow";

export function ProductsView({ setActiveView, userId, setSelectedProduct, showToast, providerType }: ProductsViewProps) {

    const { products, loading, deleteProduct, isDeleting } = useProducts(userId);

    const handleEdit = useCallback((product: any) => {
        setSelectedProduct(product);
        setActiveView('add-product');
    }, [setSelectedProduct, setActiveView]);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id);
            showToast("Product deleted successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete", "error");
        }
    }, [deleteProduct, showToast]);

    const handleCreateNew = useCallback(() => {
        setSelectedProduct(null);
        setActiveView('add-product');
    }, [setSelectedProduct, setActiveView]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20 p-4">

            {/* View Toggle */}
            {providerType === 'BOTH' && (
                <div className="flex p-1.5 bg-white rounded-xl mb-6 max-w-md border border-slate-200 shadow-sm mx-auto md:mx-0">
                    <button
                        onClick={() => setActiveView('settings')}
                        className="flex-1 py-3 text-sm font-bold rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                    >
                        Services & Rentals
                    </button>
                    <button
                        onClick={() => setActiveView('products')}
                        className="flex-1 py-3 text-sm font-bold rounded-lg bg-slate-900 text-white shadow-md transition-all"
                    >
                        Products
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Products</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage your inventory and pricing.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg active:scale-95"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* List / Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
                    <Loader2 className="animate-spin" size={40} />
                    <span className="font-medium text-sm">Loading inventory...</span>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <Package className="text-slate-300 mb-4" size={48} />
                    <h3 className="text-slate-900 font-bold text-lg">No products found</h3>
                    <button onClick={handleCreateNew} className="mt-4 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                        Create first product
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden relative">
                    {isDeleting && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-slate-900" />
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="py-4 pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">No.</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sub-Category</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="py-4 pr-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p: any, index: number) => (
                                    <ProductTableRow
                                        key={p.id}
                                        index={index}
                                        p={p}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}