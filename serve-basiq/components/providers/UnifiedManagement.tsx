'use client';

import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import {
    Package, Plus, Loader2, Pencil, Trash2, Eye,
    CheckCircle2, AlertCircle, Hammer, Truck, Boxes, X, ChevronRight
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

const ListingTableRow = memo(
    ({ s, index, kind, onEdit, onDelete, onView }: {
        s: any;
        index: number;
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

        const shortDesc = s.desc
            ? (s.desc.length > 50 ? s.desc.substring(0, 50) + '...' : s.desc)
            : 'No description provided';

        const isInStock = isProduct ? s.stockStatus === 'IN_STOCK' : (s.stock ?? 0) > 0;

        const priceLabel = isProduct
            ? (s.unit || 'PIECE')
            : getServicePriceUnit(s.priceType);

        const tagBg = isProduct
            ? 'bg-emerald-50 text-emerald-600'
            : isRental
                ? 'bg-orange-50 text-orange-600'
                : 'bg-blue-50 text-blue-600';

        const tagLabel = isProduct ? 'Product' : isRental ? 'Rental' : 'Service';

        return (
            <tr className="group border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
                <td className="py-4 pl-4 md:pl-6 align-middle hidden md:table-cell w-12">
                    <span className="text-sm font-bold text-slate-400">
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>
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
                                <p className="font-bold text-slate-900 text-sm truncate max-w-[160px] sm:max-w-[200px] lg:max-w-[300px]">
                                    {s.name}
                                </p>

                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${tagBg}`}>
                                    {tagLabel}
                                </span>

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
                                    {s.priceType === 'QUOTE' ? (
                                        <span className="text-slate-500">Custom Quote</span>
                                    ) : (
                                        <>₹{Number(s.price).toLocaleString()} <span className="text-[9px] text-slate-400 font-medium uppercase">/{priceLabel}</span></>
                                    )}
                                </span>
                                <span className="text-[9px] font-bold uppercase bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                                    {categoryName}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isInStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {isInStock ? 'Active' : (isProduct ? (s.stockStatus?.replace('_', ' ') || 'Out') : 'Out')}
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

                <td className="py-4 align-middle font-bold text-slate-700 text-sm hidden sm:table-cell">
                    {s.priceType === 'QUOTE' ? (
                        <span className="text-slate-500 italic font-medium text-xs">Custom Quote</span>
                    ) : (
                        <>
                            ₹{Number(s.price).toLocaleString()}
                            <span className="text-[10px] text-slate-400 font-medium ml-1 uppercase">
                                /{priceLabel}
                            </span>
                        </>
                    )}
                </td>

                <td className="py-4 align-middle hidden md:table-cell">
                    {isProduct ? (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isInStock ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {s.stockStatus?.replace('_', ' ') || 'Active'}
                        </span>
                    ) : isRental ? (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isInStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {isInStock ? `${s.stock} in Stock` : 'Out of Stock'}
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                            Active
                        </span>
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
                        <button onClick={() => onDelete(s)} className="p-2 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 transition-colors" title="Delete">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    }
);
ListingTableRow.displayName = 'ListingTableRow';

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

    const counts = {
        SERVICE: services?.length || 0,
        RENTAL: rentals?.length || 0,
        PRODUCT: products?.length || 0,
    };

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

    const tabMeta: Record<TabKey, { label: string; icon: any; color: string }> = {
        SERVICE: { label: 'Services', icon: Hammer, color: 'blue' },
        RENTAL: { label: 'Rentals', icon: Truck, color: 'orange' },
        PRODUCT: { label: 'Products', icon: Boxes, color: 'emerald' },
    };

    const headerByTab: Record<TabKey, { title: string; subtitle: string; addLabel: string }> = {
        SERVICE: { title: 'My Services', subtitle: 'Manage your services and pricing.', addLabel: 'Add Service' },
        RENTAL: { title: 'My Rentals', subtitle: 'Manage your rentals and pricing.', addLabel: 'Add Rental' },
        PRODUCT: { title: 'My Products', subtitle: 'Manage your products and pricing.', addLabel: 'Add Product' },
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20 px-4 md:px-0 space-y-6 relative">

            {/* Tabs (only for entities user has) */}
            {visibleTabs.length > 0 && (
                <div className="flex bg-white rounded-xl max-w-xl border border-slate-200 shadow-sm mx-auto md:mx-0 overflow-hidden">
                    {visibleTabs.map((t) => {
                        const meta = tabMeta[t];
                        const Icon = meta.icon;
                        const isActive = activeTab === t;
                        return (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`flex-1 py-3.5 px-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${isActive
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={15} />
                                <span>{meta.label}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {counts[t]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Header / Add */}
            <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                        {headerByTab[activeTab].title}
                    </h2>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">
                        {headerByTab[activeTab].subtitle}
                    </p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition shadow-lg active:scale-95 w-fit"
                >
                    <Plus size={18} />
                    {headerByTab[activeTab].addLabel}
                </button>
            </div>

            {/* Body: loading / empty / table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
                    <Loader2 className="animate-spin" size={40} />
                    <span className="font-medium text-sm">Loading...</span>
                </div>
            ) : visibleTabs.length === 0 ? (
                <EmptyAllListings
                    onAdd={handleAddClick}
                />
            ) : listingRows.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <Package className="text-slate-300 mb-4" size={48} />
                    <h3 className="text-slate-900 font-bold text-lg">No {tabMeta[activeTab].label.toLowerCase()} found</h3>
                    <button onClick={handleAddClick} className="mt-4 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                        Create first {tabMeta[activeTab].label.slice(0, -1).toLowerCase()}
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden relative">
                    {isAnyDeleting && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-slate-900" />
                        </div>
                    )}
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
                                {listingRows.map((row: any, index: number) => (
                                    <ListingTableRow
                                        key={row.id}
                                        index={index}
                                        s={row}
                                        kind={activeTab}
                                        onEdit={handleEdit}
                                        onDelete={handleDeletePrompt}
                                        onView={handleView}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
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
