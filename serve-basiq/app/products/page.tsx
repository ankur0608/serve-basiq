'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import clsx from 'clsx';
import { useProducts } from '@/app/hook/useProducts';
import { PackageOpen } from 'lucide-react';

export default function B2BMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  // ✅ 1. Fetch Data
  const { products, loading, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ 2. Optimize Category Extraction (Memoized)
  // Only recalculates when the 'products' array actually changes
  const productCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
  }, [products]);

  // ✅ 3. Optimize Filter Logic (Memoized)
  // Prevents re-running this loop on unrelated renders
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = activeCat === 'All' || product.category === activeCat;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, activeCat]);

  // ✅ 4. Stable Handler for clearing
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setActiveCat('All');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-32 animate-in fade-in duration-500">

      {/* --- HEADER --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Wholesale Marketplace</h1>
        <p className="text-slate-500">Direct factory prices for bulk orders.</p>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative mb-8 max-w-2xl group">
        <FaMagnifyingGlass className="absolute left-4 top-3.5 text-gray-400 text-lg group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search machines, tools, bulk items..."
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- CATEGORY PILLS --- */}
      <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-2">
          {/* 'All' Button */}
          <button
            onClick={() => setActiveCat('All')}
            className={clsx(
              "px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap shadow-sm active:scale-95",
              activeCat === 'All'
                ? "bg-slate-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600"
            )}
          >
            All
          </button>

          {/* Dynamic Categories */}
          {!loading && productCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={clsx(
                "px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap shadow-sm active:scale-95 flex items-center gap-2",
                activeCat === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600"
              )}
            >
              {cat}
            </button>
          ))}

          {/* Category Skeleton */}
          {loading && [1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-24 bg-gray-100 rounded-full animate-pulse shrink-0"></div>
          ))}
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <PackageOpen className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-900 font-bold text-lg">No products found</p>
          <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
            We couldn't find any items matching "{searchTerm}" in {activeCat === 'All' ? 'any category' : activeCat}.
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm"
          >
            Clear Search & Filters
          </button>
        </div>
      )}
    </div>
  );
}