'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaHeart, FaRegHeart, FaPaperPlane, FaXmark } from "react-icons/fa6";
import { BadgeCheck, Store } from 'lucide-react';

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
                // Ensure these fields exist to avoid crashes
                id: (session.user as any).id,
                isPhoneVerified: (session.user as any).isPhoneVerified,
                phone: (session.user as any).phone,
                addresses: []
            };
        }
        return null;
    }, [currentUser, session]);

    // --- CLICK HANDLER WITH LOGIC ---
    const handleRequestClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 1. If Not Logged In -> Open Login (or redirect)
        if (!session) {
            signIn(undefined, { callbackUrl: window.location.pathname });
            return;
        }

        // 2. If Logged In but Not Verified -> Open Mobile Verification Modal
        if (!effectiveUser?.isPhoneVerified) {
            setShowVerifyModal(true);
            return;
        }

        // 3. All Good -> Open Quote Request
        setShowRequestModal(true);
    };

    // Helper: After verification success
    const handleVerificationSuccess = async () => {
        await update(); // Refresh session
        setShowVerifyModal(false);
        setShowRequestModal(true); // Open request modal
    };

    // --- ✅ ROBUST IMAGE LOGIC (Fixes the missing image issue) ---
    const getValidImage = () => {
        let rawImageList: string[] = [];

        // 1. Try to get array from 'images' or 'gallery' (Arrays)
        if (Array.isArray(product.images) && product.images.length > 0) {
            rawImageList = product.images;
        } else if (Array.isArray(product.gallery) && product.gallery.length > 0) {
            rawImageList = product.gallery;
        }
        // 2. Try to get single string from 'image' or 'productImage' (Strings)
        else if (product.image && typeof product.image === 'string' && product.image.trim() !== "") {
            rawImageList = [product.image];
        } else if (product.productImage && typeof product.productImage === 'string' && product.productImage.trim() !== "") {
            rawImageList = [product.productImage];
        }

        // 3. Filter out broken placeholder domains
        const validImages = rawImageList.filter(url => !url.includes('via.placeholder.com'));

        // 4. Return first valid image OR a reliable Unsplash fallback
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
            <Link
                href={`/products/${id}`}
                className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative"
            >
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    <Image
                        src={displayImage}
                        alt={name || "Product Image"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {categoryName}
                    </span>
                    {toggleFav && (
                        <button
                            onClick={toggleFav}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm hover:bg-white active:scale-90 transition-all z-10"
                        >
                            {isFav ? <FaHeart className="text-red-500" size={14} /> : <FaRegHeart className="text-gray-400 hover:text-red-500" size={14} />}
                        </button>
                    )}
                </div>

                <div className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <Store size={12} className="text-slate-400" />
                        <span className="truncate max-w-[150px] font-medium">{sellerName}</span>
                        <BadgeCheck size={12} className="text-blue-500" />
                    </div>

                    <h3 className="font-bold text-slate-900 leading-tight mb-3 line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
                        {name}
                    </h3>

                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-xs text-slate-400 font-medium mb-0.5">Price</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-slate-900">₹{price}</span>
                                <span className="text-xs text-slate-500 font-medium">/ {unit}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-medium mb-0.5">MOQ</p>
                            <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                {moqValue} {unit}s
                            </span>
                        </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                        onClick={handleRequestClick}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
                    >
                        Request Quote <FaPaperPlane size={12} />
                    </button>
                </div>
            </Link>

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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={(e) => { e.stopPropagation(); setShowRequestModal(false); }}
                >
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowRequestModal(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition z-20"
                        >
                            <FaXmark size={18} />
                        </button>
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
            )}
        </>
    );
}