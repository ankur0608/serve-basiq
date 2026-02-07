'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Package, Plus, Loader2, Pencil, Trash2, Layers } from 'lucide-react';
import { useServices } from '@/app/hook/useServices';
import { ServiceSettingsView } from '@/components/providers/service/ServiceSettingsView';

interface ManagementViewProps {
    currentUser: any;
    userData: any;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    setActiveView: (view: string) => void;
    providerType: string;
}

// ✅ ServiceTableRow: Displays both Services and Rentals
const ServiceTableRow = memo(({ s, index, onEdit, onDelete }: { s: any, index: number, onEdit: (s: any) => void, onDelete: (id: string) => void }) => {

    const imageSrc = s.img || "";

    const getPriceUnit = (type: string) => {
        switch (type) {
            case 'HOURLY': return 'hr';
            case 'DAILY': return 'day';
            case 'MONTHLY': return 'mo';
            default: return 'fix';
        }
    };

    return (
        <tr className="group border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
            {/* 1. Index */}
            <td className="py-4 pl-6 align-middle">
                <span className="text-sm font-bold text-slate-500">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
            </td>

            {/* 2. Image & Name */}
            <td className="py-4 align-middle">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative">
                        {imageSrc ? (
                            <img src={imageSrc} alt={s.name} className="h-full w-full object-cover" />
                        ) : (
                            <Package size={16} className="text-slate-300 m-auto absolute inset-0" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${s.listingType === 'RENTAL' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                {s.listingType === 'RENTAL' ? 'Rental' : 'Service'}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{s.desc || 'No description provided'}</p>
                    </div>
                </div>
            </td>

            {/* 3. Category */}
            <td className="py-4 align-middle">
                <span className="text-[10px] font-bold uppercase bg-purple-50 text-purple-600 px-2 py-1 rounded">
                    {s.category?.name || 'General'}
                </span>
            </td>

            {/* 4. Price */}
            <td className="py-4 align-middle font-bold text-slate-700 text-sm">
                ₹{Number(s.price).toLocaleString()}
                <span className="text-[10px] text-slate-400 font-medium ml-1 uppercase">
                    /{getPriceUnit(s.priceType)}
                </span>
            </td>

            {/* 5. Status */}
            <td className="py-4 align-middle">
                {s.listingType === 'RENTAL' ? (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${s.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {s.stock > 0 ? `${s.stock} in Stock` : 'Out of Stock'}
                    </span>
                ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Active</span>
                )}
            </td>

            {/* 6. Actions */}
            <td className="py-4 pr-6 align-middle text-right flex justify-end gap-2">
                <button onClick={() => onEdit(s)} className="p-2 border rounded-lg hover:bg-blue-50 text-slate-500 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => onDelete(s.id)} className="p-2 border rounded-lg hover:bg-red-50 text-slate-500 transition-colors"><Trash2 size={14} /></button>
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

    // 1. Data Fetching
    const { services: rawServices, rentals: rawRentals, isLoading, refetch, deleteService } = useServices(currentUser?.id);

    const [selectedServiceToEdit, setSelectedServiceToEdit] = useState<any>(null);
    const [isEditingService, setIsEditingService] = useState(false);
    const [isCreatingService, setIsCreatingService] = useState(false);

    // 2. Merge Data
    const allListings = useMemo(() => {
        const sList = Array.isArray(rawServices) ? rawServices.map((svc: any) => ({
            ...svc,
            listingType: 'SERVICE',
            img: svc.serviceimg || svc.mainimg || svc.img || ""
        })) : [];

        const rList = Array.isArray(rawRentals) ? rawRentals.map((r: any) => ({
            ...r,
            listingType: 'RENTAL',
            img: r.rentalImg || ""
        })) : [];

        return [...sList, ...rList].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [rawServices, rawRentals]);

    // 3. Handlers
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

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        try {
            await deleteService(id);
            showToast("Deleted successfully", "success");
        } catch (error) {
            showToast("Failed to delete", "error");
        }
    }, [deleteService, showToast]);

    const handleCreateNew = useCallback(() => {
        setSelectedServiceToEdit(null);
        setIsCreatingService(true);
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20 p-4">

            {/* ✅ TAB TOGGLE: Styled consistently */}
            {providerType === 'BOTH' && !isEditingService && !isCreatingService && (
                <div className="flex p-1.5 bg-white rounded-xl mb-6 max-w-md border border-slate-200 shadow-sm mx-auto md:mx-0">
                    <button
                        onClick={() => setActiveView('settings')}
                        className="flex-1 py-3 text-sm font-bold rounded-lg bg-slate-900 text-white shadow-md transition-all"
                    >
                        Services & Rentals
                    </button>
                    <button
                        onClick={() => setActiveView('products')}
                        className="flex-1 py-3 text-sm font-bold rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                    >
                        Products
                    </button>
                </div>
            )}

            {/* EDIT MODE */}
            {isEditingService || isCreatingService ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b bg-white flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            {isCreatingService ? 'Add New Listing' : 'Edit Listing'}
                        </h3>
                        <button onClick={() => { setIsEditingService(false); setIsCreatingService(false); }} className="text-sm font-bold text-slate-500 hover:text-slate-900">Cancel</button>
                    </div>
                    <div className="p-6">
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
                /* LIST MODE */
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Services & Rentals</h2>
                            <p className="text-slate-500 text-sm mt-1">Manage your service offerings, rentals, and pricing.</p>
                        </div>
                        <button onClick={handleCreateNew} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg active:scale-95">
                            <Plus size={18} /> Add New
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
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="py-4 pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">No.</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listing</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="py-4 pr-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allListings.map((s: any, index: number) => (
                                            <ServiceTableRow key={s.id} index={index} s={s} onEdit={handleEdit} onDelete={handleDelete} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}