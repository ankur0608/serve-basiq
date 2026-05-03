'use client';

import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import {
    Package, Plus, Loader2, Pencil, Trash2, Eye,
    Hammer, Truck, Boxes, X, ChevronRight
} from 'lucide-react';
import { useServices } from '@/app/hook/useServices';
import { useProducts } from '@/app/hook/useProducts';
import { ServiceSettingsView } from '@/components/providers/service/ServiceSettingsView';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ViewDetailsModal } from '@/components/ui/ViewDetailsModal';
import { ServiceDetailsModal } from '@/components/ui/ServiceDetailsModal';

type TabKey = 'SERVICE' | 'RENTAL' | 'PRODUCT';

interface Props {
    currentUser: any;
    userData: any;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    setActiveView: (view: string) => void;
    initialTab?: TabKey;
    setSelectedProduct: (p: any) => void;
}

const getServicePriceUnit = (type: string) => {
    switch (type) {
        case 'HOURLY': return 'hr';
        case 'DAILY': return 'day';
        case 'WEEKLY': return 'wk';
        case 'MONTHLY': return 'mo';
        default: return 'fix';
    }
};

const ALL_TABS: TabKey[] = ['SERVICE', 'RENTAL', 'PRODUCT'];

const TAB_CHIP_META: Record<TabKey, { label: string }> = {
    SERVICE: { label: 'Service' },
    RENTAL:  { label: 'Rental' },
    PRODUCT: { label: 'Product' },
};

const AVATAR_PALETTE = [
    { bg: 'bg-teal-100', text: 'text-teal-700' },
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-violet-100', text: 'text-violet-700' },
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
];

const TYPE_BADGE: Record<TabKey, { label: string; cls: string }> = {
    PRODUCT: { label: 'Product', cls: 'bg-emerald-50 text-emerald-600' },
    RENTAL:  { label: 'Rental',  cls: 'bg-amber-50 text-amber-600' },
    SERVICE: { label: 'Service', cls: 'bg-blue-50 text-blue-600' },
};

function getStatusBadge(kind: TabKey, s: any, isInStock: boolean) {
    if (kind === 'PRODUCT') return {
        label: s.stockStatus?.replace('_', ' ') || 'Active',
        cls: isInStock ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
    };
    if (kind === 'RENTAL') return {
        label: isInStock ? 'Active' : 'Out of Stock',
        cls: isInStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600',
    };
    return {
        label: s.isVerified ? 'Active' : 'Pending',
        cls: s.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
    };
}

function getCardInitials(name: string) {
    return (name || '?').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
}
function getCardAvatar(name: string) {
    return AVATAR_PALETTE[(name || 'A').charCodeAt(0) % AVATAR_PALETTE.length];
}

const ListingCard = memo(
    ({ s, kind, onEdit, onDelete, onView }: {
        s: any;
        kind: TabKey;
        onEdit: (s: any) => void;
        onDelete: (s: any) => void;
        onView: (s: any) => void;
    }) => {
        const isProduct = kind === 'PRODUCT';
        const isRental = kind === 'RENTAL';

        const imageSrc = isProduct
            ? (s.productImages?.[0] || s.productImage || '')
            : (s.img || s.serviceimg || s.rentalImg || s.mainimg || '');

        const categoryName = typeof s.category === 'object' ? s.category?.name : (s.category || 'General');
        const isInStock = isProduct ? s.stockStatus === 'IN_STOCK' : (s.stock ?? 0) > 0;
        const priceLabel = isProduct ? (s.unit || 'piece') : getServicePriceUnit(s.priceType);

        const avatar = getCardAvatar(s.name || 'A');
        const typeBadge = TYPE_BADGE[kind];
        const statusBadge = getStatusBadge(kind, s, isInStock);

        return (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-12 w-12 rounded-xl ${avatar.bg} flex items-center justify-center shrink-0 overflow-hidden`}>
                    {imageSrc ? (
                        <img src={imageSrc} alt={s.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className={`font-bold text-sm ${avatar.text}`}>{getCardInitials(s.name)}</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">{categoryName}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {s.price && (isProduct || s.priceType !== 'QUOTE') ? (
                            <span className="font-bold text-slate-700 text-xs">
                                ₹{Number(s.price).toLocaleString()}
                                <span className="text-[10px] text-slate-400 font-medium">/{priceLabel}</span>
                            </span>
                        ) : (
                            <span className="text-xs text-slate-400 italic">Custom Quote</span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadge.cls}`}>
                            {typeBadge.label}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge.cls}`}>
                            {statusBadge.label}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => onView(s)} className="p-2 rounded-xl border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-300 transition-colors" title="View">
                        <Eye size={14} />
                    </button>
                    <button onClick={() => onEdit(s)} className="p-2 rounded-xl border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-300 transition-colors" title="Edit">
                        <Pencil size={14} />
                    </button>
                    <button onClick={() => onDelete(s)} className="p-2 rounded-xl border border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-300 transition-colors" title="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        );
    }
);
ListingCard.displayName = 'ListingCard';

const PICKER_THEMES = {
    blue: {
        border: 'hover:border-blue-500',
        bg: 'hover:bg-blue-50/40',
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600',
    },
    orange: {
        border: 'hover:border-orange-500',
        bg: 'hover:bg-orange-50/40',
        iconBg: 'bg-orange-100',
        iconText: 'text-orange-600',
    },
    emerald: {
        border: 'hover:border-emerald-500',
        bg: 'hover:bg-emerald-50/40',
        iconBg: 'bg-emerald-100',
        iconText: 'text-emerald-600',
    },
} as const;

function PickerCard({
    icon: Icon, color, title, desc, onClick
}: {
    icon: any; color: keyof typeof PICKER_THEMES; title: string; desc: string; onClick: () => void;
}) {
    const t = PICKER_THEMES[color];
    return (
        <button
            onClick={onClick}
            className={`group p-5 rounded-2xl border-2 border-slate-100 ${t.border} ${t.bg} transition-all text-left flex items-start gap-4 w-full active:scale-[0.98]`}
        >
            <div className={`w-12 h-12 rounded-xl ${t.iconBg} ${t.iconText} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-950">{title}</h3>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition" />
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
        </button>
    );
}

