'use client'; // Client component because it has interactivity (Favorites)

import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { Service } from '@/lib/data';
import { useState } from 'react';

export default function ServiceCard({ service }: { service: Service }) {
  const [isFav, setIsFav] = useState(false);

  return (
    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition flex gap-4 group h-full relative">
      <button 
        onClick={(e) => { e.preventDefault(); setIsFav(!isFav); }}
        className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white shadow-sm z-10"
      >
        {isFav ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400" />}
      </button>
      
      <Link href={`/services/${service.id}`} className="flex gap-4 w-full">
        <div className="relative w-24 h-24 flex-shrink-0">
          <img 
            src={service.img} 
            alt={service.name}
            // fill
            className="rounded-xl object-cover bg-gray-100 group-hover:brightness-95 transition"
          />
        </div>
        <div className="flex-1 min-w-0 py-1 flex flex-col">
          <h4 className="font-bold text-slate-900 truncate group-hover:text-brand-600 transition text-lg">
            {service.name}
          </h4>
          <div className="text-xs text-gray-500 mb-3">{service.cat} • {service.loc}</div>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-sm font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded">
              ₹{service.price}/hr
            </span>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <FaStar /> {service.rating}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}