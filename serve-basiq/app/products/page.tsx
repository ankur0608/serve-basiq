'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/ui/ProductCard'; // ✅ Check this path
import AppImage from '@/components/ui/AppImage';
import { FaArrowLeft, FaScrewdriverWrench } from 'react-icons/fa6';
import { PackageOpen } from 'lucide-react';
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

// --- Skeleton Component ---
function MarketplaceSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-12">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>)}
      </div>
    </div>
  );
}

export default function B2BMarketplace() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  // 1️⃣ User Favorites
  useQuery({
    queryKey: ['favorites', 'user'],
    queryFn: async () => {
      const res = await fetch('/api/user/favorites');
      if (!res.ok) return { products: [] };
      const data = await res.json();
      setFavorites(data.products || []);
      return data;
    },
    staleTime: 0,
  });

  // 2️⃣ Categories
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ['categories', 'PRODUCT'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60 * 24,
  });

  // 3️⃣ Products
  const { data: prodData, isLoading: prodLoading } = useQuery({
    queryKey: ['products', 'trending', searchTerm],
    queryFn: () => fetchProducts(searchTerm),
    staleTime: 1000 * 60,
  });

  // 4️⃣ ✅ FETCH CURRENT USER (FIXED URL)
  const { data: currentUser } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      // 🔴 WAS: fetch('/api/user/me') -> 404 Error
      // ✅ FIX: Use correct path
      const res = await fetch('/api/user/profile');
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const categories = catData?.categories || (Array.isArray(catData) ? catData : []) || [];
  const products = prodData?.products || [];

  const handleToggleFav = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlyFav = favorites.includes(id);
    const newFavorites = isCurrentlyFav
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    try {
      await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: id, type: 'PRODUCT' })
      });
    } catch (error) {
      console.error("Favorite toggle failed:", error);
      setFavorites(favorites);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 md:px-8 shadow-sm">
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
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-32">

        {(catLoading || prodLoading) ? <MarketplaceSkeleton /> : (
          <div className="animate-in fade-in duration-500">

            {/* --- CATEGORIES --- */}
            {/* <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Explore Categories</h2>
                <Link href="/productscategory" className="text-blue-600 text-xs font-bold uppercase hover:underline">View All</Link>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-6">
                {categories.slice(0, 6).map((cat: any) => (
                  <div
                    key={cat.id}
                    onClick={() => router.push(`/products/category/${encodeURIComponent(cat.name)}`)}
                    className="group flex flex-col items-center text-center cursor-pointer"
                  >
                    <div className="
                        w-14 h-14 sm:w-16 sm:h-16
                        flex items-center justify-center
                        rounded-xl
                        border border-gray-200
                        bg-white
                        group-hover:border-blue-600
                        transition
                        overflow-hidden
                        p-3
                    ">
                      {cat.image ? (
                        <AppImage
                          src={cat.image}
                          alt={cat.name}
                          type="thumbnail"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FaScrewdriverWrench className="text-blue-600 w-6 h-6 sm:w-7 sm:h-7" />
                      )}
                    </div>
                    <span className="mt-2 text-xs sm:text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* --- TRENDING PRODUCTS --- */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                ⚡ Trending Deals
              </h2>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFav={favorites.includes(product.id)}
                      toggleFav={(e: any) => handleToggleFav(e, product.id)}
                      currentUser={currentUser} // ✅ This will now have correct data
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
          </div>
        )}
      </main>
    </div>
  );
}