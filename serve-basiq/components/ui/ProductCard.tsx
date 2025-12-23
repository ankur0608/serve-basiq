'use client';

import Link from 'next/link';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useState } from 'react';
import { Product } from '@/type/product';

export default function ProductCard({ product }: { product: Product }) {
  const [isFav, setIsFav] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition group overflow-hidden h-full flex flex-col relative">

      <button
        onClick={(e) => {
          e.preventDefault();
          setIsFav(!isFav);
        }}
        className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm z-10"
      >
        {isFav ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400" />}
      </button>

      <Link href={`/b2b/${product.id}`} className="flex flex-col h-full">
        <div className="h-40 p-6 flex items-center justify-center bg-gray-50 transition relative">
          <img
            src={product.images?.[0] || '/placeholder.png'}
            alt={product.name}
            className="object-contain mix-blend-multiply group-hover:scale-110 transition duration-500"
          />
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2 h-10">
            {product.name}
          </h4>

          <div className="flex justify-between items-baseline border-t pt-2 mt-auto">
            <span className="font-extrabold text-base">₹{product.price}</span>
            <span className="text-[10px] text-gray-400 truncate w-1/2 text-right">
              {product.supplier}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