export function UnifiedManagementView({
    currentUser, userData, showToast, setActiveView,
    initialTab, setSelectedProduct
}: Props) {

    const userId = currentUser?.id;
    const { services, rentals, isLoading: loadingSvc, refetch: refetchSvc, deleteItem } = useServices(userId);
    const { products, loading: loadingProd, deleteProduct, isDeleting: isDeletingProd } = useProducts(userId);

    const counts = useMemo(() => ({
        SERVICE: services?.length || 0,
        RENTAL: rentals?.length || 0,
        PRODUCT: products?.length || 0,
    }), [services, rentals, products]);

    const visibleTabs = useMemo<TabKey[]>(() => {
        const list: TabKey[] = [];
        if (counts.SERVICE > 0) list.push('SERVICE');
        if (counts.RENTAL > 0) list.push('RENTAL');
        if (counts.PRODUCT > 0) list.push('PRODUCT');
        return list;
    }, [counts.SERVICE, counts.RENTAL, counts.PRODUCT]);

    const [activeTab, setActiveTab] = useState<TabKey>(() => {
        if (initialTab) return initialTab;
        if (counts.SERVICE > 0) return 'SERVICE';
        if (counts.RENTAL > 0) return 'RENTAL';
        if (counts.PRODUCT > 0) return 'PRODUCT';
        return 'SERVICE';
    });

    useEffect(() => {
        if (visibleTabs.length === 0) return;
        if (!visibleTabs.includes(activeTab)) {
            setActiveTab(visibleTabs[0]);
        }
    }, [visibleTabs, activeTab]);

    const [showPicker, setShowPicker] = useState(false);
    const [createType, setCreateType] = useState<'SERVICE' | 'RENTAL' | null>(null);
    const [editTarget, setEditTarget] = useState<{ data: any; type: 'SERVICE' | 'RENTAL' } | null>(null);

    const [deleteState, setDeleteState] = useState<{ open: boolean; payload: any | null; kind: TabKey | null }>({
        open: false, payload: null, kind: null
    });
    const [isDeletingSvc, setIsDeletingSvc] = useState(false);

    const [viewState, setViewState] = useState<{ open: boolean; payload: any | null; kind: TabKey | null }>({
        open: false, payload: null, kind: null
    });

    const listingRows = useMemo(() => {
        if (activeTab === 'SERVICE') {
            return [...(services || [])]
                .map((svc: any) => ({ ...svc, listingType: 'SERVICE' }))
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        if (activeTab === 'RENTAL') {
            return [...(rentals || [])]
                .map((r: any) => ({ ...r, listingType: 'RENTAL', img: r.rentalImg || '' }))
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return [...(products || [])];
    }, [activeTab, services, rentals, products]);

    const handleEdit = useCallback((row: any) => {
        if (activeTab === 'PRODUCT') {
            setSelectedProduct(row);
            setActiveView('add-product');
            return;
        }
        setEditTarget({ data: row, type: activeTab as 'SERVICE' | 'RENTAL' });
    }, [activeTab, setActiveView, setSelectedProduct]);

    const handleView = useCallback((row: any) => {
        setViewState({ open: true, payload: row, kind: activeTab });
    }, [activeTab]);

    const handleDeletePrompt = useCallback((row: any) => {
        setDeleteState({ open: true, payload: row, kind: activeTab });
    }, [activeTab]);

    const executeDelete = async () => {
        if (!deleteState.payload || !deleteState.kind) return;
        try {
            if (deleteState.kind === 'PRODUCT') {
                await deleteProduct(deleteState.payload.id);
            } else {
                setIsDeletingSvc(true);
                await deleteItem({ id: deleteState.payload.id, type: deleteState.kind });
            }
            showToast('Deleted successfully', 'success');
        } catch {
            showToast('Failed to delete', 'error');
        } finally {
            setIsDeletingSvc(false);
            setDeleteState({ open: false, payload: null, kind: null });
        }
    };

    const handleAddClick = useCallback(() => {
        setShowPicker(true);
    }, []);

    const handlePickService = () => { setShowPicker(false); setCreateType('SERVICE'); };
    const handlePickRental = () => { setShowPicker(false); setCreateType('RENTAL'); };
    const handlePickProduct = () => {
        setShowPicker(false);
        setSelectedProduct(null);
        setActiveView('add-product');
    };

    const closeForm = () => {
        setCreateType(null);
        setEditTarget(null);
        refetchSvc();
    };

    const isFormOpen = !!createType || !!editTarget;
    const isLoading = (activeTab === 'PRODUCT' ? loadingProd : loadingSvc);
    const isAnyDeleting = isDeletingSvc || isDeletingProd;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-20 px-2 md:px-4 space-y-5 relative">

            <div className="flex items-center justify-between pt-2">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">My Listings</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Services, products &amp; rentals</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition active:scale-95"
                >
                    <Plus size={16} /> Add
                </button>
            </div>

            <div className="flex gap-2 flex-wrap">
                {ALL_TABS.map((t) => {
                    const isActive = activeTab === t;
                    const count = counts[t];
                    return (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                                isActive
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                            }`}
                        >
                            {TAB_CHIP_META[t].label}
                            <span className={`text-[10px] font-bold min-w-[18px] text-center px-1 py-0.5 rounded-full ${
                                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                    <Loader2 className="animate-spin" size={36} />
                    <span className="font-medium text-sm">Loading...</span>
                </div>
            ) : visibleTabs.length === 0 ? (
                <EmptyAllListings onAdd={handleAddClick} />
            ) : listingRows.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <Package className="text-slate-300 mb-4" size={40} />
                    <h3 className="text-slate-900 font-bold text-base">
                        No {TAB_CHIP_META[activeTab].label.toLowerCase()}s yet
                    </h3>
                    <button onClick={handleAddClick} className="mt-4 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition">
                        Add {TAB_CHIP_META[activeTab].label}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3 relative">
                    {isAnyDeleting && (
                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl col-span-full">
                            <Loader2 className="animate-spin text-slate-900" size={28} />
                        </div>
                    )}
                    {listingRows.map((row: any) => (
                        <ListingCard
                            key={row.id}
                            s={row}
                            kind={activeTab}
                            onEdit={handleEdit}
                            onDelete={handleDeletePrompt}
                            onView={handleView}
                        />
                    ))}
                </div>
            )}

            {/* Picker Modal: 3 cards */}
            {showPicker && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowPicker(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowPicker(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={22} />
                        </button>

                        <div className="mb-7 text-center">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5">What would you like to add?</h2>
                            <p className="text-slate-500 text-sm">Pick a listing type to continue.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <PickerCard
                                icon={Hammer}
                                color="blue"
                                title="Service"
                                desc="Skills, repairs, or expert tasks you offer."
                                onClick={handlePickService}
                            />
                            <PickerCard
                                icon={Truck}
                                color="orange"
                                title="Rental"
                                desc="Equipment, vehicles, or items to rent out."
                                onClick={handlePickRental}
                            />
                            <PickerCard
                                icon={Boxes}
                                color="emerald"
                                title="Product"
                                desc="Physical products you sell from inventory."
                                onClick={handlePickProduct}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Service / Rental Form (modal) */}
            {isFormOpen && (createType || editTarget) && (
                <ServiceSettingsView
                    userId={userId || ''}
                    serviceData={editTarget?.data || null}
                    userData={userData}
                    userAddress={userData?.addresses?.[0] || null}
                    showToast={showToast}
                    onComplete={closeForm}
                    forcedType={(editTarget?.type || createType) as 'SERVICE' | 'RENTAL'}
                />
            )}

            <ConfirmModal
                isOpen={deleteState.open}
                onClose={() => setDeleteState({ open: false, payload: null, kind: null })}
                onConfirm={executeDelete}
                title={`Delete ${deleteState.kind === 'PRODUCT' ? 'Product' : deleteState.kind === 'RENTAL' ? 'Rental' : 'Service'}?`}
                message="Are you sure you want to delete this listing? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                isLoading={isAnyDeleting}
            />

            {viewState.kind === 'PRODUCT' ? (
                <ViewDetailsModal
                    isOpen={viewState.open}
                    onClose={() => setViewState({ open: false, payload: null, kind: null })}
                    data={viewState.payload}
                    type="PRODUCT"
                />
            ) : (
                <ServiceDetailsModal
                    isOpen={viewState.open}
                    onClose={() => setViewState({ open: false, payload: null, kind: null })}
                    data={viewState.payload}
                />
            )}
        </div>
    );
}

function EmptyAllListings({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5">
                <Plus size={28} />
            </div>
            <h3 className="text-slate-900 font-bold text-xl mb-1">Start your catalog</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
                You haven't added any listings yet. Pick a type below to create your first one.
            </p>
            <button
                onClick={onAdd}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg active:scale-95"
            >
                <Plus size={18} />
                Add Your First Listing
            </button>
        </div>
    );
}
