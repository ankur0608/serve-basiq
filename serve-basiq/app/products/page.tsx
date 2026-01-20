'use client';

import React, { useState, useEffect } from 'react'; // ✅ Fixed: Import React
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { FaMagnifyingGlass, FaArrowLeft } from 'react-icons/fa6';
import { PackageOpen } from 'lucide-react';
import { BiMap } from "react-icons/bi";

// --- ICON MAP ---
// ✅ Fixed: Changed JSX.Element to React.ReactNode
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Tools & Hardware': <span className="text-orange-500">🛠️</span>,
  'Construction Materials': <span className="text-slate-600">🧱</span>,
  'Toys & Games': <span className="text-pink-500">🧸</span>,
  'Groceries': <span className="text-green-500">🥦</span>,
  'Electronics': <span className="text-blue-500">🔌</span>,
  'Fashion': <span className="text-purple-500">👗</span>,
  'Furniture': <span className="text-amber-700">🪑</span>,
  default: <span className="text-gray-400">📦</span>
};

export default function B2BMarketplace() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products/all', { cache: 'no-store' }),
          fetch('/api/categories?type=PRODUCT')
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) setProducts(prodData.products);
        if (Array.isArray(catData)) setCategories(catData.map((c: any) => c.name));

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Navigate to Category Page
  const handleCategoryClick = (categoryName: string) => {
    router.push(`/products/category/${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">

      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Left: Back Button, Title & Location */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-full hover:bg-gray-100 text-slate-600 transition-colors -ml-2"
              aria-label="Go Back"
            >
              <FaArrowLeft size={20} />
            </button>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Wholesale Market</h1>

            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 pl-3 pr-4 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition">
              <BiMap className="text-blue-600 text-lg" /> <span>Global</span>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="relative w-full max-w-xl group">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-100/80 border-0 rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all font-medium"
            />
          </div>

          {/* Right: Badge */}
          <div className="hidden md:block">
            <span className="bg-green-100 text-green-700 text-xs font-extrabold px-3 py-1.5 rounded-full tracking-wide">B2B ONLY</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-32 animate-in fade-in duration-500">

        {/* --- COMPACT CATEGORY GRID --- */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
            Shop by Category
            <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">View All</span>
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {loading ? (
              // Skeletons
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))
            ) : (
              categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30 transition-all group h-28"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {CATEGORY_ICONS[cat] || CATEGORY_ICONS.default}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight line-clamp-2 uppercase tracking-wide">
                    {cat}
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

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
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