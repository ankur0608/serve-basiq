'use client';

import Link from 'next/link';
import { FaTag } from 'react-icons/fa6';

interface ProductProps {
  id: number;
  name: string;
  cat: string;
  price: number;
  moq: string;
  img: string;
  supplier: string;
}

export default function ProductCard({ product }: { product: ProductProps }) {
  return (
    <Link href={`/products/${product.id}`} className="block h-full">
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col h-full group">
        
        {/* Image */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
            <img 
            src={product.img || "https://via.placeholder.com/300"} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                MOQ: {product.moq}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
            <div className="text-xs text-blue-600 font-bold mb-1 flex items-center gap-1">
                <FaTag size={10} /> {product.cat}
            </div>
            <h4 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition">
            {product.name}
            </h4>
            <p className="text-xs text-gray-400 mb-3 truncate">By {product.supplier}</p>
            
            <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-extrabold text-slate-900">
                ₹{product.price}
            </span>
            <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                Buy Now
            </span>
            </div>
        </div>
        </div>
    </Link>
  );
}