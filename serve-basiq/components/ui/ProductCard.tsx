'use client';

import React, { useState, useMemo, memo } from 'react';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaHeart, FaRegHeart, FaPaperPlane, FaXmark } from "react-icons/fa6";
import { BadgeCheck, Box, Tag } from 'lucide-react';

// Components
import ProductWrapper from '@/components/products/ProductWrapper';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';

interface ProductCardProps {
    product: any;
    isFav?: boolean;
    toggleFav?: (e: React.MouseEvent) => void;
    currentUser?: any;
}

function ProductCard({ product, isFav = false, toggleFav, currentUser }: ProductCardProps) {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    if (!product) return null;

    const { id, name, category, minOrder, price, unit, user } = product;

    const effectiveUser = useMemo(() => {
        if (currentUser) return currentUser;
        if (session?.user) {
            return {
                ...session.user,
                id: (session.user as any).id,
                isPhoneVerified: (session.user as any).isPhoneVerified,
                phone: (session.user as any).phone,
                addresses: []
            };
        }
        return null;
    }, [currentUser, session]);

    const displayImage = useMemo(() => {
        let rawImageList: string[] = [];
        if (Array.isArray(product.images) && product.images.length > 0) rawImageList = product.images;
        else if (Array.isArray(product.gallery) && product.gallery.length > 0) rawImageList = product.gallery;
        else if (product.image?.trim()) rawImageList = [product.image];
        else if (product.productImage?.trim()) rawImageList = [product.productImage];

        const validImages = rawImageList.filter(url => !url.includes('via.placeholder.com'));
        return validImages[0] || "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80";
    }, [product]);

    const sellerName = product.supplier || user?.businessName || user?.shopName || user?.name || "Verified Seller";
    const categoryName = typeof category === 'string' ? category : (product.categoryName || category?.name || 'Product');
    const moqValue = minOrder || product.moq || 1;

    const handleRequestClick = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!session) {
            signIn(undefined, { callbackUrl: window.location.pathname });
            return;
        }
        if (!effectiveUser?.isPhoneVerified) {
            setShowVerifyModal(true);
            return;
        }
        setShowRequestModal(true);
    };

    const handleDetailsClick = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        router.push(`/products/${id}`);
    };

    const handleVerificationSuccess = async () => {
        await update();
        setShowVerifyModal(false);
        setShowRequestModal(true);
    };

    return (
        <>
            <div
                onClick={handleDetailsClick}
                className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
            >
                {/* --- IMAGE SECTION --- */}
                <div className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden">
                    <Image
                        src={displayImage}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm z-10">
                        <Tag size={12} className="text-blue-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                            {categoryName}
                        </span>
                    </div>

                    {/* Favorite Button */}
                    {toggleFav && (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFav(e); }}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm shadow-sm transition-all active:scale-90 z-10"
                        >
                            {isFav ? (
                                <FaHeart size={16} className="text-rose-500 drop-shadow-sm" />
                            ) : (
                                <FaRegHeart size={16} className="text-slate-500 hover:text-slate-800" />
                            )}
                        </button>
                    )}
                </div>

                {/* --- CONTENT SECTION --- */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                    {/* Title & Seller */}
                    <div>
                        <h3 className="text-base font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                            {name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                            <BadgeCheck size={14} className="text-blue-500 fill-blue-50" />
                            <span className="truncate">{sellerName}</span>
                        </div>
                    </div>

                    {/* Price & MOQ Row */}
                    <div className="flex items-end justify-between mt-auto border-t border-slate-50 pt-3">
                        <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Price</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-slate-900">₹{price.toLocaleString()}</span>
                                <span className="text-xs text-slate-500 font-medium">/ {unit}</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5 flex items-center justify-end gap-1">
                                MOQ <Box size={10} />
                            </p>
                            <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                {moqValue} {unit}s
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                            onClick={handleDetailsClick}
                            className="py-2.5 px-4 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Details
                        </button>
                        <button
                            onClick={handleRequestClick}
                            className="py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-blue-600 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            Quote <FaPaperPlane size={10} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODALS (Unchanged logic, just keeping them here) --- */}
            <MobileVerificationModal
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                onSuccess={handleVerificationSuccess}
                userId={effectiveUser?.id || ""}
            />

            {showRequestModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={(e) => { e.stopPropagation(); setShowRequestModal(false); }}
                >
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/20 shadow-sm">
                            <FaXmark size={20} />
                        </button>
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
                            <ProductWrapper
                                productId={id} productName={name} productPrice={price} productUnit={unit} moq={moqValue}
                                currentUser={effectiveUser} userAddresses={effectiveUser?.addresses || []} defaultOpen={true} onRequestClose={() => setShowRequestModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default memo(ProductCard);