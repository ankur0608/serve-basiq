'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/ui/ProductCard';
import { FaMagnifyingGlass, FaArrowLeft } from 'react-icons/fa6';
import { PackageOpen, ImageOff } from 'lucide-react';
import { BiMap } from "react-icons/bi";

// --- Fetch Functions ---
const fetchCategories = async () => {
  const res = await fetch('/api/categories?type=PRODUCT');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

// Fetch general trending products (no category filter here)
const fetchProducts = async (searchTerm: string) => {
  const params = new URLSearchParams({ limit: '50' });
  if (searchTerm) params.append('search', searchTerm);

  const res = await fetch(`/api/products/all?${params.toString()}`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

export default function B2BMarketplace() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // --- Query 1: Categories ---
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60 * 24, // 24 Hours Cache
  });

  // --- Query 2: Trending Products (General) ---
  const { data: prodData, isLoading: prodLoading } = useQuery({
    queryKey: ['products', 'trending', searchTerm],
    queryFn: () => fetchProducts(searchTerm),
    staleTime: 1000 * 60,
  });

  const categories = catData?.categories || (Array.isArray(catData) ? catData : []) || [];
  const products = prodData?.products || [];

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-full hover:bg-gray-100 text-slate-600 transition-colors -ml-2"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Wholesale Market</h1>
            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 pl-3 pr-4 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition">
              <BiMap className="text-blue-600 text-lg" /> <span>Global</span>
            </div>
          </div>

          <div className="relative w-full max-w-xl group">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100/80 border-0 rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-32 animate-in fade-in duration-500">

        {/* --- CATEGORIES (Click to Redirect) --- */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Shop by Category</h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {catLoading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
              ))
            ) : (
              categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => router.push(`/products/category/${encodeURIComponent(cat.name)}`)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 bg-white shadow-sm transition-all group h-32 hover:shadow-md hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden mb-2 bg-slate-50 border border-slate-100 relative">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300 ${cat.image ? 'hidden' : ''}`}>
                      <ImageOff size={20} />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight line-clamp-2 uppercase tracking-wide group-hover:text-blue-700">
                    {cat.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* --- TRENDING PRODUCTS --- */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            ⚡ Trending Deals
          </h2>

          {prodLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <PackageOpen className="text-gray-400 mx-auto mb-4" size={32} />
              <p className="text-gray-900 font-bold">No products found</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}