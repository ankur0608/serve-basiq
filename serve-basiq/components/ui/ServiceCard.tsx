'use client';

import Link from 'next/link';
import { FaHeart, FaRegHeart, FaStar, FaCircleCheck, FaLocationDot } from 'react-icons/fa6';
import { useState } from 'react';

// ✅ Updated Interface matching the mapped data from ServicesPage
export interface ServiceProps {
  id: string; // UUID is a string
  name: string;
  category: string;
  price: number;
  priceType: 'HOURLY' | 'FIXED' | string;
  location: string;
  image: string;
  rating: number;
  isVerified: boolean;
  providerName?: string;
  providerImage?: string;
}

export default function ServiceCard({ service }: { service: ServiceProps }) {
  const [isFav, setIsFav] = useState(false);

  return (
    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 group h-full relative overflow-hidden">

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsFav(!isFav);
        }}
        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm z-20 transition-all hover:scale-110"
      >
        {isFav ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400" />}
      </button>

      {/* Main Link */}
      <Link href={`/services/${service.id}`} className="flex gap-4 w-full">

        {/* Image Section */}
        <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
            onError={(e) => e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image"}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
          <div>
            {/* Category & Badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md truncate max-w-[100px]">
                {service.category}
              </span>
              {service.isVerified && (
                <FaCircleCheck className="text-emerald-500 text-xs" title="Verified Provider" />
              )}
            </div>

            {/* Title */}
            <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition text-lg leading-tight">
              {service.name}
            </h4>

            {/* Location */}
            <div className="text-xs text-gray-500 mt-1 truncate font-medium flex items-center gap-1">
              <FaLocationDot size={10} className="text-gray-300" />
              {service.location}
            </div>
          </div>

          {/* Footer: Price & Rating */}
          <div className="flex items-end justify-between mt-2">
            <div className="text-slate-900 font-extrabold text-lg leading-none">
              ₹{service.price}
              <span className="text-xs text-gray-400 font-normal ml-0.5 uppercase">
                {service.priceType === 'HOURLY' ? '/hr' : ''}
              </span>
            </div>

            <span className="text-xs font-bold text-amber-500 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
              {service.rating > 0 ? service.rating.toFixed(1) : 'New'} <FaStar size={10} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}