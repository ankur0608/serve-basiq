'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Package, Plus, Loader2, Pencil, Trash2, Layers, Eye, CheckCircle2, AlertCircle } from 'lucide-react'; // ✅ Added CheckCircle2 & AlertCircle
import { useServices } from '@/app/hook/useServices';
import { ServiceSettingsView } from '@/components/providers/service/ServiceSettingsView';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ViewDetailsModal } from '@/components/ui/ViewDetailsModal';
import { ServiceDetailsModal } from '../ui/ServiceDetailsModal';

interface ManagementViewProps {
    currentUser: any;
    userData: any;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    setActiveView: (view: string) => void;
    providerType: string;
}

const ServiceTableRow = memo(
    ({ s, index, onEdit, onDelete, onView }: {
        s: any;
        index: number;
        onEdit: (s: any) => void;
        onDelete: (payload: { id: string; type: 'SERVICE' | 'RENTAL' }) => void;
        onView: (s: any) => void;
    }) => {

        const imageSrc = s.img || "";

        const getPriceUnit = (type: string) => {
            switch (type) {
                case 'HOURLY': return 'hr';
                case 'DAILY': return 'day';
                case 'MONTHLY': return 'mo';
                default: return 'fix';
            }
        };

        const shortDesc = s.desc
            ? (s.desc.length > 50 ? s.desc.substring(0, 50) + '...' : s.desc)
            : 'No description provided';

        return (
            <tr className="group border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
                <td className="py-4 pl-4 md:pl-6 align-middle hidden md:table-cell w-12">
                    <span className="text-sm font-bold text-slate-400">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                </td>

                <td className="py-4 pl-4 md:pl-0 align-middle w-full sm:w-auto">
                    <div className="flex items-start sm:items-center gap-3 md:gap-4">
                        <div className="h-12 w-12 sm:h-10 sm:w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                            {imageSrc ? (
                                <img src={imageSrc} alt={s.name} className="h-full w-full object-cover" />
                            ) : (
                                <Package size={16} className="text-slate-300 m-auto absolute inset-0" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="font-bold text-slate-900 text-sm truncate max-w-[160px] sm:max-w-[200px] lg:max-w-[300px]">{s.name}</p>

                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${s.listingType === 'RENTAL' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {s.listingType === 'RENTAL' ? 'Rental' : 'Service'}
                                </span>

                                {/* ✅ Added Verification Badge Here */}
                                <span className={`flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase border ${s.isVerified
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    {s.isVerified ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                    {s.isVerified ? 'Verified' : 'Pending'}
                                </span>
                            </div>

                            <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-[250px] hidden sm:block" title={s.desc}>
                                {shortDesc}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mt-2 sm:hidden">
                                <span className="font-bold text-slate-700 text-xs">
                                    ₹{Number(s.price).toLocaleString()} <span className="text-[9px] text-slate-400 font-medium uppercase">/{getPriceUnit(s.priceType)}</span>
                                </span>
                                <span className="text-[9px] font-bold uppercase bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                                    {s.category?.name || 'General'}
                                </span>
                                {s.listingType === 'RENTAL' ? (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${s.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {s.stock > 0 ? 'In Stock' : 'Out'}
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">Active</span>
                                )}
                            </div>
                        </div>
                    </div>
                </td>

                <td className="py-4 align-middle hidden lg:table-cell">
                    <span className="text-[10px] font-bold uppercase bg-purple-50 text-purple-600 px-2 py-1 rounded">
                        {s.category?.name || 'General'}
                    </span>
                </td>

                <td className="py-4 align-middle font-bold text-slate-700 text-sm hidden sm:table-cell">
                    ₹{Number(s.price).toLocaleString()}
                    <span className="text-[10px] text-slate-400 font-medium ml-1 uppercase">
                        /{getPriceUnit(s.priceType)}
                    </span>
                </td>

                <td className="py-4 align-middle hidden md:table-cell">
                    {s.listingType === 'RENTAL' ? (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${s.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {s.stock > 0 ? `${s.stock} in Stock` : 'Out of Stock'}
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Active</span>
                    )}
                </td>

                <td className="py-4 pr-4 md:pr-6 align-middle text-right">
                    <div className="flex justify-end gap-1.5 sm:gap-2">
                        <button onClick={() => onView(s)} className="p-2 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-400 transition-colors" title="View Details">
                            <Eye size={14} />
                        </button>
                        <button onClick={() => onEdit(s)} className="p-2 border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-400 transition-colors" title="Edit">
                            <Pencil size={14} />
                        </button>
                        <button onClick={() => onDelete({ id: s.id, type: s.listingType as 'SERVICE' | 'RENTAL' })} className="p-2 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 transition-colors" title="Delete">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    });
ServiceTableRow.displayName = "ServiceTableRow";


export function ManagementView({
    currentUser,
    userData,
    showToast,
    setActiveView,
    providerType
}: ManagementViewProps) {

    const { services: rawServices, rentals: rawRentals, isLoading, refetch, deleteItem } = useServices(currentUser?.id);

    const [selectedServiceToEdit, setSelectedServiceToEdit] = useState<any>(null);
    const [isEditingService, setIsEditingService] = useState(false);
    const [isCreatingService, setIsCreatingService] = useState(false);

    const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; payload: { id: string; type: 'SERVICE' | 'RENTAL' } | null }>({ isOpen: false, payload: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const [viewModalState, setViewModalState] = useState<{ isOpen: boolean; payload: any | null }>({ isOpen: false, payload: null });

    const allListings = useMemo(() => {
        const sList = (rawServices || []).map((svc: any) => ({
            ...svc,
            listingType: 'SERVICE',
            img: svc.serviceimg || svc.mainimg || svc.img || ""
        }));

        const rList = (rawRentals || []).map((r: any) => ({
            ...r,
            listingType: 'RENTAL',
            img: r.rentalImg || ""
        }));

        return [...sList, ...rList].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [rawServices, rawRentals]);

    const handleEditComplete = () => {
        setIsEditingService(false);
        setIsCreatingService(false);
        setSelectedServiceToEdit(null);
        refetch();
    };

    const handleEdit = useCallback((service: any) => {
        setSelectedServiceToEdit(service);
        setIsEditingService(true);
    }, []);

    const handleView = useCallback((service: any) => {
        setViewModalState({ isOpen: true, payload: service });
    }, []);

    const confirmDeletePrompt = useCallback((payload: { id: string; type: 'SERVICE' | 'RENTAL' }) => {
        setDeleteModalState({ isOpen: true, payload });
    }, []);

    const executeDelete = async () => {
        if (!deleteModalState.payload) return;

        setIsDeleting(true);
        try {
            await deleteItem(deleteModalState.payload);
            showToast("Deleted successfully", "success");
        } catch {
            showToast("Failed to delete", "error");
        } finally {
            setIsDeleting(false);
            setDeleteModalState({ isOpen: false, payload: null });
        }
    };

    const handleCreateNew = useCallback(() => {
        setSelectedServiceToEdit(null);
        setIsCreatingService(true);
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20 space-y-6">

            {providerType === 'BOTH' && !isEditingService && !isCreatingService && (
                <div className="flex bg-white rounded-xl mb-1 max-w-md border border-slate-200 shadow-sm mx-auto md:mx-0">
                    <button onClick={() => setActiveView('settings')} className="flex-1 py-4 text-sm font-bold rounded-lg bg-slate-900 text-white shadow-md transition-all">Services</button>
                    <button onClick={() => setActiveView('products')} className="flex-1 py-4 text-sm font-bold rounded-lg text-slate-500 hover:text-slate-900 transition-all">Products</button>
                </div>
            )}

            {isEditingService || isCreatingService ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mx-4 md:mx-0">
                    <div className="px-6 py-5 border-b bg-white flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            {isCreatingService ? 'Add New Listing' : 'Edit Listing'}
                        </h3>
                        <button onClick={() => { setIsEditingService(false); setIsCreatingService(false); }} className="text-sm font-bold text-slate-500 hover:text-slate-900">Cancel</button>
                    </div>
                    <div className="p-4 md:p-6">
                        <ServiceSettingsView
                            userId={currentUser?.id || ""}
                            serviceData={isCreatingService ? null : selectedServiceToEdit}
                            userData={userData}
                            userAddress={userData?.addresses?.[0] || null}
                            showToast={showToast}
                            onComplete={handleEditComplete}
                        />
                    </div>
                </div>
            ) : (
                <div className="p-4 md:p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">My Services</h2>
                            <p className="text-slate-500 text-xs md:text-sm mt-1">Manage your service offerings, rentals, and pricing.</p>
                        </div>
                        <button onClick={handleCreateNew} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg active:scale-95 w-fit">
                            <Plus size={18} /> Add Service
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
                            <Loader2 className="animate-spin" size={40} />
                            <span className="font-medium text-sm">Loading listings...</span>
                        </div>
                    ) : allListings.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                            <Layers className="text-slate-300 mb-4" size={48} />
                            <h3 className="text-slate-900 font-bold text-lg">No listings found</h3>
                            <button onClick={handleCreateNew} className="mt-4 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">Create first listing</button>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="py-4 pl-4 md:pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell w-12">No.</th>
                                            <th className="py-4 pl-4 md:pl-0 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listing</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Category</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Rate</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                                            <th className="py-4 pr-4 md:pr-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allListings.map((s: any, index: number) => (
                                            <ServiceTableRow
                                                key={s.id}
                                                index={index}
                                                s={s}
                                                onEdit={handleEdit}
                                                onDelete={confirmDeletePrompt}
                                                onView={handleView}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({ isOpen: false, payload: null })}
                onConfirm={executeDelete}
                title={`Delete ${deleteModalState.payload?.type === 'RENTAL' ? 'Rental' : 'Service'}?`}
                message="Are you sure you want to delete this listing? This action cannot be undone."
                confirmText="Delete Listing"
                variant="danger"
                isLoading={isDeleting}
            />

            <ServiceDetailsModal
                isOpen={viewModalState.isOpen}
                onClose={() => setViewModalState({ isOpen: false, payload: null })}
                data={viewModalState.payload}
            />

        </div>
    );
}