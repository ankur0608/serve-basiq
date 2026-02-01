'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/ui/ProductCard';
import { FaMagnifyingGlass, FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { PackageOpen, ImageOff, Box } from 'lucide-react';
import { BiMap } from "react-icons/bi";

// --- Fetch Functions ---
const fetchCategories = async () => {
  const res = await fetch('/api/categories?type=PRODUCT');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

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
  const [favorites, setFavorites] = useState<string[]>([]);

  // 1️⃣ Query for User Favorites (Initial Load)
  useQuery({
    queryKey: ['favorites', 'user'],
    queryFn: async () => {
      const res = await fetch('/api/user/favorites');
      if (!res.ok) return { products: [] };
      const data = await res.json();
      // Update local state with fetched IDs
      setFavorites(data.products || []);
      return data;
    },
    staleTime: 0,
  });

  // --- Query 2: Categories ---
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60 * 24, // 24 Hours Cache
  });

  // --- Query 3: Trending Products ---
  const { data: prodData, isLoading: prodLoading } = useQuery({
    queryKey: ['products', 'trending', searchTerm],
    queryFn: () => fetchProducts(searchTerm),
    staleTime: 1000 * 60,
  });

  const categories = catData?.categories || (Array.isArray(catData) ? catData : []) || [];
  const products = prodData?.products || [];

  const mobileCategories = categories.slice(0, 4);
  const webCategories = categories.slice(0, 6);

  // ✅ REAL API TOGGLE FUNCTION
  const handleToggleFav = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // Stop click from navigating to details page

    // 1. Optimistic Update
    const isCurrentlyFav = favorites.includes(id);
    const newFavorites = isCurrentlyFav
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];

    setFavorites(newFavorites);

    try {
      // 2. API Call
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id, type: 'PRODUCT' }) // Note type is PRODUCT here
      });

      if (!res.ok) {
        throw new Error("Failed to update favorite");
      }
    } catch (error) {
      // 3. Rollback
      console.error("Favorite toggle failed:", error);
      setFavorites(favorites);
    }
  };

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

        {/* --- CATEGORIES SECTION --- */}
        <div className="mb-12">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Shop by Category</h2>
            <Link
              href="/productscategory"
              className="text-blue-600 text-xs font-bold uppercase hover:underline flex items-center gap-1 group"
            >
              View All <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {catLoading ? (
            // Skeleton Loader
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* MOBILE LAYOUT (4 Columns) */}
              <div className="grid grid-cols-4 gap-3 sm:hidden">
                {mobileCategories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/products/category/${encodeURIComponent(cat.name)}`)}
                    className="bg-white rounded-xl p-3 text-center shadow-sm border border-transparent hover:shadow-md hover:border-blue-200 cursor-pointer transition group"
                  >
                    <div className="w-9 h-9 bg-slate-50 rounded-lg mx-auto mb-2 group-hover:scale-105 transition overflow-hidden border border-slate-100 flex items-center justify-center">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <Box className="text-slate-400 text-sm" />
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600">{cat.name}</p>
                  </button>
                ))}
              </div>

              {/* DESKTOP LAYOUT (6 Columns) */}
              <div className="hidden sm:grid grid-cols-3 md:grid-cols-6 gap-4">
                {webCategories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/products/category/${encodeURIComponent(cat.name)}`)}
                    className="bg-white rounded-xl p-4 text-center shadow-sm border border-transparent hover:shadow-md hover:border-blue-200 cursor-pointer transition group"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-lg mx-auto mb-3 group-hover:scale-105 transition overflow-hidden border border-slate-100 flex items-center justify-center">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <Box className="text-slate-400 text-lg" />
                      )}
                    </div>
                    <p className="text-xs font-bold uppercase text-slate-700 group-hover:text-blue-600 line-clamp-1">{cat.name}</p>
                  </button>
                ))}
              </div>
            </>
          )}
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
                <ProductCard
                  key={product.id}
                  product={product}
                  isFav={favorites.includes(product.id)}
                  toggleFav={(e: any) => handleToggleFav(e, product.id)}
                />
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