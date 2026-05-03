'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Plus, Loader2, Pencil, Trash2, Layers, Eye } from 'lucide-react';
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
}

const AVATAR_COLORS = [
    { bg: 'bg-teal-100', text: 'text-teal-700' },
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-violet-100', text: 'text-violet-700' },
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
];

function getInitials(name: string) {
    return name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
}

function getAvatarColor(name: string) {
    const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

const ListingCard = memo(
    ({ s, onEdit, onDelete, onView }: {
        s: any;
        onEdit: (s: any) => void;
        onDelete: (payload: { id: string; type: 'SERVICE' | 'RENTAL' }) => void;
        onView: (s: any) => void;
    }) => {
        const imageSrc = s.img || "";
        const avatar = getAvatarColor(s.name || 'A');

        const getPriceUnit = (type: string) => {
            switch (type) {
                case 'HOURLY': return 'hr';
                case 'DAILY': return 'day';
                case 'MONTHLY': return 'mo';
                default: return 'fix';
            }
        };

        return (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-12 w-12 rounded-xl ${avatar.bg} flex items-center justify-center shrink-0 overflow-hidden`}>
                    {imageSrc ? (
                        <img src={imageSrc} alt={s.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className={`font-bold text-sm ${avatar.text}`}>{getInitials(s.name || '?')}</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">{s.category?.name || 'General'}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {s.priceType !== 'QUOTE' ? (
                            <span className="font-bold text-slate-700 text-xs">
                                ₹{Number(s.price).toLocaleString()}
                                <span className="text-[10px] text-slate-400 font-medium">/{getPriceUnit(s.priceType)}</span>
                            </span>
                        ) : (
                            <span className="text-xs text-slate-400 italic">Custom Quote</span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.listingType === 'RENTAL' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            {s.listingType === 'RENTAL' ? 'Rental' : 'Service'}
                        </span>
                        {s.listingType === 'RENTAL' ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {s.stock > 0 ? 'Active' : 'Out of Stock'}
                            </span>
                        ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {s.isVerified ? 'Active' : 'Pending'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => onView(s)} className="p-2 rounded-xl border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-400 transition-colors" title="View">
                        <Eye size={14} />
                    </button>
                    <button onClick={() => onEdit(s)} className="p-2 rounded-xl border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-400 transition-colors" title="Edit">
                        <Pencil size={14} />
                    </button>
                    <button onClick={() => onDelete({ id: s.id, type: s.listingType as 'SERVICE' | 'RENTAL' })} className="p-2 rounded-xl border border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 transition-colors" title="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        );
    });
ListingCard.displayName = "ListingCard";

export function ManagementView({
    currentUser,
    userData,
    showToast,
    setActiveView
}: ManagementViewProps) {

    const { services: rawServices, isLoading, refetch, deleteItem } = useServices(currentUser?.id);

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

        return sList.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-20 px-4 space-y-4 relative">

            {isEditingService || isCreatingService ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b bg-white flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-lg">
                            {isCreatingService ? 'Add New Service' : 'Edit Service'}
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
                            forcedType="SERVICE"
                        />
                    </div>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between pt-2">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">My Listings</h2>
                            <p className="text-slate-400 text-xs mt-0.5">Services, products &amp; rentals</p>
                        </div>
                        <button onClick={handleCreateNew} className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition active:scale-95">
                            <Plus size={15} /> Add
                        </button>
                    </div>

                    {/* Pill Tabs */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setActiveView('settings')}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-slate-900 text-white transition-all"
                        >
                            Service
                            <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                {allListings.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveView('products')}
                            className="px-4 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                        >
                            Product
                        </button>
                        <button
                            onClick={() => setActiveView('rentals')}
                            className="px-4 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                        >
                            Rental
                        </button>
                    </div>

                    {/* Listing Cards */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                            <Loader2 className="animate-spin" size={36} />
                            <span className="font-medium text-sm">Loading listings...</span>
                        </div>
                    ) : allListings.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                            <Layers className="text-slate-300 mb-4" size={40} />
                            <h3 className="text-slate-900 font-bold text-base">No services yet</h3>
                            <button onClick={handleCreateNew} className="mt-4 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition">
                                Create first service
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {allListings.map((s: any) => (
                                <ListingCard
                                    key={s.id}
                                    s={s}
                                    onEdit={handleEdit}
                                    onDelete={confirmDeletePrompt}
                                    onView={handleView}
                                />
                            ))}
                        </div>
                    )}
                </>
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