'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // using Next.js Image for optimization, or you can switch to <img> to match ServiceCard exactly if preferred
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaHeart, FaRegHeart, FaPaperPlane, FaXmark, FaBoxOpen } from "react-icons/fa6";
import { Store } from 'lucide-react';

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
    const categoryName = typeof category === 'string' ? category : (product.categoryName || category?.name || 'Product');
    const moqValue = minOrder || product.moq || 1;

    // --- CLICK HANDLERS ---
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

    return (
        <>
            {/* --- CARD COMPONENT (Matched to ServiceCard Design) --- */}
            <div
                onClick={handleDetailsClick}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow"
            >
                {/* Image Area */}
                <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
                    {/* Using <img> for exact match with ServiceCard, or Next/Image for perf */}
                    <img
                        src={displayImage}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge */}
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm text-white uppercase tracking-wide bg-emerald-600">
                        {categoryName}
                    </span>

                    {/* Favorite Button */}
                    {toggleFav && (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFav(e); }}
                            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow hover:bg-white transition-colors z-10"
                        >
                            {isFav ? <FaHeart size={12} className="text-red-500" /> : <FaRegHeart size={12} className="text-gray-400" />}
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-3 flex flex-col gap-1 flex-1">
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>

                    {/* Meta Row (Seller & MOQ) */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate max-w-[60%] flex items-center gap-1">
                            <Store size={10} /> {sellerName}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                            <FaBoxOpen size={10} /> {moqValue} {unit}s
                        </span>
                    </div>

                    {/* Price Row */}
                    <div className="text-sm font-semibold text-gray-900 mt-0.5">
                        ₹{price} <span className="text-xs font-normal text-gray-500">/ {unit}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2 pt-1">
                        <button
                            onClick={handleDetailsClick}
                            className="flex-1 border border-gray-300 text-xs py-1.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                            Details
                        </button>
                        <button
                            onClick={handleRequestClick}
                            className="flex-1 bg-black text-white text-xs py-1.5 rounded-lg hover:bg-gray-800 font-medium shadow-sm transition-colors flex items-center justify-center gap-1"
                        >
                            Quote <FaPaperPlane size={10} />
                        </button>
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

            {/* --- 2. REQUEST QUOTE MODAL (Styled like Booking Modal) --- */}
            {showRequestModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={(e) => { e.stopPropagation(); setShowRequestModal(false); }}
                >
                    <div
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button matching ServiceCard style */}
                        <button
                            onClick={() => setShowRequestModal(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/20 shadow-sm"
                            title="Close"
                        >
                            <FaXmark size={20} />
                        </button>

                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
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