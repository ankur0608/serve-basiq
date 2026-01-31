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

// ✅ ServiceTableRow: Matches ProductTableRow structure exactly
const ServiceTableRow = memo(({ s, index, onEdit, onDelete }: { s: any, index: number, onEdit: (s: any) => void, onDelete: (id: string) => void }) => {

    // Normalizing image source
    const imageSrc = s.serviceimg || s.mainimg || s.img || "";

    return (
        <tr className="group border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
            {/* 1. Index */}
            <td className="py-4 pl-6 align-middle">
                <span className="text-sm font-bold text-slate-500">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </span>
            </td>

            {/* 2. Service Image & Name */}
            <td className="py-4 align-middle">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {imageSrc ? (
                            <img src={imageSrc} alt={s.name} className="h-full w-full object-cover" />
                        ) : (
                            <Package size={16} className="text-slate-300 m-auto" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
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

            {/* 4. Rate */}
            <td className="py-4 align-middle font-bold text-slate-700 text-sm">
                ₹{Number(s.price).toLocaleString()}
                <span className="text-[10px] text-slate-400 font-medium ml-1 uppercase">
                    /{s.priceType === 'HOURLY' ? 'hr' : 'fix'}
                </span>
            </td>

            {/* 5. Status (Defaulting to Active as services usually are) */}
            <td className="py-4 align-middle">
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                    Active
                </span>
            </td>

            {/* 6. Actions */}
            <td className="py-4 pr-6 align-middle text-right flex justify-end gap-2">
                <button
                    onClick={() => onEdit(s)}
                    className="p-2 border rounded-lg hover:bg-blue-50 text-slate-500 transition-colors"
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={() => onDelete(s.id)}
                    className="p-2 border rounded-lg hover:bg-red-50 text-slate-500 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
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
    const { services: rawServices, isLoading, refetch, deleteService } = useServices(currentUser?.id);

    const [selectedServiceToEdit, setSelectedServiceToEdit] = useState<any>(null);
    const [isEditingService, setIsEditingService] = useState(false);
    const [isCreatingService, setIsCreatingService] = useState(false);

    // ✅ Format services locally
    const services = useMemo(() => {
        return rawServices.map((svc: any) => ({
            ...svc,
            img: svc.serviceimg || svc.mainimg || svc.img || ""
        }));
    }, [rawServices]);

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

    // ✅ Matching ProductsView delete logic (window.confirm)
    const handleDelete = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        const result = await deleteService(id);
        if (result.success) {
            showToast("Service deleted successfully", "success");
        } else {
            showToast(result.error || "Failed to delete", "error");
        }
    }, [deleteService, showToast]);

    const handleCreateNew = useCallback(() => {
        setSelectedServiceToEdit(null);
        setIsCreatingService(true);
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20 space-y-6">

            {/* --- TAB TOGGLE (Only for BOTH type) --- */}
            {providerType === 'BOTH' && !isEditingService && !isCreatingService && (
                <div className="flex p-1.5 bg-white rounded-xl mb-6 max-w-md border border-slate-200 shadow-sm mx-auto md:mx-0">
                    <button
                        onClick={() => setActiveView('settings')}
                        className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-slate-900 text-white shadow-md transition-all"
                    >
                        Services
                    </button>
                    <button
                        onClick={() => setActiveView('products')}
                        className="flex-1 py-2.5 text-sm font-bold rounded-lg text-slate-500 hover:text-slate-900 transition-all"
                    >
                        Products
                    </button>
                </div>
            )}

            {/* --- Main Content --- */}
            {isEditingService || isCreatingService ? (
                // Reusing your existing settings view for the form part
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b bg-white flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            {isCreatingService ? 'Add New Service' : 'Edit Service'}
                        </h3>
                        <button
                            onClick={() => { setIsEditingService(false); setIsCreatingService(false); }}
                            className="text-sm font-bold text-slate-500 hover:text-slate-900"
                        >
                            Cancel
                        </button>
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
                // ✅ List View - Styled exactly like ProductsView
                <div className="p-4 md:p-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Services</h2>
                            <p className="text-slate-500 text-sm mt-1">Manage your service offerings and pricing.</p>
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg active:scale-95"
                        >
                            <Plus size={18} /> Add Service
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
                            <Loader2 className="animate-spin" size={40} />
                            <span className="font-medium text-sm">Loading services...</span>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                            <Layers className="text-slate-300 mb-4" size={48} />
                            <h3 className="text-slate-900 font-bold text-lg">No services found</h3>
                            <button onClick={handleCreateNew} className="mt-4 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                                Create first service
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50">
                                            <th className="py-4 pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">No.</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate</th>
                                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="py-4 pr-6 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((s: any, index: number) => (
                                            <ServiceTableRow
                                                key={s.id}
                                                index={index}
                                                s={s}
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
            )}
        </div>
    );
}