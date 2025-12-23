'use client';

import Link from 'next/link';
import { FaHeart, FaRegHeart, FaStar, FaCircleCheck } from 'react-icons/fa6';
import { useState } from 'react';
import { Service } from '@/type/service';

export default function ServiceCard({ service }: { service: Service }) {
  const [isFav, setIsFav] = useState(false);

  return (
    <div className="bg-white p-3 rounded-2xl border shadow-sm flex gap-4 relative">

      <button
        onClick={(e) => {
          e.preventDefault();
          setIsFav(!isFav);
        }}
        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center"
      >
        {isFav ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
      </button>

      <Link href={`/services/${service.id}`} className="flex gap-4 w-full">
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={service.img || '/placeholder.png'}
            alt={service.name || 'Service'}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="flex-1">
          <h4 className="font-bold truncate flex items-center gap-1">
            {service.name ?? 'Unnamed Service'}
            {service.verified && <FaCircleCheck className="text-blue-500 text-xs" />}
          </h4>

          <div className="text-xs text-gray-500 truncate">
            {service.cat ?? 'General'} • {service.loc}
          </div>

          <div className="flex justify-between mt-2">
            <span className="text-sm font-bold">₹{service.price}/hr</span>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <FaStar /> {service.rating}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
