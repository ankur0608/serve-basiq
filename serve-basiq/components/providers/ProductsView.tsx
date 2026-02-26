'use client';

import { useState, useCallback, memo } from 'react';
import { useProducts } from '@/app/hook/useProducts';
import { Plus, Package, Loader2, Pencil, Trash2, Eye } from 'lucide-react'; // ✅ Added Eye
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ViewDetailsModal } from '@/components/ui/ViewDetailsModal'; // ✅ Import new modal

interface ProductsViewProps {
    setActiveView: (view: string) => void;
    userId: string;
    setSelectedProduct: (product: any) => void;
    showToast: (msg: string, type: 'success' | 'error') => void;
    providerType?: string;
}

const ProductTableRow = memo(({ p, index, onEdit, onDelete, onView }: { p: any, index: number, onEdit: (p: any) => void, onDelete: (id: string) => void, onView: (p: any) => void }) => {
    const isInStock = p.stockStatus === 'IN_STOCK';
    const categoryName = typeof p.category === 'object' ? p.category?.name : (p.category || 'General');

    const shortDesc = p.desc
        ? (p.desc.length > 50 ? p.desc.substring(0, 50) + '...' : p.desc)
        : 'No description provided';

    return (
        <tr className="group border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
            <td className="py-4 pl-4 md:pl-6 align-middle hidden md:table-cell w-12">
                <span className="text-sm font-bold text-slate-400">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
            </td>

            <td className="py-4 pl-4 md:pl-0 align-middle w-full sm:w-auto">
                <div className="flex items-start sm:items-center gap-3 md:gap-4">
                    <div className="h-12 w-12 sm:h-10 sm:w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                        {p.productImage ? (
                            <img src={p.productImage} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                            <Package size={16} className="text-slate-300 m-auto absolute inset-0" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900 text-sm truncate max-w-[160px] sm:max-w-[200px] lg:max-w-[300px]">{p.name}</p>
                        </div>

                        <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-[250px] hidden sm:block" title={p.desc}>
                            {shortDesc}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:hidden">
                            <span className="font-bold text-slate-700 text-xs">
                                ₹{p.price}
                            </span>
                            <span className="text-[9px] font-bold uppercase bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                                {categoryName}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isInStock ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {p.stockStatus?.replace('_', ' ') || 'Active'}
                            </span>
                        </div>
                    </div>
                </div>
            </td>

            <td className="py-4 align-middle hidden lg:table-cell">
                <span className="text-[10px] font-bold uppercase bg-purple-50 text-purple-600 px-2 py-1 rounded">
                    {categoryName}
                </span>
            </td>

            <td className="py-4 align-middle hidden lg:table-cell">
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

            <td className="py-4 align-middle font-bold text-slate-700 text-sm hidden sm:table-cell">
                ₹{p.price}
            </td>

            <td className="py-4 align-middle hidden md:table-cell">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isInStock ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {p.stockStatus?.replace('_', ' ') || 'Active'}
                </span>
            </td>

            <td className="py-4 pr-4 md:pr-6 align-middle text-right">
                <div className="flex justify-end gap-1.5 sm:gap-2">
                    {/* ✅ Added View Button */}
                    <button onClick={() => onView(p)} className="p-2 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-400 transition-colors" title="View Details">
                        <Eye size={14} />
                    </button>
                    <button onClick={() => onEdit(p)} className="p-2 border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-400 transition-colors" title="Edit">
                        <Pencil size={14} />
                    </button>
                    <button onClick={() => onDelete(p.id)} className="p-2 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 transition-colors" title="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
});
ProductTableRow.displayName = "ProductTableRow";


export function ProductsView({ setActiveView, userId, setSelectedProduct, showToast, providerType }: ProductsViewProps) {

    const { products, loading, deleteProduct, isDeleting } = useProducts(userId);

    const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; productId: string | null }>({ isOpen: false, productId: null });

    // ✅ View Modal State
    const [viewModalState, setViewModalState] = useState<{ isOpen: boolean; payload: any | null }>({ isOpen: false, payload: null });

    const handleEdit = useCallback((product: any) => {
        setSelectedProduct(product);
        setActiveView('add-product');
    }, [setSelectedProduct, setActiveView]);

    // ✅ Open View Modal
    const handleView = useCallback((product: any) => {
        setViewModalState({ isOpen: true, payload: product });
    }, []);

    const confirmDeletePrompt = useCallback((id: string) => {
        setDeleteModalState({ isOpen: true, productId: id });
    }, []);

    const executeDelete = async () => {
        if (!deleteModalState.productId) return;

        try {
            await deleteProduct(deleteModalState.productId);
            showToast("Product deleted successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete", "error");
        } finally {
            setDeleteModalState({ isOpen: false, productId: null });
        }
    };

    const handleCreateNew = useCallback(() => {
        setSelectedProduct(null);
        setActiveView('add-product');
    }, [setSelectedProduct, setActiveView]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20 p-4 md:p-0 relative">

            {/* View Toggle */}
            {providerType === 'BOTH' && (
                <div className="flex bg-white rounded-xl mb-6 max-w-md border border-slate-200 shadow-sm mx-auto md:mx-0">
                    <button
                        onClick={() => setActiveView('settings')}
                        className="flex-1 py-4 text-sm font-bold rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                    >
                        Services
                    </button>
                    <button
                        onClick={() => setActiveView('products')}
                        className="flex-1 py-4 text-sm font-bold rounded-lg bg-slate-900 text-white shadow-md transition-all"
                    >
                        Products
                    </button>
                </div>
            )}

            {/* Mobile Optimized Header */}
            <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">My Products</h2>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">Manage your inventory and pricing.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg active:scale-95 w-fit"
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
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center mx-4 md:mx-0">
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
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="py-4 pl-4 md:pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell w-12">No.</th>
                                    <th className="py-4 pl-4 md:pl-0 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Category</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Sub-Category</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Rate</th>
                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                                    <th className="py-4 pr-4 md:pr-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p: any, index: number) => (
                                    <ProductTableRow
                                        key={p.id}
                                        index={index}
                                        p={p}
                                        onEdit={handleEdit}
                                        onDelete={confirmDeletePrompt}
                                        onView={handleView} // ✅ Passed View prop down
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({ isOpen: false, productId: null })}
                onConfirm={executeDelete}
                title="Delete Product?"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete Product"
                variant="danger"
                isLoading={isDeleting}
            />

            {/* ✅ Mount the Details Modal */}
            <ViewDetailsModal
                isOpen={viewModalState.isOpen}
                onClose={() => setViewModalState({ isOpen: false, payload: null })}
                data={viewModalState.payload}
                type="PRODUCT"
            />

        </div>
    );
}