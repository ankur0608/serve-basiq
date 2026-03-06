'use client';

import { X, BadgeIndianRupee, Package, Truck, Tag, Info, Image as ImageIcon, Box } from 'lucide-react';
import clsx from 'clsx';

interface ViewDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any; 
    type: 'PRODUCT' | 'SERVICE' | 'RENTAL';
}

export function ViewDetailsModal({ isOpen, onClose, data, type }: ViewDetailsModalProps) {
    if (!isOpen || !data) return null;

    const mainImage = data.productImage || data.img || data.mainimg || data.serviceimg || data.rentalImg || "";
    const categoryName = typeof data.category === 'object' ? data.category?.name : (data.category || 'General');
    const subCategoryName = data.subcategory?.name || 'None';
    const gallery = data.gallery || [];

    const getPriceUnit = (priceType: string, unit: string) => {
        if (type === 'PRODUCT') return unit || 'UNIT';
        switch (priceType) {
            case 'HOURLY': return 'hr';
            case 'DAILY': return 'day';
            case 'MONTHLY': return 'mo';
            default: return 'fix';
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                            type === 'PRODUCT' ? "bg-blue-500" : type === 'RENTAL' ? "bg-orange-500" : "bg-purple-500"
                        )}>
                            <Package size={16} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">Listing Details</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{type}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-8">

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-1/3 aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                            {mainImage ? (
                                <img src={mainImage} alt={data.name} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={32} className="text-slate-300 m-auto absolute inset-0" />
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{data.name}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-bold uppercase bg-purple-50 text-purple-600 px-2 py-1 rounded">
                                        {categoryName}
                                    </span>
                                    {subCategoryName !== 'None' && (
                                        <span className="text-xs font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                            {subCategoryName}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl inline-block w-full">
                                <p className="text-xs font-bold text-slate-500 mb-1 uppercase">Price</p>
                                <div className="text-3xl font-extrabold text-slate-900 flex items-baseline">
                                    ₹{Number(data.price).toLocaleString()}
                                    <span className="text-sm font-bold text-slate-400 ml-1 uppercase">
                                        / {getPriceUnit(data.priceType, data.unit)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center text-center">
                            <Box size={20} className="text-blue-400 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                            <span className="text-sm font-bold text-slate-900 mt-0.5">{data.stockStatus?.replace(/_/g, ' ') || (data.stock > 0 ? 'In Stock' : 'Active')}</span>
                        </div>
                        {type === 'PRODUCT' && (
                            <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center text-center">
                                <Package size={20} className="text-orange-400 mb-2" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Min Order (MOQ)</span>
                                <span className="text-sm font-bold text-slate-900 mt-0.5">{data.moq} {data.unit}</span>
                            </div>
                        )}
                        <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center text-center">
                            <Truck size={20} className="text-emerald-400 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Logistics</span>
                            <span className="text-sm font-bold text-slate-900 mt-0.5">{data.deliveryType || 'N/A'}</span>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex flex-col items-center justify-center text-center">
                            <Tag size={20} className="text-purple-400 mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Condition</span>
                            <span className="text-sm font-bold text-slate-900 mt-0.5">{data.condition || data.itemCondition || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Info size={16} className="text-slate-400" /> Description
                        </h4>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {data.desc || "No description provided by the seller."}
                        </div>
                    </div>

                    {/* Gallery */}
                    {gallery.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <ImageIcon size={16} className="text-slate-400" /> Gallery
                            </h4>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {gallery.map((img: string, i: number) => (
                                    <div key={i} className="aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group">
                                        {img.match(/\.(mp4|webm)$/i) || img.includes('video') ? (
                                            <video src={img} className="w-full h-full object-cover" muted playsInline />
                                        ) : (
                                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}