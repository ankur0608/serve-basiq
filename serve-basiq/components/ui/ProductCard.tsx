'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaRegHeart, FaPaperPlane, FaXmark } from "react-icons/fa6";
import { BadgeCheck, Store } from 'lucide-react';
import ProductWrapper from '@/components/products/ProductWrapper';

// ✅ Interface: Make interactive props optional so Server Components can use this card
interface ProductCardProps {
    product: any; 
    isFav?: boolean;                       // ✅ Added '?' (Optional)
    toggleFav?: (e: React.MouseEvent) => void; // ✅ Added '?' (Optional)
    currentUser?: any;
}

export default function ProductCard({ product, isFav = false, toggleFav, currentUser }: ProductCardProps) {
    const [showRequestModal, setShowRequestModal] = useState(false);

    if (!product) return null;

    const {
        id,
        name,
        category,
        image,
        minOrder, // Matches 'moq' usually, check your DB field mapping if this is undefined
        price,
        unit,
        user
    } = product;

    // Handle Image Fallback
    const displayImage = image || product.productImage || 'https://via.placeholder.com/300';
    
    // Handle Seller Name
    const sellerName = product.supplier || user?.businessName || user?.name || "Verified Seller";
    
    // Handle Category Name safely
    const categoryName = typeof category === 'string' ? category : (category?.name || 'General');

    // Handle MOQ mapping if your DB uses 'moq' instead of 'minOrder'
    const moqValue = minOrder || product.moq || 1;

    const handleRequestClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowRequestModal(true);
    };

    return (
        <>
            <Link
                href={`/products/${id}`}
                className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative"
            >
                {/* --- Image Section --- */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    <Image
                        src={displayImage}
                        alt={name || "Product Image"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {categoryName}
                    </span>

                    {/* ✅ ONLY render Wishlist button if toggleFav is provided */}
                    {toggleFav && (
                        <button
                            onClick={toggleFav}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm hover:bg-white active:scale-90 transition-all z-10"
                        >
                            {isFav ? (
                                <FaHeart className="text-red-500" size={14} />
                            ) : (
                                <FaRegHeart className="text-gray-400 hover:text-red-500" size={14} />
                            )}
                        </button>
                    )}
                </div>

                {/* --- Content Section --- */}
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

                    <button
                        onClick={handleRequestClick}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
                    >
                        Request Quote <FaPaperPlane size={12} />
                    </button>
                </div>
            </Link>

            {/* --- FORM MODAL --- */}
            {showRequestModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowRequestModal(false);
                    }}
                >
                    <div 
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" 
                        onClick={(e) => e.stopPropagation()}
                    >
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
                            currentUser={currentUser}
                            userAddresses={currentUser?.addresses || []}
                            defaultOpen={true} 
                            onRequestClose={() => setShowRequestModal(false)} 
                        />
                    </div>
                </div>
            )}
        </>
    );
}