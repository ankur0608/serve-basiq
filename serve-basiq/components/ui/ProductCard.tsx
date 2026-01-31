'use client';

import Link from 'next/link';
import { FaTag, FaCircleCheck } from 'react-icons/fa6';
// ✅ Ensure this path is correct
import AppImage from '@/components/ui/AppImage';

export interface ProductProps {
    id: string;
    name: string;
    category: string;
    price: number;
    moq: number;
    image: string; // The parent now maps 'productImage' to this
    supplier: string;
    isVerified: boolean;
    unit: string;
}

export default function ProductCard({ product }: { product: ProductProps }) {
    return (
        <Link href={`/products/${product.id}`} className="block h-full">
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full group">

                {/* Image */}
                <div className="relative w-full h-36 aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3 flex items-center justify-center">

                    <AppImage
                        src={product.image}
                        alt={product.name}
                        type="card"
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />

                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm z-10">
                        MOQ: {product.moq} {product.unit}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    <div className="text-xs text-blue-600 font-bold mb-1 flex items-center gap-1">
                        <FaTag size={10} />
                        <span className="truncate max-w-[120px]">{product.category}</span>
                        {product.isVerified && <FaCircleCheck className="text-emerald-500 text-[10px]" />}
                    </div>

                    <h4 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                        {product.name}
                    </h4>

                    <p className="text-xs text-gray-400 mb-3 truncate">By {product.supplier}</p>

                    <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-extrabold text-slate-900">
                            ₹{product.price}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-600 hover:bg-slate-200 transition">
                            Details
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}