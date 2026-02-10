'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaHeart, FaRegHeart, FaPaperPlane, FaXmark, FaBoxOpen } from "react-icons/fa6";
import { BadgeCheck, Store, ChevronRight } from 'lucide-react';

// Components
import ProductWrapper from '@/components/products/ProductWrapper';
import MobileVerificationModal from '@/components/auth/MobileVerificationModal';

interface ProductCardProps {
    product: any;
    isFav?: boolean;
    toggleFav?: (e: React.MouseEvent) => void;
    currentUser?: any;
}

export default function ProductCard({ product, isFav = false, toggleFav, currentUser }: ProductCardProps) {
    const { data: session, update } = useSession();
    const router = useRouter();

    // Modals State
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    if (!product) return null;

    const { id, name, category, minOrder, price, unit, user } = product;

    // --- SMART USER RESOLUTION ---
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

    // --- CLICK HANDLER ---
    const handleRequestClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
        e.preventDefault();
        e.stopPropagation();
        router.push(`/products/${id}`);
    };

    const handleVerificationSuccess = async () => {
        await update();
        setShowVerifyModal(false);
        setShowRequestModal(true);
    };

    // --- IMAGE LOGIC ---
    const getValidImage = () => {
        let rawImageList: string[] = [];
        if (Array.isArray(product.images) && product.images.length > 0) {
            rawImageList = product.images;
        } else if (Array.isArray(product.gallery) && product.gallery.length > 0) {
            rawImageList = product.gallery;
        } else if (product.image && typeof product.image === 'string' && product.image.trim() !== "") {
            rawImageList = [product.image];
        } else if (product.productImage && typeof product.productImage === 'string' && product.productImage.trim() !== "") {
            rawImageList = [product.productImage];
        }
        const validImages = rawImageList.filter(url => !url.includes('via.placeholder.com'));
        return validImages.length > 0
            ? validImages[0]
            : "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&q=80";
    };

    const displayImage = getValidImage();
    const sellerName = product.supplier || user?.businessName || user?.shopName || user?.name || "Verified Seller";
    const categoryName = typeof category === 'string' ? category : (product.categoryName || category?.name || 'General');
    const moqValue = minOrder || product.moq || 1;

    return (
        <>
            {/* --- CARD UI --- */}
            <div
                onClick={handleDetailsClick}
                className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
            >
                {/* Image Section */}
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <Image
                        src={displayImage}
                        alt={name || "Product Image"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {categoryName}
                    </span>

                    {/* Fav Button */}
                    {toggleFav && (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFav(e); }}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm hover:bg-white active:scale-90 transition-all z-10"
                        >
                            {isFav ? <FaHeart className="text-red-500" size={14} /> : <FaRegHeart className="text-gray-400 hover:text-red-500" size={14} />}
                        </button>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1">
                    {/* Seller Info */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <Store size={12} className="text-slate-400" />
                        <span className="truncate max-w-[150px] font-medium">{sellerName}</span>
                        <BadgeCheck size={12} className="text-blue-500" />
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 text-sm leading-snug mb-3 line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
                        {name}
                    </h3>

                    {/* Price & MOQ Row */}
                    <div className="mt-auto pt-3 border-t border-gray-50">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Price</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-slate-900">₹{price}</span>
                                    <span className="text-xs text-slate-500 font-medium">/ {unit}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Min Order</p>
                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                    <FaBoxOpen size={10} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-700">
                                        {moqValue} {unit}s
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {/* <button
                                onClick={handleDetailsClick}
                                className="flex-1 border border-gray-200 text-slate-600 py-2.5 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors"
                            >
                                Details
                            </button> */}
                            <button
                                onClick={handleRequestClick}
                                className="flex-[1.5] bg-slate-900 text-white py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
                            >
                                Get Quote <FaPaperPlane size={10} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 1. MOBILE VERIFICATION MODAL --- */}
            <MobileVerificationModal
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                onSuccess={handleVerificationSuccess}
                userId={effectiveUser?.id || ""}
            />

            {/* --- 2. REQUEST QUOTE MODAL --- */}
            {showRequestModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={(e) => { e.stopPropagation(); setShowRequestModal(false); }}
                >
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowRequestModal(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition z-20"
                        >
                            <FaXmark size={18} />
                        </button>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <ProductWrapper
                                productId={id}
                                productName={name}
                                productPrice={price}
                                productUnit={unit}
                                moq={moqValue}
                                currentUser={effectiveUser}
                                userAddresses={effectiveUser?.addresses || []}
                                defaultOpen={true}
                                onRequestClose={() => setShowRequestModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}