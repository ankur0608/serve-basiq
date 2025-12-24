'use client';

import Link from 'next/link';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa6'; // Updated to fa6 to match other files
import { useState } from 'react';
import clsx from 'clsx';

// 1. Define the interface locally to match your Database/Prisma output
interface ServiceProps {
  id: number;
  name: string;
  cat: string;
  price: number;
  loc: string;
  img: string;
  rating: number;
  verified: boolean;
}

export default function ServiceCard({ service }: { service: ServiceProps }) {
  const [isFav, setIsFav] = useState(false);

  return (
    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition flex gap-4 group h-full relative overflow-hidden">

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault(); // Prevent clicking the link when clicking the heart
          setIsFav(!isFav);
        }}
        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm z-20 transition-all hover:scale-110"
      >
        {isFav ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400" />}
      </button>

      {/* 2. Link to the dynamic details page */}
      <Link href={`/services/${service.id}`} className="flex gap-4 w-full">

        {/* Image Container */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={service.img || "https://via.placeholder.com/150"}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition text-lg leading-tight">
              {service.name}
            </h4>
            <div className="text-xs text-gray-500 mt-1 truncate">
              {service.cat} • {service.loc}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
              ₹{service.price}/hr
            </span>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              {service.rating} <FaStar />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}