// components/ui/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Product } from '@/lib/data';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const [isFav, setIsFav] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition group overflow-hidden h-full flex flex-col relative">
      <button 
        onClick={(e) => { e.preventDefault(); setIsFav(!isFav); }}
        className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white shadow-sm z-10"
      >
        {isFav ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400" />}
      </button>

      <Link href={`/b2b/${product.id}`} className="flex flex-col h-full">
        <div className="h-40 p-6 flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition relative">
          {/* Using object-contain for products to show full item */}
          <div className="relative w-full h-full">
             <img 
                src={product.img} 
                alt={product.name}
                // fill
                className="object-contain mix-blend-multiply group-hover:scale-110 transition duration-500"
             />
          </div>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2 group-hover:text-green-600 transition h-10">
            {product.name}
          </h4>
          <div className="flex justify-between items-baseline border-t border-gray-50 pt-2 mt-auto">
            <span className="font-extrabold text-base text-slate-900">₹{product.price}</span>
            <span className="text-[10px] text-gray-400 font-medium truncate w-1/2 text-right">
              {product.supplier}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}